// ============================================================
// LoginForm Component — Unit Tests
// ============================================================
// Covers: sign-in/sign-up toggle, form validation, signIn/
// signUp/signInWithGoogle calls, navigation after success,
// error display, password mismatch.
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockClearError = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    loading: false,
    error: null,
    clearError: mockClearError,
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial render ─────────────────────────────────────
  describe('initial render', () => {
    it('shows "Welcome Back" heading in sign-in mode', () => {
      renderForm();
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    it('shows Sign In submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('shows Google sign-in button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('does not show Confirm Password in sign-in mode', () => {
      renderForm();
      expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    });
  });

  // ── Sign-up toggle ─────────────────────────────────────
  describe('sign-up toggle', () => {
    it('switches to sign-up mode when toggle clicked', () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows Confirm Password in sign-up mode', () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('switches back to sign-in mode', () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
  });

  // ── Validation ─────────────────────────────────────────
  describe('validation', () => {
    it('shows error for empty email', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => expect(screen.getByText(/email is required/i)).toBeInTheDocument());
    });

    it('shows error for invalid email format', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'not-email' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => expect(screen.getByText(/valid email/i)).toBeInTheDocument());
    });

    it('shows error for empty password', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => expect(screen.getByText(/password is required/i)).toBeInTheDocument());
    });

    it('shows error for password shorter than 6 chars', async () => {
      renderForm();
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
      const pwdInputs = screen.getAllByLabelText(/password/i);
      fireEvent.change(pwdInputs[0], { target: { value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument());
    });

    it('shows error when passwords do not match in sign-up mode', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
      const pwdInputs = screen.getAllByLabelText(/password/i);
      fireEvent.change(pwdInputs[0], { target: { value: 'password123' } });
      fireEvent.change(pwdInputs[1], { target: { value: 'different' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument());
    });
  });

  // ── Sign-in flow ───────────────────────────────────────
  describe('sign-in flow', () => {
    it('calls signIn with email and password', async () => {
      mockSignIn.mockResolvedValue(undefined);
      renderForm();
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
      const pwdInputs = screen.getAllByLabelText(/password/i);
      fireEvent.change(pwdInputs[0], { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123'));
    });

    it('navigates to /guide after successful sign-in', async () => {
      mockSignIn.mockResolvedValue(undefined);
      renderForm();
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
      const pwdInputs = screen.getAllByLabelText(/password/i);
      fireEvent.change(pwdInputs[0], { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/guide'));
    });
  });

  // ── Google sign-in ─────────────────────────────────────
  describe('Google sign-in', () => {
    it('calls signInWithGoogle when Google button clicked', async () => {
      mockSignInWithGoogle.mockResolvedValue(undefined);
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /google/i }));
      await waitFor(() => expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1));
    });

    it('navigates to /guide after Google sign-in', async () => {
      mockSignInWithGoogle.mockResolvedValue(undefined);
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /google/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/guide'));
    });
  });

  // ── Error display ──────────────────────────────────────
  describe('error display', () => {
    it('shows auth error from context', () => {
      const { useAuth } = vi.mocked(await import('../../hooks/useAuth'));
      useAuth.mockReturnValue({
        signIn: mockSignIn,
        signUp: mockSignUp,
        signInWithGoogle: mockSignInWithGoogle,
        loading: false,
        error: 'Invalid credentials',
        clearError: mockClearError,
      } as any);
      renderForm();
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});
