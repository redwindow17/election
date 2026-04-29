// ============================================================
// Header Component — Navigation with auth state
// ============================================================

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import './Header.css';

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="header" role="banner">
      <div className="container header__inner">
        {/* Logo / Brand */}
        <Link to="/" className="header__brand" aria-label="AI Election Guide Home">
          <div className="header__logo">
            <span className="header__logo-icon">🗳️</span>
            <div className="header__logo-bar">
              <span className="header__bar header__bar--saffron"></span>
              <span className="header__bar header__bar--white"></span>
              <span className="header__bar header__bar--green"></span>
            </div>
          </div>
          <div className="header__brand-text">
            <span className="header__title">AI Election Guide</span>
            <span className="header__subtitle">India</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="header__nav" aria-label="Main navigation">
          <Link
            to="/"
            className={`header__link ${location.pathname === '/' ? 'header__link--active' : ''}`}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                to="/guide"
                className={`header__link ${location.pathname === '/guide' ? 'header__link--active' : ''}`}
              >
                Get Guide
              </Link>
              <Link
                to="/history"
                className={`header__link ${location.pathname === '/history' ? 'header__link--active' : ''}`}
              >
                History
              </Link>
            </>
          )}
        </nav>

        {/* Auth actions */}
        <div className="header__actions">
          {user ? (
            <div className="header__user">
              <span className="header__user-name">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="saffron" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
