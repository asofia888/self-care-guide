import React from 'react';
import type { GeneralSuggestion, ProfessionalSuggestion, AnalysisResult } from '../types';
import { BrainCircuitIcon, DietIcon, LeafIcon, SpaIcon, PillIcon, AlertTriangleIcon, SparklesIcon, StethoscopeIcon, UserIcon, PrinterIcon } from './Icons';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const StreamingDisplay = React.memo(() => {
    const { streamingContent, language } = useAppContext();
    return (
        <div className="mt-8 bg-teal-900/95 p-6 rounded-2xl shadow-xl border border-teal-700 animate-fade-in no-print" role="log" aria-live="polite">
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-6 h-6 text-amber-300 animate-pulse" />
                <h3 className="text-xl font-bold text-white">{t(language).streaming.title}</h3>
            </div>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-green-300 overflow-x-auto max-h-96">
                <pre className="whitespace-pre-wrap">
                    {streamingContent}
                    <span className="inline-block w-2 h-4 bg-green-300 animate-pulse ml-1" aria-hidden="true"></span>
                </pre>
            </div>
            <p className="text-xs text-teal-300 mt-3 text-center">{t(language).streaming.subtitle}</p>
        </div>
    );
});
StreamingDisplay.displayName = "StreamingDisplay";


// --- SHARED COMPONENTS ---

const isProfessionalSuggestion = (s: any): s is ProfessionalSuggestion => 'pharmacology' in s;

const SuggestionCard = React.memo<{
    suggestion: ProfessionalSuggestion | GeneralSuggestion;
}> (({ suggestion }) => {
    const { language, viewCompendiumItem } = useAppContext();
    const proTranslations = t(language).analysisDisplay.professional;
    const genTranslations = t(language).analysisDisplay.general;
    
    const isPro = isProfessionalSuggestion(suggestion);

    return (
        <div className="border-t border-amber-200 pt-3 text-sm">
            <button 
                onClick={() => viewCompendiumItem(suggestion.name)} 
                className="text-left w-full disabled:pointer-events-none disabled:no-underline"
                disabled={!isPro} // Only professional suggestions are linkable
            >
                <h5 className={`font-bold text-slate-800 text-base ${isPro ? 'hover:text-amber-600 underline decoration-amber-500/50 decoration-2 underline-offset-2 transition-colors' : ''}`}>
                    {suggestion.name}
                </h5>
            </button>
            <p className="text-slate-600 mt-1"><strong className="font-semibold">{isPro ? proTranslations.reason : genTranslations.reason}:</strong> {suggestion.reason}</p>
            {isPro && suggestion.constituentHerbs && <p className="text-slate-600 mt-1"><strong className="font-semibold">{proTranslations.constituentHerbs}:</strong> {suggestion.constituentHerbs}</p>}
            {isPro && suggestion.pharmacology && <p className="text-slate-600 mt-1"><strong className="font-semibold">{proTranslations.pharmacology}:</strong> {suggestion.pharmacology}</p>}
            <p className="text-slate-600 mt-1"><strong className="font-semibold">{isPro ? proTranslations.usage : genTranslations.usage}:</strong> {suggestion.usage}</p>
            {isPro && suggestion.contraindications && <p className="text-red-600 mt-1"><strong className="font-semibold">{proTranslations.contraindications}:</strong> {suggestion.contraindications}</p>}
        </div>
    );
});
SuggestionCard.displayName = "SuggestionCard";

const SuggestionSection = React.memo<{
    icon: React.ReactNode;
    title: string;
    suggestions: (ProfessionalSuggestion | GeneralSuggestion)[];
}> (({ icon, title, suggestions }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
         <div className="bg-white/70 p-5 rounded-xl shadow-md border border-amber-200/60 flex flex-col">
            <div className="flex items-center gap-3 mb-4"><h4 className="text-xl font-bold text-teal-800 flex items-center gap-3">{icon}{title}</h4></div>
            <div className="space-y-4">
                {suggestions.map((item, index) => (
                   <SuggestionCard key={index} suggestion={item} />
                ))}
            </div>
        </div>
    );
});
SuggestionSection.displayName = "SuggestionSection";

