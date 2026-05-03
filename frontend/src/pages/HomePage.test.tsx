// ============================================================
// HomePage Tests
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('renders the hero heading', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the "How It Works" section', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument();
  });

  it('renders three feature cards as articles', () => {
    renderHomePage();
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(3);
  });

  it('renders the CTA button linking to /guide', () => {
    renderHomePage();
    const link = screen.getByRole('link', { name: /get your personalized guide/i });
    expect(link).toHaveAttribute('href', '/guide');
  });

  it('hero section has aria-labelledby pointing to heading', () => {
    renderHomePage();
    const hero = screen.getByRole('region', { name: /your voice/i });
    expect(hero).toBeInTheDocument();
  });

  it('features section has aria-labelledby pointing to heading', () => {
    renderHomePage();
    const features = screen.getByRole('region', { name: /how it works/i });
    expect(features).toBeInTheDocument();
  });

  it('renders AI-Powered Insights feature', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /ai-powered insights/i })).toBeInTheDocument();
  });

  it('renders Secure & Private feature', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /secure & private/i })).toBeInTheDocument();
  });

  it('renders All States Covered feature', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /all states covered/i })).toBeInTheDocument();
  });
});
