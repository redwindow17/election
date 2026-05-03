// ============================================================
// Select Component Tests
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
];

describe('Select', () => {
  it('renders label and select element', () => {
    render(<Select label="Language" options={options} />);
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
  });

  it('renders all options plus placeholder', () => {
    render(<Select label="Language" options={options} placeholder="Choose..." />);
    expect(screen.getByRole('option', { name: 'Choose...' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hindi' })).toBeInTheDocument();
  });

  it('shows error message with role="alert"', () => {
    render(<Select label="Language" options={options} error="Please select a language" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a language');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Select label="Language" options={options} error="Required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required when required prop is passed', () => {
    render(<Select label="Language" options={options} required />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select label="Language" options={options} onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('accepts string array options', () => {
    render(<Select label="State" options={['Delhi', 'Mumbai']} />);
    expect(screen.getByRole('option', { name: 'Delhi' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mumbai' })).toBeInTheDocument();
  });
});
