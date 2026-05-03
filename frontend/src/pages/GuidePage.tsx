// ============================================================
// GuidePage Component
// ============================================================

import { GuideForm } from '../components/guide/GuideForm';
import { GuideResult } from '../components/guide/GuideResult';
import { useElectionGuide } from '../hooks/useElectionGuide';
import type { ElectionQueryInput } from '../types';
import './GuidePage.css';

export function GuidePage() {
  const { result, loading, error, generateGuide, clearResult } = useElectionGuide();

  const handleGenerate = (input: ElectionQueryInput) => {
    generateGuide(input);
  };

  return (
    <div className="guide-page container">
      <div className="guide-page__header">
        <h1 className="guide-page__title">Your Election Guide</h1>
        <p className="guide-page__subtitle">
          Fill out your details to get personalized steps and advice for voting.
        </p>
      </div>

      <div className={`guide-page__layout ${result ? 'guide-page__layout--has-result' : ''}`}>
        <div className="guide-page__form-section">
          {!result && (
            <GuideForm 
              onSubmit={handleGenerate} 
              loading={loading} 
            />
          )}
          
          {loading && !result && (
            <div className="guide-page__loading glass-card">
              <div className="guide-page__loading-spinner"></div>
              <p>Analyzing your profile and generating personalized advice...</p>
            </div>
          )}

          {error && (
            <div className="guide-page__error glass-card" role="alert" aria-live="assertive">
              <span className="guide-page__error-icon" aria-hidden="true">⚠️</span>
              <p>{error}</p>
              <button className="guide-page__error-retry" onClick={clearResult}>Try Again</button>
            </div>
          )}
        </div>

        {result && (
          <div className="guide-page__result-section">
            <GuideResult result={result} onReset={clearResult} />
          </div>
        )}
      </div>
    </div>
  );
}
