import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// Rate limiting in-memory store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const compendiumEntrySchema = {
    type: Type.OBJECT, 
    properties: { 
        name: { type: Type.STRING }, 
        category: { type: Type.STRING, enum: ['Herb', 'Kampo Formula', 'Supplement'] }, 
        summary: { type: Type.STRING }, 
        properties: { type: Type.STRING }, 
        channels: { type: Type.STRING }, 
        actions: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        indications: { type: Type.ARRAY, items: { type: Type.STRING } }, 
        constituentHerbs: { type: Type.STRING }, 
        clinicalNotes: { type: Type.STRING }, 
        contraindications: { type: Type.STRING }, 
    }, 
    required: ["name", "category", "summary", "actions", "indications"]
};

const compendiumResponseSchema = {
    type: Type.OBJECT, 
    properties: { 
        integrativeViewpoint: { type: Type.STRING }, 
        kampoEntries: { type: Type.ARRAY, items: compendiumEntrySchema }, 
        herbEntries: { type: Type.ARRAY, items: compendiumEntrySchema }, 
        supplementEntries: { type: Type.ARRAY, items: compendiumEntrySchema } 
    }, 
    required: ["integrativeViewpoint", "kampoEntries", "herbEntries", "supplementEntries"]
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
    const limit = 10; // 10 requests per minute
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
        const { query, language } = req.body;

        // Input validation
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query is required and must be a non-empty string' });
        }

        if (query.length > 500) {
            return res.status(400).json({ error: 'Query must be less than 500 characters' });
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
        const model = 'gemini-2.5-flash';
        const languageName = getLanguageName(language);

        const systemInstruction = `You are an expert AI Materia Medica and integrative medicine scholar with deep knowledge of Japanese Kampo medicine. Your function is to provide detailed, accurate, and structured information for a professional audience. Analyze the query.
- If the query appears to be a specific substance (e.g., an herb, a crude drug, a supplement, or a specific formula like "Kakkonto"), focus the response on providing a detailed entry for that substance in its correct category. Provide a concise integrative viewpoint related to that substance. Do not provide lists of other unrelated substances unless they are directly relevant for comparison.
- If the query appears to be a symptom, condition, or general concept (e.g., "headache," "fatigue," "qi stagnation"), provide a comprehensive integrative viewpoint and then provide categorized lists of relevant therapeutic options. In this case, you should suggest exactly three relevant Kampo formulas/crude drugs, exactly three relevant herbs, and five to seven relevant supplements.
- Order all suggestions by clinical relevance and efficacy, with the most effective and commonly used options first.
- For supplements, provide a diverse range covering different mechanisms and price points:
  * Include 2-3 primary evidence-based supplements (e.g., vitamins, minerals, omega-3)
  * Include 2-3 functional supplements (e.g., probiotics, adaptogens, amino acids)
  * Include 1-2 complementary or emerging options with good research support
  * Prioritize commonly available, well-researched options directly relevant to the query
  * DO NOT default to suggesting obscure supplements unless specifically relevant
- Focus on practical, accessible, and well-researched therapeutic options that give users meaningful choice based on budget, availability, and preference.
Your entire response MUST be a single, valid JSON object adhering to the schema, with all text in ${languageName}.`;

        const textPrompt = `Provide integrative compendium information for the query: "${query.trim()}"`;
        const contents = { parts: [{ text: textPrompt }] };

        const response = await ai.models.generateContent({ 
            model, 
            contents, 
            config: { 
                systemInstruction, 
                responseMimeType: "application/json", 
                responseSchema: compendiumResponseSchema 
            } 
        });

        const result = JSON.parse(response.text.trim());
        return res.status(200).json(result);

    } catch (error) {
        console.error('Compendium API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            return res.status(429).json({ error: 'Service temporarily unavailable. Please try again later.' });
        }
        
        return res.status(500).json({ error: 'Failed to process request. Please try again.' });
    }
}