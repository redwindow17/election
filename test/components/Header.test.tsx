// ============================================================
// Header Component — Unit Tests
// ============================================================
// Covers: logo/brand link, navigation links, auth state
// (signed-in vs signed-out), sign-out button.
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../../components/layout/Header';

const mockSignOut = vi.fn();

// Default: no user (signed out)
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    signOut: mockSignOut,
  })),
}));

import { useAuth } from '../../hooks/useAuth';

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      getIdToken: vi.fn(),
      clearError: vi.fn(),
    });
  });

  // ── Structure ──────────────────────────────────────────
  describe('structure', () => {
    it('renders a <header> with role="banner"', () => {
      renderHeader();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders brand link with accessible label', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: /ai election guide home/i })).toBeInTheDocument();
    });

    it('renders main navigation landmark', () => {
      renderHeader();
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });

    it('renders Home link', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    });
  });

  // ── Signed-out state ───────────────────────────────────
  describe('signed-out state', () => {
    it('shows Sign In button when no user', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('does not show Get Guide link when no user', () => {
      renderHeader();
      expect(screen.queryByRole('link', { name: 'Get Guide' })).not.toBeInTheDocument();
    });

    it('does not show History link when no user', () => {
      renderHeader();
      expect(screen.queryByRole('link', { name: 'History' })).not.toBeInTheDocument();
    });
  });

  // ── Signed-in state ────────────────────────────────────
  describe('signed-in state', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'u1', email: 'test@example.com', displayName: 'Test User', photoURL: null },
        signOut: mockSignOut,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        getIdToken: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('shows user display name', () => {
      renderHeader();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('shows Get Guide link', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: 'Get Guide' })).toBeInTheDocument();
    });

    it('shows History link', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
    });

    it('shows Sign Out button', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('calls signOut when Sign Out is clicked', () => {
      renderHeader();
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('falls back to email prefix when no displayName', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'u1', email: 'voter@example.com', displayName: null, photoURL: null },
        signOut: mockSignOut,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        getIdToken: vi.fn(),
        clearError: vi.fn(),
      });
      renderHeader();
      expect(screen.getByText('voter')).toBeInTheDocument();
    });
  });

  // ── Active link ────────────────────────────────────────
  describe('active link', () => {
    it('applies active class to Home link on / path', () => {
      renderHeader('/');
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('header__link--active');
    });
  });
});
