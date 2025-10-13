import type {
    Language, CompendiumResult, AnalysisMode, AnyUserProfile, AnalysisResult
} from '../types';
import { API_CONFIG } from '../constants';
import { APIError, shouldRetry, logError } from '../utils/errorHandler';

// Helper function for API calls with retry logic
const apiCall = async <T>(
    endpoint: string,
    payload: any,
    maxRetries: number = API_CONFIG.RETRY_COUNT
): Promise<T> => {
    let lastError: Error | APIError;


    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new APIError(
                    response.status,
                    errorData.error || `HTTP ${response.status}: ${response.statusText}`,
                    errorData
                );
            }

            const data = await response.json();
            return data as T;

        } catch (error) {
            lastError = error as Error | APIError;

            // Log error for monitoring
            logError(`apiCall:${endpoint}:attempt${attempt + 1}`, error);

            // Don't retry on client errors (4xx) or on last attempt
            if (!shouldRetry(error) || attempt === maxRetries) {
                throw lastError;
            }

            // Wait with exponential backoff for server errors
            const delay = 1000 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

// --- COMPENDIUM FUNCTION ---
export const getCompendiumInfo = async (query: string, language: Language): Promise<CompendiumResult> => {
    try {
        const result = await apiCall<CompendiumResult>('/compendium', {
            query: query.trim(),
            language
        });

        return result;
    } catch (error) {
        logError('getCompendiumInfo', error);
        throw error; // Re-throw to allow caller to handle
    }
};


// --- ANALYSIS FUNCTION ---

export const analyzeUserData = async (
    mode: AnalysisMode,
    profile: AnyUserProfile,
    language: Language
): Promise<AnalysisResult> => {
    try {
        const payload = {
            mode,
            profile,
            language
        };

        const result = await apiCall<AnalysisResult>('/analysis', payload);
        return result;

    } catch (error) {
        logError('analyzeUserData', error);

        // Re-throw APIError as-is for proper handling
        if (error instanceof APIError) {
            throw error;
        }

        // Wrap other errors in APIError
        const typedError = error as Error;
        throw new APIError(
            500,
            typedError.message || 'An unknown error occurred with the AI service.',
            error
        );
    }
};
