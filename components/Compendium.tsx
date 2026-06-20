import React from 'react';
import { SparklesIcon, PrinterIcon } from './Icons';
import type { CompendiumEntry } from '../types';
import { t } from '../i18n';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppContext } from '../contexts/AppContext';
import { ErrorDisplay } from './ErrorDisplay';
import { useCompendiumSearch } from '../hooks/useCompendiumSearch';

const Detail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <h4 className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-sage-600">
      {label}
    </h4>
    {children}
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5 text-stone-600">
        <span
          className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-champagne-400"
          aria-hidden="true"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-6 flex items-center gap-4">
    <h2 className="font-display text-2xl font-medium text-stone-800 sm:text-[1.7rem]">
      {children}
    </h2>
    <span
      className="h-px flex-grow bg-gradient-to-r from-champagne-200 to-transparent"
      aria-hidden="true"
    />
  </div>
);

const EntryCard: React.FC<{ entry: CompendiumEntry }> = React.memo(({ entry }) => {
  const { language } = useAppContext();
  const translations = t(language).compendium;
  return (
    <div className="mb-5 break-words rounded-2xl border border-cream-200/80 bg-white/90 p-6 shadow-soft transition-shadow duration-300 hover:shadow-elegant sm:mb-6 sm:p-7">
      <div className="flex items-baseline justify-between gap-3 border-b border-cream-200 pb-3">
        <h3 className="font-display text-2xl font-medium text-stone-800">{entry.name}</h3>
        <span className="flex-shrink-0 text-[10px] uppercase tracking-[0.18em] text-champagne-600">
          {entry.category}
        </span>
      </div>

      <p className="mt-4 leading-relaxed text-stone-600">{entry.summary}</p>

      <div className="mt-5 space-y-4 text-sm">
        {entry.properties && (
          <Detail label={translations.properties}>
            <p className="text-stone-600">
              {entry.properties}
              {entry.channels && ` (${entry.channels})`}
            </p>
          </Detail>
        )}
        {entry.actions && entry.actions.length > 0 && (
          <Detail label={translations.actions}>
            <BulletList items={entry.actions} />
          </Detail>
        )}
        {entry.indications && entry.indications.length > 0 && (
          <Detail label={translations.indications}>
            <BulletList items={entry.indications} />
          </Detail>
        )}
        {entry.constituentHerbs && (
          <Detail label={translations.constituentHerbsRationale}>
            <p className="whitespace-pre-wrap text-stone-600">{entry.constituentHerbs}</p>
          </Detail>
        )}
        {entry.clinicalNotes && (
          <Detail label={translations.clinicalNotes}>
            <p className="whitespace-pre-wrap text-stone-600">{entry.clinicalNotes}</p>
          </Detail>
        )}
        {entry.contraindications && (
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3">
            <h4 className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-rose-400">
              {translations.contraindications}
            </h4>
            <p className="text-rose-700/90">{entry.contraindications}</p>
          </div>
        )}
      </div>
    </div>
  );
});
EntryCard.displayName = 'EntryCard';

export const Compendium: React.FC = () => {
  const { language } = useAppContext();
  const { query, setQuery, result, isLoading, error, infoMessage, handleSearch, clearError } =
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
    <div className="animate-fade-in-up">
      <div className="no-print">
        <div className="mb-10 rounded-[2rem] border border-white/60 bg-white/70 p-10 text-center shadow-elegant backdrop-blur-md sm:p-14">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="h-24 w-24 animate-drift object-contain drop-shadow-[0_10px_22px_rgba(193,156,104,0.22)]"
            />
          </div>
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-champagne-600">
            Integrative Wellness
          </p>
          <h2 className="font-display text-3xl font-medium tracking-wide text-stone-800 sm:text-4xl">
            {translations.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-stone-500">
            {translations.description}
          </p>
        </div>

        <form onSubmit={submitForm} className="mb-10" role="search">
          <label htmlFor="compendium-search" className="sr-only">
            {translations.searchLabel}
          </label>
          <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-[1.6rem] border border-cream-200/80 bg-white/80 p-2.5 shadow-soft backdrop-blur-sm sm:flex-row sm:gap-2 sm:rounded-full">
            <input
              id="compendium-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translations.searchPlaceholder}
              className="w-full flex-grow rounded-2xl bg-transparent px-5 py-3.5 text-base text-stone-700 transition-colors placeholder:text-stone-400 focus:outline-none sm:rounded-full"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-champagne-400 to-champagne-500 px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white shadow-soft transition-all duration-300 hover:shadow-elegant hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-stone-300 disabled:to-stone-300 disabled:shadow-none sm:rounded-full"
            >
              <SparklesIcon className="h-4 w-4" />
              {isLoading ? translations.searching : translations.searchButton}
            </button>
          </div>
        </form>
      </div>

      <div aria-busy={isLoading} aria-live="polite">
        {isLoading && <LoadingSpinner />}

        <ErrorDisplay message={error || ''} onClear={clearError} />

        {infoMessage && !isLoading && (
          <div className="no-print mt-8 rounded-2xl border border-champagne-200/60 bg-white/70 px-6 py-5 text-center text-stone-600 shadow-soft">
            <p>{infoMessage}</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="printable-area space-y-10">
            <div className="no-print text-right">
              <button
                onClick={handlePrint}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white/70 px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-stone-500 transition-colors duration-300 hover:border-champagne-300 hover:text-champagne-600 sm:min-h-[auto]"
              >
                <PrinterIcon className="h-4 w-4" />
                {translations.print}
              </button>
            </div>

            {result.integrativeViewpoint && (
              <div className="rounded-[1.8rem] border border-champagne-200/50 bg-gradient-to-br from-white via-cream-50 to-champagne-50/40 p-8 shadow-soft sm:p-10">
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-champagne-600">
                  Integrative Viewpoint
                </p>
                <h2 className="mb-4 font-display text-2xl font-medium text-stone-800 sm:text-[1.7rem]">
                  {translations.integrativeViewpointTitle}
                </h2>
                <p className="leading-relaxed text-stone-600">{result.integrativeViewpoint}</p>
              </div>
            )}

            {result.supplementEntries.length > 0 && (
              <section>
                <SectionHeading>{translations.supplementSectionTitle}</SectionHeading>
                {result.supplementEntries.map((entry, index) => (
                  <EntryCard key={`supplement-${index}`} entry={entry} />
                ))}
              </section>
            )}

            {result.kampoEntries && result.kampoEntries.length > 0 && (
              <section>
                <SectionHeading>{translations.kampoFormulaSectionTitle}</SectionHeading>
                {result.kampoEntries.map((entry, index) => (
                  <EntryCard key={`kampo-formula-${index}`} entry={entry} />
                ))}
              </section>
            )}

            {result.westernHerbEntries.length > 0 && (
              <section>
                <SectionHeading>{translations.westernHerbSectionTitle}</SectionHeading>
                {result.westernHerbEntries.map((entry, index) => (
                  <EntryCard key={`western-herb-${index}`} entry={entry} />
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
