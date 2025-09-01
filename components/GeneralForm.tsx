import React from 'react';
import type { Language, GeneralUserProfile } from '../types';
import { t } from '../i18n';

interface GeneralFormProps {
    profile: Partial<GeneralUserProfile>;
    handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleMultiSelectChange: (field: 'concerns' | 'selfAssessment' | 'goals', value: string) => void;
    isLoading: boolean;
    language: Language;
}

export const GeneralForm: React.FC<GeneralFormProps> = React.memo(({ profile, handleProfileChange, handleMultiSelectChange, isLoading, language }) => {
    const translations = t(language).userInput;
    const genTranslations = translations.general;
    const inputClass = "w-full p-2 bg-amber-50/40 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors duration-200 placeholder:text-slate-400 text-sm";
    const labelClass = "block text-sm font-semibold text-teal-800 mb-1";
    const textareaClass = inputClass + ' h-24';
    const legendClass = "text-lg font-bold text-teal-900 mb-3";

    return (
        <>
            <fieldset>
                <legend className={legendClass}>{genTranslations.basicInfoTitle}</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label htmlFor="age" className={labelClass}>{genTranslations.age}</label><input type="number" id="age" name="age" value={profile.age || ''} onChange={handleProfileChange} className={inputClass} disabled={isLoading} /></div>
                    <div><label htmlFor="gender" className={labelClass}>{genTranslations.gender}</label><select id="gender" name="gender" value={profile.gender || ''} onChange={handleProfileChange} className={inputClass} disabled={isLoading}><option value=""></option>{translations.genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div>
                      <label htmlFor="occupation" className={labelClass}>{genTranslations.occupation}</label>
                      <select id="occupation" name="occupation" value={profile.occupation || ''} onChange={handleProfileChange} className={inputClass} disabled={isLoading}>
                          <option value=""></option>
                          {genTranslations.occupationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                </div>
              </fieldset>
              <fieldset>
                <legend className={legendClass}>{genTranslations.concernsTitle} *</legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {genTranslations.concernOptions.map(opt => (
                        <button type="button" key={opt.value} onClick={() => handleMultiSelectChange('concerns', opt.value)} disabled={isLoading} aria-pressed={profile.concerns?.includes(opt.value)} className={`text-left p-2 rounded-lg border-2 transition-all text-sm disabled:opacity-70 ${profile.concerns?.includes(opt.value) ? 'bg-teal-700 text-white border-teal-700' : 'bg-white hover:bg-amber-50 border-amber-300'}`}>{opt.label}</button>
                    ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={legendClass}>{genTranslations.selfAssessmentTitle}</legend>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {genTranslations.selfAssessmentOptions.map(opt => (
                        <button type="button" key={opt.value} onClick={() => handleMultiSelectChange('selfAssessment', opt.value)} disabled={isLoading} aria-pressed={profile.selfAssessment?.includes(opt.value)} className={`text-left p-2 rounded-lg border-2 transition-all text-sm disabled:opacity-70 ${profile.selfAssessment?.includes(opt.value) ? 'bg-teal-700 text-white border-teal-700' : 'bg-white hover:bg-amber-50 border-amber-300'}`}>{opt.label}</button>
                    ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={legendClass}>{genTranslations.safetyInfoTitle}</legend>
                <div><label htmlFor="medications" className={labelClass}>{genTranslations.medications}</label><textarea id="medications" name="medications" value={profile.medications || ''} onChange={handleProfileChange} className={textareaClass} placeholder={genTranslations.medicationsPlaceholder} disabled={isLoading}></textarea></div>
                <div className="mt-4"><label htmlFor="allergies" className={labelClass}>{genTranslations.allergies}</label><textarea id="allergies" name="allergies" value={profile.allergies || ''} onChange={handleProfileChange} className={textareaClass} placeholder={genTranslations.allergiesPlaceholder} disabled={isLoading}></textarea></div>
              </fieldset>
        </>
    );
});
GeneralForm.displayName = "GeneralForm";