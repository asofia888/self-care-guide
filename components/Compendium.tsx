import React from 'react';
import { SparklesIcon, PrinterIcon, StethoscopeIcon, AlertTriangleIcon, PillIcon } from './Icons';
import { EVIDENCE_LEVELS } from '../types';
import type { CompendiumEntry, EvidenceLevel } from '../types';
import { t } from '../i18n';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppContext } from '../contexts/AppContext';
import { ErrorDisplay } from './ErrorDisplay';
import { SafetyAlert } from './SafetyAlert';
import { useCompendiumSearch } from '../hooks/useCompendiumSearch';

const Detail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <h4 className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-sage-700">
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

// Every text color here keeps at least 4.5:1 contrast against its badge background.
const evidenceBadgeStyles: Record<EvidenceLevel, string> = {
  traditional: 'border-stone-200 bg-stone-50 text-stone-600',
  limited: 'border-champagne-200 bg-champagne-50/60 text-champagne-700',
  moderate: 'border-sage-200 bg-sage-50/60 text-sage-700',
  strong: 'border-sage-300 bg-sage-100/70 font-medium text-sage-700',
};

const isEvidenceLevel = (value: unknown): value is EvidenceLevel =>
  EVIDENCE_LEVELS.includes(value as EvidenceLevel);

