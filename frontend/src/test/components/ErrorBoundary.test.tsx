// ============================================================
// ErrorBoundary Component — Unit Tests
// ============================================================
// Covers: normal render pass-through, error catch, fallback
// prop, refresh button, role="alert" on error UI.
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

// Suppress console.error for expected boundary catches
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

// Component that throws on demand
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>Safe content</div>;
}

describe('ErrorBoundary', () => {
  // ── Normal render ──────────────────────────────────────
  describe('normal render', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <Bomb shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });
  });

  // ── Error catch ────────────────────────────────────────
  describe('error catch', () => {
    it('renders default error UI when child throws', () => {
      render(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('error UI has role="alert"', () => {
      render(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows helpful message to user', () => {
      render(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/refresh the page/i)).toBeInTheDocument();
    });

    it('shows Refresh Page button', () => {
      render(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    });

    it('Refresh Page button calls window.location.reload', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      fireEvent.click(screen.getByRole('button', { name: /refresh page/i }));
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  // ── Custom fallback ────────────────────────────────────
  describe('custom fallback', () => {
    it('renders custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });

    it('does not render default error UI when custom fallback provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });
});
