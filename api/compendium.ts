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
const LANGUAGES = ['ja', 'en'] as const;

// Rate limiting in-memory store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const compendiumEntrySchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    category: {
      type: Type.STRING,
      description:
        "Category of the entry. For English: 'Western Herb', 'Kampo Formula', or 'Supplement'. For Japanese: '西洋ハーブ', '漢方処方', or 'サプリメント'.",
    },
    summary: { type: Type.STRING },
    properties: { type: Type.STRING },
    channels: { type: Type.STRING },
    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
    indications: { type: Type.ARRAY, items: { type: Type.STRING } },
    constituentHerbs: {
      type: Type.STRING,
      description:
        'Key constituent herbs in Kampo formulas, or active compounds in Western herbs/supplements. Always provide this.',
    },
    clinicalNotes: {
      type: Type.STRING,
      description:
        'Clinical applications, research evidence, and traditional use notes. Always provide this information.',
    },
    contraindications: {
      type: Type.STRING,
      description:
        'Important contraindications, warnings, and precautions. Always provide this information.',
    },
  },
  required: [
    'name',
    'category',
    'summary',
    'actions',
    'indications',
    'constituentHerbs',
    'clinicalNotes',
    'contraindications',
  ],
};

const compendiumResponseSchema = {
  type: Type.OBJECT,
  properties: {
    integrativeViewpoint: {
      type: Type.STRING,
      description:
        'Integrative perspective explaining the holistic approach combining Eastern and Western medicine. IMPORTANT: Must be 280-320 characters for Japanese, 180-220 words for English. Provide sufficient detail within this range.',
    },
    kampoEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
    westernHerbEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
    supplementEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
  },
  required: ['integrativeViewpoint', 'westernHerbEntries', 'supplementEntries'],
};

