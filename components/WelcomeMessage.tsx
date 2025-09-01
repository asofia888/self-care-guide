import React from 'react';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

export const WelcomeMessage: React.FC = () => {
    const { language } = useAppContext();
    return (
        <div className="mt-12 text-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-amber-300/80 no-print">
            <div className="flex justify-center mb-4">
              <img src="/public/logo.png" alt="Self-Care Guide for Wellness Logo" className="w-16 h-16 object-contain flex-shrink-0" />
            </div>
            <h2 className="text-2xl font-bold text-teal-800 mb-2">{t(language).welcome.title}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
                {t(language).welcome.description}
            </p>
        </div>
    );
}