const InfoSection = React.memo<{ title: string; icon: React.ReactNode; children: React.ReactNode;}> (({title, icon, children}) => (
    <div className="bg-white/70 p-5 rounded-xl shadow-md border border-amber-200/60">
        <div className="flex items-center gap-3 mb-3">{icon}<h3 className="text-xl font-bold text-teal-800">{title}</h3></div>
        <div className="prose prose-sm prose-slate max-w-none text-slate-700 prose-p:my-1 prose-strong:text-slate-800">{children}</div>
    </div>
));
InfoSection.displayName = "InfoSection";


const LifestyleCard = React.memo<{ icon: React.ReactNode; title: string; items: string[] }> (({ icon, title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">{icon}<h5 className="font-semibold text-teal-800">{title}</h5></div>
            <ul className="space-y-2 list-disc list-inside text-slate-700 text-sm">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
        </div>
    );
});
LifestyleCard.displayName = "LifestyleCard";

const PrecautionsSection = React.memo<{ precautions: string[], title: string }> (({ precautions, title }) => {
    if (!precautions || precautions.length === 0) return null;
    return (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg shadow-md">
            <div className="flex items-center gap-3"><AlertTriangleIcon className="w-6 h-6 text-amber-600"/><h3 className="text-xl font-bold">{title}</h3></div>
            <ul className="mt-2 ml-9 space-y-1 list-disc list-outside text-sm">{precautions.map((item, index) => <li key={index}>{item}</li>)}</ul>
        </div>
    );
});
PrecautionsSection.displayName = "PrecautionsSection";

