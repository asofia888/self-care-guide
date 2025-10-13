import React, { useState } from 'react';
import { SparklesIcon, StethoscopeIcon, UserIcon } from './Icons';
import type { Language, ProfessionalUserProfile, ProfessionalObservations, AnalysisMode, GeneralUserProfile, AnyUserProfile } from '../types';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import { ProfessionalForm } from './ProfessionalForm';
import { GeneralForm } from './GeneralForm';
import { ErrorDisplay } from './ErrorDisplay';

const ModeSwitcher = React.memo<{
    currentMode: AnalysisMode;
    onModeChange: (mode: AnalysisMode) => void;
    language: Language;
}> (({ currentMode, onModeChange, language}) => {
    const translations = t(language).userInput.modes;
    return (
        <div className="flex justify-center p-1 bg-amber-200/40 rounded-full border border-amber-200/60 mb-8">
            <button 
                onClick={() => onModeChange('professional')}
                aria-pressed={currentMode === 'professional'}
                aria-controls="professional-form-section"
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${currentMode === 'professional' ? 'bg-teal-700 text-white shadow-md' : 'text-teal-800 hover:bg-amber-100/50'}`}
            >
                <StethoscopeIcon className="w-5 h-5" />
                {translations.professional}
            </button>
            <button 
                onClick={() => onModeChange('general')}
                aria-pressed={currentMode === 'general'}
                aria-controls="general-form-section"
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${currentMode === 'general' ? 'bg-teal-700 text-white shadow-md' : 'text-teal-800 hover:bg-amber-100/50'}`}
            >
                <UserIcon className="w-5 h-5" />
                {translations.general}
            </button>
        </div>
    );
});
ModeSwitcher.displayName = 'ModeSwitcher';


export const UserInput: React.FC = () => {
  const { handleAnalysis, isLoading, language, error: globalError, clearError: clearGlobalError } = useAppContext();

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('professional');
  const [profile, setProfile] = useState<Partial<ProfessionalUserProfile & GeneralUserProfile>>({ professionalObservations: {} });
  const [localError, setLocalError] = useState<string | null>(null);

  const translations = t(language).userInput;

  const handleModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    setProfile({ professionalObservations: {} }); // Reset profile on mode change
    setLocalError(null);
    clearGlobalError();
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, professionalObservations: { ...prev.professionalObservations, [name as keyof ProfessionalObservations]: value }}));
  };

  const handleMultiSelectChange = (field: 'concerns' | 'selfAssessment' | 'goals', value: string) => {
    setProfile(prev => {
        const currentValues: string[] = (prev[field] as string[] | undefined) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    clearGlobalError();
    const proTranslations = translations.professional;
    const genTranslations = translations.general;
    if (analysisMode === 'professional' && !profile.chiefComplaint) {
      setLocalError(proTranslations.chiefComplaintRequiredError);
      return;
    }
    if (analysisMode === 'general' && (!profile.concerns || profile.concerns.length === 0)) {
      setLocalError(genTranslations.concernsRequiredError);
      return;
    }
    setLocalError(null);
    handleAnalysis(analysisMode, profile as AnyUserProfile);
  };

  return (
    <>
      <div className="bg-white/80 p-4 sm:p-6 rounded-2xl shadow-lg border border-amber-200/80 no-print">
        <ModeSwitcher currentMode={analysisMode} onModeChange={handleModeChange} language={language} />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div id="professional-form-section" role="region" hidden={analysisMode !== 'professional'}>
            <ProfessionalForm
              profile={profile}
              handleProfileChange={handleProfileChange}
              handleObservationChange={handleObservationChange}
              isLoading={isLoading}
              language={language}
            />
          </div>
          <div id="general-form-section" role="region" hidden={analysisMode !== 'general'}>
            <GeneralForm
              profile={profile}
              handleProfileChange={handleProfileChange}
              handleMultiSelectChange={handleMultiSelectChange}
              isLoading={isLoading}
              language={language}
            />
          </div>

          {localError && <p className="text-red-600 mt-4 text-sm text-center" role="alert">{localError}</p>}
          
          <ErrorDisplay message={globalError || ''} onClear={clearGlobalError} />

          <div className="mt-6 text-center pt-4 border-t border-amber-200">
              <button type="submit" disabled={isLoading} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 bg-amber-500 text-teal-900 font-bold rounded-full shadow-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:bg-slate-400 disabled:text-white disabled:cursor-not-allowed disabled:transform-none">
                  <SparklesIcon className="w-6 h-6"/>
                  {isLoading ? translations.submitButtonLoading : translations.submitButton}
              </button>
          </div>
        </form>
      </div>
    </>
  );
};