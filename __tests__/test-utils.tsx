import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';
import type { Language } from '../types';

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & {
    initialLanguage?: Language;
  } = {}
) => {
  const { initialLanguage = 'en', ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AppProvider>{children}</AppProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data for testing
export const mockCompendiumResult = {
  integrativeViewpoint: 'Test integrative viewpoint for ginger analysis.',
  kampoEntries: [
    {
      name: 'Shokenchuto',
      category: 'Kampo Formula' as const,
      summary: 'A warming formula for digestive support.',
      properties: 'Warm, pungent',
      actions: ['Warm the middle jiao', 'Dispel cold'],
      indications: ['Cold limbs', 'Digestive weakness'],
      constituentHerbs: 'Ginger, Cinnamon, Jujube',
      clinicalNotes: 'Use with caution in heat conditions.',
    },
  ],
  herbEntries: [
    {
      name: 'Ginger',
      category: 'Herb' as const,
      summary: 'Warming herb for digestive health.',
      properties: 'Hot, pungent',
      actions: ['Warm the stomach', 'Stop nausea'],
      indications: ['Nausea', 'Cold stomach'],
      clinicalNotes: 'Fresh vs dried ginger have different properties.',
    },
  ],
  supplementEntries: [
    {
      name: 'Ginger Extract',
      category: 'Supplement' as const,
      summary: 'Concentrated ginger for convenient dosing.',
      actions: ['Support digestive health'],
      indications: ['Occasional nausea', 'Motion sickness'],
    },
  ],
};

export const mockAnalysisResult = {
  analysisMode: 'general' as const,
  wellnessProfile: {
    title: 'Digestive Wellness Profile',
    summary: 'You appear to have digestive sensitivity with occasional discomfort.',
  },
  herbSuggestions: [
    {
      name: 'Chamomile',
      reason: 'Gentle digestive support',
      usage: 'Tea, 1-2 cups daily',
    },
  ],
  supplementSuggestions: [
    {
      name: 'Probiotics',
      reason: 'Support digestive balance',
      usage: 'Daily with food',
    },
  ],
  folkRemedies: [
    {
      name: 'Warm Water',
      description: 'Drink warm water before meals',
    },
  ],
  lifestyleAdvice: {
    diet: ['Eat smaller, frequent meals'],
    sleep: ['Maintain regular sleep schedule'],
    exercise: ['Gentle walking after meals'],
  },
  precautions: ['Consult healthcare provider if symptoms persist'],
};

export const mockUserProfile = {
  age: 30,
  gender: 'female' as const,
  symptoms: 'digestive discomfort',
  currentMedications: 'none',
  allergies: 'none',
  lifestyle: 'sedentary',
  stressLevel: 'moderate' as const,
  sleepQuality: 'fair' as const,
  exerciseFrequency: 'rarely' as const,
  dietaryPreferences: 'omnivore' as const,
};

// Mock File for testing file uploads
export const createMockFile = (name: string, type: string, size: number = 1000): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
};

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
    status: 200,
  });
};

export const mockFetchError = (status: number = 500, message: string = 'Server Error') => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: message }),
    status,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
