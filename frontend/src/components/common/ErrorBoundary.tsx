// ============================================================
// Error Boundary — Catches render errors gracefully
// ============================================================

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import logger from '../../utils/logger';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Unexpected render error', { error: error.message, componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__icon" aria-hidden="true">⚠️</div>
          <h2 className="error-boundary__title">Something went wrong</h2>
          <p className="error-boundary__message">
            An unexpected error occurred. Please refresh the page and try again.
          </p>
          <button
            className="error-boundary__btn"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
