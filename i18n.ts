import type { Language } from './types';
import jaTranslations from './i18n/ja.json';
import enTranslations from './i18n/en.json';

// Type definitions for translations structure
export interface Translations {
  header: {
    tagline: string;
    fontSize: {
      label: string;
      standard: string;
      large: string;
    };
  };
  nav: {
    compendium: string;
    manual: string;
  };
  welcome: {
    title: string;
    description: string;
  };
  userInput: {
    submitButton: string;
    submitButtonLoading: string;
    modes: {
      professional: string;
      general: string;
    };
    genderOptions: Array<{ value: string; label: string }>;
    professional: {
      patientInfoTitle: string;
      age: string;
      gender: string;
      height: string;
      weight: string;
      occupation: string;
      occupationOptions: Array<{ value: string; label: string }>;
      clinicalInfoTitle: string;
      chiefComplaint: string;
      chiefComplaintPlaceholder: string;
      chiefComplaintRequiredError: string;
      historyOfPresentIllness: string;
      historyOfPresentIllnessPlaceholder: string;
      pastMedicalHistory: string;
      pastMedicalHistoryPlaceholder: string;
      allergies: string;
      allergiesPlaceholder: string;
      practitionerObservationsTitle: string;
      tongueDiagnosis: string;
      tongueDiagnosisPlaceholder: string;
      pulseDiagnosis: string;
      pulseDiagnosisPlaceholder: string;
      abdominalDiagnosis: string;
      abdominalDiagnosisPlaceholder: string;
      otherObservations: string;
      otherObservationsPlaceholder: string;
      practitionerDiagnosis: string;
      practitionerDiagnosisPlaceholder: string;
    };
    general: {
      basicInfoTitle: string;
      age: string;
      gender: string;
      occupation: string;
      occupationOptions: Array<{ value: string; label: string }>;
      concernsTitle: string;
      concernsRequiredError: string;
      concernOptions: Array<{ value: string; label: string }>;
      selfAssessmentTitle: string;
      selfAssessmentOptions: Array<{ value: string; label: string }>;
      safetyInfoTitle: string;
      medications: string;
      medicationsPlaceholder: string;
      allergies: string;
      allergiesPlaceholder: string;
    };
  };
  streaming: {
    title: string;
  };
  error: {
    unexpected: string;
    apiError: string;
    networkError: string;
    retry: string;
  };
  compendium: {
    title: string;
    description: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    clearButton: string;
    searching: string;
    print: string;
    printButton: string;
    integrativeViewpointTitle: string;
    kampoFormulasTitle: string;
    kampoFormulaSectionTitle: string;
    westernHerbsTitle: string;
    westernHerbSectionTitle: string;
    supplementsTitle: string;
    supplementSectionTitle: string;
    category: string;
    summary: string;
    properties: string;
    channels: string;
    actions: string;
    indications: string;
    constituentHerbs: string;
    clinicalNotes: string;
    noResults: string;
  };
  analysisDisplay: {
    professionalAnalysisTitle: string;
    generalAnalysisTitle: string;
    differentialDiagnosisTitle: string;
    pattern: string;
    pathology: string;
    evidence: string;
    rationaleTitle: string;
    treatmentPrincipleTitle: string;
    herbSuggestionsTitle: string;
    kampoSuggestionsTitle: string;
    supplementSuggestionsTitle: string;
    folkRemediesTitle: string;
    lifestyleAdviceTitle: string;
    dietTitle: string;
    sleepTitle: string;
    exerciseTitle: string;
    precautionsTitle: string;
    wellnessProfileTitle: string;
    reason: string;
    usage: string;
    rationale: string;
    printButton: string;
    searchInCompendium: string;
  };
  manual: {
    title: string;
    overviewTitle: string;
    overviewContent: string;
    modesTitle: string;
    professionalModeTitle: string;
    professionalModeContent: string;
    generalModeTitle: string;
    generalModeContent: string;
    compendiumTitle: string;
    compendiumContent: string;
    disclaimerTitle: string;
    disclaimerContent: string;
  };
  footer: {
    privacy: string;
    terms: string;
    disclaimer: string;
  };
  privacy: {
    title: string;
    content: string;
  };
  terms: {
    title: string;
    content: string;
  };
  disclaimer: {
    title: string;
    content: string;
  };
}

// Translation data
const translations: Record<Language, Translations> = {
  ja: jaTranslations as Translations,
  en: enTranslations as Translations,
};

/**
 * Get translations for a specific language
 * @param language - The language code ('ja' or 'en')
 * @returns Translation object for the specified language
 */
export const t = (language: Language): Translations => {
  return translations[language] || translations.ja;
};

// Re-export for backward compatibility
export default translations;
