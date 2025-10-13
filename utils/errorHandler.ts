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
    // Handle specific HTTP status codes
    switch (error.status) {
      case 400:
        return translations.apiError.replace('{message}', 'Invalid request');
      case 401:
        return translations.apiError.replace('{message}', 'Unauthorized');
      case 403:
        return translations.apiError.replace('{message}', 'Access denied');
      case 404:
        return translations.apiError.replace('{message}', 'Not found');
      case 429:
        return translations.apiError.replace('{message}', 'Too many requests. Please try again later.');
      case 500:
      case 502:
      case 503:
        return translations.apiError.replace('{message}', 'Service unavailable. Please try again.');
      default:
        return translations.apiError.replace('{message}', error.message);
    }
  }

  if (error instanceof Error) {
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

    return translations.apiError.replace('{message}', error.message);
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
    // Retry on server errors (5xx) but not client errors (4xx)
    return error.status >= 500 && error.status < 600;
  }

  if (error instanceof Error) {
    // Retry on network errors
    return error.message.includes('Network') ||
           error.message.includes('timeout') ||
           error.message.includes('ECONNREFUSED');
  }

  return false;
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
