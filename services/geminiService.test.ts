import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCompendiumInfo, analyzeUserData } from './geminiService';
import { mockCompendiumResult, mockAnalysisResult, mockUserProfile, createMockFile } from '../__tests__/test-utils';

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

    it('retries on server errors', async () => {
      const mockFetch = vi.mocked(fetch);
      // First call fails, second succeeds
      mockFetch
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

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCompendiumResult);
    });

    it('does not retry on client errors', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Bad Request' }),
        status: 400,
      } as Response);

      await expect(getCompendiumInfo('ginger', 'en')).rejects.toThrow('Bad Request');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('analyzeUserData', () => {
    it('makes correct API call for analysis without images', async () => {
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

    it('includes face image when provided', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResult,
        status: 200,
      } as Response);

      const faceImage = createMockFile('face.jpg', 'image/jpeg');
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,dGVzdA==',
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Simulate successful file read
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload();
        }
      }, 0);

      const result = await analyzeUserData('general', mockUserProfile, 'en', faceImage);

      expect(result).toEqual(mockAnalysisResult);
    });

    it('includes tongue image when provided', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResult,
        status: 200,
      } as Response);

      const tongueImage = createMockFile('tongue.jpg', 'image/jpeg');
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,dGVzdA==',
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Simulate successful file read
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload();
        }
      }, 0);

      const result = await analyzeUserData('general', mockUserProfile, 'en', null, tongueImage);

      expect(result).toEqual(mockAnalysisResult);
    });

    it('handles file processing errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResult,
        status: 200,
      } as Response);

      const faceImage = createMockFile('face.jpg', 'image/jpeg');
      
      // Mock FileReader that fails
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: null,
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Simulate file read error
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror();
        }
      }, 0);

      // Should still proceed without the image
      const result = await analyzeUserData('general', mockUserProfile, 'en', faceImage);

      expect(result).toEqual(mockAnalysisResult);
    });

    it('handles different analysis modes correctly', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResult,
        status: 200,
      } as Response);

      await analyzeUserData('professional', mockUserProfile, 'en');

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1]?.body as string);
      
      expect(body.mode).toBe('professional');
    });

    it('handles analysis API errors', async () => {
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
      } as Response);

      await expect(analyzeUserData('general', mockUserProfile, 'en'))
        .rejects.toThrow('AI API Error: HTTP 500: Internal Server Error');
    });

    it('applies exponential backoff for retries', async () => {
      const mockFetch = vi.mocked(fetch);
      let attemptCount = 0;
      
      mockFetch.mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          return {
            ok: false,
            json: async () => ({ error: 'Server Error' }),
            status: 500,
          } as Response;
        }
        return {
          ok: true,
          json: async () => mockAnalysisResult,
          status: 200,
        } as Response;
      });

      const startTime = Date.now();
      const result = await analyzeUserData('general', mockUserProfile, 'en');
      const endTime = Date.now();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockAnalysisResult);
      // Should have some delay due to exponential backoff
      expect(endTime - startTime).toBeGreaterThan(100);
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
  });
});