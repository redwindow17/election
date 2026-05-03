// ============================================================
// Layout Component — Unit Tests
// ============================================================
// Covers: skip link, main landmark, header/footer presence,
// children rendering.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';

// Stub Header and Footer to isolate Layout
vi.mock('../../components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));
vi.mock('../../components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

function renderLayout(children = <div>Page content</div>) {
  return render(
    <MemoryRouter>
      <Layout>{children}</Layout>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('renders children inside main', () => {
    renderLayout(<p>Hello world</p>);
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Hello world'));
  });

  it('renders Header', () => {
    renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    renderLayout();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders skip-to-content link', () => {
    renderLayout();
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('main element has id="main-content"', () => {
    renderLayout();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('main element has role="main"', () => {
    renderLayout();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
