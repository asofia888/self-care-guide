import React from 'react';
import { IntegrativeMedicineIcon, SparklesIcon, PrinterIcon } from './Icons';
import type { CompendiumEntry } from '../types';
import { t } from '../i18n';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppContext } from '../contexts/AppContext';
import { ErrorDisplay } from './ErrorDisplay';
import { useCompendiumSearch } from '../hooks/useCompendiumSearch';

const EntryCard: React.FC<{ entry: CompendiumEntry }> = React.memo(({ entry }) => {
  const { language } = useAppContext();
  const translations = t(language).compendium;
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-slate-200 mb-4 sm:mb-6 break-words">
      <h3 className="text-lg sm:text-xl font-bold text-slate-800">{entry.name}</h3>
      <p className="text-sm font-semibold text-sky-600 mb-3">{entry.category}</p>

      <p className="text-slate-700 mb-4">{entry.summary}</p>

      <div className="space-y-3 text-sm">
        {entry.properties && (
          <div>
            <h4 className="font-semibold text-emerald-700">{translations.properties}</h4>
            <p className="text-slate-600">
              {entry.properties}
              {entry.channels && ` (${entry.channels})`}
            </p>
          </div>
        )}
        {entry.actions && entry.actions.length > 0 && (
          <div>
            <h4 className="font-semibold text-emerald-700">{translations.actions}</h4>
            <ul className="list-disc list-inside text-slate-600">
              {entry.actions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        )}
        {entry.indications && entry.indications.length > 0 && (
          <div>
            <h4 className="font-semibold text-emerald-700">{translations.indications}</h4>
            <ul className="list-disc list-inside text-slate-600">
              {entry.indications.map((indication, i) => (
                <li key={i}>{indication}</li>
              ))}
            </ul>
          </div>
        )}
        {entry.constituentHerbs && (
          <div>
            <h4 className="font-semibold text-emerald-700">
              {translations.constituentHerbsRationale}
            </h4>
            <p className="text-slate-600 whitespace-pre-wrap">{entry.constituentHerbs}</p>
          </div>
        )}
        {entry.clinicalNotes && (
          <div>
            <h4 className="font-semibold text-emerald-700">{translations.clinicalNotes}</h4>
            <p className="text-slate-600 whitespace-pre-wrap">{entry.clinicalNotes}</p>
          </div>
        )}
        {entry.contraindications && (
          <div>
            <h4 className="font-semibold text-red-700">{translations.contraindications}</h4>
            <p className="text-red-600">{entry.contraindications}</p>
          </div>
        )}
      </div>
    </div>
  );
});
EntryCard.displayName = 'EntryCard';

export const Compendium: React.FC = () => {
  const { language } = useAppContext();
  const { query, setQuery, result, isLoading, error, infoMessage, handleSearch, clearError, clearInfoMessage } =
    useCompendiumSearch();
  const translations = t(language).compendium;

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div className="no-print">
        <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-slate-200 mb-8">
          <div className="flex justify-center mb-4">
            <IntegrativeMedicineIcon className="w-16 h-16 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{translations.title}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">{translations.description}</p>
        </div>

        <form onSubmit={submitForm} className="mb-8" role="search">
          <label htmlFor="compendium-search" className="sr-only">
            {translations.searchLabel}
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <input
              id="compendium-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translations.searchPlaceholder}
              className="flex-grow w-full p-4 sm:p-3 text-base bg-white border-2 border-slate-300 rounded-xl sm:rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-4 sm:py-3 min-h-[48px] sm:min-h-[auto] bg-sky-600 text-white font-bold rounded-xl sm:rounded-full shadow-lg hover:bg-sky-700 active:bg-sky-800 transition-all duration-300 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-5 h-5" />
              {isLoading ? translations.searching : translations.searchButton}
            </button>
          </div>
        </form>
      </div>

      <div aria-busy={isLoading} aria-live="polite">
        {isLoading && <LoadingSpinner />}

        <ErrorDisplay message={error || ''} onClear={clearError} />

        {infoMessage && !isLoading && (
          <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg shadow-md text-center no-print">
            <p>{infoMessage}</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4 printable-area">
            <div className="text-right no-print">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] sm:min-h-[auto] sm:py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 text-sm"
              >
                <PrinterIcon className="w-4 h-4" />
                {translations.print}
              </button>
            </div>

            <div className="space-y-8">
              {result.integrativeViewpoint && (
                <div className="bg-gradient-to-br from-sky-50 to-white text-slate-800 p-6 rounded-2xl shadow-lg border border-sky-200/80">
                  <h2 className="text-2xl font-bold mb-3">
                    {translations.integrativeViewpointTitle}
                  </h2>
                  <div className="prose prose-sm max-w-none prose-p:my-1 text-slate-700">
                    <p>{result.integrativeViewpoint}</p>
                  </div>
                </div>
              )}

              {result.supplementEntries.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-300 pb-2">
                    {translations.supplementSectionTitle}
                  </h2>
                  {result.supplementEntries.map((entry, index) => (
                    <EntryCard key={`supplement-${index}`} entry={entry} />
                  ))}
                </section>
              )}

              {result.kampoEntries && result.kampoEntries.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-300 pb-2">
                    {translations.kampoFormulaSectionTitle}
                  </h2>
                  {result.kampoEntries.map((entry, index) => (
                    <EntryCard key={`kampo-formula-${index}`} entry={entry} />
                  ))}
                </section>
              )}

              {result.westernHerbEntries.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-emerald-400 pb-2">
                    {translations.westernHerbSectionTitle}
                  </h2>
                  {result.westernHerbEntries.map((entry, index) => (
                    <EntryCard key={`western-herb-${index}`} entry={entry} />
                  ))}
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