const getLanguageName = (langCode: string) => {
  const level = 'Medical Professional Level';
  switch (langCode) {
    case 'ja':
      return `Japanese (${level})`;
    case 'en':
      return `English (${level})`;
    default:
      return `English (${level})`;
  }
};

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = RATE_LIMIT.REQUESTS_PER_MINUTE * 2; // 10 requests per minute for compendium
  const windowMs = RATE_LIMIT.WINDOW_MS;

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

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy for API endpoint
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none';"
  );

  // CORS for frontend
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

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

    if (!language || !LANGUAGES.includes(language as (typeof LANGUAGES)[number])) {
      return res.status(400).json({ error: 'Language must be "ja" or "en"' });
    }

    // Get API key from environment
    const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

    // Validate API key
    if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY.trim() === '') {
      console.error('API key validation failed');
      console.error('API_KEY value:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');
      console.error(
        'Environment variables with API/GEMINI:',
        Object.keys(process.env)
          .filter((key) => key.includes('API') || key.includes('GEMINI'))
          .map((key) => `${key}=${process.env[key]?.substring(0, 10)}...`)
      );
      return res.status(500).json({
        error: 'Service configuration error. API key not properly configured.',
        hint: 'Please ensure GEMINI_API_KEY is set in Vercel environment variables',
      });
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const languageName = getLanguageName(language);

    const systemInstruction = `You are an expert integrative medicine AI combining Kampo and Western herbal traditions. Provide concise, evidence-based recommendations in ${languageName}.

QUERY TYPE DETECTION (Critical):
1. If the query is for a SPECIFIC SUBSTANCE (herb, supplement, Kampo formula, botanical name like "Tongkat Ali", "Ginseng", "Turmeric", "Echinacea", etc.):
   - Return ONLY that ONE substance with its integrative viewpoint
   - Ignore related substances - focus ONLY on what was queried
   - Leave kampoEntries, westernHerbEntries, and supplementEntries arrays with AT MOST ONE entry each based on what the query is
   - If the substance is a Western herb → put it ONLY in westernHerbEntries
   - If the substance is a supplement → put it ONLY in supplementEntries
   - If the substance is a Kampo formula → put it ONLY in kampoEntries
   - Leave other arrays EMPTY

2. If the query is for a SYMPTOM, CONDITION, or HEALTH STATE (like "fatigue", "insomnia", "low energy", "joint pain", etc.):
   - Return integrative viewpoint plus multiple related options
   - Include 1-3 Kampo formulas if relevant (empty array if not found)
   - Include 3 Western herbs (European/American herbs)
   - Include 5-7 supplements

CRITICAL - LENGTH REQUIREMENT FOR INTEGRATIVE VIEWPOINT:
The integrativeViewpoint field MUST be detailed and comprehensive within the specified length:
- Japanese: 280-320 characters (aim for around 300 characters)
- English: 180-220 words (aim for around 200 words)
Do NOT write shorter than the minimum. Provide sufficient detail about how Eastern and Western approaches complement each other.

CRITICAL - LANGUAGE REQUIREMENT:
ALL fields including name, category, summary, properties, actions, indications, constituentHerbs, clinicalNotes, and contraindications MUST be written ENTIRELY in ${languageName}. Do not mix languages. Every single word must be in the specified language.
- For Japanese: Use '西洋ハーブ' for Western Herb, '漢方処方' for Kampo Formula, 'サプリメント' for Supplement
- For English: Use 'Western Herb', 'Kampo Formula', 'Supplement'

CRITICAL - ALWAYS INCLUDE FOR EVERY ENTRY:
1. constituentHerbs: Main herbs in Kampo formulas, or active compounds in Western herbs/supplements (in ${languageName})
2. clinicalNotes: Clinical applications, research evidence, and traditional use (1-2 sentences minimum, in ${languageName})
3. contraindications: Safety information, warnings, and precautions (in ${languageName}, even if minimal, state equivalent of "Generally safe when used as directed" in the target language)

These fields are MANDATORY. Never omit them. All content must be in ${languageName}.

Order by clinical relevance. Be concise but complete. Focus on accessible, well-researched options.

Output: Valid JSON only, no markdown.`;

    const textPrompt = `Provide integrative compendium information for the query: "${query.trim()}"`;
    const contents = { parts: [{ text: textPrompt }] };

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: compendiumResponseSchema,
      },
    });

    // Validate response before parsing
    const responseText = response.text.trim();
    if (!responseText) {
      console.error('Empty response from Gemini API');
      return res.status(500).json({ error: 'Empty response from AI service. Please try again.' });
    }

    // Log response for debugging (first 500 chars in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Gemini response preview:', responseText.substring(0, 500));
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text (first 1000 chars):', responseText.substring(0, 1000));
      return res
        .status(500)
        .json({ error: 'Invalid response format from AI service. Please try again.' });
    }

    // Validate required fields in response
    if (!result.integrativeViewpoint || !result.westernHerbEntries || !result.supplementEntries) {
      console.error('Missing required fields in response:', {
        hasIntegrativeViewpoint: !!result.integrativeViewpoint,
        hasWesternHerbEntries: !!result.westernHerbEntries,
        hasSupplementEntries: !!result.supplementEntries,
      });
      return res
        .status(500)
        .json({ error: 'Incomplete response from AI service. Please try again.' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Compendium API error:', error);

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
    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')
    ) {
      return res.status(429).json({
        error: 'Service temporarily unavailable due to high demand. Please try again later.',
      });
    }

    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('UNAUTHENTICATED')
    ) {
      console.error('Authentication error - check API key configuration');
      return res
        .status(500)
        .json({ error: 'Service configuration error. Please contact support.' });
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('DEADLINE_EXCEEDED')) {
      return res.status(504).json({ error: 'Request timeout. Please try again.' });
    }

    // Generic error with more context in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
      error: 'Failed to process request. Please try again.',
      ...(isDevelopment && { details: errorMessage }),
    });
  }
}
