// ============================================================
// Layout Component — Wraps pages with Header + Footer
// ============================================================

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="layout__main" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
