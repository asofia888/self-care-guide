import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Compendium } from './Compendium';
import {
  render,
  mockFetchSuccess,
  mockFetchError,
  mockCompendiumResult,
} from '../__tests__/test-utils';

// Mock the geminiService
vi.mock('../services/geminiService', () => ({
  getCompendiumInfo: vi.fn(),
}));

describe('Compendium Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    // Mock successful fetch by default
    mockFetchSuccess(mockCompendiumResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the compendium interface correctly', () => {
    render(<Compendium />);

    // Check if main elements are present
    expect(screen.getByRole('heading', { name: /compendium/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByText(/provide detailed, accurate information/i)).toBeInTheDocument();
  });

  it('handles search input correctly', async () => {
    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    // Initially search button should be disabled
    expect(searchButton).toBeDisabled();

    // Type in search input
    await user.type(searchInput, 'ginger');
    expect(searchInput).toHaveValue('ginger');

    // Search button should be enabled
    expect(searchButton).toBeEnabled();
  });

  it('performs search and displays results', async () => {
    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    // Perform search
    await user.type(searchInput, 'ginger');
    await user.click(searchButton);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    });

    // Check if results are displayed
    expect(screen.getByText('Shokenchuto')).toBeInTheDocument();
    expect(screen.getByText('Ginger')).toBeInTheDocument();
    expect(screen.getByText('Ginger Extract')).toBeInTheDocument();
    expect(screen.getByText(/integrative viewpoint/i)).toBeInTheDocument();
  });

  it('shows loading state during search', async () => {
    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'ginger');
    await user.click(searchButton);

    // Check loading state
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
    expect(searchButton).toBeDisabled();
  });

  it('handles search errors gracefully', async () => {
    mockFetchError(500, 'Server Error');

    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'ginger');
    await user.click(searchButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Check that error can be cleared
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search returns empty', async () => {
    mockFetchSuccess({
      integrativeViewpoint: '',
      kampoEntries: [],
      herbEntries: [],
      supplementEntries: [],
    });

    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'nonexistent');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  it('handles form submission via Enter key', async () => {
    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');

    await user.type(searchInput, 'ginger');
    await user.keyboard('{Enter}');

    // Should trigger search
    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('shows print button when results are available', async () => {
    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'ginger');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    });
  });

  it('calls window.print when print button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'ginger');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: /print/i });
    await user.click(printButton);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('prevents search with empty query', async () => {
    render(<Compendium />);

    const searchButton = screen.getByRole('button', { name: /search/i });

    // Button should be disabled with empty input
    expect(searchButton).toBeDisabled();

    // Type and then clear input
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test');
    await user.clear(searchInput);

    // Button should be disabled again
    expect(searchButton).toBeDisabled();
  });

  it('displays different result sections correctly', async () => {
    render(<Compendium />);

    const searchInput = screen.getByRole('searchbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'ginger');
    await user.click(searchButton);

    await waitFor(() => {
      // Check section headers
      expect(screen.getByText(/kampo formula/i)).toBeInTheDocument();
      expect(screen.getByText(/herb/i)).toBeInTheDocument();
      expect(screen.getByText(/supplement/i)).toBeInTheDocument();
    });
  });
});
