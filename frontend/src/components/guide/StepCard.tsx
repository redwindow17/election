// ============================================================
// StepCard Component — Individual election step card
// ============================================================

import type { ElectionStep } from '../../types';
import './StepCard.css';

interface StepCardProps {
  step: ElectionStep;
  index: number;
}

export function StepCard({ step, index }: StepCardProps) {
  return (
    <div
      className="step-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="step-card__header">
        <div className="step-card__number">
          <span>{step.stepNumber}</span>
        </div>
        <h3 className="step-card__title">{step.title}</h3>
      </div>

      <p className="step-card__description">{step.description}</p>

      {step.requirements && step.requirements.length > 0 && (
        <div className="step-card__section">
          <h4 className="step-card__section-title">📋 Requirements</h4>
          <ul className="step-card__list">
            {step.requirements.map((req, i) => (
              <li key={i} className="step-card__list-item">
                <span className="step-card__bullet">→</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.tips && step.tips.length > 0 && (
        <div className="step-card__section step-card__section--tips">
          <h4 className="step-card__section-title">💡 Tips</h4>
          <ul className="step-card__list">
            {step.tips.map((tip, i) => (
              <li key={i} className="step-card__list-item step-card__list-item--tip">
                <span className="step-card__bullet step-card__bullet--tip">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
