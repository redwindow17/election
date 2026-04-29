// ============================================================
// NotFoundPage Component
// ============================================================

import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-6)'
    }}>
      <h1 style={{
        fontSize: 'var(--font-size-6xl)',
        fontWeight: '900',
        background: 'var(--gradient-saffron)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 'var(--space-4)'
      }}>404</h1>
      <h2 style={{
        fontSize: 'var(--font-size-2xl)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-4)'
      }}>Page Not Found</h2>
      <p style={{
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-8)',
        maxWidth: '400px'
      }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
