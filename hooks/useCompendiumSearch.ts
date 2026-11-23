import { useState, useCallback, useMemo } from 'react';
import { getCompendiumInfo } from '../services/geminiService';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import { formatErrorMessage } from '../utils/errorHandler';
import {
  addHistoryEntry,
  clearStoredHistory,
  findHistoryEntry,
  loadHistory,
  saveHistory,
  type HistoryEntry,
} from '../utils/searchHistory';
import { detectSafetyConcern, type SafetyLevel } from '../utils/safetyTriage';
import type { CompendiumResult } from '../types';

interface SearchOptions {
  // Fetch from the API even when the query is saved in history.
  refresh?: boolean;
  // Skip the safety triage, e.g. after the person chose to proceed past it.
  skipSafetyCheck?: boolean;
}

export interface SafetyConcern {
  level: SafetyLevel;
  query: string;
}

const hasEntries = (data: CompendiumResult | null): boolean =>
  !!data &&
  ((data.kampoEntries?.length ?? 0) > 0 ||
    data.westernHerbEntries.length > 0 ||
    data.supplementEntries.length > 0);

/**
 * Custom hook for managing compendium search state and logic
 * Encapsulates search functionality, state management, and error handling
 */
export function useCompendiumSearch() {
  const { language } = useAppContext();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CompendiumResult | null>(null);
  // The query that produced `result`, so a refresh re-runs it even if the input changed.
  const [resultQuery, setResultQuery] = useState<string | null>(null);
  // Set when `result` was served from saved history instead of the API.
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  // When `result` was fetched from the API, whether just now or from history.
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  // Set when the query was stopped by the safety triage instead of searched.
  const [safetyConcern, setSafetyConcern] = useState<SafetyConcern | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Memoize translations to prevent unnecessary lookups
  const translations = useMemo(() => t(language).compendium, [language]);

  const updateHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = addHistoryEntry(prev, entry);
      saveHistory(next);
      return next;
    });
  }, []);

  /**
   * Performs the search operation. Queries that suggest a crisis or urgent
   * symptoms are stopped by the safety triage unless `skipSafetyCheck` is set.
   * A previous result for the same query and language is reused from history
   * unless `refresh` is set.
   */
  const handleSearch = useCallback(
    async (
      searchQuery: string,
      { refresh = false, skipSafetyCheck = false }: SearchOptions = {}
    ) => {
      if (!searchQuery.trim()) return;

      setError(null);
      setInfoMessage(null);
      setSafetyConcern(null);

      const safetyLevel = skipSafetyCheck ? null : detectSafetyConcern(searchQuery);
      if (safetyLevel) {
        setResult(null);
        setResultQuery(null);
        setCachedAt(null);
        setFetchedAt(null);
        setSafetyConcern({ level: safetyLevel, query: searchQuery.trim() });
        return;
      }

      const cached = refresh ? undefined : findHistoryEntry(history, searchQuery, language);
      if (cached) {
        setResult(cached.result);
        setResultQuery(cached.query);
        setCachedAt(cached.savedAt);
        setFetchedAt(cached.savedAt);
        updateHistory(cached);
        return;
      }

      setIsLoading(true);
      setResult(null);
      setCachedAt(null);
      setFetchedAt(null);

      try {
        const data = await getCompendiumInfo(searchQuery, language);
        const now = Date.now();
        setResult(data);
        setResultQuery(searchQuery.trim());
        setFetchedAt(now);

        if (hasEntries(data)) {
          updateHistory({ query: searchQuery.trim(), language, result: data, savedAt: now });
        } else {
          setInfoMessage(translations.noResults);
        }
      } catch (err) {
        console.error('Compendium search error:', err);

        // Use centralized error formatting
        const errorMessage = formatErrorMessage(err, language);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [history, language, translations.noResults, updateHistory]
  );

  /**
   * Shows a saved search: fills the input and reuses its stored result.
   */
  const searchFromHistory = useCallback(
    (entry: HistoryEntry) => {
      setQuery(entry.query);
      handleSearch(entry.query);
    },
    [handleSearch]
  );

  /**
   * Re-fetches the displayed result from the API, bypassing history. The
   * displayed result already passed (or was let past) the safety triage.
   */
  const refreshResult = useCallback(() => {
    if (resultQuery) handleSearch(resultQuery, { refresh: true, skipSafetyCheck: true });
  }, [handleSearch, resultQuery]);

  /**
   * Shows the information for an urgent-symptom query after the person has
   * read the advice to see a doctor. Crisis queries cannot be continued.
   */
  const proceedPastSafetyConcern = useCallback(() => {
    if (safetyConcern?.level === 'urgent') {
      handleSearch(safetyConcern.query, { skipSafetyCheck: true });
    }
  }, [handleSearch, safetyConcern]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearStoredHistory();
  }, []);

  // History entries for the current language, most recent first.
  const recentSearches = useMemo(
    () => history.filter((entry) => entry.language === language),
    [history, language]
  );

  /**
   * Resets the search state to initial values
   */
  const resetSearch = useCallback(() => {
    setQuery('');
    setResult(null);
    setResultQuery(null);
    setCachedAt(null);
    setFetchedAt(null);
    setSafetyConcern(null);
    setError(null);
    setInfoMessage(null);
  }, []);

  /**
   * Clears only the error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clears only the info message
   */
  const clearInfoMessage = useCallback(() => {
    setInfoMessage(null);
  }, []);

  return {
    // State
    query,
    result,
    resultQuery,
    cachedAt,
    fetchedAt,
    safetyConcern,
    recentSearches,
    isLoading,
    error,
    infoMessage,
    // State setters
    setQuery,
    // Handlers
    handleSearch,
    searchFromHistory,
    refreshResult,
    proceedPastSafetyConcern,
    clearHistory,
    resetSearch,
    clearError,
    clearInfoMessage,
  };
}
