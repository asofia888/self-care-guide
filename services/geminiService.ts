import { GoogleGenAI, Type } from "@google/genai";
import type { 
    Language, CompendiumResult, AnalysisMode, AnyUserProfile, AnalysisResult
} from '../types';

const API_KEY = import.meta.env.VITE_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ 
    apiKey: API_KEY,
    // Add fetch configuration for better mobile compatibility
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        // Use standard fetch with proper headers for mobile
        const config = {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
            },
        };
        return fetch(input, config);
    }
});

const getLanguageName = (langCode: Language) => {
    const level = 'Medical Professional Level';
    switch (langCode) {
        case 'ja': return `Japanese (${level})`;
        case 'en': return `English (${level})`;
        default: return `English (${level})`;
    }
}

// Helper function for retrying API calls with exponential backoff
const withRetry = async <T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            
            // Don't retry on certain types of errors
            if (lastError.message.includes('API_KEY') || 
                lastError.message.includes('quota') ||
                attempt === maxRetries) {
                throw lastError;
            }
            
            // Wait with exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError!;
};

// --- COMPENDIUM FUNCTION ---
const compendiumEntrySchema = {
    type: Type.OBJECT, properties: { name: { type: Type.STRING }, category: { type: Type.STRING, enum: ['Herb', 'Kampo Formula', 'Supplement'] }, summary: { type: Type.STRING }, properties: { type: Type.STRING }, channels: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } }, indications: { type: Type.ARRAY, items: { type: Type.STRING } }, constituentHerbs: { type: Type.STRING }, clinicalNotes: { type: Type.STRING }, contraindications: { type: Type.STRING }, }, required: ["name", "category", "summary", "actions", "indications"]
};
const compendiumResponseSchema = {
    type: Type.OBJECT, properties: { integrativeViewpoint: { type: Type.STRING }, kampoEntries: { type: Type.ARRAY, items: compendiumEntrySchema }, herbEntries: { type: Type.ARRAY, items: compendiumEntrySchema }, supplementEntries: { type: Type.ARRAY, items: compendiumEntrySchema } }, required: ["integrativeViewpoint", "kampoEntries", "herbEntries", "supplementEntries"]
};

export const getCompendiumInfo = async (query: string, language: Language): Promise<CompendiumResult> => {
    const model = 'gemini-2.5-flash';
    const languageName = getLanguageName(language);
    const systemInstruction = `You are an expert AI Materia Medica and integrative medicine scholar with deep knowledge of Japanese Kampo medicine. Your function is to provide detailed, accurate, and structured information for a professional audience. Analyze the query.
- If the query appears to be a specific substance (e.g., an herb, a crude drug, a supplement, or a specific formula like "Kakkonto"), focus the response on providing a detailed entry for that substance in its correct category. Provide a concise integrative viewpoint related to that substance. Do not provide lists of other unrelated substances unless they are directly relevant for comparison.
- If the query appears to be a symptom, condition, or general concept (e.g., "headache," "fatigue," "qi stagnation"), provide a comprehensive integrative viewpoint and then provide categorized lists of relevant therapeutic options. In this case, you should suggest at least two relevant Kampo formulas/crude drugs, two relevant herbs, and five relevant supplements.
One of the supplement suggestions, if relevant, should be a lesser-known but promising one like Nucleic Acid (核酸), with a clear rationale.
Your entire response MUST be a single, valid JSON object adhering to the schema, with all text in ${languageName}.`;
    const textPrompt = `Provide integrative compendium information for the query: "${query}"`;
    const contents = { parts: [{ text: textPrompt }] }; // Using a structured object for robustness

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({ 
                model, 
                contents, 
                config: { 
                    systemInstruction, 
                    responseMimeType: "application/json", 
                    responseSchema: compendiumResponseSchema 
                } 
            });
        });
        
        // FIX: The response text might not be valid JSON. Parsing it in a try-catch block.
        try {
            return JSON.parse(response.text.trim());
        } catch (parseError) {
            console.error("Error parsing Gemini API response for Compendium:", parseError);
            console.error("Raw response text:", response.text);
            throw new Error("Failed to parse AI response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for Compendium:", error);
        throw error; // Re-throw the original error object to preserve context
    }
};


// --- ANALYSIS FUNCTION ---

