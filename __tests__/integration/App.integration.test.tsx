import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { render, mockFetchSuccess, mockCompendiumResult, mockAnalysisResult } from '../test-utils';

describe('App Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up successful API responses by default
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCompendiumResult,
      status: 200,
    });
  });

  it('renders the complete application', () => {
    render(<App />);
    
    // Check if main application elements are present
    expect(screen.getByText('Self-Care Guide for Wellness')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/compendium/i)).toBeInTheDocument();
  });

  it('allows navigation between views', async () => {
    render(<App />);
    
    // Initially should be on compendium view
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    
    // Navigate to manual
    const manualButton = screen.getByRole('button', { name: /manual/i });
    await user.click(manualButton);
    
    expect(screen.getByText(/instruction manual/i)).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    
    // Navigate back to compendium
    const compendiumButton = screen.getByRole('button', { name: /compendium/i });
    await user.click(compendiumButton);
    
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('changes language and updates UI', async () => {
    render(<App />);
    
    // Initially should be in English
    expect(screen.getByText(/search the compendium/i)).toBeInTheDocument();
    
    // Switch to Japanese
    const jaButton = screen.getByRole('button', { name: 'JA' });
    await user.click(jaButton);
    
    // Should see Japanese text (assuming translations exist)
    await waitFor(() => {
      expect(document.querySelector('html')).toHaveAttribute('lang');
    });
  });

  it('changes font size and applies to interface', async () => {
    render(<App />);
    
    const largeButton = screen.getByRole('button', { name: /large/i });
    await user.click(largeButton);
    
    // Check if font size is applied to document
    expect(document.documentElement.style.fontSize).toBe('18px');
  });

  it('performs complete compendium search workflow', async () => {
    render(<App />);
    
    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Perform search
    await user.type(searchInput, 'ginger');
    await user.click(searchButton);
    
    // Should show loading state
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
    
    // Wait for results
    await waitFor(() => {
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    });
    
    // Check if results are displayed
    expect(screen.getByText('Shokenchuto')).toBeInTheDocument();
    expect(screen.getByText('Ginger')).toBeInTheDocument();
    
    // Check if print button appears
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
  });

  it('handles error states gracefully across the application', async () => {
    // Mock API failure
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Service unavailable' }),
      status: 503,
    });
    
    render(<App />);
    
    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(searchInput, 'ginger');
    await user.click(searchButton);
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
    });
    
    // Should allow clearing the error
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);
    
    expect(screen.queryByText(/service unavailable/i)).not.toBeInTheDocument();
  });

  it('maintains state during navigation', async () => {
    render(<App />);
    
    // Perform search
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'ginger');
    await user.click(screen.getByRole('button', { name: /search/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Ginger')).toBeInTheDocument();
    });
    
    // Navigate away
    const manualButton = screen.getByRole('button', { name: /manual/i });
    await user.click(manualButton);
    
    expect(screen.getByText(/instruction manual/i)).toBeInTheDocument();
    
    // Navigate back
    const compendiumButton = screen.getByRole('button', { name: /compendium/i });
    await user.click(compendiumButton);
    
    // Search results should still be visible
    expect(screen.getByText('Ginger')).toBeInTheDocument();
  });

  it('handles mobile navigation menu', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<App />);
    
    // Mobile navigation should be visible
    const mobileNav = screen.getByRole('navigation', { name: /compendium/i });
    expect(mobileNav).toBeInTheDocument();
    
    // Should have navigation buttons
    expect(within(mobileNav).getByRole('button', { name: /compendium/i })).toBeInTheDocument();
    expect(within(mobileNav).getByRole('button', { name: /manual/i })).toBeInTheDocument();
  });

  it('persists settings across browser sessions', async () => {
    const { unmount } = render(<App />);
    
    // Change settings
    await user.click(screen.getByRole('button', { name: 'JA' }));
    await user.click(screen.getByRole('button', { name: /large/i }));
    
    // Unmount and remount (simulate page reload)
    unmount();
    render(<App />);
    
    // Settings should be persisted
    expect(screen.getByRole('button', { name: 'JA' })).toHaveClass(/bg-sky-600/);
    expect(document.documentElement.style.fontSize).toBe('18px');
  });

  it('handles footer navigation correctly', async () => {
    render(<App />);
    
    const footer = screen.getByRole('contentinfo') || document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    
    // Click on privacy link
    const privacyButton = screen.getByRole('button', { name: /privacy/i });
    await user.click(privacyButton);
    
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    
    // Click on terms link
    const termsButton = screen.getByRole('button', { name: /terms/i });
    await user.click(termsButton);
    
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    render(<App />);
    
    const searchInput = screen.getByRole('searchbox');
    
    // Focus search input
    searchInput.focus();
    expect(searchInput).toHaveFocus();
    
    // Type and submit with Enter
    await user.type(searchInput, 'ginger');
    await user.keyboard('{Enter}');
    
    // Should trigger search
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });
});