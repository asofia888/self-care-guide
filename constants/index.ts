/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  RETRY_COUNT: 3,
  TIMEOUT: 30000, // 30 seconds
  BASE_URL: typeof window !== 'undefined' ? '/api' : '',
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 5,
  WINDOW_MS: 60 * 1000, // 1 minute
} as const;

// Test Configuration
export const TEST_CONFIG = {
  TIMEOUT: 30000,
  HOOK_TIMEOUT: 30000,
} as const;

// Gemini API Model
export const GEMINI_MODEL = 'gemini-flash-latest' as const;

// CORS Allowed Origins
export const ALLOWED_ORIGINS = [
  'https://self-care-guide.vercel.app',
  'https://self-care-guide-git-main-asofia888.vercel.app',
  'http://localhost:5173',
] as const;

// Supported Languages
export const LANGUAGES = ['ja', 'en'] as const;
