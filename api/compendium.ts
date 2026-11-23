import { createHmac } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, HarmBlockThreshold, HarmCategory } from '@google/genai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Constants (defined locally for Vercel serverless function compatibility)
const GEMINI_MODEL = 'gemini-flash-latest';
const RATE_LIMIT_MAX = 10; // requests per window, per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ALLOWED_ORIGINS = [
  'https://self-care-guide.vercel.app',
  'https://self-care-guide-git-main-asofia888.vercel.app',
  'http://localhost:5173',
];
const LANGUAGES = ['ja', 'en'] as const;

// Distributed rate limiter (Upstash Redis / Vercel KV). Active only when the
// relevant environment variables are configured; otherwise the in-memory
// fallback below is used. Supports both Upstash and Vercel KV variable names.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const ratelimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, '60 s'),
        prefix: 'ratelimit:compendium',
        analytics: false,
      })
    : null;

// In-memory fallback (per serverless instance; used only when no Redis store is
// configured). Not shared across instances — provision Redis for production.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
let lastRateLimitSweep = 0;

// IP addresses are never stored as-is: the rate limiter keys on a keyed hash, so
// neither Redis nor memory holds a value that can be turned back into an IP. A
// plain SHA-256 of an IPv4 address could be reversed by brute force, hence HMAC.
const RATE_LIMIT_SECRET =
  process.env.RATE_LIMIT_SALT || process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const hashClientId = (ip: string): string =>
  createHmac('sha256', RATE_LIMIT_SECRET).update(ip).digest('hex').slice(0, 32);

// The first entry of x-forwarded-for is the client; later entries are proxies.
const getClientIp = (req: VercelRequest): string => {
  const raw = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value.split(',')[0].trim() || 'unknown';
};

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
    constitution: {
      type: Type.STRING,
      description:
        'Kampo formulas only: the pattern (証) the formula suits and the pattern it does not suit, in terms of excess/deficiency (虚実), heat/cold (寒熱), and qi-blood-fluid (気血水). Omit for Western herbs and supplements.',
    },
    evidenceLevel: {
      type: Type.STRING,
      format: 'enum',
      enum: ['traditional', 'limited', 'moderate', 'strong'],
      description:
        "Strength of human clinical evidence for the listed indications: 'traditional' = traditional use only, 'limited' = small or preliminary human studies, 'moderate' = several controlled trials with modest or mixed results, 'strong' = consistent controlled trials or meta-analyses.",
    },
    interactions: {
      type: Type.STRING,
      description:
        'Clinically relevant interactions with drugs, herbs, or supplements. Always provide this information.',
    },
    contraindications: {
      type: Type.STRING,
      description:
        'Contraindications, cautions for special populations, and notable adverse effects. Always provide this information.',
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
    'evidenceLevel',
    'interactions',
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
    whenToSeeDoctor: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'Specific warning signs that mean the person should see a doctor instead of relying on self-care. One short sentence per item.',
    },
    kampoEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
    westernHerbEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
    supplementEntries: { type: Type.ARRAY, items: compendiumEntrySchema },
  },
  required: ['integrativeViewpoint', 'whenToSeeDoctor', 'westernHerbEntries', 'supplementEntries'],
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

const checkRateLimitInMemory = (clientId: string): boolean => {
  const now = Date.now();

  // Drop expired entries so hashed client IDs are not kept beyond their window.
  if (now - lastRateLimitSweep > RATE_LIMIT_WINDOW_MS) {
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetTime) rateLimitStore.delete(key);
    }
    lastRateLimitSweep = now;
  }

  const record = rateLimitStore.get(clientId);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
};

// Returns true when the request is within limits. Uses the distributed limiter
// when configured, otherwise the per-instance in-memory fallback.
const isWithinRateLimit = async (clientId: string): Promise<boolean> => {
  if (ratelimit) {
    const { success } = await ratelimit.limit(clientId);
    return success;
  }
  return checkRateLimitInMemory(clientId);
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

  // Rate limiting (keyed on a hash of the client IP; see hashClientId)
  if (!(await isWithinRateLimit(hashClientId(getClientIp(req))))) {
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

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: API_KEY });

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

