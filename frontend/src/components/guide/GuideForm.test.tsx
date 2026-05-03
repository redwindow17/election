// ============================================================
// GuideForm Component Tests
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GuideForm } from './GuideForm';

const mockOnSubmit = vi.fn();

function renderForm(loading = false) {
  return render(<GuideForm onSubmit={mockOnSubmit} loading={loading} />);
}

describe('GuideForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderForm();
    // Use getByRole for the number input (age field)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument(); // number input
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // textarea
    expect(screen.getByLabelText(/voter id status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter your age/i)).toBeInTheDocument();
      expect(screen.getByText(/please select your state/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter your question/i)).toBeInTheDocument();
    });
  });

  it('shows age validation error for underage', async () => {
    renderForm();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '16' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 18/i)).toBeInTheDocument();
    });
  });

  it('shows question length validation error', async () => {
    renderForm();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '25' } });
    // Select a state - use the combobox for State / UT (first combobox)
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    renderForm();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '28' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'How do I register to vote?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 28,
          state: 'Delhi',
          question: 'How do I register to vote?',
        })
      );
    });
  });

  it('fills question when sample chip is clicked', () => {
    renderForm();
    const chips = screen.getAllByRole('button', { name: /use sample question/i });
    expect(chips.length).toBeGreaterThan(0);
    fireEvent.click(chips[0]);
    const textarea = screen.getByLabelText(/your question/i) as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(0);
  });

  it('shows loading state on submit button', () => {
    renderForm(true);
    const btn = screen.getByRole('button', { name: /generate/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('shows character count', () => {
    renderForm();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' },
    });
    expect(screen.getByText('5/500')).toBeInTheDocument();
  });

  it('textarea has aria-required', () => {
    renderForm();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });
});
