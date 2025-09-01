import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

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

const getLanguageName = (langCode: string) => {
    const level = 'Medical Professional Level';
    switch (langCode) {
        case 'ja': return `Japanese (${level})`;
        case 'en': return `English (${level})`;
        default: return `English (${level})`;
    }
};

const checkRateLimit = (ip: string): boolean => {
    const now = Date.now();
    const limit = 5; // 5 requests per minute (more restrictive for analysis)
    const windowMs = 60 * 1000; // 1 minute

    const key = ip;
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    rateLimitStore.set(key, record);
    return true;
};

const processImageFile = async (imageData: string, mimeType: string) => {
    // Validate image type
    if (!mimeType.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
    }

    // Validate image size (base64 encoded, so approximate)
    const sizeInBytes = (imageData.length * 3) / 4;
    if (sizeInBytes > 4 * 1024 * 1024) { // 4MB limit
        throw new Error('Image too large. Maximum size is 4MB.');
    }

    return {
        inlineData: { data: imageData, mimeType },
    };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set security headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // CORS for frontend
    const allowedOrigins = [
        'https://self-care-guide.vercel.app',
        'https://self-care-guide-git-main-asofia888.vercel.app',
        'http://localhost:5173'
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP;
    
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    try {
        const { mode, profile, language, faceImage, tongueImage } = req.body;

        // Input validation
        if (!mode || !['professional', 'general'].includes(mode)) {
            return res.status(400).json({ error: 'Mode must be "professional" or "general"' });
        }

        if (!profile || typeof profile !== 'object') {
            return res.status(400).json({ error: 'Profile is required and must be an object' });
        }

        if (!language || !['ja', 'en'].includes(language)) {
            return res.status(400).json({ error: 'Language must be "ja" or "en"' });
        }

        // Get API key from environment
        const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!API_KEY) {
            console.error('Environment variables available:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('GEMINI')));
            console.error('GEMINI_API_KEY not configured - check Vercel environment variables');
            return res.status(500).json({ 
                error: 'Service configuration error', 
                details: 'API key not configured properly'
            });
        }

        // Initialize Gemini AI
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const model = 'gemini-2.0-flash-exp';
        const languageName = getLanguageName(language);
        const responseSchema = mode === 'professional' ? professionalAnalysisSchema : generalAnalysisSchema;

        const systemInstruction = `You are an expert AI in integrative medicine, skilled in Japanese Kampo, TCM, and modern wellness. Your task is to analyze user-provided data and generate a structured, professional-level (for 'professional' mode) or easy-to-understand (for 'general' mode) wellness analysis.
- Analyze all provided text data and any images (face, tongue) to form a comprehensive assessment.
- If images are provided, incorporate visual diagnosis (e.g., tongue diagnosis, facial complexion) into your analysis.
- Base your suggestions on evidence and traditional knowledge. For 'professional' mode, be specific and clinical. For 'general' mode, be safe, practical, and encouraging.
- Your entire response MUST be a single, valid JSON object adhering to the provided schema, with all text in ${languageName}.
- Do not include any markdown formatting (like \`\`\`json) in your response, only the raw JSON object.`;

        const textPrompt = `Please perform a wellness analysis.
- Mode: ${mode}
- User Profile: ${JSON.stringify(profile, null, 2)}
- If images are included, analyze them for signs relevant to the assessment (e.g., tongue coating, color, shape; facial complexion).`;

        const contents: any[] = [{ text: textPrompt }];

        // Process images if provided
        if (faceImage && faceImage.data && faceImage.mimeType) {
            try {
                contents.push({ text: "User's face image:" });
                contents.push(await processImageFile(faceImage.data, faceImage.mimeType));
            } catch (error) {
                console.error('Error processing face image:', error);
                return res.status(400).json({ error: 'Invalid face image format' });
            }
        }

        if (tongueImage && tongueImage.data && tongueImage.mimeType) {
            try {
                contents.push({ text: "User's tongue image:" });
                contents.push(await processImageFile(tongueImage.data, tongueImage.mimeType));
            } catch (error) {
                console.error('Error processing tongue image:', error);
                return res.status(400).json({ error: 'Invalid tongue image format' });
            }
        }

        const response = await ai.models.generateContent({
            model,
            contents: { parts: contents },
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            return res.status(429).json({ error: 'Service temporarily unavailable. Please try again later.' });
        }
        
        return res.status(500).json({ error: 'Failed to process analysis request. Please try again.' });
    }
}