// ============================================================
// GuideForm Component — Unit Tests
// ============================================================
// Covers: field rendering, validation (empty/underage/short
// question), valid submission, sample question chips,
// character count, aria attributes, loading state.
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GuideForm } from '../../components/guide/GuideForm';

const mockOnSubmit = vi.fn();

function renderForm(loading = false) {
  return render(<GuideForm onSubmit={mockOnSubmit} loading={loading} />);
}

describe('GuideForm', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────
  describe('rendering', () => {
    it('renders age number input', () => {
      renderForm();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('renders state/UT select', () => {
      renderForm();
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('renders question textarea', () => {
      renderForm();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('renders sample question chips', () => {
      renderForm();
      const chips = screen.getAllByRole('button', { name: /use sample question/i });
      expect(chips.length).toBeGreaterThan(0);
    });

    it('sample chips are in a group with accessible label', () => {
      renderForm();
      expect(screen.getByRole('group', { name: /try a sample question/i })).toBeInTheDocument();
    });
  });

  // ── Validation ─────────────────────────────────────────
  describe('validation', () => {
    it('shows error when age is empty', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/please enter your age/i)).toBeInTheDocument());
    });

    it('shows error when age is below 18', async () => {
      renderForm();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '16' } });
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/at least 18/i)).toBeInTheDocument());
    });

    it('shows error when age is above 120', async () => {
      renderForm();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '121' } });
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/valid age/i)).toBeInTheDocument());
    });

    it('shows error when state is not selected', async () => {
      renderForm();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '25' } });
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/please select your state/i)).toBeInTheDocument());
    });

    it('shows error when question is empty', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/please enter your question/i)).toBeInTheDocument());
    });

    it('shows error when question is too short (< 5 chars)', async () => {
      renderForm();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '25' } });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Delhi' } });
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hi' } });
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument());
    });

    it('does not call onSubmit when validation fails', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/please enter your age/i)).toBeInTheDocument());
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // ── Valid submission ────────────────────────────────────
  describe('valid submission', () => {
    it('calls onSubmit with correct data', async () => {
      renderForm();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '28' } });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Delhi' } });
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'How do I register to vote?' },
      });
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ age: 28, state: 'Delhi', question: 'How do I register to vote?' })
        )
      );
    });

    it('trims whitespace from question before submitting', async () => {
      renderForm();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '28' } });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Delhi' } });
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '  How do I vote?  ' },
      });
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() =>
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ question: 'How do I vote?' })
        )
      );
    });
  });

  // ── Sample questions ────────────────────────────────────
  describe('sample questions', () => {
    it('fills textarea when sample chip is clicked', () => {
      renderForm();
      const chips = screen.getAllByRole('button', { name: /use sample question/i });
      fireEvent.click(chips[0]);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value.length).toBeGreaterThan(0);
    });

    it('clears question error when sample chip is clicked', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() => expect(screen.getByText(/please enter your question/i)).toBeInTheDocument());
      const chips = screen.getAllByRole('button', { name: /use sample question/i });
      fireEvent.click(chips[0]);
      expect(screen.queryByText(/please enter your question/i)).not.toBeInTheDocument();
    });
  });

  // ── Character count ────────────────────────────────────
  describe('character count', () => {
    it('shows 0/500 initially', () => {
      renderForm();
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('updates character count as user types', () => {
      renderForm();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
      expect(screen.getByText('5/500')).toBeInTheDocument();
    });
  });

  // ── Accessibility ──────────────────────────────────────
  describe('accessibility', () => {
    it('textarea has aria-required=true', () => {
      renderForm();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    });

    it('textarea has aria-invalid=false by default', () => {
      renderForm();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('textarea has aria-invalid=true after validation error', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      await waitFor(() =>
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      );
    });
  });

  // ── Loading state ──────────────────────────────────────
  describe('loading state', () => {
    it('disables submit button when loading', () => {
      renderForm(true);
      expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled();
    });

    it('submit button has aria-busy=true when loading', () => {
      renderForm(true);
      expect(screen.getByRole('button', { name: /generate/i })).toHaveAttribute('aria-busy', 'true');
    });
  });
});
