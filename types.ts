export type Language = 'ja' | 'en';
export type View = 'compendium' | 'manual' | 'privacy' | 'terms' | 'disclaimer';
export type FontSize = 'standard' | 'large';

// --- COMPENDIUM TYPES ---

export interface CompendiumEntry {
  name: string;
  category: 'Western Herb' | 'Kampo Formula' | 'Supplement';
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
  kampoEntries?: CompendiumEntry[];
  westernHerbEntries: CompendiumEntry[];
  supplementEntries: CompendiumEntry[];
}
