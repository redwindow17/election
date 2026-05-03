// ============================================================
// LoginForm Component Tests
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

// Mock useAuth hook
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockClearError = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    loading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginForm() {
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

  it('renders sign in form by default', () => {
    renderLoginForm();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    // In sign-in mode there's only one password field; use getAllByLabelText to be safe
    const passwordInputs = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordInputs[0], { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('calls signIn with email and password on valid submit', async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    const passwordInputs = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('navigates to /guide after successful sign in', async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    const passwordInputs = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/guide');
    });
  });

  it('switches to sign up mode when toggle is clicked', () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows confirm password field in sign up mode', () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match in sign up mode', async () => {
    renderLoginForm();
    // Switch to sign up mode
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    // In sign-up mode there are two password fields; use getAllByLabelText
    const passwordFields = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordFields[0], { target: { value: 'password123' } });
    fireEvent.change(passwordFields[1], { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('calls signInWithGoogle when Google button is clicked', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined);
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: /google/i }));
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
});
