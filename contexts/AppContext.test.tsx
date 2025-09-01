import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AppContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('provides default values', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.activeView).toBe('compendium');
    expect(result.current.fontSize).toBe('standard');
  });

  it('loads saved language from localStorage', () => {
    localStorageMock.setItem('selfcare-language', 'ja');

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.language).toBe('ja');
  });

  it('loads saved font size from localStorage', () => {
    localStorageMock.setItem('selfcare-fontSize', 'large');

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.fontSize).toBe('large');
  });

  it('handles invalid localStorage values gracefully', () => {
    localStorageMock.setItem('selfcare-language', 'invalid');
    localStorageMock.setItem('selfcare-fontSize', 'invalid');

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.fontSize).toBe('standard');
  });

  it('handles localStorage access errors', () => {
    // Mock localStorage to throw error
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.fontSize).toBe('standard');

    vi.restoreAllMocks();
  });

  it('changes language and saves to localStorage', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.handleLanguageChange('ja');
    });

    expect(result.current.language).toBe('ja');
    expect(localStorageMock.getItem('selfcare-language')).toBe('ja');
  });

  it('changes font size and saves to localStorage', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.handleFontSizeChange('large');
    });

    expect(result.current.fontSize).toBe('large');
    expect(localStorageMock.getItem('selfcare-fontSize')).toBe('large');
  });

  it('navigates to different views', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.handleNavigate('manual');
    });

    expect(result.current.activeView).toBe('manual');

    act(() => {
      result.current.handleNavigate('privacy');
    });

    expect(result.current.activeView).toBe('privacy');
  });

  it('validates language input', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Should not change to invalid language
    act(() => {
      result.current.handleLanguageChange('fr' as any);
    });

    expect(result.current.language).toBe('en'); // Should remain default
  });

  it('validates font size input', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Should not change to invalid font size
    act(() => {
      result.current.handleFontSizeChange('huge' as any);
    });

    expect(result.current.fontSize).toBe('standard'); // Should remain default
  });

  it('validates view navigation', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Should not navigate to invalid view
    act(() => {
      result.current.handleNavigate('invalid' as any);
    });

    expect(result.current.activeView).toBe('compendium'); // Should remain default
  });

  it('handles localStorage save errors gracefully', () => {
    // Mock localStorage to throw error on setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Should not throw error
    expect(() => {
      act(() => {
        result.current.handleLanguageChange('ja');
      });
    }).not.toThrow();

    // State should still change
    expect(result.current.language).toBe('ja');

    vi.restoreAllMocks();
  });

  it('throws error when useAppContext is used outside provider', () => {
    // Temporarily mock console.error to avoid test output noise
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppProvider');

    console.error = originalError;
  });

  it('maintains context state across re-renders', () => {
    const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.handleLanguageChange('ja');
      result.current.handleNavigate('manual');
      result.current.handleFontSizeChange('large');
    });

    rerender();

    expect(result.current.language).toBe('ja');
    expect(result.current.activeView).toBe('manual');
    expect(result.current.fontSize).toBe('large');
  });

  it('provides stable function references', () => {
    const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

    const initialHandlers = {
      handleLanguageChange: result.current.handleLanguageChange,
      handleNavigate: result.current.handleNavigate,
      handleFontSizeChange: result.current.handleFontSizeChange,
    };

    rerender();

    expect(result.current.handleLanguageChange).toBe(initialHandlers.handleLanguageChange);
    expect(result.current.handleNavigate).toBe(initialHandlers.handleNavigate);
    expect(result.current.handleFontSizeChange).toBe(initialHandlers.handleFontSizeChange);
  });
});