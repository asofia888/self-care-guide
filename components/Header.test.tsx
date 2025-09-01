

// FIX: Import vitest matchers from jest-dom to provide types for expect extensions.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// FIX: Rely on vitest globals (`describe`, `it`, `expect`, `vi`, `beforeEach`) and only import types. This ensures the globally augmented `expect` with jest-dom matchers is used, fixing type errors.
import { type Mock } from 'vitest';
import { Header } from './Header';
import { useAppContext } from '../contexts/AppContext';
import type { AppContextType } from '../contexts/AppContext';

// Mock the useAppContext hook to provide a controlled context for tests.
vi.mock('../contexts/AppContext');

describe('Header component', () => {
  // Create mock functions to spy on event handlers.
  const mockHandleLanguageChange = vi.fn();
  const mockHandleNavigate = vi.fn();
  const mockHandleFontSizeChange = vi.fn();

  // Define a base mock context value that can be reused and overridden in tests.
  // FIX: Added all missing properties to satisfy the AppContextType interface.
  const mockContextValue: AppContextType = {
    language: 'en',
    activeView: 'compendium',
    fontSize: 'standard',
    analysisResult: null,
    streamingContent: '',
    isLoading: false,
    error: null,
    handleLanguageChange: mockHandleLanguageChange,
    handleNavigate: mockHandleNavigate,
    handleFontSizeChange: mockHandleFontSizeChange,
    handleAnalysis: vi.fn(),
    clearError: vi.fn(),
    viewCompendiumItem: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks and setup the default mock return value before each test.
    vi.clearAllMocks();
    (useAppContext as Mock).mockReturnValue(mockContextValue);
  });

  it('renders the header with title and tagline in English', () => {
    render(<Header />);
    expect(screen.getByText('Self-Care Guide for Wellness')).toBeInTheDocument();
    expect(screen.getByText('Your Wellness Guide')).toBeInTheDocument();
  });

  it('renders navigation buttons and highlights the active one with aria-current', () => {
    render(<Header />);
    const compendiumButton = screen.getByRole('button', { name: /Formulary/i });
    const manualButton = screen.getByRole('button', { name: /Manual/i });

    expect(compendiumButton).toBeInTheDocument();
    expect(manualButton).toBeInTheDocument();
    
    // The active button should have specific styles and aria-current attribute.
    expect(compendiumButton.className).toContain('bg-sky-100');
    expect(compendiumButton).toHaveAttribute('aria-current', 'page');
    expect(manualButton.className).not.toContain('bg-sky-100');
    expect(manualButton).not.toHaveAttribute('aria-current');
  });

  it('calls handleNavigate when a navigation button is clicked', () => {
    render(<Header />);
    const manualButton = screen.getByRole('button', { name: /Manual/i });
    fireEvent.click(manualButton);
    expect(mockHandleNavigate).toHaveBeenCalledWith('manual');
    expect(mockHandleNavigate).toHaveBeenCalledTimes(1);
  });
  
  it('calls handleLanguageChange when a language button is clicked', () => {
    render(<Header />);
    const jaButton = screen.getByRole('button', { name: 'JA' });
    fireEvent.click(jaButton);
    expect(mockHandleLanguageChange).toHaveBeenCalledWith('ja');
    expect(mockHandleLanguageChange).toHaveBeenCalledTimes(1);
  });

  it('calls handleFontSizeChange when a font size button is clicked', () => {
    render(<Header />);
    const largeButton = screen.getByRole('button', { name: 'Large' });
    fireEvent.click(largeButton);
    expect(mockHandleFontSizeChange).toHaveBeenCalledWith('large');
    expect(mockHandleFontSizeChange).toHaveBeenCalledTimes(1);
  });

  it('renders Japanese text when language is set to "ja"', () => {
    // Override the mock context for this specific test case.
    (useAppContext as Mock).mockReturnValue({
      ...mockContextValue,
      language: 'ja',
    });

    render(<Header />);
    expect(screen.getByText('あなたのウェルネス・ガイド')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /処方解説/i })).toBeInTheDocument();
  });
});
