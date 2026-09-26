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
import type { CompendiumResult } from '../types';

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
   * Performs the search operation. A previous result for the same query and
   * language is reused from history unless `refresh` is set.
   */
  const handleSearch = useCallback(
    async (searchQuery: string, { refresh = false }: { refresh?: boolean } = {}) => {
      if (!searchQuery.trim()) return;

      setError(null);
      setInfoMessage(null);

      const cached = refresh ? undefined : findHistoryEntry(history, searchQuery, language);
      if (cached) {
        setResult(cached.result);
        setResultQuery(cached.query);
        setCachedAt(cached.savedAt);
        updateHistory(cached);
        return;
      }

      setIsLoading(true);
      setResult(null);
      setCachedAt(null);

      try {
        const data = await getCompendiumInfo(searchQuery, language);
        setResult(data);
        setResultQuery(searchQuery.trim());

        if (hasEntries(data)) {
          updateHistory({ query: searchQuery.trim(), language, result: data, savedAt: Date.now() });
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
   * Re-fetches the displayed result from the API, bypassing history.
   */
  const refreshResult = useCallback(() => {
    if (resultQuery) handleSearch(resultQuery, { refresh: true });
  }, [handleSearch, resultQuery]);

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
    cachedAt,
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
    clearHistory,
    resetSearch,
    clearError,
    clearInfoMessage,
  };
}
