// ============================================================
// Select Component — Unit Tests
// ============================================================
// Covers: label/select association, options rendering,
// placeholder, error state, aria attributes, onChange.
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../../components/common/Select';

const OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
];

describe('Select', () => {
  // ── Rendering ──────────────────────────────────────────
  describe('rendering', () => {
    it('renders a labelled select', () => {
      render(<Select label="Language" options={OPTIONS} />);
      expect(screen.getByLabelText('Language')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<Select label="Language" options={OPTIONS} />);
      expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Hindi' })).toBeInTheDocument();
    });

    it('renders placeholder option', () => {
      render(<Select label="Language" options={OPTIONS} placeholder="Choose..." />);
      expect(screen.getByRole('option', { name: 'Choose...' })).toBeInTheDocument();
    });

    it('placeholder option is disabled', () => {
      render(<Select label="Language" options={OPTIONS} placeholder="Choose..." />);
      const placeholder = screen.getByRole('option', { name: 'Choose...' }) as HTMLOptionElement;
      expect(placeholder.disabled).toBe(true);
    });

    it('accepts string array options', () => {
      render(<Select label="State" options={['Delhi', 'Mumbai']} />);
      expect(screen.getByRole('option', { name: 'Delhi' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Mumbai' })).toBeInTheDocument();
    });
  });

  // ── Error State ────────────────────────────────────────
  describe('error state', () => {
    it('shows error message with role="alert"', () => {
      render(<Select label="Language" options={OPTIONS} error="Please select a language" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Please select a language');
    });

    it('sets aria-invalid=true when error present', () => {
      render(<Select label="Language" options={OPTIONS} error="Required" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid=false when no error', () => {
      render(<Select label="Language" options={OPTIONS} />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  // ── Required ───────────────────────────────────────────
  describe('required', () => {
    it('sets aria-required=true when required', () => {
      render(<Select label="Language" options={OPTIONS} required />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });
  });

  // ── Interaction ────────────────────────────────────────
  describe('interaction', () => {
    it('calls onChange when selection changes', () => {
      const handleChange = vi.fn();
      render(<Select label="Language" options={OPTIONS} onChange={handleChange} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });
});
