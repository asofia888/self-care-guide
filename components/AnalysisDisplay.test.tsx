import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisDisplay } from './AnalysisDisplay';
import { render, mockAnalysisResult } from '../__tests__/test-utils';

describe('AnalysisDisplay Component', () => {
  const user = userEvent.setup();

  it('renders professional analysis results correctly', () => {
    const professionalResult = {
      ...mockAnalysisResult,
      analysisMode: 'professional' as const,
      differentialDiagnosis: {
        pattern: 'Spleen Qi Deficiency',
        pathology: 'Digestive weakness with qi stagnation',
        evidence: 'Fatigue after meals, loose stools, poor appetite'
      },
      rationale: 'Based on symptoms and presentation',
      treatmentPrinciple: 'Strengthen spleen qi and regulate digestion',
      kampoSuggestions: [
        {
          name: 'Rikkunshito',
          reason: 'Strengthen digestive function',
          usage: '2.5g three times daily',
          constituentHerbs: 'Ginseng, Atractylodes, Citrus',
          pharmacology: 'Enhances gastric motility',
          contraindications: 'Avoid in acute fever'
        }
      ]
    };

    render(<AnalysisDisplay result={professionalResult} />);
    
    // Check professional-specific elements
    expect(screen.getByText('Differential Diagnosis')).toBeInTheDocument();
    expect(screen.getByText('Spleen Qi Deficiency')).toBeInTheDocument();
    expect(screen.getByText(/rationale/i)).toBeInTheDocument();
    expect(screen.getByText(/treatment principle/i)).toBeInTheDocument();
    expect(screen.getByText('Rikkunshito')).toBeInTheDocument();
    expect(screen.getByText(/pharmacology/i)).toBeInTheDocument();
  });

  it('renders general analysis results correctly', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    // Check general analysis elements
    expect(screen.getByText('Digestive Wellness Profile')).toBeInTheDocument();
    expect(screen.getByText(/digestive sensitivity/i)).toBeInTheDocument();
    expect(screen.getByText('Chamomile')).toBeInTheDocument();
    expect(screen.getByText('Probiotics')).toBeInTheDocument();
  });

  it('displays lifestyle advice sections', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    // Check lifestyle advice sections
    expect(screen.getByText(/dietary recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/sleep recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/exercise recommendations/i)).toBeInTheDocument();
    
    // Check specific advice
    expect(screen.getByText(/smaller, frequent meals/i)).toBeInTheDocument();
    expect(screen.getByText(/regular sleep schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/gentle walking/i)).toBeInTheDocument();
  });

  it('displays precautions section', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    expect(screen.getByText(/precautions/i)).toBeInTheDocument();
    expect(screen.getByText(/consult healthcare provider/i)).toBeInTheDocument();
  });

  it('displays folk remedies when available', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    expect(screen.getByText(/folk remedies/i)).toBeInTheDocument();
    expect(screen.getByText('Warm Water')).toBeInTheDocument();
    expect(screen.getByText(/drink warm water before meals/i)).toBeInTheDocument();
  });

  it('shows print button and handles print functionality', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();
    
    await user.click(printButton);
    expect(printSpy).toHaveBeenCalled();
    
    printSpy.mockRestore();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalResult = {
      analysisMode: 'general' as const,
      wellnessProfile: {
        title: 'Basic Profile',
        summary: 'Basic summary'
      },
      herbSuggestions: [],
      supplementSuggestions: [],
      lifestyleAdvice: {
        diet: [],
        sleep: [],
        exercise: []
      },
      precautions: []
    };

    render(<AnalysisDisplay result={minimalResult} />);
    
    // Should still render basic structure
    expect(screen.getByText('Basic Profile')).toBeInTheDocument();
    expect(screen.getByText('Basic summary')).toBeInTheDocument();
  });

  it('displays herb and supplement suggestions with proper formatting', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    // Check herb suggestions
    expect(screen.getByText(/herbal recommendations/i)).toBeInTheDocument();
    expect(screen.getByText('Chamomile')).toBeInTheDocument();
    expect(screen.getByText(/gentle digestive support/i)).toBeInTheDocument();
    expect(screen.getByText(/tea, 1-2 cups daily/i)).toBeInTheDocument();
    
    // Check supplement suggestions
    expect(screen.getByText(/supplement recommendations/i)).toBeInTheDocument();
    expect(screen.getByText('Probiotics')).toBeInTheDocument();
    expect(screen.getByText(/support digestive balance/i)).toBeInTheDocument();
  });

  it('handles empty suggestion arrays', () => {
    const resultWithEmptyArrays = {
      ...mockAnalysisResult,
      herbSuggestions: [],
      supplementSuggestions: [],
      folkRemedies: []
    };

    render(<AnalysisDisplay result={resultWithEmptyArrays} />);
    
    // Should not show empty sections
    expect(screen.queryByText(/herbal recommendations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/supplement recommendations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/folk remedies/i)).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for print formatting', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    const printableArea = document.querySelector('.printable-area');
    expect(printableArea).toBeInTheDocument();
    
    const noPrintElements = document.querySelectorAll('.no-print');
    expect(noPrintElements.length).toBeGreaterThan(0);
  });

  it('displays analysis mode indicator', () => {
    render(<AnalysisDisplay result={mockAnalysisResult} />);
    
    // For general mode
    expect(screen.getByText(/wellness analysis/i)).toBeInTheDocument();
    
    // Test professional mode
    const professionalResult = {
      ...mockAnalysisResult,
      analysisMode: 'professional' as const,
      differentialDiagnosis: {
        pattern: 'Test Pattern',
        pathology: 'Test Pathology',
        evidence: 'Test Evidence'
      },
      rationale: 'Test Rationale',
      treatmentPrinciple: 'Test Treatment',
      kampoSuggestions: []
    };
    
    render(<AnalysisDisplay result={professionalResult} />);
    expect(screen.getByText(/professional analysis/i)).toBeInTheDocument();
  });
});