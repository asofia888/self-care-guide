import React from 'react';
import { StethoscopeIcon } from './Icons';
import type { Language, ProfessionalUserProfile } from '../types';
import { t } from '../i18n';

interface ProfessionalFormProps {
  profile: Partial<ProfessionalUserProfile>;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleObservationChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  language: Language;
}

export const ProfessionalForm: React.FC<ProfessionalFormProps> = React.memo(({
  profile,
  handleProfileChange,
  handleObservationChange,
  isLoading,
  language
}) => {
  const translations = t(language).userInput;
  const proTranslations = translations.professional;

  // Shared CSS classes
  const inputClass = "w-full p-2 bg-amber-50/40 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors duration-200 placeholder:text-slate-400 text-sm";
  const labelClass = "block text-sm font-semibold text-teal-800 mb-1";
  const textareaClass = `${inputClass} h-24`;
  const legendClass = "text-lg font-bold text-teal-900 mb-3";

  return (
    <>
      {/* Patient Information Section */}
      <fieldset>
        <legend className={legendClass}>{proTranslations.patientInfoTitle}</legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="age" className={labelClass}>
              {proTranslations.age}
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={profile.age || ''}
              onChange={handleProfileChange}
              className={inputClass}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="gender" className={labelClass}>
              {proTranslations.gender}
            </label>
            <select
              id="gender"
              name="gender"
              value={profile.gender || ''}
              onChange={handleProfileChange}
              className={inputClass}
              disabled={isLoading}
            >
              <option value=""></option>
              {translations.genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="height" className={labelClass}>
              {proTranslations.height}
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={profile.height || ''}
              onChange={handleProfileChange}
              className={inputClass}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="weight" className={labelClass}>
              {proTranslations.weight}
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={profile.weight || ''}
              onChange={handleProfileChange}
              className={inputClass}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="occupation" className={labelClass}>
            {proTranslations.occupation}
          </label>
          <select
            id="occupation"
            name="occupation"
            value={profile.occupation || ''}
            onChange={handleProfileChange}
            className={inputClass}
            disabled={isLoading}
          >
            <option value=""></option>
            {proTranslations.occupationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Clinical Information Section */}
      <fieldset>
        <legend className={legendClass}>{proTranslations.clinicalInfoTitle}</legend>

        <div>
          <label htmlFor="chiefComplaint" className={labelClass}>
            {proTranslations.chiefComplaint} *
          </label>
          <textarea
            id="chiefComplaint"
            name="chiefComplaint"
            value={profile.chiefComplaint || ''}
            onChange={handleProfileChange}
            className={textareaClass}
            placeholder={proTranslations.chiefComplaintPlaceholder}
            disabled={isLoading}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="historyOfPresentIllness" className={labelClass}>
            {proTranslations.historyOfPresentIllness}
          </label>
          <textarea
            id="historyOfPresentIllness"
            name="historyOfPresentIllness"
            value={profile.historyOfPresentIllness || ''}
            onChange={handleProfileChange}
            className={textareaClass}
            placeholder={proTranslations.historyOfPresentIllnessPlaceholder}
            disabled={isLoading}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="pastMedicalHistory" className={labelClass}>
            {proTranslations.pastMedicalHistory}
          </label>
          <textarea
            id="pastMedicalHistory"
            name="pastMedicalHistory"
            value={profile.pastMedicalHistory || ''}
            onChange={handleProfileChange}
            className={textareaClass}
            placeholder={proTranslations.pastMedicalHistoryPlaceholder}
            disabled={isLoading}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="allergies" className={labelClass}>
            {proTranslations.allergies}
          </label>
          <textarea
            id="allergies"
            name="allergies"
            value={profile.allergies || ''}
            onChange={handleProfileChange}
            className={textareaClass}
            placeholder={proTranslations.allergiesPlaceholder}
            disabled={isLoading}
          />
        </div>
      </fieldset>

      {/* Practitioner Observations Section */}
      <fieldset>
        <legend className="flex items-center gap-2 text-lg font-bold text-teal-900 mb-3">
          <StethoscopeIcon className="w-6 h-6" />
          {proTranslations.practitionerObservationsTitle}
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tongue" className={labelClass}>
              {proTranslations.tongueDiagnosis}
            </label>
            <textarea
              id="tongue"
              name="tongue"
              value={profile.professionalObservations?.tongue || ''}
              onChange={handleObservationChange}
              className={textareaClass}
              placeholder={proTranslations.tongueDiagnosisPlaceholder}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="pulse" className={labelClass}>
              {proTranslations.pulseDiagnosis}
            </label>
            <textarea
              id="pulse"
              name="pulse"
              value={profile.professionalObservations?.pulse || ''}
              onChange={handleObservationChange}
              className={textareaClass}
              placeholder={proTranslations.pulseDiagnosisPlaceholder}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="abdomen" className={labelClass}>
              {proTranslations.abdominalDiagnosis}
            </label>
            <textarea
              id="abdomen"
              name="abdomen"
              value={profile.professionalObservations?.abdomen || ''}
              onChange={handleObservationChange}
              className={textareaClass}
              placeholder={proTranslations.abdominalDiagnosisPlaceholder}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="other" className={labelClass}>
              {proTranslations.otherObservations}
            </label>
            <textarea
              id="other"
              name="other"
              value={profile.professionalObservations?.other || ''}
              onChange={handleObservationChange}
              className={textareaClass}
              placeholder={proTranslations.otherObservationsPlaceholder}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="practitionerDiagnosis" className={labelClass}>
            {proTranslations.practitionerDiagnosis}
          </label>
          <textarea
            id="practitionerDiagnosis"
            name="practitionerDiagnosis"
            value={profile.practitionerDiagnosis || ''}
            onChange={handleProfileChange}
            className={textareaClass}
            placeholder={proTranslations.practitionerDiagnosisPlaceholder}
            disabled={isLoading}
          />
        </div>
      </fieldset>
    </>
  );
});

ProfessionalForm.displayName = "ProfessionalForm";
