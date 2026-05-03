// ============================================================
// HomePage — Unit Tests
// ============================================================
// Covers: hero heading, CTA link, feature cards as articles,
// section landmarks with aria-labelledby, feature content.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../../pages/HomePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  // ── Hero section ───────────────────────────────────────
  describe('hero section', () => {
    it('renders h1 heading', () => {
      renderPage();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('heading contains "Your Voice"', () => {
      renderPage();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/your voice/i);
    });

    it('hero section is a landmark with accessible name', () => {
      renderPage();
      expect(screen.getByRole('region', { name: /your voice/i })).toBeInTheDocument();
    });

    it('CTA button links to /guide', () => {
      renderPage();
      const link = screen.getByRole('link', { name: /get your personalized guide/i });
      expect(link).toHaveAttribute('href', '/guide');
    });
  });

  // ── Features section ───────────────────────────────────
  describe('features section', () => {
    it('renders "How It Works" heading', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument();
    });

    it('features section is a landmark with accessible name', () => {
      renderPage();
      expect(screen.getByRole('region', { name: /how it works/i })).toBeInTheDocument();
    });

    it('renders exactly 3 feature cards as <article> elements', () => {
      renderPage();
      expect(screen.getAllByRole('article')).toHaveLength(3);
    });

    it('renders AI-Powered Insights feature', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /ai-powered insights/i })).toBeInTheDocument();
    });

    it('renders Secure & Private feature', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /secure & private/i })).toBeInTheDocument();
    });

    it('renders All States Covered feature', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /all states covered/i })).toBeInTheDocument();
    });
  });
});
