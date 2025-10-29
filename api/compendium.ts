import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, SchemaType, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

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
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    category: {
      type: SchemaType.STRING,
      description:
        "Category of the entry. For English: 'Western Herb', 'Kampo Formula', or 'Supplement'. For Japanese: '西洋ハーブ', '漢方処方', or 'サプリメント'.",
    },
    summary: { type: SchemaType.STRING },
    properties: { type: SchemaType.STRING },
    channels: { type: SchemaType.STRING },
    actions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    indications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    constituentHerbs: {
      type: SchemaType.STRING,
      description:
        'Key constituent herbs in Kampo formulas, or active compounds in Western herbs/supplements. Always provide this.',
    },
    clinicalNotes: {
      type: SchemaType.STRING,
      description:
        'Clinical applications, research evidence, and traditional use notes. Always provide this information.',
    },
    contraindications: {
      type: SchemaType.STRING,
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
  type: SchemaType.OBJECT,
  properties: {
    integrativeViewpoint: {
      type: SchemaType.STRING,
      description:
        'Integrative perspective explaining the holistic approach combining Eastern and Western medicine. IMPORTANT: Must be 280-320 characters for Japanese, 180-220 words for English. Provide sufficient detail within this range.',
    },
    kampoEntries: { type: SchemaType.ARRAY, items: compendiumEntrySchema },
    westernHerbEntries: { type: SchemaType.ARRAY, items: compendiumEntrySchema },
    supplementEntries: { type: SchemaType.ARRAY, items: compendiumEntrySchema },
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

  let query = '';
  let language = '';

  try {
    const reqData = req.body;
    query = reqData.query;
    language = reqData.language;

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
      console.error('❌ API key validation failed');
      console.error('API_KEY present:', !!API_KEY);
      console.error('API_KEY is placeholder:', API_KEY === 'PLACEHOLDER_API_KEY');
      console.error('API_KEY is empty string:', API_KEY?.trim() === '');

      // Log all environment variables for debugging (safe approach - only in error case)
      const envVars = Object.keys(process.env)
        .filter((key) => key.includes('GEMINI') || key.includes('GOOGLE') || key.includes('API'))
        .map((key) => `${key}=${process.env[key] ? '✓ set' : '✗ undefined'}`);

      if (envVars.length > 0) {
        console.error('Relevant environment variables:', envVars.join(', '));
      } else {
        console.error('⚠️ No GEMINI, GOOGLE, or API environment variables found!');
      }

      return res.status(500).json({
        error: 'Service configuration error. Please contact support.',
        code: 'API_KEY_NOT_CONFIGURED',
      });
    }

    console.log('✓ API key validation passed - key is configured');
    console.log('API key length:', API_KEY.length, 'characters');
    console.log('API key format (first 15 + last 5):', `${API_KEY.substring(0, 15)}...${API_KEY.substring(API_KEY.length - 5)}`);


    // Initialize Gemini AI
    const ai = new GoogleGenerativeAI(API_KEY);

    // Get language name
    const languageName = getLanguageName(language);

    // Build language-specific system instruction
    const systemInstruction = `You are a medical and health information assistant. You provide factual, educational information about herbs, supplements, and traditional medicine practices. This is legitimate medical education content.

You are an expert integrative medicine AI combining Kampo and Western herbal traditions. Provide concise, evidence-based recommendations in ${languageName}.

IMPORTANT: All responses are educational medical information. This is NOT sexual content - it is health and wellness information for professional and educational purposes.

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
${language === 'ja' ? "- Use '西洋ハーブ' for Western Herb, '漢方処方' for Kampo Formula, 'サプリメント' for Supplement" : "- Use 'Western Herb', 'Kampo Formula', 'Supplement' for categories"}

CRITICAL - ALWAYS INCLUDE FOR EVERY ENTRY:
1. constituentHerbs: Main herbs in Kampo formulas, or active compounds in Western herbs/supplements (in ${languageName})
2. clinicalNotes: Clinical applications, research evidence, and traditional use (1-2 sentences minimum, in ${languageName})
3. contraindications: Safety information, warnings, and precautions (in ${languageName}, state "Generally safe when used as directed" equivalent in target language)

These fields are MANDATORY. Never omit them.

Order by clinical relevance. Be concise but complete. Focus on accessible, well-researched options.

Output: Valid JSON only, no markdown.`;

    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ] as any,
    });

    const textPrompt = `Provide integrative compendium information for the query: "${query.trim()}"`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: compendiumResponseSchema,
      },
    } as any);

    // Validate response before parsing
    let responseText = '';

    // Try different ways to extract text from response
    if (response.response?.text) {
      const textValue = response.response.text;
      // Handle if it's a function or a string
      responseText = typeof textValue === 'function' ? textValue() : textValue;
    } else if ((response as any)?.text) {
      const textValue = (response as any).text;
      responseText = typeof textValue === 'function' ? textValue() : textValue;
    } else if (Array.isArray((response as any)?.candidates) && (response as any).candidates.length > 0) {
      const content = (response as any).candidates[0]?.content;
      if (content?.parts && content.parts.length > 0) {
        responseText = content.parts[0].text || '';
      }
    }

    responseText = responseText.trim();

    if (!responseText) {
      console.error('Empty response from Gemini API');
      console.error('Response keys:', Object.keys(response));
      if ((response as any)?.response) {
        console.error('Response.response keys:', Object.keys((response as any).response));
      }
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
      console.error('❌ Missing required fields in response:', {
        hasIntegrativeViewpoint: !!result.integrativeViewpoint,
        hasWesternHerbEntries: !!result.westernHerbEntries,
        hasSupplementEntries: !!result.supplementEntries,
        kampoEntries: result.kampoEntries ? `${result.kampoEntries.length} entries` : 'undefined',
      });
      console.error('Response structure:', JSON.stringify(result, null, 2).substring(0, 1000));
      console.error('Query was:', query, 'Language:', language);
      return res
        .status(500)
        .json({ error: 'Incomplete response from AI service. Please try again.' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Compendium API error encountered');
    console.error('Query:', query);
    console.error('Language:', language);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack?.substring(0, 500));
    } else if (error && typeof error === 'object') {
      console.error('Error object:', JSON.stringify(error, null, 2).substring(0, 500));
    } else {
      console.error('Unknown error type:', error);
    }

    const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');

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
