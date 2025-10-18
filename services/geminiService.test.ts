import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCompendiumInfo } from './geminiService';

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


// Mock fetch globally
global.fetch = vi.fn();

// Helper to create mock Response objects
const createMockResponse = (data: any, ok: boolean, status: number, statusText: string = ''): Response => {
  const response = {
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    formData: vi.fn().mockResolvedValue(new FormData()),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    clone: vi.fn(),
  } as unknown as Response;

  response.clone = vi.fn().mockReturnValue(response);
  return response;
};

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
      mockFetch.mockResolvedValueOnce(createMockResponse(mockCompendiumResult, true, 200));

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
      mockFetch.mockResolvedValueOnce(createMockResponse(mockCompendiumResult, true, 200));

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
      // Mock all retry attempts to fail
      for (let i = 0; i < 4; i++) {
        mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'Server Error' }, false, 500, 'Internal Server Error'));
      }

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow();
    });

    it('handles network errors', async () => {
      const mockFetch = vi.mocked(fetch);
      // Mock all retry attempts to fail
      for (let i = 0; i < 4; i++) {
        mockFetch.mockRejectedValueOnce(new Error('Network Error'));
      }

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow();
    });

    it('retries on server errors with exponential backoff', async () => {
      const mockFetch = vi.mocked(fetch);
      // First two calls fail, third succeeds
      mockFetch
        .mockResolvedValueOnce(createMockResponse({ error: 'Server Error' }, false, 500))
        .mockResolvedValueOnce(createMockResponse({ error: 'Server Error' }, false, 500))
        .mockResolvedValueOnce(createMockResponse(mockCompendiumResult, true, 200));

      const result = await getCompendiumInfo('ginger', 'en');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockCompendiumResult);
    });

    it('does not retry on client errors (4xx)', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'Bad Request' }, false, 400));

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Bad Request');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('stops retrying after max retries', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue(createMockResponse({ error: 'Server Error' }, false, 500));

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Server Error');
      // Should try 4 times total (initial + 3 retries)
      expect(mockFetch).toHaveBeenCalledTimes(4);
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
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'Custom error message' }, false, 422));

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Custom error message');
    });

    it('handles missing error field in response', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(createMockResponse({}, false, 500, 'Internal Server Error'));

      // Should throw an error after retries
      await expect(getCompendiumInfo('ginger', 'en'))
        .rejects.toThrow();
    });

    it('handles unknown API errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: null }, false, 500, 'Internal Server Error'));

      await expect(getCompendiumInfo('test', 'en'))
        .rejects.toThrow();
    });
  });
});
