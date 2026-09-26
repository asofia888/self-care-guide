import type { CompendiumResult, Language } from '../types';
import { readStorage, removeStorage, writeStorage } from './storage';

export interface HistoryEntry {
  query: string;
  language: Language;
  result: CompendiumResult;
  // When the result was fetched from the API (ms since epoch).
  savedAt: number;
}

export const HISTORY_STORAGE_KEY = 'scg:searchHistory';
export const MAX_HISTORY_ENTRIES = 20;

// Treat full-width/half-width and letter case variants as the same query.
const normalizeQuery = (query: string): string => query.trim().normalize('NFKC').toLowerCase();

const isSameSearch = (entry: HistoryEntry, query: string, language: Language): boolean =>
  entry.language === language && normalizeQuery(entry.query) === normalizeQuery(query);

const isHistory = (value: unknown): value is HistoryEntry[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      typeof entry?.query === 'string' &&
      (entry.language === 'ja' || entry.language === 'en') &&
      typeof entry.savedAt === 'number' &&
      typeof entry.result === 'object' &&
      entry.result !== null
  );

export const loadHistory = (): HistoryEntry[] => readStorage(HISTORY_STORAGE_KEY, isHistory) ?? [];

export const saveHistory = (history: HistoryEntry[]): void =>
  writeStorage(HISTORY_STORAGE_KEY, history);

export const clearStoredHistory = (): void => removeStorage(HISTORY_STORAGE_KEY);

export const findHistoryEntry = (
  history: HistoryEntry[],
  query: string,
  language: Language
): HistoryEntry | undefined => history.find((entry) => isSameSearch(entry, query, language));

/** Puts the entry first, replacing any earlier entry for the same search. */
export const addHistoryEntry = (history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] =>
  [entry, ...history.filter((e) => !isSameSearch(e, entry.query, entry.language))].slice(
    0,
    MAX_HISTORY_ENTRIES
  );
