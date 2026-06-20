import React from 'react';
import { FileTextIcon } from './Icons';

interface LegalPageProps {
  title: string;
  content: string;
}

export const LegalPage: React.FC<LegalPageProps> = React.memo(({ title, content }) => {
  return (
    <div className="animate-fade-in-up">
      <div className="rounded-[1.8rem] border border-cream-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-sm sm:p-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cream-50 to-champagne-50 ring-1 ring-champagne-200/60">
            <FileTextIcon className="h-6 w-6 text-champagne-500" />
          </div>
          <h2 className="font-display text-3xl font-medium text-stone-800 md:text-4xl">{title}</h2>
        </div>

        <div className="space-y-3 leading-relaxed text-stone-600">
          {content.split('\n\n').map((paragraph, index) => {
            const parts = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={i} className="font-medium text-stone-800">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            });
            return <p key={index}>{parts}</p>;
          })}
        </div>
      </div>
    </div>
  );
});
LegalPage.displayName = 'LegalPage';
