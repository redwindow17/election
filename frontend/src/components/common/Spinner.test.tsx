// ============================================================
// Spinner Component Tests
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<Spinner label="Fetching data..." />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Fetching data...');
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen reader announcements', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-busy="true"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('applies size class', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('spinner--lg');
  });

  it('spinner ring is aria-hidden', () => {
    render(<Spinner />);
    const ring = screen.getByRole('status').querySelector('.spinner__ring');
    expect(ring).toHaveAttribute('aria-hidden', 'true');
  });
});
