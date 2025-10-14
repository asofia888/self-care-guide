import type { Language } from '../types';
import { t } from '../i18n';

/**
 * Custom API Error class with status code
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Format error message for display to user
 * @param error - The error object
 * @param language - Current language
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: unknown, language: Language): string => {
  const translations = t(language).error;

  if (error instanceof APIError) {
    // Handle specific HTTP status codes with user-friendly messages
    switch (error.status) {
      case 400:
        return translations.apiError.replace('{message}',
          language === 'ja' ? '無効なリクエストです' : 'Invalid request');
      case 401:
        return translations.apiError.replace('{message}',
          language === 'ja' ? '認証が必要です' : 'Authentication required');
      case 403:
        return translations.apiError.replace('{message}',
          language === 'ja' ? 'アクセスが拒否されました' : 'Access denied');
      case 404:
        return translations.apiError.replace('{message}',
          language === 'ja' ? 'リソースが見つかりません' : 'Resource not found');
      case 429:
        return translations.apiError.replace('{message}',
          language === 'ja' ? 'リクエストが多すぎます。しばらく待ってから再試行してください' : 'Too many requests. Please try again later');
      case 500:
      case 502:
      case 503:
      case 504:
        return translations.apiError.replace('{message}',
          language === 'ja' ? 'サービスが一時的に利用できません。しばらく待ってから再試行してください' : 'Service temporarily unavailable. Please try again later');
      default:
        // Use the error message if available
        return translations.apiError.replace('{message}',
          error.message || (language === 'ja' ? 'エラーが発生しました' : 'An error occurred'));
    }
  }

  if (error instanceof Error) {
    // Check for network errors
    if (error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch') ||
        error.message.toLowerCase().includes('connection')) {
      return translations.networkError;
    }

    // Try to parse if it's a JSON error message
    try {
      const jsonMatch = error.message.match(/AI API Error: (.*)/);
      if (jsonMatch) {
        const parsedError = JSON.parse(jsonMatch[1]);
        return translations.apiError.replace(
          '{message}',
          parsedError.error?.message || error.message
        );
      }
    } catch {
      // Not JSON, use as-is
    }

    // Return the error message directly
    return translations.apiError.replace('{message}', error.message);
  }

  // Handle unknown error types
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    const errorMsg = errorObj.message || errorObj.error || String(error);
    return translations.apiError.replace('{message}', errorMsg);
  }

  return translations.unexpected;
};

/**
 * Check if error should trigger a retry
 * @param error - The error object
 * @returns True if should retry
 */
export const shouldRetry = (error: unknown): boolean => {
  if (error instanceof APIError) {
    // Retry on server errors (5xx) and rate limiting (429)
    // Don't retry on authentication errors (401, 403) or bad requests (400, 404)
    if (error.status === 429) {
      // Rate limiting - retry with backoff
      return true;
    }
    if (error.status >= 500 && error.status < 600) {
      // Server errors - retry
      return true;
    }
    // Client errors - don't retry
    return false;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Retry on network errors
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('econnrefused') ||
           message.includes('fetch failed') ||
           message.includes('connection');
  }

  return false;
};

/**
 * Calculate retry delay with exponential backoff and jitter
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
export const getRetryDelay = (
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (randomness) to prevent thundering herd
  // Jitter range: 50% to 100% of calculated delay
  const jitter = cappedDelay * (0.5 + Math.random() * 0.5);

  return Math.floor(jitter);
};

/**
 * Extract error details for logging
 * @param error - The error object
 * @returns Error details object
 */
export const getErrorDetails = (error: unknown): Record<string, unknown> => {
  if (error instanceof APIError) {
    return {
      type: 'APIError',
      status: error.status,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    type: 'Unknown',
    value: String(error),
  };
};

/**
 * Log error to console (can be extended to send to monitoring service)
 * @param context - Context where error occurred
 * @param error - The error object
 */
export const logError = (context: string, error: unknown): void => {
  const details = getErrorDetails(error);
  console.error(`[${context}]`, details);

  // TODO: Send to monitoring service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { custom: { context, ...details } } });
  // }
};
