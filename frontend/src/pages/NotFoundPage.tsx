// ============================================================
// NotFoundPage Component
// ============================================================

import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <h1 className="not-found__code">404</h1>
      <h2 className="not-found__title">Page Not Found</h2>
      <p className="not-found__message">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
