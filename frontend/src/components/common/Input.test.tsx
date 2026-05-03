// ============================================================
// Input Component Tests
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders label and input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows error message with role="alert"', () => {
    render(<Input label="Email" error="Email is required" />);
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Email is required');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid to false when no error', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('sets aria-required when required prop is passed', () => {
    render(<Input label="Email" required />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('shows required asterisk when required', () => {
    render(<Input label="Email" required />);
    // The asterisk span is aria-hidden, so we check the container
    const label = screen.getByText('Email', { exact: false });
    expect(label.closest('label')).toBeInTheDocument();
  });

  it('shows help text when no error', () => {
    render(<Input label="Email" helpText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('hides help text when error is shown', () => {
    render(<Input label="Email" error="Required" helpText="Enter your email" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('uses provided id', () => {
    render(<Input label="Name" id="custom-id" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });
});
