import { NextRequest, NextResponse } from 'next/server';
import { PROMPTS, CRISIS_KEYWORDS, CRISIS_RESPONSE } from '@/lib/prompts';
import { getRandomFallbackResponse } from '@/lib/fallback-responses';

// TypeScript interfaces for request/response
interface RequestBody {
  mode: 'therapy' | 'blunt' | 'closure';
  inputText: string;
  consent: boolean;
  safeMode?: boolean;
}

interface ResponseBody {
  aiText: string;
  safety: {
    flagged: boolean;
    reason?: string;
  };
  provider: string;
  followUps?: string[];
}

interface ErrorResponse {
  error: string;
}

// In-memory rate limiting (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: 30 requests per 60 seconds per IP
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX) {
    return false;
  }

  clientData.count += 1;
  return true;
}

// Basic crisis/self-harm detection using regex
function detectCrisisKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Simple content moderation using keywords (since we're switching away from OpenAI)
async function checkModeration(text: string): Promise<{ flagged: boolean; reason?: string }> {
  try {
    // Basic keyword-based moderation
    const inappropriateKeywords = [
      'hate', 'violence', 'harmful', 'illegal', 'drug', 'weapon', 
      'abuse', 'harassment', 'explicit', 'nsfw'
    ];
    
    const lowerText = text.toLowerCase();
    const foundKeywords = inappropriateKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      return { 
        flagged: true, 
        reason: `Content flagged for potentially inappropriate content: ${foundKeywords.join(', ')}` 
      };
    }

    return { flagged: false };
  } catch (error) {
    console.error('Moderation check failed:', error);
    return { flagged: false }; // Fail open
  }
}

// Google Gemini API call
async function getChatResponse(prompt: string, safeMode: boolean = false): Promise<string> {
  const temperature = safeMode ? 0.5 : 0.8;
  const modelName = 'gemini-1.5-flash';

  // Helper: try to extract text from various response shapes
  const extractText = (obj: any): string | null => {
    try {
      if (!obj) return null;
      const tries = [
        () => obj?.candidates?.[0]?.message?.content?.[0]?.text,
        () => obj?.candidates?.[0]?.message?.content?.[0]?.text,
        () => obj?.candidates?.[0]?.content?.parts?.[0]?.text,
        () => obj?.candidates?.[0]?.content?.[0]?.text,
        () => obj?.output?.[0]?.content?.text,
        () => obj?.outputText,
        () => obj?.response?.outputText,
      ];

      for (const g of tries) {
        try {
          const v = g();
          if (v && typeof v === 'string' && v.trim()) return v;
        } catch (e) {
          // continue
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Use generateContent only (model supports generateContent; generateMessage is not available for this key)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  // Heuristic prompt trimming to avoid MAX_TOKENS: keep prompt to a reasonable size
  const MAX_PROMPT_CHARS = 1000; // ~250 tokens heuristic - much shorter now
  const trimmedPrompt = (typeof prompt === 'string' && prompt.length > MAX_PROMPT_CHARS)
    ? prompt.slice(0, MAX_PROMPT_CHARS) + '\n\nRespond to: ' + prompt.slice(-200)
    : prompt;

  const generationConfig = { temperature, maxOutputTokens: 1024, topP: 0.9, topK: 40 };

  const body = {
    contents: [{ parts: [{ text: trimmedPrompt }] }],
    generationConfig,
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await resp.json();
      try { console.log(`Gemini generateContent raw response (attempt ${attempt}):`, JSON.stringify(data)); } catch (e) {}

      if (resp.ok) {
        const txt = extractText(data);
        if (txt) return txt;

        // If candidate exists but no text, log finishReason and don't immediately retry with another request (to avoid quota)
        try {
          const cand = data?.candidates?.[0];
          if (cand) console.warn('generateContent candidate:', { finishReason: cand.finishReason, role: cand?.content?.role, index: cand.index });
        } catch (e) {}

        // If no usable text, break to allow higher-level retry with shortened prompt
        break;
      }

      // Handle rate limits with Retry-After or RetryInfo in response
      if (resp.status === 429) {
        // Try to find a retry delay in the response
        let retryDelaySec = 5;
        try {
          const retryInfo = data?.details?.find((d: any) => d['@type'] && d['@type'].includes('RetryInfo'));
          if (retryInfo?.retryDelay) {
            // retryDelay could be in format "45s" or object; attempt parse
            const rd = retryInfo.retryDelay;
            if (typeof rd === 'string' && rd.endsWith('s')) retryDelaySec = parseFloat(rd.slice(0, -1)) || retryDelaySec;
            else if (typeof rd === 'object' && rd.seconds) retryDelaySec = Number(rd.seconds) || retryDelaySec;
          }
        } catch (e) {}

        console.warn(`Rate limited by Gemini (attempt ${attempt}). Waiting ${retryDelaySec}s before retrying.`);
        await new Promise((r) => setTimeout(r, retryDelaySec * 1000));
        continue; // retry
      }

      // Other non-OK status: log and break
      console.error('generateContent error', resp.status, JSON.stringify(data));
      break;
    } catch (e) {
      const em = (e && (e as any).message) ? (e as any).message : String(e);
      console.error('generateContent request failed (attempt ' + attempt + '):', em);
      // small backoff before retry
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  // Nothing usable was produced
  return 'Sorry, I could not generate a response.';
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' } as ErrorResponse,
        { status: 429 }
      );
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' } as ErrorResponse,
        { status: 400 }
      );
    }

  const { mode, inputText, consent, safeMode = false } = body;
  console.log('API request body:', { mode, inputText: inputText?.slice(0,200), safeMode });

    // Validation: Check consent
    if (!consent) {
      return NextResponse.json(
        { error: 'Consent is required to use this service' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validation: Check inputText
    if (!inputText || inputText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input text is required' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validation: Check mode
    if (!['therapy', 'blunt', 'closure'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be therapy, blunt, or closure' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Check for crisis keywords first (faster than API call)
    if (detectCrisisKeywords(inputText)) {
      return NextResponse.json({
        aiText: CRISIS_RESPONSE,
        safety: { flagged: true, reason: 'Crisis keywords detected' },
        provider: 'system'
      } as ResponseBody);
    }

    // Check OpenAI moderation
    const moderationResult = await checkModeration(inputText);
    if (moderationResult.flagged) {
      return NextResponse.json({
        aiText: "I can't respond to that type of content. Please try rephrasing your message in a more appropriate way.",
        safety: moderationResult,
        provider: 'system'
      } as ResponseBody);
    }

    // Use pre-made responses instead of calling Gemini
    const response = getRandomFallbackResponse(mode);
    console.log('Using pre-made response:', response.text.slice(0, 100));

    // Return successful response
    return NextResponse.json({
      aiText: response.text,
      safety: { flagged: false },
      provider: 'pre-made-responses',
      followUps: response.followUps
    } as ResponseBody);

  } catch (error) {
    console.error('API error:', error);
    
    // Return generic error to client (don't expose internal details)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' } as ErrorResponse,
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' } as ErrorResponse,
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' } as ErrorResponse,
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' } as ErrorResponse,
    { status: 405 }
  );
}