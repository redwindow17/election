// ============================================================
// GuideResult Component - Displays the AI response
// ============================================================

import { useState } from 'react';
import type { ConversationExportResult, ElectionGuideResponse } from '../../types';
import { exportConversation, submitConversationFeedback } from '../../services/apiService';
import { StepCard } from './StepCard';
import { Button } from '../common/Button';
import './GuideResult.css';

interface GuideResultProps {
  result: ElectionGuideResponse;
  onReset: () => void;
}

function downloadInlineExport(exportResult: ConversationExportResult) {
  if (!exportResult.inlineExport) return;

  const blob = new Blob([JSON.stringify(exportResult.inlineExport.data, null, 2)], {
    type: exportResult.inlineExport.contentType,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportResult.inlineExport.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function GuideResult({ result, onReset }: GuideResultProps) {
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ConversationExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [useful, setUseful] = useState(true);
  const [comment, setComment] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const canPersist = Boolean(result.conversationId && result.conversationId !== 'local-preview');

  async function handleExport() {
    if (!result.conversationId) return;

    try {
      setExporting(true);
      setExportError(null);
      const nextExport = await exportConversation(result.conversationId);
      setExportResult(nextExport);
      if (nextExport.inlineExport) downloadInlineExport(nextExport);
    } catch (error: unknown) {
      setExportError(getErrorMessage(error, 'Could not export this guide'));
    } finally {
      setExporting(false);
    }
  }

  async function handleFeedbackSubmit() {
    if (!result.conversationId) return;

    try {
      setFeedbackState('saving');
      setFeedbackError(null);
      await submitConversationFeedback(result.conversationId, {
        rating,
        useful,
        comment: comment.trim() || undefined,
      });
      setFeedbackState('saved');
    } catch (error: unknown) {
      setFeedbackError(getErrorMessage(error, 'Could not save feedback'));
      setFeedbackState('idle');
    }
  }

  return (
    <div className="guide-result animate-fade-in-up">
      <div className="guide-result__header">
        <h2 className="guide-result__title">Your Personalized Election Guide</h2>
        <div className="guide-result__header-actions">
          <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting} disabled={!canPersist}>
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Ask Another Question
          </Button>
        </div>
      </div>

      {exportResult?.downloadUrl && (
        <a className="guide-result__export-link" href={exportResult.downloadUrl} target="_blank" rel="noreferrer">
          Download exported guide
        </a>
      )}

      {exportError && (
        <div className="guide-result__notice" role="alert" aria-live="assertive">
          {exportError}
        </div>
      )}

      <div className="guide-result__advice glass-card">
        <div className="guide-result__advice-icon">i</div>
        <p>{result.personalizedAdvice}</p>
      </div>

      <div className="guide-result__steps">
        {result.steps.map((step, index) => (
          <StepCard key={step.stepNumber} step={step} index={index} />
        ))}
      </div>

      {(result.importantDates || result.helplineNumbers || result.additionalResources) && (
        <section className="guide-result__extras" aria-label="Additional information">
          {result.importantDates && result.importantDates.length > 0 && (
            <div className="guide-result__extra-section glass-card delay-3">
              <h3>Important Dates</h3>
              <ul>
                {result.importantDates.map((date, i) => (
                  <li key={i}>{date}</li>
                ))}
              </ul>
            </div>
          )}

          {result.helplineNumbers && result.helplineNumbers.length > 0 && (
            <div className="guide-result__extra-section glass-card delay-4">
              <h3>Helpline Numbers</h3>
              <ul>
                {result.helplineNumbers.map((num, i) => (
                  <li key={i}>{num}</li>
                ))}
              </ul>
            </div>
          )}

          {result.additionalResources && result.additionalResources.length > 0 && (
            <div className="guide-result__extra-section glass-card delay-5">
              <h3>Additional Resources</h3>
              <ul>
                {result.additionalResources.map((res, i) => (
                  <li key={i}>{res}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="guide-result__feedback glass-card">
        <div>
          <h3>Was this guide useful?</h3>
          <p>Help improve future election guidance.</p>
        </div>
        <fieldset className="guide-result__rating" aria-label="Rate this guide">
          <legend className="sr-only">Rating (1 to 5 stars)</legend>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={value <= rating ? 'guide-result__rating-btn guide-result__rating-btn--active' : 'guide-result__rating-btn'}
              onClick={() => setRating(value)}
              aria-label={`${value} out of 5`}
              aria-pressed={value === rating}
            >
              {value}
            </button>
          ))}
        </fieldset>
        <label className="guide-result__useful">
          <input type="checkbox" checked={useful} onChange={(event) => setUseful(event.target.checked)} />
          <span>Useful for my next step</span>
        </label>
        <label htmlFor="guide-feedback-comment" className="sr-only">Optional comment</label>
        <textarea
          id="guide-feedback-comment"
          className="guide-result__feedback-text"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Optional note"
          maxLength={500}
          rows={3}
          aria-label="Optional comment"
        />
        {feedbackError && (
          <p className="guide-result__notice" role="alert" aria-live="assertive">
            {feedbackError}
          </p>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={handleFeedbackSubmit}
          loading={feedbackState === 'saving'}
          disabled={!canPersist || feedbackState === 'saved'}
        >
          {feedbackState === 'saved' ? 'Feedback Saved' : 'Save Feedback'}
        </Button>
      </div>
    </div>
  );
}
