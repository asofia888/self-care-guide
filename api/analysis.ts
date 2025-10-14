import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// Constants (defined locally for Vercel serverless function compatibility)
const GEMINI_MODEL = 'gemini-flash-latest';
const RATE_LIMIT = {
    REQUESTS_PER_MINUTE: 5,
    WINDOW_MS: 60 * 1000,
};
const ALLOWED_ORIGINS = [
    'https://self-care-guide.vercel.app',
    'https://self-care-guide-git-main-asofia888.vercel.app',
    'http://localhost:5173',
];
const ALLOWED_MODES = ['professional', 'general'] as const;
const ALLOWED_LANGUAGES = ['ja', 'en'] as const;

type AnalysisMode = typeof ALLOWED_MODES[number];
type Language = typeof ALLOWED_LANGUAGES[number];

// Rate limiting in-memory store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const professionalSuggestionSchema = {
    type: Type.OBJECT, 
    properties: { 
        name: { type: Type.STRING }, 
        reason: { type: Type.STRING }, 
        usage: { type: Type.STRING }, 
        constituentHerbs: { type: Type.STRING, description: 'Optional. The main herbs in the formula.' }, 
        pharmacology: { type: Type.STRING, description: 'Optional. Known pharmacological actions.' }, 
        contraindications: { type: Type.STRING, description: 'Optional. Warnings or contraindications.' }, 
    }, 
    required: ["name", "reason", "usage"]
};

const generalSuggestionSchema = {
    type: Type.OBJECT, 
    properties: { 
        name: { type: Type.STRING }, 
        reason: { type: Type.STRING }, 
        usage: { type: Type.STRING }, 
    }, 
    required: ["name", "reason", "usage"]
};

const folkRemedySchema = {
    type: Type.OBJECT, 
    properties: { 
        name: { type: Type.STRING }, 
        description: { type: Type.STRING }, 
        rationale: { type: Type.STRING, description: 'Optional. The reasoning behind the remedy.' }, 
    }, 
    required: ["name", "description"]
};

const lifestyleAdviceSchema = {
    type: Type.OBJECT, 
    properties: { 
        diet: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        sleep: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        exercise: { type: Type.ARRAY, items: { type: Type.STRING } }, 
    }, 
    required: ["diet", "sleep", "exercise"]
};

const professionalAnalysisSchema = {
    type: Type.OBJECT, 
    properties: { 
        analysisMode: { type: Type.STRING, enum: ['professional'] }, 
        differentialDiagnosis: { 
            type: Type.OBJECT, 
            properties: { 
                pattern: { type: Type.STRING, description: "e.g., Liver Qi Stagnation with Spleen Deficiency" }, 
                pathology: { type: Type.STRING, description: "The underlying pathological process." }, 
                evidence: { type: Type.STRING, description: "Key signs and symptoms supporting the diagnosis." }, 
            }, 
            required: ["pattern", "pathology", "evidence"] 
        }, 
        rationale: { type: Type.STRING, description: "Detailed reasoning for the diagnosis." }, 
        treatmentPrinciple: { type: Type.STRING, description: "The primary strategy for treatment." }, 
        herbSuggestions: { type: Type.ARRAY, items: professionalSuggestionSchema }, 
        kampoSuggestions: { type: Type.ARRAY, items: professionalSuggestionSchema }, 
        supplementSuggestions: { type: Type.ARRAY, items: professionalSuggestionSchema }, 
        folkRemedies: { type: Type.ARRAY, items: folkRemedySchema, description: "Optional folk remedies." }, 
        lifestyleAdvice: lifestyleAdviceSchema, 
        precautions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important precautions and warnings." }, 
    }, 
    required: ["analysisMode", "differentialDiagnosis", "rationale", "treatmentPrinciple", "herbSuggestions", "kampoSuggestions", "supplementSuggestions", "lifestyleAdvice", "precautions"]
};

const generalAnalysisSchema = {
    type: Type.OBJECT, 
    properties: { 
        analysisMode: { type: Type.STRING, enum: ['general'] }, 
        wellnessProfile: { 
            type: Type.OBJECT, 
            properties: { 
                title: { type: Type.STRING, description: "A concise title for the user's wellness profile." }, 
                summary: { type: Type.STRING, description: "A brief, easy-to-understand summary of their condition." }, 
            }, 
            required: ["title", "summary"] 
        }, 
        herbSuggestions: { type: Type.ARRAY, items: generalSuggestionSchema }, 
        supplementSuggestions: { type: Type.ARRAY, items: generalSuggestionSchema }, 
        folkRemedies: { type: Type.ARRAY, items: folkRemedySchema, description: "Optional self-care tips." }, 
        lifestyleAdvice: lifestyleAdviceSchema, 
        precautions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important precautions and warnings." }, 
    }, 
    required: ["analysisMode", "wellnessProfile", "herbSuggestions", "supplementSuggestions", "lifestyleAdvice", "precautions"]
};

