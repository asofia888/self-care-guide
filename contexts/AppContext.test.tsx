import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

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
        'disclaimer',
      ];

      views.forEach((view) => {
        act(() => {
          result.current.handleNavigate(view);
        });
        expect(result.current.activeView).toBe(view);
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
        viewCompendiumItem: result.current.viewCompendiumItem,
      };

      rerender();

      // All handlers should maintain referential equality
      expect(result.current.handleLanguageChange).toBe(initialHandlers.handleLanguageChange);
      expect(result.current.handleNavigate).toBe(initialHandlers.handleNavigate);
      expect(result.current.handleFontSizeChange).toBe(initialHandlers.handleFontSizeChange);
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
});
