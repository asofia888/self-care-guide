import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { type Mock } from 'vitest';
import { ErrorDisplay } from './ErrorDisplay';
import { useAppContext } from '../contexts/AppContext';
import type { AppContextType } from '../contexts/AppContext';

vi.mock('../contexts/AppContext');
vi.mock('./Icons', () => ({
  AlertTriangleIcon: ({ className }: { className: string }) => (
    <div data-testid="alert-icon" className={className} />
  ),
}));

describe('ErrorDisplay component', () => {
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

  it('renders error message when provided', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    render(<ErrorDisplay message="Test error message" onClear={onClear} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('returns null when message is empty', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const { container } = render(<ErrorDisplay message="" onClear={onClear} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays alert icon', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    render(<ErrorDisplay message="Test error" onClear={onClear} />);
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    render(<ErrorDisplay message="Test error" onClear={onClear} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders dismiss button with correct aria-label in English', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue({ language: 'en' }));
    const onClear = vi.fn();
    render(<ErrorDisplay message="Test error" onClear={onClear} />);
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onClear when dismiss button is clicked', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    render(<ErrorDisplay message="Test error" onClear={onClear} />);
    const dismissButton = screen.getByRole('button');
    fireEvent.click(dismissButton);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling classes', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const { container } = render(<ErrorDisplay message="Test error" onClear={onClear} />);
    const alertDiv = container.querySelector('[role="alert"]');
    expect(alertDiv).toHaveClass('bg-red-100', 'border-l-4', 'border-red-500', 'text-red-800');
  });

  it('has no-print class to hide during printing', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const { container } = render(<ErrorDisplay message="Test error" onClear={onClear} />);
    const alertDiv = container.querySelector('.no-print');
    expect(alertDiv).toBeInTheDocument();
  });

  it('renders with memo optimization (displayName)', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    render(<ErrorDisplay message="Test error" onClear={onClear} />);
    expect(ErrorDisplay.displayName).toBe('ErrorDisplay');
  });

  it('does not render when message is null', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const { container } = render(
      <ErrorDisplay message={'' as unknown as string} onClear={onClear} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays long error messages correctly', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const longMessage =
      'This is a very long error message that might wrap to multiple lines to test the layout and styling of the error display component';
    render(<ErrorDisplay message={longMessage} onClear={onClear} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('renders close icon with correct SVG attributes', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const { container } = render(<ErrorDisplay message="Test error" onClear={onClear} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('applies flex layout for proper alignment', () => {
    (useAppContext as Mock).mockReturnValue(createMockContextValue());
    const onClear = vi.fn();
    const { container } = render(<ErrorDisplay message="Test error" onClear={onClear} />);
    const alertDiv = container.querySelector('[role="alert"]');
    expect(alertDiv).toHaveClass('flex', 'items-center', 'justify-between');
  });
});
