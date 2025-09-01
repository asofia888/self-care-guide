import React from 'react';
import { t } from '../i18n';
import { HelpCircleIcon, SparklesIcon, BookOpenIcon, AlertTriangleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = React.memo(({ icon, title, children }) => (
  <section className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="prose prose-sm prose-slate max-w-none text-slate-700 prose-p:my-2 prose-strong:text-slate-800 prose-ul:my-2 prose-li:my-1">
      {children}
    </div>
  </section>
));
Section.displayName = "Section";

const InstructionManual: React.FC = () => {
  const { language } = useAppContext();
  const translations = t(language).manual;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-slate-200">
        <div className="flex justify-center mb-4">
          <HelpCircleIcon className="w-16 h-16 text-sky-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{translations.title}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">{translations.description}</p>
      </div>

      <div className="space-y-6">
        <Section icon={<SparklesIcon className="w-6 h-6 text-sky-600"/>} title={translations.introduction.title}>
            <p>{translations.introduction.p1}</p>
            <p>{translations.introduction.p2}</p>
        </Section>

        <Section icon={<BookOpenIcon className="w-6 h-6 text-sky-600"/>} title={translations.compendium.title}>
            <p>{translations.compendium.p1}</p>
            <p>{translations.compendium.p2}</p>
        </Section>
        
        <Section icon={<AlertTriangleIcon className="w-6 h-6 text-sky-600"/>} title={translations.generalTips.title}>
             <div className="mt-2">
                <h4 className="font-bold flex items-center gap-2"><AlertTriangleIcon className="w-5 h-5"/>{translations.generalTips.disclaimer.title}</h4>
                <p className="font-semibold text-red-700/80">{translations.generalTips.disclaimer.p1}</p>
            </div>
        </Section>
      </div>
    </div>
  );
};

export default InstructionManual;