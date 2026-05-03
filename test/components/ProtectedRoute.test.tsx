// ============================================================
// ProtectedRoute Component — Unit Tests
// ============================================================
// Covers: loading spinner, redirect when unauthenticated,
// children render when authenticated.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';

function renderProtected(children = <div>Protected content</div>) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/protected"
          element={<ProtectedRoute>{children}</ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────
  describe('loading state', () => {
    it('shows spinner while loading', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: true } as any);
      renderProtected();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows "Checking authentication" label', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: true } as any);
      renderProtected();
      expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
    });

    it('does not render children while loading', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: true } as any);
      renderProtected(<div>Secret content</div>);
      expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
    });
  });

  // ── Unauthenticated ────────────────────────────────────
  describe('unauthenticated', () => {
    it('redirects to /login when no user', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as any);
      renderProtected();
      expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('does not render children when no user', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as any);
      renderProtected(<div>Secret content</div>);
      expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
    });
  });

  // ── Authenticated ──────────────────────────────────────
  describe('authenticated', () => {
    it('renders children when user is present', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'u1', email: 'test@example.com', displayName: null, photoURL: null },
        loading: false,
      } as any);
      renderProtected(<div>Protected content</div>);
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('does not redirect when user is present', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'u1', email: 'test@example.com', displayName: null, photoURL: null },
        loading: false,
      } as any);
      renderProtected();
      expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    });
  });
});
