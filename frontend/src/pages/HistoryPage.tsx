// ============================================================
// HistoryPage Component
// ============================================================

import { useEffect, useState } from 'react';
import type { ConversationHistoryItem } from '../types';
import { fetchConversationHistory } from '../services/apiService';
import { Spinner } from '../components/common/Spinner';
import { Button } from '../components/common/Button';
import './HistoryPage.css';

export function HistoryPage() {
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversationHistory(10);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
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
      <div className="history-page__error container">
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

      {history.length === 0 ? (
        <div className="history-page__empty glass-card">
          <div className="history-page__empty-icon">📂</div>
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
              </div>
              <p className="history-page__card-preview">
                {item.response.personalizedAdvice.substring(0, 150)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
