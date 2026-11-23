import React, { useEffect, useRef } from 'react';
import { AlertTriangleIcon, LeafIcon } from './Icons';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import type { SafetyLevel } from '../utils/safetyTriage';

interface SafetyResource {
  name: string;
  contact: string;
  // tel: or https: link.
  href: string;
  note: string;
}

const ResourceList: React.FC<{ resources: SafetyResource[] }> = ({ resources }) => (
  <ul className="mt-6 space-y-3">
    {resources.map((resource) => {
      const isExternal = resource.href.startsWith('http');
      return (
        <li
          key={resource.name}
          className="rounded-2xl border border-cream-200 bg-white px-5 py-4 text-left shadow-soft"
        >
          <p className="font-medium text-stone-800">{resource.name}</p>
          <a
            href={resource.href}
            className="mt-1 inline-block text-lg font-medium text-sage-600 underline decoration-sage-300 underline-offset-4 hover:text-stone-800"
            {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {resource.contact}
          </a>
          <p className="mt-1 text-sm text-stone-600">{resource.note}</p>
        </li>
      );
    })}
  </ul>
);

/**
 * Shown instead of search results when a query suggests a mental health crisis
 * or symptoms that may need prompt medical care.
 */
export const SafetyAlert: React.FC<{ level: SafetyLevel; onProceed: () => void }> = ({
  level,
  onProceed,
}) => {
  const { language } = useAppContext();
  const safety = t(language).compendium.safety;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the message so keyboard and screen reader users reach it first.
  useEffect(() => {
    headingRef.current?.focus();
  }, [level]);

  if (level === 'crisis') {
    const crisis = safety.crisis;
    return (
      <section
        aria-labelledby="safety-alert-title"
        className="mt-8 animate-fade-in-up rounded-[1.8rem] border border-sage-200 bg-sage-50/70 p-8 text-center shadow-soft sm:p-10"
      >
        <LeafIcon className="mx-auto mb-4 h-10 w-10 text-sage-600" />
        <h2
          id="safety-alert-title"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-medium text-stone-800 focus:outline-none sm:text-[1.7rem]"
        >
          {crisis.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-stone-700">{crisis.body}</p>
        <p className="mx-auto mt-3 max-w-xl font-medium leading-relaxed text-stone-800">
          {crisis.emergency}
        </p>
        <ResourceList resources={crisis.resources} />
      </section>
    );
  }

  const urgent = safety.urgent;
  return (
    <section
      aria-labelledby="safety-alert-title"
      className="mt-8 animate-fade-in-up rounded-[1.8rem] border border-amber-200 bg-amber-50/70 p-8 text-center shadow-soft sm:p-10"
    >
      <AlertTriangleIcon className="mx-auto mb-4 h-10 w-10 text-amber-700" />
      <h2
        id="safety-alert-title"
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-2xl font-medium text-amber-900 focus:outline-none sm:text-[1.7rem]"
      >
        {urgent.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl leading-relaxed text-stone-700">{urgent.body}</p>
      <ResourceList resources={urgent.resources} />
      <button
        type="button"
        onClick={onProceed}
        className="mt-7 inline-flex min-h-[44px] items-center rounded-full border border-stone-300 bg-white px-6 py-2.5 text-sm text-stone-600 transition-colors duration-300 hover:border-stone-400 hover:text-stone-800"
      >
        {urgent.proceed}
      </button>
    </section>
  );
};