const professionalSuggestionSchema = {
    type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: Type.STRING }, usage: { type: Type.STRING }, constituentHerbs: { type: Type.STRING, description: 'Optional. The main herbs in the formula.' }, pharmacology: { type: Type.STRING, description: 'Optional. Known pharmacological actions.' }, contraindications: { type: Type.STRING, description: 'Optional. Warnings or contraindications.' }, }, required: ["name", "reason", "usage"],
};
const generalSuggestionSchema = {
    type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: Type.STRING }, usage: { type: Type.STRING }, }, required: ["name", "reason", "usage"],
};
const folkRemedySchema = {
    type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, rationale: { type: Type.STRING, description: 'Optional. The reasoning behind the remedy.' }, }, required: ["name", "description"],
};
const lifestyleAdviceSchema = {
    type: Type.OBJECT, properties: { diet: { type: Type.ARRAY, items: { type: Type.STRING } }, sleep: { type: Type.ARRAY, items: { type: Type.STRING } }, exercise: { type: Type.ARRAY, items: { type: Type.STRING } }, }, required: ["diet", "sleep", "exercise"],
};
const professionalAnalysisSchema = {
    type: Type.OBJECT, properties: { analysisMode: { type: Type.STRING, enum: ['professional'] }, differentialDiagnosis: { type: Type.OBJECT, properties: { pattern: { type: Type.STRING, description: "e.g., Liver Qi Stagnation with Spleen Deficiency" }, pathology: { type: Type.STRING, description: "The underlying pathological process." }, evidence: { type: Type.STRING, description: "Key signs and symptoms supporting the diagnosis." }, }, required: ["pattern", "pathology", "evidence"], }, rationale: { type: Type.STRING, description: "Detailed reasoning for the diagnosis." }, treatmentPrinciple: { type: Type.STRING, description: "The primary strategy for treatment." }, herbSuggestions: { type: Type.ARRAY, items: professionalSuggestionSchema }, kampoSuggestions: { type: Type.ARRAY, items: professionalSuggestionSchema }, supplementSuggestions: { type: Type.ARRAY, items: professionalSuggestionSchema }, folkRemedies: { type: Type.ARRAY, items: folkRemedySchema, description: "Optional folk remedies." }, lifestyleAdvice: lifestyleAdviceSchema, precautions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important precautions and warnings." }, }, required: ["analysisMode", "differentialDiagnosis", "rationale", "treatmentPrinciple", "herbSuggestions", "kampoSuggestions", "supplementSuggestions", "lifestyleAdvice", "precautions"],
};
const generalAnalysisSchema = {
    type: Type.OBJECT, properties: { analysisMode: { type: Type.STRING, enum: ['general'] }, wellnessProfile: { type: Type.OBJECT, properties: { title: { type: Type.STRING, description: "A concise title for the user's wellness profile." }, summary: { type: Type.STRING, description: "A brief, easy-to-understand summary of their condition." }, }, required: ["title", "summary"], }, herbSuggestions: { type: Type.ARRAY, items: generalSuggestionSchema }, supplementSuggestions: { type: Type.ARRAY, items: generalSuggestionSchema }, folkRemedies: { type: Type.ARRAY, items: folkRemedySchema, description: "Optional self-care tips." }, lifestyleAdvice: lifestyleAdviceSchema, precautions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important precautions and warnings." }, }, required: ["analysisMode", "wellnessProfile", "herbSuggestions", "supplementSuggestions", "lifestyleAdvice", "precautions"],
};

const fileToGenerativePart = async (file: File) => {
  return new Promise<{inlineData: {data: string, mimeType: string}}>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({
          inlineData: { data: base64Data, mimeType: file.type },
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const analyzeUserData = async (
    mode: AnalysisMode, 
    profile: AnyUserProfile, 
    language: Language,
    faceImage?: File | null, 
    tongueImage?: File | null
): Promise<AnalysisResult> => {
    const model = 'gemini-2.5-flash';
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
    
    // Process images sequentially to avoid ReadableStream issues on mobile
    if (faceImage) {
        try {
            contents.push({ text: "User's face image:" });
            const facePart = await fileToGenerativePart(faceImage);
            contents.push(facePart);
        } catch (error) {
            console.error('Error processing face image:', error);
            // Continue without the image rather than failing completely
        }
    }
    
    if (tongueImage) {
        try {
            contents.push({ text: "User's tongue image:" });
            const tonguePart = await fileToGenerativePart(tongueImage);
            contents.push(tonguePart);
        } catch (error) {
            console.error('Error processing tongue image:', error);
            // Continue without the image rather than failing completely
        }
    }

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model,
                contents: { parts: contents },
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                }
            });
        });

        try {
            return JSON.parse(response.text.trim()) as AnalysisResult;
        } catch (parseError) {
            console.error("Error parsing Gemini API response for Analysis:", parseError);
            console.error("Raw response text:", response.text);
            throw new Error("Failed to parse AI response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for Analysis:", error);
        const typedError = error as any;
        if (typedError.message) {
            throw new Error(`AI API Error: ${typedError.message}`);
        }
        throw new Error("An unknown error occurred with the AI service.");
    }
};
