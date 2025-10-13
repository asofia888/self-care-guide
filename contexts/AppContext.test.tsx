import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import type { AnalysisMode, AnyUserProfile } from '../types';

describe('AppContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default State', () => {
    it('provides default values', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.language).toBe('ja');
      expect(result.current.activeView).toBe('compendium');
      expect(result.current.fontSize).toBe('standard');
      expect(result.current.analysisResult).toBeNull();
      expect(result.current.streamingContent).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('throws error when useAppContext is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Language Management', () => {
    it('changes language correctly', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleLanguageChange('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('persists language changes', () => {
      const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleLanguageChange('en');
      });

      rerender();
      expect(result.current.language).toBe('en');
    });
  });

  describe('Font Size Management', () => {
    it('changes font size correctly', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleFontSizeChange('large');
      });

      expect(result.current.fontSize).toBe('large');
    });

    it('persists font size changes', () => {
      const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleFontSizeChange('large');
      });

      rerender();
      expect(result.current.fontSize).toBe('large');
    });
  });

  describe('Navigation', () => {
    it('navigates to different views', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleNavigate('manual');
      });

      expect(result.current.activeView).toBe('manual');
    });

    it('scrolls to top when navigating', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleNavigate('privacy');
      });

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
      scrollToSpy.mockRestore();
    });

    it('supports all valid view types', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      const views: Array<'compendium' | 'manual' | 'privacy' | 'terms' | 'disclaimer'> = [
        'compendium',
        'manual',
        'privacy',
        'terms',
        'disclaimer'
      ];

      views.forEach(view => {
        act(() => {
          result.current.handleNavigate(view);
        });
        expect(result.current.activeView).toBe(view);
      });
    });
  });

  describe('Error Management', () => {
    it('clears error when clearError is called', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Manually set error state (simulating an error)
      act(() => {
        result.current.handleAnalysis('professional', { chiefComplaint: 'test', professionalObservations: {} });
      });

      // Mock API error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Test error' }),
        status: 500,
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Analysis Workflow', () => {
    it('handles successful analysis', async () => {
      const mockResult = {
        analysisMode: 'professional' as const,
        differentialDiagnosis: {
          pattern: 'Test Pattern',
          pathology: 'Test Pathology',
          evidence: 'Test Evidence'
        },
        rationale: 'Test Rationale',
        treatmentPrinciple: 'Test Treatment',
        herbSuggestions: [],
        kampoSuggestions: [],
        supplementSuggestions: [],
        lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
        precautions: []
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
        status: 200,
      });

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const profile: AnyUserProfile = {
        chiefComplaint: 'Headache',
        professionalObservations: {}
      };

      await act(async () => {
        await result.current.handleAnalysis('professional', profile);
      });

      await waitFor(() => {
        expect(result.current.analysisResult).toEqual(mockResult);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('sets loading state during analysis', async () => {
      global.fetch = vi.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({}),
            status: 200,
          }), 100)
        )
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const profile: AnyUserProfile = {
        chiefComplaint: 'Test',
        professionalObservations: {}
      };

      act(() => {
        result.current.handleAnalysis('professional', profile);
      });

      // Should be loading immediately
      expect(result.current.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 5000 });
    });

    it('handles analysis errors', async () => {
      const errorMessage = 'Analysis failed';
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: errorMessage }),
        status: 500,
      });

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const profile: AnyUserProfile = {
        chiefComplaint: 'Test',
        professionalObservations: {}
      };

      await act(async () => {
        await result.current.handleAnalysis('professional', profile);
      });

      await waitFor(() => {
        expect(result.current.error).toContain(errorMessage);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.analysisResult).toBeNull();
      });
    });

    it('handles general mode analysis', async () => {
      const mockResult = {
        analysisMode: 'general' as const,
        wellnessProfile: {
          title: 'Wellness Profile',
          summary: 'Test Summary'
        },
        herbSuggestions: [],
        supplementSuggestions: [],
        lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
        precautions: []
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
        status: 200,
      });

      const { result } = renderHook(() => useAppContext(), { wrapper });

      const profile: AnyUserProfile = {
        concerns: ['stress'],
        selfAssessment: ['low_energy']
      };

      await act(async () => {
        await result.current.handleAnalysis('general', profile);
      });

      await waitFor(() => {
        expect(result.current.analysisResult).toEqual(mockResult);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('clears previous results before new analysis', async () => {
      const firstResult = {
        analysisMode: 'general' as const,
        wellnessProfile: { title: 'First', summary: 'First' },
        herbSuggestions: [],
        supplementSuggestions: [],
        lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
        precautions: []
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => firstResult,
        status: 200,
      });

      const { result } = renderHook(() => useAppContext(), { wrapper });

      // First analysis
      await act(async () => {
        await result.current.handleAnalysis('general', { concerns: ['stress'] });
      });

      await waitFor(() => {
        expect(result.current.analysisResult).toEqual(firstResult);
      });

      // Second analysis
      const secondResult = { ...firstResult, wellnessProfile: { title: 'Second', summary: 'Second' } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => secondResult,
        status: 200,
      });

      await act(async () => {
        await result.current.handleAnalysis('general', { concerns: ['fatigue'] });
      });

      await waitFor(() => {
        expect(result.current.analysisResult).toEqual(secondResult);
      });
    });
  });

  describe('Compendium Integration', () => {
    it('navigates to compendium when viewing an item', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Start from a different view
      act(() => {
        result.current.handleNavigate('manual');
      });

      // View a compendium item
      act(() => {
        result.current.viewCompendiumItem('ginger');
      });

      expect(result.current.activeView).toBe('compendium');
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);

      scrollToSpy.mockRestore();
    });
  });

  describe('Function Stability', () => {
    it('provides stable function references', () => {
      const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

      const initialHandlers = {
        handleLanguageChange: result.current.handleLanguageChange,
        handleNavigate: result.current.handleNavigate,
        handleFontSizeChange: result.current.handleFontSizeChange,
        handleAnalysis: result.current.handleAnalysis,
        clearError: result.current.clearError,
        viewCompendiumItem: result.current.viewCompendiumItem,
      };

      rerender();

      // All handlers should maintain referential equality
      expect(result.current.handleLanguageChange).toBe(initialHandlers.handleLanguageChange);
      expect(result.current.handleNavigate).toBe(initialHandlers.handleNavigate);
      expect(result.current.handleFontSizeChange).toBe(initialHandlers.handleFontSizeChange);
      expect(result.current.handleAnalysis).toBe(initialHandlers.handleAnalysis);
      expect(result.current.clearError).toBe(initialHandlers.clearError);
      expect(result.current.viewCompendiumItem).toBe(initialHandlers.viewCompendiumItem);
    });

    it('maintains context state across re-renders', () => {
      const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleLanguageChange('en');
        result.current.handleNavigate('manual');
        result.current.handleFontSizeChange('large');
      });

      rerender();

      expect(result.current.language).toBe('en');
      expect(result.current.activeView).toBe('manual');
      expect(result.current.fontSize).toBe('large');
    });
  });

  describe('Streaming Content', () => {
    it('sets streaming content during analysis', async () => {
      global.fetch = vi.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              analysisMode: 'general',
              wellnessProfile: { title: 'Test', summary: 'Test' },
              herbSuggestions: [],
              supplementSuggestions: [],
              lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
              precautions: []
            }),
            status: 200,
          }), 100)
        )
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.handleAnalysis('general', { concerns: ['stress'] });
      });

      // Should show streaming content during analysis
      expect(result.current.streamingContent).toBeTruthy();

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.streamingContent).toBe('');
      }, { timeout: 5000 });
    });
  });
});
