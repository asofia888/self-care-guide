import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { t } from '../i18n';

export const MedicalDisclaimerBanner: React.FC = () => {
  const { language, handleNavigate } = useAppContext();
  const translations = t(language);

  const disclaimerText = language === 'ja'
    ? '⚠️ 重要：本サービスは医療行為ではありません。医学的助言が必要な場合は、必ず医師に相談してください。'
    : '⚠️ IMPORTANT: This service is NOT medical practice. Always consult a physician for medical advice.';

  const linkText = language === 'ja' ? '詳細を見る' : 'View Details';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleNavigate('disclaimer');
    // Scroll to top after navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="bg-amber-50 border-l-4 border-amber-500 p-3 sm:p-4 no-print"
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-grow">
          <p className="text-sm sm:text-base text-amber-900 font-medium">
            {disclaimerText}
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={handleClick}
            className="inline-block w-full sm:w-auto text-center px-4 py-2 min-h-[44px] sm:min-h-[auto] text-sm font-semibold text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200 active:bg-amber-300 transition-colors duration-200 border border-amber-300"
          >
            {linkText}
          </button>
        </div>
      </div>
    </div>
  );
};
