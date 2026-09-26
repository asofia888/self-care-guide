export type Language = 'ja' | 'en';
export type View = 'compendium' | 'manual' | 'privacy' | 'terms' | 'disclaimer';
export type FontSize = 'standard' | 'large';
export type LegalPageType = 'privacy' | 'terms' | 'disclaimer';

// --- COMPENDIUM TYPES ---

export const EVIDENCE_LEVELS = ['traditional', 'limited', 'moderate', 'strong'] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export interface CompendiumEntry {
  name: string;
  // Localized by the model, e.g. 'Kampo Formula' in English or '漢方処方' in Japanese.
  category: string;
  summary: string;
  properties?: string;
  channels?: string;
  // Kampo only: the pattern (証) the formula suits and does not suit.
  constitution?: string;
  actions: string[];
  indications: string[];
  constituentHerbs?: string;
  clinicalNotes?: string;
  evidenceLevel?: EvidenceLevel;
  interactions?: string;
  contraindications?: string;
}

export interface CompendiumResult {
  integrativeViewpoint: string;
  kampoEntries?: CompendiumEntry[];
  westernHerbEntries: CompendiumEntry[];
  supplementEntries: CompendiumEntry[];
}
