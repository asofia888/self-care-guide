import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { type Mock } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppContext } from '../contexts/AppContext';
import type { AppContextType } from '../contexts/AppContext';

vi.mock('../contexts/AppContext');

describe('LoadingSpinner component', () => {
  const createMockContextValue = (overrides?: Partial<AppContextType>): AppContextType => ({
    language: 'en',
    activeView: 'compendium',
    fontSize: 'standard',
    handleLanguageChange: vi.fn(),
    handleNavigate: vi.fn(),
    handleFontSizeChange: vi.fn(),
    viewCompendiumItem: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading spinner with role="status"', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('displays loading message in English', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ language: 'en' }));
    render(<LoadingSpinner />);
    expect(screen.getByText(/Searching for the best information/i)).toBeInTheDocument();
  });

  it('displays loading message in Japanese', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ language: 'ja' }));
    render(<LoadingSpinner />);
    expect(screen.getByText(/最適な情報を検索しています/)).toBeInTheDocument();
  });

  it('animates dots in the loading message', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    // Fake timers are scoped to this test only; real timers are restored before
    // the global afterEach cleanup unmounts the component.
    vi.useFakeTimers();
    try {
      render(<LoadingSpinner />);
      const status = screen.getByRole('status');

      // The animated dots are appended on a 500ms interval next to the message.
      expect(status.textContent).toContain('Loading');

      // Advancing through a full animation cycle should keep the message rendered.
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(status.textContent).toContain('Loading');
    } finally {
      vi.useRealTimers();
    }
  });

  it('cleans up interval on unmount', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { unmount } = render(<LoadingSpinner />);
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('renders with no-print class to hide during printing', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.no-print');
    expect(spinner).toBeInTheDocument();
  });

  it('has accessible sr-only text', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<LoadingSpinner />);
    const srOnlyText = screen.getByText('Loading...', { selector: 'span' });
    expect(srOnlyText).toHaveClass('sr-only');
  });

  it('renders a decorative animated icon', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('img[src="/logo.png"]')).toBeInTheDocument();
    expect(container.querySelector('.animate-breathe')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<LoadingSpinner />);
    const statusDiv = container.querySelector('[role="status"]');
    expect(statusDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'my-16');
  });

  it('applies proper color classes to loading element', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<LoadingSpinner />);
    const statusDiv = container.querySelector('[role="status"]');
    expect(statusDiv).toHaveClass('text-stone-600');
  });

  it('renders with memo optimization (displayName)', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<LoadingSpinner />);
    expect(LoadingSpinner.displayName).toBe('LoadingSpinner');
  });
});
