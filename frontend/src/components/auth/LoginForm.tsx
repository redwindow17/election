// ============================================================
// LoginForm Component — Email/Password + Google Sign-In
// ============================================================

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import './LoginForm.css';

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/guide');
    } catch {
      // Error is handled by AuthContext
    }
  }

  async function handleGoogle() {
    clearError();
    try {
      await signInWithGoogle();
      navigate('/guide');
    } catch {
      // Error is handled by AuthContext
    }
  }

  return (
    <div className="login">
      <div className="login__card glass-card">
        {/* Decorative tricolor top */}
        <div className="login__tricolor">
          <span></span><span></span><span></span>
        </div>

        <div className="login__header">
          <span className="login__icon">🗳️</span>
          <h1 className="login__title">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="login__desc">
            {isSignUp
              ? 'Join to get your personalized election guide'
              : 'Sign in to access your personalized election guide'}
          </p>
        </div>

        {error && (
          <div className="login__error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login__form" noValidate>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={formErrors.password}
            placeholder="••••••••"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />

          {isSignUp && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={formErrors.confirmPassword}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          )}

          <Button
            type="submit"
            variant="saffron"
            size="lg"
            fullWidth
            loading={loading}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="login__divider">
          <span>or continue with</span>
        </div>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleGoogle}
          disabled={loading}
          icon={<span style={{ fontSize: '1.2em' }}>G</span>}
        >
          Google
        </Button>

        <p className="login__toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="login__toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormErrors({});
              clearError();
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
