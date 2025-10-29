import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { WelcomeMessage } from './WelcomeMessage';
import { useAppContext } from '../contexts/AppContext';
import type { AppContextType } from '../contexts/AppContext';

vi.mock('../contexts/AppContext');

describe('WelcomeMessage component', () => {
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
  });

  it('renders welcome message in English', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ language: 'en' }));
    render(<WelcomeMessage />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });

  it('renders welcome message in Japanese', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ language: 'ja' }));
    render(<WelcomeMessage />);
    // Check if the component renders (text will be in Japanese)
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('displays logo image with correct alt text', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<WelcomeMessage />);
    const logo = screen.getByAltText('Self-Care Guide for Wellness Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('w-16', 'h-16');
  });

  it('renders h2 heading with correct styling', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const heading = container.querySelector('h2');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-teal-800');
  });

  it('has no-print class to hide during printing', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const welcomeDiv = container.querySelector('.no-print');
    expect(welcomeDiv).toBeInTheDocument();
  });

  it('applies correct container styling classes', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('mt-12', 'text-center', 'p-8', 'bg-white/50', 'rounded-2xl');
  });

  it('has border styling with dashed border and amber color', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('border-2', 'border-dashed', 'border-amber-300/80');
  });

  it('renders description text with proper styling', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const description = container.querySelector('p');
    expect(description).toHaveClass('text-slate-600', 'max-w-2xl', 'mx-auto');
  });

  it('centers logo image', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const logoContainer = container.querySelector('.flex.justify-center');
    expect(logoContainer).toBeInTheDocument();
  });

  it('has proper spacing with mb-4 between logo and heading', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const logoContainer = container.querySelector('.mb-4');
    expect(logoContainer).toBeInTheDocument();
  });

  it('has proper spacing with mb-2 between heading and description', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const { container } = render(<WelcomeMessage />);
    const heading = container.querySelector('h2');
    expect(heading).toHaveClass('mb-2');
  });

  it('has flexible shrink behavior for logo', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<WelcomeMessage />);
    const logo = screen.getByAltText('Self-Care Guide for Wellness Logo');
    expect(logo).toHaveClass('flex-shrink-0');
  });

  it('has contain object-fit for logo', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    render(<WelcomeMessage />);
    const logo = screen.getByAltText('Self-Care Guide for Wellness Logo');
    expect(logo).toHaveClass('object-contain');
  });
});
