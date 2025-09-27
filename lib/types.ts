// Types for the AI Therapy Assistant API

export interface APIRequest {
  mode: 'therapy' | 'blunt' | 'closure';
  inputText: string;
  consent: boolean;
  safeMode?: boolean;
}

export interface APIResponse {
  aiText: string;
  safety: {
    flagged: boolean;
    reason?: string;
  };
  provider: string;
}

export interface APIError {
  error: string;
}

export type TherapyMode = 'therapy' | 'blunt' | 'closure';

export interface RateLimitData {
  count: number;
  resetTime: number;
}