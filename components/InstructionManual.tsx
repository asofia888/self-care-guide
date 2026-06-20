import React from 'react';
import { t } from '../i18n';
import { HelpCircleIcon, SparklesIcon, BookOpenIcon, AlertTriangleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = React.memo(({ icon, title, children }) => (
  <section className="rounded-2xl border border-cream-200/80 bg-white/85 p-7 shadow-soft sm:p-8">
    <div className="mb-5 flex items-center gap-3.5">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cream-50 to-champagne-50 ring-1 ring-champagne-200/50">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-medium text-stone-800">{title}</h3>
    </div>
    <div className="space-y-3 leading-relaxed text-stone-600">{children}</div>
  </section>
));
Section.displayName = 'Section';

const InstructionManual: React.FC = () => {
  const { language } = useAppContext();
  const translations = t(language).manual;

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="rounded-[2rem] border border-white/60 bg-white/70 p-10 text-center shadow-elegant backdrop-blur-md sm:p-14">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cream-50 to-champagne-50 ring-1 ring-champagne-200/60">
            <HelpCircleIcon className="h-10 w-10 text-champagne-500" />
          </div>
        </div>
        <p className="mb-4 text-xs uppercase tracking-[0.32em] text-champagne-600">Guide</p>
        <h2 className="font-display text-3xl font-medium text-stone-800 sm:text-4xl">
          {translations.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-stone-500">
          {translations.description}
        </p>
      </div>

      <div className="space-y-6">
        <Section
          icon={<SparklesIcon className="h-6 w-6 text-champagne-500" />}
          title={translations.introduction.title}
        >
          <p>{translations.introduction.p1}</p>
          <p>{translations.introduction.p2}</p>
        </Section>

        <Section
          icon={<BookOpenIcon className="h-6 w-6 text-sage-500" />}
          title={translations.compendium.title}
        >
          <p>{translations.compendium.p1}</p>
          <p>{translations.compendium.p2}</p>
        </Section>

        <Section
          icon={<AlertTriangleIcon className="h-6 w-6 text-champagne-500" />}
          title={translations.generalTips.title}
        >
          <div className="rounded-xl border border-champagne-200/50 bg-champagne-50/40 p-5">
            <h4 className="mb-2 flex items-center gap-2 font-display text-lg text-stone-800">
              <AlertTriangleIcon className="h-5 w-5 text-champagne-500" />
              {translations.generalTips.disclaimer.title}
            </h4>
            <p className="text-stone-600">{translations.generalTips.disclaimer.p1}</p>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default InstructionManual;