// Helper functions
const getLanguageName = (langCode: Language): string => {
    const level = 'Medical Professional Level';
    const languageMap: Record<Language, string> = {
        ja: 'Japanese',
        en: 'English'
    };
    return `${languageMap[langCode]} (${level})`;
};

const getClientIP = (req: VercelRequest): string => {
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    return Array.isArray(clientIP) ? clientIP[0] : clientIP;
};

const checkRateLimit = (ip: string): boolean => {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS });
        return true;
    }

    if (record.count >= RATE_LIMIT.REQUESTS_PER_MINUTE) {
        return false;
    }

    record.count++;
    return true;
};

const setSecurityHeaders = (res: VercelResponse): void => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
};

const setCORSHeaders = (req: VercelRequest, res: VercelResponse): void => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const buildSystemInstruction = (languageName: string): string => {
    return `You are an expert AI in integrative medicine, skilled in Japanese Kampo, TCM, and modern wellness. Your task is to analyze user-provided data and generate a structured, professional-level (for 'professional' mode) or easy-to-understand (for 'general' mode) wellness analysis.
- Analyze the provided text data to form a comprehensive assessment.
- Base your suggestions on evidence and traditional knowledge. For 'professional' mode, be specific and clinical. For 'general' mode, be safe, practical, and encouraging.
- Your entire response MUST be a single, valid JSON object adhering to the provided schema, with all text in ${languageName}.
- Do not include any markdown formatting (like \`\`\`json) in your response, only the raw JSON object.`;
};

const buildPrompt = (mode: AnalysisMode, profile: object): string => {
    return `Please perform a wellness analysis.
- Mode: ${mode}
- User Profile: ${JSON.stringify(profile, null, 2)}`;
};

interface RequestBody {
    mode?: string;
    profile?: unknown;
    language?: string;
}

const validateRequest = (body: RequestBody): { mode: AnalysisMode; profile: object; language: Language } | { error: string } => {
    const { mode, profile, language } = body;

    if (!mode || !ALLOWED_MODES.includes(mode as AnalysisMode)) {
        return { error: 'Mode must be "professional" or "general"' };
    }

    if (!profile || typeof profile !== 'object') {
        return { error: 'Profile is required and must be an object' };
    }

    if (!language || !ALLOWED_LANGUAGES.includes(language as Language)) {
        return { error: 'Language must be "ja" or "en"' };
    }

    return {
        mode: mode as AnalysisMode,
        profile: profile as object,
        language: language as Language
    };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);
    setCORSHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = getClientIP(req);
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    try {
        const validation = validateRequest(req.body);
        if ('error' in validation) {
            return res.status(400).json({ error: validation.error });
        }

        const { mode, profile, language } = validation;

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

        // Validate API key
        if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.trim() === '') {
            console.error('API key validation failed');
            console.error('API_KEY value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
            console.error('Environment variables with API/GEMINI:',
                Object.keys(process.env)
                    .filter(key => key.includes('API') || key.includes('GEMINI'))
                    .map(key => `${key}=${process.env[key]?.substring(0, 10)}...`)
            );
            return res.status(500).json({
                error: 'Service configuration error. API key not properly configured.',
                hint: 'Please ensure GEMINI_API_KEY is set in Vercel environment variables'
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        const languageName = getLanguageName(language);
        const responseSchema = mode === 'professional' ? professionalAnalysisSchema : generalAnalysisSchema;
        const systemInstruction = buildSystemInstruction(languageName);
        const textPrompt = buildPrompt(mode, profile);

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: { parts: [{ text: textPrompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            }
        });

        const result = JSON.parse(response.text.trim());
        return res.status(200).json(result);

    } catch (error) {
        console.error('Analysis API error:', error);

        // Log detailed error information
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        } else {
            console.error('Non-Error object:', JSON.stringify(error, null, 2));
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle specific API errors
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            return res.status(429).json({ error: 'Service temporarily unavailable due to high demand. Please try again later.' });
        }

        if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('UNAUTHENTICATED')) {
            console.error('Authentication error - check API key configuration');
            return res.status(500).json({ error: 'Service configuration error. Please contact support.' });
        }

        if (errorMessage.includes('timeout') || errorMessage.includes('DEADLINE_EXCEEDED')) {
            return res.status(504).json({ error: 'Request timeout. Please try again.' });
        }

        // Generic error with more context in development
        const isDevelopment = process.env.NODE_ENV === 'development';
        return res.status(500).json({
            error: 'Failed to process analysis request. Please try again.',
            ...(isDevelopment && { details: errorMessage })
        });
    }
}