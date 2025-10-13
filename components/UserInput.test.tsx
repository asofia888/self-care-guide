import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserInput } from './UserInput';
import { render } from '../__tests__/test-utils';

describe('UserInput Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mode Switching', () => {
    it('renders with professional mode by default', () => {
      render(<UserInput />);

      // Check if mode switcher is present
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(/専門家向け|For Practitioners/i);
    });

    it('switches to general mode when clicked', async () => {
      render(<UserInput />);

      const generalButton = screen.getByRole('button', { name: /一般向け|For General Wellness/i });
      await user.click(generalButton);

      expect(generalButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('clears form data when switching modes', async () => {
      render(<UserInput />);

      // Fill some professional mode fields
      const ageInput = screen.getByLabelText(/年齢|Age/i);
      await user.type(ageInput, '30');

      // Switch to general mode
      const generalButton = screen.getByRole('button', { name: /一般向け|For General Wellness/i });
      await user.click(generalButton);

      // Switch back to professional mode
      const professionalButton = screen.getByRole('button', { name: /専門家向け|For Practitioners/i });
      await user.click(professionalButton);

      // Age field should be cleared
      const ageInputAfter = screen.getByLabelText(/年齢|Age/i);
      expect(ageInputAfter).toHaveValue(null);
    });
  });

  describe('Professional Mode Form', () => {
    it('renders professional form fields correctly', () => {
      render(<UserInput />);

      expect(screen.getByLabelText(/年齢|Age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/性別|Gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/主訴|Chief Complaint/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/舌診|Tongue Diagnosis/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/脈診|Pulse Diagnosis/i)).toBeInTheDocument();
    });

    it('handles professional form input changes correctly', async () => {
      render(<UserInput />);

      const ageInput = screen.getByLabelText(/年齢|Age/i) as HTMLInputElement;
      const chiefComplaintInput = screen.getByLabelText(/主訴|Chief Complaint/i) as HTMLTextAreaElement;

      await user.type(ageInput, '35');
      await user.type(chiefComplaintInput, 'Headache for 3 months');

      expect(ageInput.value).toBe('35');
      expect(chiefComplaintInput.value).toBe('Headache for 3 months');
    });

    it('validates chief complaint as required field', async () => {
      render(<UserInput />);

      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/主訴は必須|Chief complaint is required/i);
      });
    });

    it('submits professional form with valid data', async () => {
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          analysisMode: 'professional',
          differentialDiagnosis: {
            pattern: 'Test pattern',
            pathology: 'Test pathology',
            evidence: 'Test evidence'
          },
          rationale: 'Test rationale',
          treatmentPrinciple: 'Test principle',
          herbSuggestions: [],
          kampoSuggestions: [],
          supplementSuggestions: [],
          lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
          precautions: []
        }),
        status: 200,
      });

      render(<UserInput />);

      // Fill required field
      const chiefComplaintInput = screen.getByLabelText(/主訴|Chief Complaint/i);
      await user.type(chiefComplaintInput, 'Chronic fatigue');

      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/分析中|Analyzing/i)).toBeInTheDocument();
      });
    });
  });

  describe('General Mode Form', () => {
    beforeEach(async () => {
      render(<UserInput />);
      const generalButton = screen.getByRole('button', { name: /一般向け|For General Wellness/i });
      await user.click(generalButton);
    });

    it('renders general form fields correctly', () => {
      expect(screen.getByLabelText(/年齢|Age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/性別|Gender/i)).toBeInTheDocument();
      expect(screen.getByText(/現在の主な悩み|Primary Concerns/i)).toBeInTheDocument();
      expect(screen.getByText(/体質・状態の自己評価|Self-Assessment/i)).toBeInTheDocument();
    });

    it('validates concerns as required field', async () => {
      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/悩みを1つ以上選択|Please select at least one concern/i);
      });
    });

    it('handles concern selection correctly', async () => {
      const stressCheckbox = screen.getByRole('checkbox', { name: /ストレス・不安|Stress.*Anxiety/i });
      const fatigueCheckbox = screen.getByRole('checkbox', { name: /疲労感|Fatigue/i });

      await user.click(stressCheckbox);
      await user.click(fatigueCheckbox);

      expect(stressCheckbox).toBeChecked();
      expect(fatigueCheckbox).toBeChecked();

      // Uncheck one
      await user.click(stressCheckbox);
      expect(stressCheckbox).not.toBeChecked();
    });

    it('submits general form with valid data', async () => {
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          analysisMode: 'general',
          wellnessProfile: {
            title: 'Test Profile',
            summary: 'Test summary'
          },
          herbSuggestions: [],
          supplementSuggestions: [],
          lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
          precautions: []
        }),
        status: 200,
      });

      // Select at least one concern
      const stressCheckbox = screen.getByRole('checkbox', { name: /ストレス・不安|Stress.*Anxiety/i });
      await user.click(stressCheckbox);

      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/分析中|Analyzing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays API errors correctly', async () => {
      // Mock API failure
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Service unavailable' }),
        status: 503,
      });

      render(<UserInput />);

      // Fill required field
      const chiefComplaintInput = screen.getByLabelText(/主訴|Chief Complaint/i);
      await user.type(chiefComplaintInput, 'Test complaint');

      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/Service unavailable|通信中にエラー/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('allows clearing errors', async () => {
      // Mock API failure
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Test error' }),
        status: 500,
      });

      render(<UserInput />);

      // Trigger error
      const chiefComplaintInput = screen.getByLabelText(/主訴|Chief Complaint/i);
      await user.type(chiefComplaintInput, 'Test');
      await user.click(screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i }));

      await waitFor(() => {
        expect(screen.getByText(/Test error|エラー/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Clear error by clicking dismiss button
      const dismissButton = screen.getByRole('button', { name: /閉じる|Dismiss/i });
      await user.click(dismissButton);

      expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('disables submit button while loading', async () => {
      // Mock delayed API response
      global.fetch = vi.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              analysisMode: 'professional',
              differentialDiagnosis: { pattern: 'Test', pathology: 'Test', evidence: 'Test' },
              rationale: 'Test',
              treatmentPrinciple: 'Test',
              herbSuggestions: [],
              kampoSuggestions: [],
              supplementSuggestions: [],
              lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
              precautions: []
            }),
            status: 200,
          }), 100)
        )
      );

      render(<UserInput />);

      const chiefComplaintInput = screen.getByLabelText(/主訴|Chief Complaint/i);
      await user.type(chiefComplaintInput, 'Test');

      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();
    });

    it('clears previous errors before new submission', async () => {
      render(<UserInput />);

      // First trigger a validation error
      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Now fill the form and submit again
      const chiefComplaintInput = screen.getByLabelText(/主訴|Chief Complaint/i);
      await user.type(chiefComplaintInput, 'New complaint');

      // Mock successful response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          analysisMode: 'professional',
          differentialDiagnosis: { pattern: 'Test', pathology: 'Test', evidence: 'Test' },
          rationale: 'Test',
          treatmentPrinciple: 'Test',
          herbSuggestions: [],
          kampoSuggestions: [],
          supplementSuggestions: [],
          lifestyleAdvice: { diet: [], sleep: [], exercise: [] },
          precautions: []
        }),
        status: 200,
      });

      await user.click(submitButton);

      // Previous error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for mode switcher', () => {
      render(<UserInput />);

      const professionalButton = screen.getByRole('button', { name: /専門家向け|For Practitioners/i });
      const generalButton = screen.getByRole('button', { name: /一般向け|For General Wellness/i });

      expect(professionalButton).toHaveAttribute('aria-pressed');
      expect(generalButton).toHaveAttribute('aria-pressed');
      expect(professionalButton).toHaveAttribute('aria-controls', 'professional-form-section');
      expect(generalButton).toHaveAttribute('aria-controls', 'general-form-section');
    });

    it('shows proper form sections with hidden attribute', async () => {
      render(<UserInput />);

      const professionalSection = document.getElementById('professional-form-section');
      const generalSection = document.getElementById('general-form-section');

      // Professional should be visible, general hidden
      expect(professionalSection).not.toHaveAttribute('hidden');
      expect(generalSection).toHaveAttribute('hidden');

      // Switch mode
      const generalButton = screen.getByRole('button', { name: /一般向け|For General Wellness/i });
      await user.click(generalButton);

      // General should be visible, professional hidden
      expect(professionalSection).toHaveAttribute('hidden');
      expect(generalSection).not.toHaveAttribute('hidden');
    });

    it('displays error messages with role="alert"', async () => {
      render(<UserInput />);

      const submitButton = screen.getByRole('button', { name: /AI分析を開始|Get AI Analysis/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});
