import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import App from './App';
import { useAppContext } from './contexts/AppContext';
import type { AppContextType } from './contexts/AppContext';

// Mock the Header and Compendium components
vi.mock('./components/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('./components/Compendium', () => ({
  Compendium: () => <div data-testid="compendium">Compendium</div>,
}));

// Mock the lazy loaded components
vi.mock('./components/InstructionManual', () => ({
  default: () => <div data-testid="instruction-manual">Instruction Manual</div>,
}));

vi.mock('./components/PrivacyPolicy', () => ({
  default: () => <div data-testid="privacy-policy">Privacy Policy</div>,
}));

vi.mock('./components/TermsOfService', () => ({
  default: () => <div data-testid="terms-of-service">Terms of Service</div>,
}));

vi.mock('./components/DisclaimerPage', () => ({
  default: () => <div data-testid="disclaimer-page">Disclaimer Page</div>,
}));

vi.mock('./components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading Spinner</div>,
}));

// Mock the useAppContext hook
vi.mock('./contexts/AppContext');

describe('App component', () => {
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
    // Reset document styles
    document.documentElement.style.fontSize = '';
  });

  afterEach(() => {
    document.documentElement.style.fontSize = '';
  });

  it('renders the Header component', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the Compendium view by default', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<App />);
    expect(screen.getByTestId('compendium')).toBeInTheDocument();
  });

  it('renders the InstructionManual view when activeView is manual', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ activeView: 'manual' }));
    render(<App />);
    expect(screen.getByTestId('instruction-manual')).toBeInTheDocument();
  });

  it('renders the PrivacyPolicy view when activeView is privacy', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ activeView: 'privacy' }));
    render(<App />);
    expect(screen.getByTestId('privacy-policy')).toBeInTheDocument();
  });

  it('renders the TermsOfService view when activeView is terms', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ activeView: 'terms' }));
    render(<App />);
    expect(screen.getByTestId('terms-of-service')).toBeInTheDocument();
  });

  it('renders the DisclaimerPage view when activeView is disclaimer', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ activeView: 'disclaimer' }));
    render(<App />);
    expect(screen.getByTestId('disclaimer-page')).toBeInTheDocument();
  });

  it('sets font size to 18px when fontSize is large', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ fontSize: 'large' }));
    render(<App />);
    expect(document.documentElement.style.fontSize).toBe('18px');
  });

  it('sets font size to 16px when fontSize is standard', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ fontSize: 'standard' }));
    render(<App />);
    expect(document.documentElement.style.fontSize).toBe('16px');
  });

  it('resets font size on unmount', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ fontSize: 'large' }));
    const { unmount } = render(<App />);
    expect(document.documentElement.style.fontSize).toBe('18px');
    unmount();
    expect(document.documentElement.style.fontSize).toBe('');
  });

  it('renders footer with navigation links', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<App />);
    expect(screen.getByText('Self-Care Guide for Wellness')).toBeInTheDocument();
  });

  it('has correct main structure with flex layout', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<App />);
    const mainDiv = container.querySelector('div[class*="flex flex-col"]');
    expect(mainDiv).toBeInTheDocument();
  });

  it('renders footer with minimum height buttons for mobile accessibility', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<App />);
    const footerButtons = screen.getAllByRole('button');
    expect(footerButtons.length).toBeGreaterThan(0);
    footerButtons.forEach((button) => {
      expect(button.className).toContain('min-h-[44px]');
    });
  });
});