CRITICAL - WHEN TO SEE A DOCTOR (whenToSeeDoctor, MANDATORY):
- For a SYMPTOM or CONDITION query: list 3-5 specific warning signs that mean the person should see a doctor rather than rely on self-care (e.g. symptoms lasting more than two weeks, high fever, unexplained weight loss, blood in stool or urine, severe or worsening pain). If the query could describe a medical emergency, the first item must tell them to seek emergency care immediately.
- For a SPECIFIC SUBSTANCE query: list 2-4 signs of an adverse reaction that mean they should stop using it and see a doctor (e.g. rash, jaundice or dark urine, swelling or edema, palpitations, raised blood pressure).
- One short, concrete sentence per item. Never suggest that herbs or supplements can replace medical care.

CRITICAL - LANGUAGE REQUIREMENT:
ALL text fields including name, category, summary, properties, constitution, actions, indications, constituentHerbs, clinicalNotes, interactions, contraindications, and whenToSeeDoctor MUST be written ENTIRELY in ${languageName}. Do not mix languages. Every single word must be in the specified language. The only exception is evidenceLevel, which must be one of its fixed English values.
${language === 'ja' ? "- Use '西洋ハーブ' for Western Herb, '漢方処方' for Kampo Formula, 'サプリメント' for Supplement" : "- Use 'Western Herb', 'Kampo Formula', 'Supplement' for categories"}

CRITICAL - ALWAYS INCLUDE FOR EVERY ENTRY:
1. constituentHerbs: Main herbs in Kampo formulas, or active compounds in Western herbs/supplements (in ${languageName})
2. clinicalNotes: Clinical applications, research evidence, and traditional use (1-2 sentences minimum, in ${languageName})
3. evidenceLevel: Rate honestly from human clinical evidence for the listed indications. Do not inflate it; traditional use alone is 'traditional'.
4. interactions: Name specific drugs or drug classes (e.g. anticoagulants, antidiabetics, antihypertensives, CYP3A4 substrates, interferon) and overlapping herbs (e.g. licorice or ephedra duplicated across Kampo formulas). If no clinically significant interaction is documented, say exactly that; never describe the substance as safe.
5. contraindications: Cover pregnancy and breastfeeding, children, older adults, relevant medical conditions, and notable adverse effects (e.g. pseudoaldosteronism from licorice/甘草, palpitations or raised blood pressure from ephedra/麻黄, interstitial pneumonia or liver injury where reported). Never fall back to a generic "generally safe" statement.

FOR KAMPO FORMULAS ALSO INCLUDE:
- constitution: The pattern (証) the formula suits and the pattern it does not suit, in terms of excess/deficiency (虚実), heat/cold (寒熱), and qi-blood-fluid (気血水) (in ${languageName}).

These fields are MANDATORY. Never omit them.

Order by clinical relevance. Be concise but complete. Focus on accessible, well-researched options.

Output: Valid JSON only, no markdown.`;

    const textPrompt = `Provide integrative compendium information for the query: "${query.trim()}"`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
      config: {
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
        ],
        responseMimeType: 'application/json',
        responseSchema: compendiumResponseSchema,
      },
    });

    // The SDK exposes the aggregated response text via the `text` getter.
    const responseText = (response.text ?? '').trim();

    if (!responseText) {
      console.error('Empty response from Gemini API');
      return res.status(500).json({ error: 'Empty response from AI service. Please try again.' });
    }

    // Log response for debugging (first 500 chars in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Gemini response preview:', responseText.substring(0, 500));
    }

    // Search terms and generated health content are never written to the logs:
    // only their shape and size, so that logs hold no health information.
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      // Only the error name: V8's JSON.parse messages quote part of the input.
      console.error('JSON parse error:', parseError instanceof Error ? parseError.name : 'unknown');
      console.error('Response length:', responseText.length);
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
        responseKeys: Object.keys(result ?? {}),
        language,
      });
      return res
        .status(500)
        .json({ error: 'Incomplete response from AI service. Please try again.' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Compendium API error encountered');
    console.error('Language:', language, 'Query length:', query?.length ?? 0);

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
