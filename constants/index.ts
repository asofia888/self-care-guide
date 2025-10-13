/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  RETRY_COUNT: 3,
  TIMEOUT: 30000, // 30 seconds
  BASE_URL: typeof window !== 'undefined' ? '/api' : '',
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 4 * 1024 * 1024, // 4MB in bytes
  ALLOWED_TYPES: ['image/png', 'image/jpeg'],
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg'],
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 5,
  WINDOW_MS: 60 * 1000, // 1 minute
} as const;

// Form CSS Classes
export const FORM_STYLES = {
  input: "w-full p-2 bg-amber-50/40 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors duration-200 placeholder:text-slate-400 text-sm",
  label: "block text-sm font-semibold text-teal-800 mb-1",
  textarea: "w-full p-2 bg-amber-50/40 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors duration-200 placeholder:text-slate-400 text-sm h-24",
  legend: "text-lg font-bold text-teal-900 mb-3",
  button: {
    primary: "w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 bg-amber-500 text-teal-900 font-bold rounded-full shadow-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-300 ease-in-out",
    secondary: "text-left p-2 rounded-lg border-2 transition-all text-sm",
    selected: "bg-teal-700 text-white border-teal-700",
    unselected: "bg-white hover:bg-amber-50 border-amber-300",
    disabled: "bg-slate-400 text-white cursor-not-allowed transform-none",
  },
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

// Analysis Modes
export const ANALYSIS_MODES = ['professional', 'general'] as const;

// Supported Languages
export const LANGUAGES = ['ja', 'en'] as const;

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 4MB limit',
  INVALID_FILE_TYPE: 'Only PNG and JPEG images are allowed',
  API_KEY_MISSING: 'API key not configured',
  NETWORK_ERROR: 'Network error occurred',
  VALIDATION_ERROR: 'Validation failed',
} as const;
