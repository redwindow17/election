// ============================================================
// Spinner Component — Unit Tests
// ============================================================
// Covers: default/custom label, aria attributes, size classes,
// aria-hidden on decorative ring, aria-live announcement.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from '../../components/common/Spinner';

describe('Spinner', () => {
  // ── Rendering ──────────────────────────────────────────
  describe('rendering', () => {
    it('renders with role="status"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders default label text', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders custom label text', () => {
      render(<Spinner label="Fetching data..." />);
      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });
  });

  // ── Accessibility ──────────────────────────────────────
  describe('accessibility', () => {
    it('has aria-label matching the label prop', () => {
      render(<Spinner label="Please wait" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Please wait');
    });

    it('has aria-live="polite" for screen reader announcements', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-busy="true"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('spinner ring is aria-hidden to avoid noise', () => {
      render(<Spinner />);
      const ring = screen.getByRole('status').querySelector('.spinner__ring');
      expect(ring).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ── Sizes ──────────────────────────────────────────────
  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('applies size class: %s', (size) => {
      render(<Spinner size={size} />);
      expect(screen.getByRole('status')).toHaveClass(`spinner--${size}`);
    });

    it('defaults to md size', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveClass('spinner--md');
    });
  });
});
