import { useState, useCallback, useMemo } from 'react';
import { getCompendiumInfo } from '../services/geminiService';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import { formatErrorMessage } from '../utils/errorHandler';
import type { CompendiumResult } from '../types';

/**
 * Custom hook for managing compendium search state and logic
 * Encapsulates search functionality, state management, and error handling
 */
export function useCompendiumSearch() {
  const { language } = useAppContext();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CompendiumResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Memoize translations to prevent unnecessary lookups
  const translations = useMemo(() => t(language).compendium, [language]);

  /**
   * Performs the search operation
   * Handles loading states, error handling, and result processing
   */
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setError(null);
      setInfoMessage(null);
      setResult(null);

      try {
        const data = await getCompendiumInfo(searchQuery, language);
        setResult(data);

        // Check if results are empty
        if (
          !data ||
          ((!data.kampoEntries || data.kampoEntries.length === 0) &&
            !data.westernHerbEntries.length &&
            !data.supplementEntries.length)
        ) {
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
    [language, translations.noResults]
  );

  /**
   * Resets the search state to initial values
   */
  const resetSearch = useCallback(() => {
    setQuery('');
    setResult(null);
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
    isLoading,
    error,
    infoMessage,
    // State setters
    setQuery,
    // Handlers
    handleSearch,
    resetSearch,
    clearError,
    clearInfoMessage,
  };
}
