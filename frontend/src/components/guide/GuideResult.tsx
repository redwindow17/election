// ============================================================
// GuideResult Component — Displays the AI response
// ============================================================

import type { ElectionGuideResponse } from '../../types';
import { StepCard } from './StepCard';
import { Button } from '../common/Button';
import './GuideResult.css';

interface GuideResultProps {
  result: ElectionGuideResponse;
  onReset: () => void;
}

export function GuideResult({ result, onReset }: GuideResultProps) {
  return (
    <div className="guide-result animate-fade-in-up">
      <div className="guide-result__header">
        <h2 className="guide-result__title">Your Personalized Election Guide</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Ask Another Question
        </Button>
      </div>

      <div className="guide-result__advice glass-card">
        <div className="guide-result__advice-icon">💡</div>
        <p>{result.personalizedAdvice}</p>
      </div>

      <div className="guide-result__steps">
        {result.steps.map((step, index) => (
          <StepCard key={step.stepNumber} step={step} index={index} />
        ))}
      </div>

      {(result.importantDates || result.helplineNumbers || result.additionalResources) && (
        <div className="guide-result__extras">
          {result.importantDates && result.importantDates.length > 0 && (
            <div className="guide-result__extra-section glass-card delay-3">
              <h3>📅 Important Dates</h3>
              <ul>
                {result.importantDates.map((date, i) => (
                  <li key={i}>{date}</li>
                ))}
              </ul>
            </div>
          )}

          {result.helplineNumbers && result.helplineNumbers.length > 0 && (
            <div className="guide-result__extra-section glass-card delay-4">
              <h3>📞 Helpline Numbers</h3>
              <ul>
                {result.helplineNumbers.map((num, i) => (
                  <li key={i}>{num}</li>
                ))}
              </ul>
            </div>
          )}

          {result.additionalResources && result.additionalResources.length > 0 && (
            <div className="guide-result__extra-section glass-card delay-5">
              <h3>🔗 Additional Resources</h3>
              <ul>
                {result.additionalResources.map((res, i) => (
                  <li key={i}>{res}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
