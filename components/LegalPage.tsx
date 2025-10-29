import React from 'react';
import { FileTextIcon } from './Icons';

interface LegalPageProps {
  title: string;
  content: string;
}

export const LegalPage: React.FC<LegalPageProps> = React.memo(({ title, content }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
            <FileTextIcon className="w-7 h-7 text-sky-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{title}</h2>
        </div>

        <div
          className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-700 
                     prose-headings:text-slate-800 prose-headings:font-bold 
                     prose-strong:text-slate-800 
                     prose-p:my-2 prose-ul:my-3 prose-li:my-1 prose-h2:text-xl prose-h2:mb-2 prose-h2:mt-4
                     prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-3"
        >
          {content.split('\n\n').map((paragraph, index) => {
            const parts = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
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
