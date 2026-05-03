// ============================================================
// Footer Component — Unit Tests
// ============================================================
// Covers: contentinfo landmark, brand text, external links,
// helpline number, copyright year, disclaimer.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../../components/layout/Footer';

describe('Footer', () => {
  // ── Structure ──────────────────────────────────────────
  describe('structure', () => {
    it('renders a <footer> with role="contentinfo"', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders brand text', () => {
      render(<Footer />);
      expect(screen.getByText(/ai election guide/i)).toBeInTheDocument();
    });
  });

  // ── Links ──────────────────────────────────────────────
  describe('links', () => {
    it('renders ECI Official link', () => {
      render(<Footer />);
      const links = screen.getAllByRole('link', { name: /eci official/i });
      expect(links.length).toBeGreaterThan(0);
    });

    it('renders Voter Portal link', () => {
      render(<Footer />);
      expect(screen.getByRole('link', { name: /voter portal/i })).toBeInTheDocument();
    });

    it('ECI links open in new tab with noopener', () => {
      render(<Footer />);
      const eciLinks = screen.getAllByRole('link', { name: /eci official/i });
      eciLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('disclaimer link points to eci.gov.in', () => {
      render(<Footer />);
      const disclaimerLink = screen.getByRole('link', { name: /election commission of india/i });
      expect(disclaimerLink).toHaveAttribute('href', 'https://eci.gov.in');
    });
  });

  // ── Helpline ───────────────────────────────────────────
  describe('helpline', () => {
    it('shows voter helpline number 1950', () => {
      render(<Footer />);
      expect(screen.getByText(/1950/)).toBeInTheDocument();
    });
  });

  // ── Copyright ──────────────────────────────────────────
  describe('copyright', () => {
    it('shows current year in copyright', () => {
      render(<Footer />);
      const year = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    });
  });
});
