import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCompendiumInfo, analyzeUserData } from './geminiService';

// Mock data
const mockCompendiumResult = {
  integrativeViewpoint: "Test integrative viewpoint for ginger analysis.",
  kampoEntries: [{
    name: "Shokenchuto",
    category: "Kampo Formula" as const,
    summary: "A warming formula for digestive support.",
    properties: "Warm, pungent",
    channels: "Spleen, Stomach",
    actions: ["Warm the middle jiao", "Dispel cold"],
    indications: ["Cold limbs", "Digestive weakness"],
    constituentHerbs: "Ginger, Cinnamon, Jujube",
    clinicalNotes: "Use with caution in heat conditions."
  }],
  westernHerbEntries: [{
    name: "Ginger",
    category: "Western Herb" as const,
    summary: "Warming herb for digestive health.",
    properties: "Hot, pungent",
    actions: ["Warm the stomach", "Stop nausea"],
    indications: ["Nausea", "Cold stomach"],
    clinicalNotes: "Fresh vs dried ginger have different properties."
  }],
  supplementEntries: [{
    name: "Ginger Extract",
    category: "Supplement" as const,
    summary: "Concentrated ginger for convenient dosing.",
    actions: ["Support digestive health"],
    indications: ["Occasional nausea", "Motion sickness"]
  }]
};

const mockAnalysisResult = {
  analysisMode: "general" as const,
  wellnessProfile: {
    title: "Digestive Wellness Profile",
    summary: "You appear to have digestive sensitivity with occasional discomfort."
  },
  herbSuggestions: [{
    name: "Chamomile",
    reason: "Gentle digestive support",
    usage: "Tea, 1-2 cups daily"
  }],
  supplementSuggestions: [{
    name: "Probiotics",
    reason: "Support digestive balance",
    usage: "Daily with food"
  }],
  folkRemedies: [{
    name: "Warm Water",
    description: "Drink warm water before meals"
  }],
  lifestyleAdvice: {
    diet: ["Eat smaller, frequent meals"],
    sleep: ["Maintain regular sleep schedule"],
    exercise: ["Gentle walking after meals"]
  },
  precautions: ["Consult healthcare provider if symptoms persist"]
};

const mockUserProfile = {
  age: 30,
  gender: "female",
  concerns: ["digestion"],
  selfAssessment: ["low_energy"],
  medications: "none",
  allergies: "none"
};

// Mock fetch globally
global.fetch = vi.fn();

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCompendiumInfo', () => {
    it('makes correct API call for compendium search', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompendiumResult,
        status: 200,
      } as Response);

      const result = await getCompendiumInfo('ginger', 'en');

      expect(mockFetch).toHaveBeenCalledWith('/api/compendium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'ginger',
          language: 'en'
        }),
      });

      expect(result).toEqual(mockCompendiumResult);
    });

    it('trims query before sending', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompendiumResult,
        status: 200,
      } as Response);

      await getCompendiumInfo('  ginger  ', 'en');

      expect(mockFetch).toHaveBeenCalledWith('/api/compendium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'ginger',
          language: 'en'
        }),
      });
    });

    it('handles API errors correctly', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server Error' }),
        status: 500,
      } as Response);

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Server Error');
    });

    it('handles network errors', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Network Error');
    });

    it('retries on server errors with exponential backoff', async () => {
      const mockFetch = vi.mocked(fetch);
      // First two calls fail, third succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Server Error' }),
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Server Error' }),
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCompendiumResult,
          status: 200,
        } as Response);

      const result = await getCompendiumInfo('ginger', 'en');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockCompendiumResult);
    });

    it('does not retry on client errors (4xx)', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Bad Request' }),
        status: 400,
      } as Response);

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Bad Request');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('stops retrying after max retries', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Server Error' }),
        status: 500,
      } as Response);

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Server Error');
      // Should try 4 times total (initial + 3 retries)
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('analyzeUserData', () => {
    it('makes correct API call for analysis', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResult,
        status: 200,
      } as Response);

      const result = await analyzeUserData('general', mockUserProfile, 'en');

      expect(mockFetch).toHaveBeenCalledWith('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'general',
          profile: mockUserProfile,
          language: 'en'
        }),
      });

      expect(result).toEqual(mockAnalysisResult);
    });

    it('handles different analysis modes correctly', async () => {
      const mockFetch = vi.mocked(fetch);
      const professionalResult = {
        ...mockAnalysisResult,
        analysisMode: 'professional' as const,
        differentialDiagnosis: {
          pattern: "Qi Deficiency",
          pathology: "Weak digestive function",
          evidence: "Fatigue, poor appetite"
        },
        rationale: "Based on symptoms",
        treatmentPrinciple: "Tonify Qi",
        kampoSuggestions: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => professionalResult,
        status: 200,
      } as Response);

      const professionalProfile = {
        chiefComplaint: "Fatigue",
        professionalObservations: {}
      };

      await analyzeUserData('professional', professionalProfile, 'en');

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1]?.body as string);

      expect(body.mode).toBe('professional');
    });

    it('handles analysis API errors with proper formatting', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Analysis failed' }),
        status: 500,
      } as Response);

      await expect(analyzeUserData('general', mockUserProfile, 'en'))
        .rejects.toThrow('AI API Error: Analysis failed');
    });

    it('handles malformed API responses', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(analyzeUserData('general', mockUserProfile, 'en'))
        .rejects.toThrow('AI API Error: HTTP 500: Internal Server Error');
    });

    it('retries on server errors', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Server Error' }),
          status: 503,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalysisResult,
          status: 200,
        } as Response);

      const result = await analyzeUserData('general', mockUserProfile, 'en');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockAnalysisResult);
    });

    it('does not retry on authentication errors', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
        status: 401,
      } as Response);

      await expect(analyzeUserData('general', mockUserProfile, 'en'))
        .rejects.toThrow('AI API Error: Unauthorized');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling and resilience', () => {
    it('handles timeout scenarios', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Timeout');
    });

    it('properly formats error messages', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Custom error message' }),
        status: 422,
      } as Response);

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Custom error message');
    });

    it('handles missing error field in response', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(getCompendiumInfo('ginger', 'en'))
        .rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('handles unknown API errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: null }),
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(analyzeUserData('general', mockUserProfile, 'en'))
        .rejects.toThrow('AI API Error');
    });
  });
});
