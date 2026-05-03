// ============================================================
// NotFoundPage — Unit Tests
// ============================================================
// Covers: 404 heading, page-not-found message, return home link.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '../../pages/NotFoundPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );
}

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('renders "Page Not Found" heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders descriptive message', () => {
    renderPage();
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument();
  });

  it('renders Return Home link pointing to /', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /return home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
