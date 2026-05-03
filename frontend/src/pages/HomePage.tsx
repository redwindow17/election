// ============================================================
// HomePage Component
// ============================================================

import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home__hero" aria-labelledby="hero-heading">
        <div className="home__hero-content">
          <h1 id="hero-heading" className="home__title animate-fade-in-up">
            Your Voice. <br />
            <span className="home__title-accent">Your Power.</span> <br />
            Our Democracy.
          </h1>
          <p className="home__subtitle animate-fade-in-up delay-1">
            Get personalized, AI-powered guidance on the Indian election process.
            From voter registration to polling day procedures, we've got you covered.
          </p>
          <div className="home__cta animate-fade-in-up delay-2">
            <Link to="/guide">
              <Button size="lg" variant="saffron" icon={<span aria-hidden="true">🗳️</span>}>
                Get Your Personalized Guide
              </Button>
            </Link>
          </div>
        </div>
        <div className="home__hero-bg" aria-hidden="true">
          <div className="home__hero-glow"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home__features container" aria-labelledby="features-heading">
        <h2 id="features-heading" className="home__section-title">How It Works</h2>
        <div className="home__feature-grid">
          <article className="glass-card home__feature-card animate-fade-in-up delay-1">
            <div className="home__feature-icon" aria-hidden="true">🤖</div>
            <h3>AI-Powered Insights</h3>
            <p>Our advanced AI analyzes your specific situation and provides tailored, step-by-step guidance for voting.</p>
          </article>
          <article className="glass-card home__feature-card animate-fade-in-up delay-2">
            <div className="home__feature-icon" aria-hidden="true">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and securely stored. We respect your privacy and only use your information to help you vote.</p>
          </article>
          <article className="glass-card home__feature-card animate-fade-in-up delay-3">
            <div className="home__feature-icon" aria-hidden="true">🇮🇳</div>
            <h3>All States Covered</h3>
            <p>Whether you're in a metropolitan city or a rural village, get accurate information for all 28 States and 8 UTs.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
