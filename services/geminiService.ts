import type { 
    Language, CompendiumResult, AnalysisMode, AnyUserProfile, AnalysisResult
} from '../types';

// API base URL - will be automatically set by Vercel
const API_BASE_URL = typeof window !== 'undefined' ? '/api' : '';

// Helper function for API calls with retry logic
const apiCall = async <T>(
    endpoint: string,
    payload: any,
    maxRetries: number = 3
): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data as T;

        } catch (error) {
            lastError = error as Error;
            
            // Don't retry on client errors (4xx) or on last attempt
            if (lastError.message.includes('400') || 
                lastError.message.includes('401') ||
                lastError.message.includes('403') ||
                attempt === maxRetries) {
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
        console.error("Error calling Compendium API:", error);
        throw error; // Re-throw the original error object to preserve context
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
        console.error("Error calling Analysis API:", error);
        const typedError = error as any;
        if (typedError.message) {
            throw new Error(`AI API Error: ${typedError.message}`);
        }
        throw new Error("An unknown error occurred with the AI service.");
    }
};
