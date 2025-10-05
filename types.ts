export type Language = 'ja' | 'en';
export type View = 'compendium' | 'manual' | 'privacy' | 'terms' | 'disclaimer';
export type FontSize = 'standard' | 'large';

// --- COMPENDIUM TYPES ---

export interface CompendiumEntry {
    name: string;
    category: 'Japanese Crude Drug' | 'Western Herb' | 'Kampo Formula' | 'Supplement';
    summary: string;
    properties?: string;
    channels?: string;
    actions: string[];
    indications: string[];
    constituentHerbs?: string;
    clinicalNotes?: string;
    contraindications?: string;
}

export interface CompendiumResult {
    integrativeViewpoint: string;
    kampoEntries: CompendiumEntry[];
    japaneseCrudeDrugEntries: CompendiumEntry[];
    westernHerbEntries: CompendiumEntry[];
    supplementEntries: CompendiumEntry[];
}

// --- ANALYSIS TYPES ---

export type AnalysisMode = 'professional' | 'general';

export interface ProfessionalObservations {
    tongue?: string;
    pulse?: string;
    abdomen?: string;
    other?: string;
}

export interface ProfessionalUserProfile {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    occupation?: string;
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string;
    allergies?: string;
    practitionerDiagnosis?: string;
    professionalObservations: ProfessionalObservations;
}

export interface GeneralUserProfile {
    age?: number;
    gender?: string;
    occupation?: string;
    concerns: string[];
    selfAssessment?: string[];
    medications?: string;
    allergies?: string;
    goals?: string[];
}

export type AnyUserProfile = Partial<ProfessionalUserProfile> & Partial<GeneralUserProfile>;

export interface ProfessionalSuggestion {
    name: string;
    reason: string;
    usage: string;
    constituentHerbs?: string;
    pharmacology?: string;
    contraindications?: string;
}

export interface GeneralSuggestion {
    name: string;
    reason: string;
    usage: string;
}

export interface FolkRemedy {
    name: string;
    description: string;
    rationale?: string;
}

export interface LifestyleAdvice {
    diet: string[];
    sleep: string[];
    exercise: string[];
}

export type AnalysisResult = {
    analysisMode: 'professional';
    differentialDiagnosis: {
        pattern: string;
        pathology: string;
        evidence: string;
    };
    rationale: string;
    treatmentPrinciple: string;
    herbSuggestions: ProfessionalSuggestion[];
    kampoSuggestions: ProfessionalSuggestion[];
    supplementSuggestions: ProfessionalSuggestion[];
    folkRemedies?: FolkRemedy[];
    lifestyleAdvice: LifestyleAdvice;
    precautions: string[];
} | {
    analysisMode: 'general';
    wellnessProfile: {
        title: string;
        summary: string;
    };
    herbSuggestions: GeneralSuggestion[];
    supplementSuggestions: GeneralSuggestion[];
    folkRemedies?: FolkRemedy[];
    lifestyleAdvice: LifestyleAdvice;
    precautions: string[];
};
