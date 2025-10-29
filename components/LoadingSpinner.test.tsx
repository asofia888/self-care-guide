import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    analysisResult: null,
    streamingContent: '',
    isLoading: false,
    error: null,
    handleLanguageChange: vi.fn(),
    handleNavigate: vi.fn(),
    handleFontSizeChange: vi.fn(),
    handleAnalysis: vi.fn(),
    clearError: vi.fn(),
    viewCompendiumItem: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
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

  it('animates dots in the loading message', async () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<LoadingSpinner />);

    // Initially should have no dots
    expect(screen.getByText(/Your Wellness Guide is loading/)).toBeInTheDocument();

    // After 500ms, should have one dot
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      const messages = screen.getAllByText(/Your Wellness Guide is loading./i);
      expect(messages.length).toBeGreaterThan(0);
    });

    // After another 500ms, should have two dots
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      const messages = screen.getAllByText(/Your Wellness Guide is loading../i);
      expect(messages.length).toBeGreaterThan(0);
    });

    // After another 500ms, should have three dots
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      const messages = screen.getAllByText(/Your Wellness Guide is loading.../i);
      expect(messages.length).toBeGreaterThan(0);
    });

    // After another 500ms, should cycle back to no dots
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(screen.getByText(/Your Wellness Guide is loading/i)).toBeInTheDocument();
    });
  });

  it('cleans up interval on unmount', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { unmount } = render(<LoadingSpinner />);
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
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
    const srOnlyText = screen.getByText('Your Wellness Guide is loading', { selector: 'span' });
    expect(srOnlyText).toHaveClass('sr-only');
  });

  it('renders loading icon with alt text', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<LoadingSpinner />);
    const icon = screen.getByAltText('Loading');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-12', 'h-12', 'animate-pulse');
  });

  it('has proper styling classes', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<LoadingSpinner />);
    const statusDiv = container.querySelector('[role="status"]');
    expect(statusDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'my-12');
  });

  it('applies proper color classes to loading element', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<LoadingSpinner />);
    const statusDiv = container.querySelector('[role="status"]');
    expect(statusDiv).toHaveClass('text-sky-700');
  });

  it('renders with memo optimization (displayName)', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<LoadingSpinner />);
    expect(LoadingSpinner.displayName).toBe('LoadingSpinner');
  });
});
