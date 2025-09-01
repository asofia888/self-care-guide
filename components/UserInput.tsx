import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon, SparklesIcon, StethoscopeIcon, UserIcon } from './Icons';
import type { Language, ProfessionalUserProfile, ProfessionalObservations, AnalysisMode, GeneralUserProfile, AnyUserProfile } from '../types';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import { ProfessionalForm } from './ProfessionalForm';
import { GeneralForm } from './GeneralForm';
import { ErrorDisplay } from './ErrorDisplay';

const ImageUploader = React.memo<{
  imagePreview: string | null;
  onFileSelect: () => void;
  onRemove: () => void;
  isLoading: boolean;
  language: Language;
  'aria-labelledby': string;
}> (({ imagePreview, onFileSelect, onRemove, isLoading, language, 'aria-labelledby': labelledby }) => {
  const translations = t(language).userInput;
  const altText = labelledby === 'face-photo-title' ? translations.faceImagePreviewAlt : translations.tongueImagePreviewAlt;

  return (
    <div role="group" aria-labelledby={labelledby}>
      <div className="flex items-start gap-4">
        <div className="flex-grow">
          <button type="button" onClick={onFileSelect} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-amber-300 text-amber-800 font-semibold rounded-lg hover:bg-amber-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            <UploadIcon className="w-4 h-4" />
            {translations.uploadButton}
          </button>
        </div>
        {imagePreview && (
          <div className="relative group flex-shrink-0">
            <img src={imagePreview} alt={altText} className="h-16 w-16 object-cover rounded-md border-2 border-amber-200" />
            <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" aria-label={translations.removeImageLabel} disabled={isLoading}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
ImageUploader.displayName = 'ImageUploader';

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
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
  const [tongueImageFile, setTongueImageFile] = useState<File | null>(null);
  const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null);
  const [tongueImagePreview, setTongueImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const faceFileInputRef = useRef<HTMLInputElement>(null);
  const tongueFileInputRef = useRef<HTMLInputElement>(null);

  const translations = t(language).userInput;

  useEffect(() => {
    return () => {
      if (faceImagePreview) URL.revokeObjectURL(faceImagePreview);
      if (tongueImagePreview) URL.revokeObjectURL(tongueImagePreview);
    };
  }, [faceImagePreview, tongueImagePreview]);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, target: 'face' | 'tongue') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { setLocalError(translations.imageSizeError); return; }
      const newPreviewUrl = URL.createObjectURL(file);
      if (target === 'face') {
        if (faceImagePreview) URL.revokeObjectURL(faceImagePreview);
        setFaceImageFile(file);
        setFaceImagePreview(newPreviewUrl);
      } else {
        if (tongueImagePreview) URL.revokeObjectURL(tongueImagePreview);
        setTongueImageFile(file);
        setTongueImagePreview(newPreviewUrl);
      }
      setLocalError(null);
    }
  };

  const triggerFileSelect = (target: 'face' | 'tongue') => {
    if (target === 'face') faceFileInputRef.current?.click();
    else tongueFileInputRef.current?.click();
  };

  const removeImage = useCallback((target: 'face' | 'tongue') => {
    if (target === 'face') {
        setFaceImageFile(null);
        if (faceImagePreview) URL.revokeObjectURL(faceImagePreview);
        setFaceImagePreview(null);
        if (faceFileInputRef.current) faceFileInputRef.current.value = "";
    } else {
        setTongueImageFile(null);
        if (tongueImagePreview) URL.revokeObjectURL(tongueImagePreview);
        setTongueImagePreview(null);
        if (tongueFileInputRef.current) tongueFileInputRef.current.value = "";
    }
  }, [faceImagePreview, tongueImagePreview]);

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
    handleAnalysis(analysisMode, profile as AnyUserProfile, faceImageFile, tongueImageFile);
  };
  
  const legendClass = "text-lg font-bold text-teal-900 mb-3";

  return (
    <>
      <div className="bg-white/80 p-4 sm:p-6 rounded-2xl shadow-lg border border-amber-200/80 no-print">
        <ModeSwitcher currentMode={analysisMode} onModeChange={handleModeChange} language={language} />

        <form onSubmit={handleSubmit} className="space-y-8">
          <input type="file" accept="image/png, image/jpeg" ref={faceFileInputRef} onChange={(e) => handleFileChange(e, 'face')} className="hidden" disabled={isLoading} />
          <input type="file" accept="image/png, image/jpeg" ref={tongueFileInputRef} onChange={(e) => handleFileChange(e, 'tongue')} className="hidden" disabled={isLoading} />

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

           <fieldset>
             <legend className={legendClass}>{translations.photoTitle}</legend>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <div>
                    <h4 id="face-photo-title" className="block text-md font-semibold text-teal-800 mb-2">{translations.facePhotoTitle}</h4>
                    <ImageUploader aria-labelledby="face-photo-title" imagePreview={faceImagePreview} onFileSelect={() => triggerFileSelect('face')} onRemove={() => removeImage('face')} isLoading={isLoading} language={language}/>
                 </div>
                 <div>
                    <h4 id="tongue-photo-title" className="block text-md font-semibold text-teal-800 mb-2">{translations.tonguePhotoTitle}</h4>
                    <ImageUploader aria-labelledby="tongue-photo-title" imagePreview={tongueImagePreview} onFileSelect={() => triggerFileSelect('tongue')} onRemove={() => removeImage('tongue')} isLoading={isLoading} language={language} />
                 </div>
              </div>
           </fieldset>

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