const FolkRemediesSection = React.memo<{ 
    remedies: { name: string; description: string; rationale?: string; }[] | undefined, 
    title: string,
    rationaleLabel: string,
}> (({ remedies, title, rationaleLabel }) => {
     if (!remedies || remedies.length === 0) return null;
    return (
        <div className="bg-white/70 p-5 rounded-xl shadow-md border border-amber-200/60">
            <div className="flex items-center gap-3 mb-4"><SpaIcon className="w-8 h-8 text-cyan-600"/><h4 className="text-xl font-bold text-teal-800">{title}</h4></div>
            <div className="space-y-4">
                {remedies.map((remedy, index) => (
                    <div key={index} className="border-t border-amber-200 pt-3 text-sm">
                        <h5 className="font-bold text-slate-800 text-base">{remedy.name}</h5>
                        <p className="text-slate-600 mt-1">{remedy.description}</p>
                        {remedy.rationale && <p className="text-slate-600 mt-1"><strong className='font-semibold'>{rationaleLabel}:</strong> {remedy.rationale}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
});
FolkRemediesSection.displayName = "FolkRemediesSection";

const LifestyleSection = React.memo<{ 
    advice: { diet: string[], sleep: string[], exercise: string[] },
    translations: any
}> (({ advice, translations }) => (
     <div className="bg-white/70 p-5 rounded-xl shadow-md border border-amber-200/60">
        <div className="flex items-center gap-3 mb-4"><DietIcon className="w-8 h-8 text-orange-500"/><h4 className="text-xl font-bold text-teal-800">{translations.lifestyleAdviceTitle}</h4></div>
        <div className="space-y-4">
            <LifestyleCard icon={<DietIcon className="w-5 h-5 text-orange-500"/>} title={translations.diet} items={advice.diet} />
            <LifestyleCard icon={<SpaIcon className="w-5 h-5 text-cyan-600"/>} title={translations.sleep} items={advice.sleep} />
            <LifestyleCard icon={<SparklesIcon className="w-5 h-5 text-amber-500"/>} title={translations.exercise} items={advice.exercise} />
        </div>
    </div>
));
LifestyleSection.displayName = "LifestyleSection";


// --- DISPLAY MODE COMPONENTS ---

const ProfessionalDisplay = React.memo<{ result: Extract<AnalysisResult, { analysisMode: 'professional'}> }>(({ result }) => {
    const { language } = useAppContext();
    const translations = t(language).analysisDisplay.professional;
    const { differentialDiagnosis: diagnosis } = result;

    return(
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-teal-800 to-teal-700 text-white p-6 rounded-2xl shadow-xl"><div className="flex items-center gap-3 mb-3"><StethoscopeIcon className="w-8 h-8"/><h2 className="text-2xl font-bold">{translations.diagnosisSummaryTitle}</h2></div><h3 className="font-semibold text-xl text-amber-200 mb-2">{diagnosis.pattern}</h3><div className="prose prose-sm prose-invert max-w-none prose-p:my-1"><p><strong>{translations.pathology}:</strong> {diagnosis.pathology}</p><p><strong>{translations.evidence}:</strong> {diagnosis.evidence}</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><InfoSection title={translations.rationaleTitle} icon={<BrainCircuitIcon className="w-8 h-8 text-sky-600"/>}><p>{result.rationale}</p></InfoSection><InfoSection title={translations.treatmentPrincipleTitle} icon={<SparklesIcon className="w-8 h-8 text-amber-500"/>}><p>{result.treatmentPrinciple}</p></InfoSection></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SuggestionSection icon={<LeafIcon className="w-8 h-8 text-green-600"/>} title={translations.herbSuggestionsTitle} suggestions={result.herbSuggestions} />
                <SuggestionSection icon={<LeafIcon className="w-8 h-8 text-lime-700"/>} title={translations.kampoSuggestionsTitle} suggestions={result.kampoSuggestions} />
                <SuggestionSection icon={<PillIcon className="w-8 h-8 text-blue-600"/>} title={translations.supplementSuggestionsTitle} suggestions={result.supplementSuggestions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FolkRemediesSection remedies={result.folkRemedies} title={translations.folkRemediesTitle} rationaleLabel={translations.rationale} />
                <LifestyleSection advice={result.lifestyleAdvice} translations={translations} />
            </div>
            <PrecautionsSection precautions={result.precautions} title={translations.precautionsTitle} />
        </div>
    );
});
ProfessionalDisplay.displayName = "ProfessionalDisplay";


const GeneralDisplay = React.memo<{ result: Extract<AnalysisResult, { analysisMode: 'general'}> }>(({ result }) => {
    const { language } = useAppContext();
    const translations = t(language).analysisDisplay.general;

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-teal-800 to-teal-700 text-white p-6 rounded-2xl shadow-xl text-center">
                <div className="flex items-center justify-center gap-3 mb-3"><UserIcon className="w-8 h-8"/><h2 className="text-2xl font-bold">{translations.wellnessProfileTitle}</h2></div>
                <h3 className="font-semibold text-xl text-amber-200 mb-2">{result.wellnessProfile.title}</h3>
                <p className="max-w-2xl mx-auto text-white/90">{result.wellnessProfile.summary}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SuggestionSection icon={<LeafIcon className="w-8 h-8 text-green-600"/>} title={translations.herbSuggestionsTitle} suggestions={result.herbSuggestions} />
                <SuggestionSection icon={<PillIcon className="w-8 h-8 text-blue-600"/>} title={translations.supplementSuggestionsTitle} suggestions={result.supplementSuggestions} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FolkRemediesSection remedies={result.folkRemedies} title={translations.folkRemediesTitle} rationaleLabel={""} />
                <LifestyleSection advice={result.lifestyleAdvice} translations={translations} />
            </div>
            <PrecautionsSection precautions={result.precautions} title={translations.precautionsTitle} />
        </div>
    );
});
GeneralDisplay.displayName = "GeneralDisplay";


// --- MAIN COMPONENT ---

export { StreamingDisplay };

export const AnalysisDisplay: React.FC = () => {
  const { analysisResult, language } = useAppContext();
  const translations = t(language).analysisDisplay;

  const handlePrint = () => {
    window.print();
  };
  
  if (!analysisResult) return null;

  return (
    <div className="space-y-4 animate-fade-in printable-area">
        <div className="text-right no-print">
            <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-800 font-semibold rounded-lg hover:bg-amber-50 transition-all duration-200 text-sm"
            >
                <PrinterIcon className="w-4 h-4" />
                {translations.print}
            </button>
        </div>
        {analysisResult.analysisMode === 'professional' 
            ? <ProfessionalDisplay result={analysisResult} />
            : <GeneralDisplay result={analysisResult} />
        }
    </div>
  );
};