const EntryCard: React.FC<{ entry: CompendiumEntry }> = React.memo(({ entry }) => {
  const { language } = useAppContext();
  const translations = t(language).compendium;
  return (
    <div className="mb-5 break-words rounded-2xl border border-cream-200/80 bg-white/90 p-6 shadow-soft transition-shadow duration-300 hover:shadow-elegant sm:mb-6 sm:p-7">
      <div className="flex items-baseline justify-between gap-3 border-b border-cream-200 pb-3">
        <h3 className="font-display text-2xl font-medium text-stone-800">{entry.name}</h3>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-champagne-700">
            {entry.category}
          </span>
          {isEvidenceLevel(entry.evidenceLevel) && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs tracking-wide ${evidenceBadgeStyles[entry.evidenceLevel]}`}
            >
              {translations.evidence.label}: {translations.evidence[entry.evidenceLevel]}
            </span>
          )}
        </div>
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
        {entry.constitution && (
          <Detail label={translations.constitution}>
            <p className="whitespace-pre-wrap text-stone-600">{entry.constitution}</p>
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
        {/* Safety sections: larger, darker headings with an icon, so they are not
            identified by color alone and stay readable (>= 4.5:1 contrast). */}
        {entry.interactions && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
              <PillIcon className="h-4 w-4 flex-shrink-0" />
              {translations.interactions}
            </h4>
            <p className="text-amber-900">{entry.interactions}</p>
          </div>
        )}
        {entry.contraindications && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-rose-700">
              <AlertTriangleIcon className="h-4 w-4 flex-shrink-0" />
              {translations.contraindications}
            </h4>
            <p className="text-rose-900">{entry.contraindications}</p>
          </div>
        )}
      </div>
    </div>
  );
});
EntryCard.displayName = 'EntryCard';

export const Compendium: React.FC = () => {
  const { language, handleNavigate } = useAppContext();
  const {
    query,
    setQuery,
    result,
    resultQuery,
    cachedAt,
    fetchedAt,
    safetyConcern,
    recentSearches,
    isLoading,
    error,
    infoMessage,
    handleSearch,
    searchFromHistory,
    refreshResult,
    proceedPastSafetyConcern,
    clearHistory,
    clearError,
  } = useCompendiumSearch();
  const translations = t(language).compendium;

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US');

  const confirmClearHistory = () => {
    if (window.confirm(translations.history.clearConfirm)) clearHistory();
  };

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
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-champagne-700">
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
              className="w-full flex-grow rounded-2xl bg-transparent px-5 py-3.5 text-base text-stone-700 transition-colors placeholder:text-stone-500 focus:outline-none sm:rounded-full"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-champagne-600 to-champagne-700 px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white shadow-soft transition-all duration-300 hover:shadow-elegant hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-stone-300 disabled:to-stone-300 disabled:shadow-none sm:rounded-full"
            >
              <SparklesIcon className="h-4 w-4" />
              {isLoading ? translations.searching : translations.searchButton}
            </button>
          </div>
          <p className="mx-auto mt-3 max-w-2xl px-2 text-center text-xs leading-relaxed text-stone-500">
            {translations.notice.search}{' '}
            {/* Inline in the sentence, so it opts out of the 44px mobile button sizing. */}
            <button
              type="button"
              onClick={() => handleNavigate('disclaimer')}
              className="min-h-0 min-w-0 p-0 align-baseline underline decoration-stone-400 underline-offset-2 transition-colors duration-300 hover:text-champagne-700"
            >
              {translations.notice.learnMore}
            </button>
          </p>
        </form>

        {recentSearches.length > 0 && (
          <section className="mx-auto -mt-4 mb-10 max-w-2xl px-2" aria-labelledby="recent-searches">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h2
                id="recent-searches"
                className="text-xs uppercase tracking-[0.2em] text-stone-500"
              >
                {translations.history.title}
              </h2>
              <button
                type="button"
                onClick={confirmClearHistory}
                className="text-xs tracking-wide text-stone-500 transition-colors duration-300 hover:text-champagne-700"
              >
                {translations.history.clear}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((entry) => (
                <button
                  key={entry.query}
                  type="button"
                  onClick={() => searchFromHistory(entry)}
                  disabled={isLoading}
                  className="rounded-full border border-cream-200 bg-white/70 px-3.5 py-1.5 text-sm text-stone-600 transition-colors duration-300 hover:border-champagne-300 hover:text-champagne-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {entry.query}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div aria-busy={isLoading} aria-live="polite">
        {isLoading && <LoadingSpinner />}

        <ErrorDisplay message={error || ''} onClear={clearError} />

        {safetyConcern && !isLoading && (
          <SafetyAlert level={safetyConcern.level} onProceed={proceedPastSafetyConcern} />
        )}

        {infoMessage && !isLoading && (
          <div className="no-print mt-8 rounded-2xl border border-champagne-200/60 bg-white/70 px-6 py-5 text-center text-stone-600 shadow-soft">
            <p>{infoMessage}</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="printable-area space-y-10">
            <div className="no-print flex flex-wrap items-center justify-end gap-3">
              {cachedAt !== null && (
                <>
                  <span className="text-xs text-stone-500">
                    {translations.history.fromHistory.replace('{date}', formatDate(cachedAt))}
                  </span>
                  <button
                    type="button"
                    onClick={refreshResult}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white/70 px-5 py-2.5 text-xs tracking-[0.1em] text-stone-500 transition-colors duration-300 hover:border-champagne-300 hover:text-champagne-700 sm:min-h-[auto]"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    {translations.history.refresh}
                  </button>
                </>
              )}
              <button
                onClick={handlePrint}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white/70 px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-stone-500 transition-colors duration-300 hover:border-champagne-300 hover:text-champagne-700 sm:min-h-[auto]"
              >
                <PrinterIcon className="h-4 w-4" />
                {translations.print}
              </button>
            </div>

            {resultQuery && (
              <p className="print-only font-display text-lg text-stone-800">
                Self-Care Guide for Wellness —{' '}
                {translations.notice.printQuery.replace('{query}', resultQuery)}
              </p>
            )}

            <aside
              aria-label={translations.notice.resultTitle}
              className="rounded-2xl border border-cream-300 bg-cream-50 px-5 py-4 text-sm leading-relaxed text-stone-600"
            >
              <p className="mb-1 font-medium text-stone-800">{translations.notice.resultTitle}</p>
              <p>
                {translations.notice.result.replace('{date}', formatDate(fetchedAt ?? Date.now()))}
              </p>
            </aside>

            {result.integrativeViewpoint && (
              <div className="rounded-[1.8rem] border border-champagne-200/50 bg-gradient-to-br from-white via-cream-50 to-champagne-50/40 p-8 shadow-soft sm:p-10">
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-champagne-700">
                  Integrative Viewpoint
                </p>
                <h2 className="mb-4 font-display text-2xl font-medium text-stone-800 sm:text-[1.7rem]">
                  {translations.integrativeViewpointTitle}
                </h2>
                <p className="leading-relaxed text-stone-600">{result.integrativeViewpoint}</p>
              </div>
            )}

            {result.whenToSeeDoctor && result.whenToSeeDoctor.length > 0 && (
              <section
                aria-labelledby="when-to-see-doctor"
                className="rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-5 sm:px-8"
              >
                <h2
                  id="when-to-see-doctor"
                  className="mb-3 flex items-center gap-2.5 font-display text-xl font-medium text-rose-800"
                >
                  <StethoscopeIcon className="h-5 w-5 flex-shrink-0" />
                  {translations.whenToSeeDoctor}
                </h2>
                <ul className="space-y-1.5">
                  {result.whenToSeeDoctor.map((sign, i) => (
                    <li key={i} className="flex gap-2.5 text-stone-700">
                      <span
                        className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-rose-400"
                        aria-hidden="true"
                      />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </section>
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
