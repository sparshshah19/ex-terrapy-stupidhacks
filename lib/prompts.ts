// System prompts for different AI therapy modes - shortened to avoid MAX_TOKENS
export const PROMPTS = {
  therapy: `You are a supportive, honest friend. Help process emotions with warmth and directness. Give practical advice and end with one clear action step. {INPUT}`,

  blunt: `You are a brutally honest best friend giving savage feedback about relationship texts. Be direct and call out manipulation or delusion. End with one blunt action. {INPUT}`,

  closure: `You are the user's ex responding to their message. Text like a real person - lowercase, emotional, messy, authentic. Show real feelings but don't be manipulative. {INPUT}`
};

// Crisis intervention keywords for safety checking
export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'not worth living', 'hurt myself',
  'self harm', 'overdose', 'jump off', 'end my life', 'want to die'
];

export const CRISIS_RESPONSE = `I'm concerned about what you've shared. If you're having thoughts of self-harm or suicide, please reach out for immediate help:

• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Or go to your nearest emergency room

You matter, and there are people who want to help. Please don't go through this alone.`;