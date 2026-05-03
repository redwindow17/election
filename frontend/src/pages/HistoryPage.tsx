// ============================================================
// HistoryPage Component
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import type { ConversationHistoryItem, ElectionInsights } from '../types';
import {
  exportConversation,
  fetchConversationHistory,
  fetchElectionInsights,
  submitConversationFeedback,
} from '../services/apiService';
import { Spinner } from '../components/common/Spinner';
import { Button } from '../components/common/Button';
import './HistoryPage.css';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function HistoryPage() {
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
  const [insights, setInsights] = useState<ElectionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [historyData, insightsData] = await Promise.all([
        fetchConversationHistory(10),
        fetchElectionInsights().catch(() => null),
      ]);
      setHistory(historyData);
      setInsights(insightsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load history'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  const handleExport = async (conversationId: string) => {
    try {
      setExportingId(conversationId);
      const result = await exportConversation(conversationId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      }
      if (result.inlineExport) {
        const blob = new Blob([JSON.stringify(result.inlineExport.data, null, 2)], {
          type: result.inlineExport.contentType,
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.inlineExport.fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
      await loadHistory();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to export guide'));
    } finally {
      setExportingId(null);
    }
  };

  const handleQuickFeedback = async (conversationId: string) => {
    try {
      setFeedbackId(conversationId);
      await submitConversationFeedback(conversationId, {
        rating: 5,
        useful: true,
        comment: 'Marked useful from history',
      });
      await loadHistory();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save feedback'));
    } finally {
      setFeedbackId(null);
    }
  };

  if (loading) {
    return (
      <div className="history-page__loading">
        <Spinner size="lg" label="Loading history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page__error container" role="alert" aria-live="assertive">
        <div className="glass-card">
          <h2>Oops! Something went wrong.</h2>
          <p>{error}</p>
          <Button onClick={loadHistory} variant="primary">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page container">
      <div className="history-page__header">
        <h1 className="history-page__title">Your Conversation History</h1>
        <p className="history-page__subtitle">Review your past queries and election guides.</p>
      </div>

      {insights && (
        <dl className="history-page__insights" aria-label="Usage insights">
          <div className="history-page__metric">
            <dd>{insights.guideCreated}</dd>
            <dt><strong>Guides</strong></dt>
          </div>
          <div className="history-page__metric">
            <dd>{insights.exportCreated}</dd>
            <dt><strong>Exports</strong></dt>
          </div>
          <div className="history-page__metric">
            <dd>{insights.feedbackSubmitted}</dd>
            <dt><strong>Feedback</strong></dt>
          </div>
        </dl>
      )}

      {history.length === 0 ? (
        <div className="history-page__empty glass-card">
          <div className="history-page__empty-icon" aria-hidden="true">📂</div>
          <h2>No history found</h2>
          <p>You haven't generated any election guides yet.</p>
        </div>
      ) : (
        <div className="history-page__list">
          {history.map((item, index) => (
            <div key={item.id} className={`history-page__card glass-card delay-${(index % 5) + 1}`}>
              <div className="history-page__card-header">
                <h3>{item.query.question || 'General Guide'}</h3>
                <span className="history-page__date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="history-page__card-details">
                <span className="history-badge">Age: {item.query.age}</span>
                <span className="history-badge">{item.query.state}</span>
                <span className="history-badge">Exports: {item.exportCount ?? 0}</span>
                {item.lastFeedback && <span className="history-badge">Rated {item.lastFeedback.rating}/5</span>}
              </div>
              <p className="history-page__card-preview">
                {item.response.personalizedAdvice.substring(0, 150)}...
              </p>
              <div className="history-page__card-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport(item.id)}
                  loading={exportingId === item.id}
                >
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickFeedback(item.id)}
                  loading={feedbackId === item.id}
                  disabled={Boolean(item.lastFeedback)}
                >
                  {item.lastFeedback ? 'Feedback Saved' : 'Mark Useful'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
