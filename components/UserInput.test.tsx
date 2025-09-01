import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserInput } from './UserInput';
import { render, mockFetchSuccess, mockAnalysisResult } from '../__tests__/test-utils';
import type { AnalysisMode } from '../types';

// Mock the geminiService
vi.mock('../services/geminiService', () => ({
  analyzeUserData: vi.fn(),
}));

describe('UserInput Component', () => {
  const user = userEvent.setup();
  const mockOnAnalysisComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSuccess(mockAnalysisResult);
  });

  it('renders professional mode form correctly', () => {
    render(<UserInput mode="professional" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Check professional form elements
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/chief complaint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current medications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/known allergies/i)).toBeInTheDocument();
  });

  it('renders general mode form correctly', () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Check general form elements
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what.*feeling/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stress level/i)).toBeInTheDocument();
  });

  it('handles form input changes correctly', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    const ageInput = screen.getByLabelText(/age/i);
    const symptomsInput = screen.getByLabelText(/what.*feeling/i);
    
    await user.type(ageInput, '25');
    await user.type(symptomsInput, 'feeling tired');
    
    expect(ageInput).toHaveValue(25);
    expect(symptomsInput).toHaveValue('feeling tired');
  });

  it('handles dropdown selections correctly', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    const genderSelect = screen.getByLabelText(/gender/i);
    const stressSelect = screen.getByLabelText(/stress level/i);
    
    await user.selectOptions(genderSelect, 'female');
    await user.selectOptions(stressSelect, 'high');
    
    expect(genderSelect).toHaveValue('female');
    expect(stressSelect).toHaveValue('high');
  });

  it('validates required fields before submission', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    const submitButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(submitButton);
    
    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText(/age is required/i)).toBeInTheDocument();
    });
  });

  it('handles image upload correctly', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Create mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const faceInput = screen.getByLabelText(/face photo/i);
    await user.upload(faceInput, file);
    
    expect(faceInput.files?.[0]).toBe(file);
    expect(faceInput.files).toHaveLength(1);
  });

  it('validates file size limits', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Create oversized file (> 4MB)
    const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    const faceInput = screen.getByLabelText(/face photo/i);
    await user.upload(faceInput, largeFile);
    
    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 4MB/i)).toBeInTheDocument();
    });
  });

  it('validates file types', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Create invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const faceInput = screen.getByLabelText(/face photo/i);
    await user.upload(faceInput, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/please select an image file/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Fill required fields
    await user.type(screen.getByLabelText(/age/i), '30');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'female');
    await user.type(screen.getByLabelText(/what.*feeling/i), 'digestive issues');
    await user.selectOptions(screen.getByLabelText(/stress level/i), 'moderate');
    
    const submitButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Wait for completion
    await waitFor(() => {
      expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockAnalysisResult);
    });
  });

  it('shows appropriate help text for professional mode', () => {
    render(<UserInput mode="professional" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    expect(screen.getByText(/professional assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/detailed clinical analysis/i)).toBeInTheDocument();
  });

  it('shows appropriate help text for general mode', () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    expect(screen.getByText(/wellness guidance/i)).toBeInTheDocument();
    expect(screen.getByText(/personalized recommendations/i)).toBeInTheDocument();
  });

  it('allows image removal after upload', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const faceInput = screen.getByLabelText(/face photo/i);
    
    await user.upload(faceInput, file);
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    
    // Remove image
    const removeButton = screen.getByRole('button', { name: /remove.*face/i });
    await user.click(removeButton);
    
    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
  });

  it('handles analysis errors gracefully', async () => {
    // Mock API failure
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Analysis failed' }),
      status: 500,
    });
    
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/age/i), '30');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'female');
    await user.type(screen.getByLabelText(/what.*feeling/i), 'test');
    
    const submitButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
    });
    
    // Button should be re-enabled
    expect(submitButton).toBeEnabled();
  });

  it('clears form when reset button is clicked', async () => {
    render(<UserInput mode="general" onAnalysisComplete={mockOnAnalysisComplete} />);
    
    // Fill some fields
    await user.type(screen.getByLabelText(/age/i), '30');
    await user.type(screen.getByLabelText(/what.*feeling/i), 'test');
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    // Fields should be cleared
    expect(screen.getByLabelText(/age/i)).toHaveValue(null);
    expect(screen.getByLabelText(/what.*feeling/i)).toHaveValue('');
  });
});