// ============================================================
// Input Component — Unit Tests
// ============================================================
// Covers: label/input association, error display, help text,
// aria attributes, required indicator, onChange, custom id.
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../components/common/Input';

describe('Input', () => {
  // ── Rendering ──────────────────────────────────────────
  describe('rendering', () => {
    it('renders a labelled input', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders as a text input by default', () => {
      render(<Input label="Name" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders as number input when type="number"', () => {
      render(<Input label="Age" type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('renders placeholder text', () => {
      render(<Input label="Email" placeholder="you@example.com" />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });
  });

  // ── Error State ────────────────────────────────────────
  describe('error state', () => {
    it('shows error message', () => {
      render(<Input label="Email" error="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('error message has role="alert"', () => {
      render(<Input label="Email" error="Required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
    });

    it('sets aria-invalid=true when error present', () => {
      render(<Input label="Email" error="Required" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid=false when no error', () => {
      render(<Input label="Email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('links input to error via aria-describedby', () => {
      render(<Input label="Email" id="email" error="Required" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('adds error CSS class to wrapper', () => {
      const { container } = render(<Input label="Email" error="Required" />);
      expect(container.firstChild).toHaveClass('input-group--error');
    });
  });

  // ── Help Text ──────────────────────────────────────────
  describe('help text', () => {
    it('shows help text when no error', () => {
      render(<Input label="Email" helpText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('hides help text when error is shown', () => {
      render(<Input label="Email" error="Required" helpText="Enter your email" />);
      expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    });
  });

  // ── Required ───────────────────────────────────────────
  describe('required', () => {
    it('sets aria-required=true when required', () => {
      render(<Input label="Email" required />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    });

    it('does not set aria-required when not required', () => {
      render(<Input label="Email" />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
    });
  });

  // ── Interaction ────────────────────────────────────────
  describe('interaction', () => {
    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input label="Name" onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── ID ─────────────────────────────────────────────────
  describe('id', () => {
    it('uses provided id', () => {
      render(<Input label="Name" id="custom-id" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
    });

    it('auto-generates id from label when no id provided', () => {
      render(<Input label="Email Address" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'input-email-address');
    });
  });
});
