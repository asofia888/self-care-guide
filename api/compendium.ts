import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// Rate limiting in-memory store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const compendiumEntrySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['Western Herb', 'Kampo Formula', 'Supplement'] },
        summary: { type: Type.STRING },
        properties: { type: Type.STRING },
        channels: { type: Type.STRING },
        actions: { type: Type.ARRAY, items: { type: Type.STRING } },
        indications: { type: Type.ARRAY, items: { type: Type.STRING } },
        constituentHerbs: { type: Type.STRING },
        clinicalNotes: { type: Type.STRING },
        contraindications: { type: Type.STRING, description: "Important contraindications, warnings, and precautions. Always provide this information." },
    },
    required: ["name", "category", "summary", "actions", "indications", "contraindications"]
};

const compendiumResponseSchema = {
    type: Type.OBJECT,
    properties: {
        integrativeViewpoint: { type: Type.STRING },
        kampoEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
        westernHerbEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
        supplementEntries: { type: Type.ARRAY, items: compendiumEntrySchema }
    },
    required: ["integrativeViewpoint", "kampoEntries", "westernHerbEntries", "supplementEntries"]
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
        const model = 'gemini-flash-latest';
        const languageName = getLanguageName(language);

        const systemInstruction = `You are an expert integrative medicine AI combining Kampo and Western herbal traditions. Provide concise, evidence-based recommendations in ${languageName}.

For specific substances: Provide ONE detailed entry in the correct category with brief integrative viewpoint.

For symptoms/conditions: Provide integrative viewpoint plus:
- 3 Kampo formulas (traditional multi-herb Japanese prescriptions like Kakkonto, Hochuekkito)
- 3 Western herbs (European/American herbs like Echinacea, Valerian, Chamomile, St. John's Wort)
- 5-7 supplements (modern supplements: vitamins, minerals, probiotics, amino acids, etc.)

IMPORTANT: ALWAYS include contraindications for EVERY entry. This is critical safety information. Even if minimal, state "Generally safe when used as directed" or similar. Never omit this field.

Order by clinical relevance. Be concise but complete. Focus on accessible, well-researched options.

Output: Valid JSON only, no markdown.`;

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