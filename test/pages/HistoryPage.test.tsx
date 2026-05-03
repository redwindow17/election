// ============================================================
// HistoryPage — Unit Tests
// ============================================================
// Covers: loading state, empty state, history list, insights
// metrics, export flow, quick feedback, error state, retry.
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HistoryPage } from '../../pages/HistoryPage';
import {
  exportConversation,
  fetchConversationHistory,
  fetchElectionInsights,
  submitConversationFeedback,
} from '../../services/apiService';

vi.mock('../../services/apiService', () => ({
  exportConversation: vi.fn(),
  fetchConversationHistory: vi.fn(),
  fetchElectionInsights: vi.fn(),
  submitConversationFeedback: vi.fn(),
}));

const MOCK_ITEM = {
  id: 'conv-1',
  createdAt: '2026-05-01T00:00:00.000Z',
  exportCount: 0,
  query: {
    age: 28,
    state: 'Delhi',
    question: 'How should I prepare for voting?',
    voterIdStatus: 'registered' as const,
    language: 'en' as const,
  },
  response: {
    personalizedAdvice: 'Check your polling station and carry accepted identification.',
    steps: [],
  },
};

const MOCK_INSIGHTS = {
  guideCreated: 3,
  exportCreated: 1,
  feedbackSubmitted: 2,
  source: 'demo' as const,
};

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConversationHistory).mockResolvedValue([MOCK_ITEM]);
    vi.mocked(fetchElectionInsights).mockResolvedValue(MOCK_INSIGHTS);
    vi.mocked(exportConversation).mockResolvedValue({
      provider: 'inline-demo',
      conversationId: 'conv-1',
      inlineExport: {
        fileName: 'guide.json',
        contentType: 'application/json',
        data: { conversationId: 'conv-1' },
      },
    });
    vi.mocked(submitConversationFeedback).mockResolvedValue({
      rating: 5,
      useful: true,
      createdAt: '2026-05-01T00:00:00.000Z',
    });
  });

  // ── Loading state ──────────────────────────────────────
  describe('loading state', () => {
    it('shows spinner while loading', () => {
      vi.mocked(fetchConversationHistory).mockReturnValue(new Promise(() => {}));
      render(<HistoryPage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  // ── Loaded state ───────────────────────────────────────
  describe('loaded state', () => {
    it('renders page heading', async () => {
      render(<HistoryPage />);
      expect(await screen.findByRole('heading', { name: /conversation history/i })).toBeInTheDocument();
    });

    it('renders conversation question', async () => {
      render(<HistoryPage />);
      expect(await screen.findByText('How should I prepare for voting?')).toBeInTheDocument();
    });

    it('renders state badge', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      expect(screen.getByText('Delhi')).toBeInTheDocument();
    });
  });

  // ── Insights ───────────────────────────────────────────
  describe('insights', () => {
    it('renders insights as a definition list', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      const dl = document.querySelector('dl[aria-label="Usage insights"]'); expect(dl).toBeTruthy();
    });

    it('shows guide count', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows export count', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('insights container has aria-label', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      const insightsEl = document.querySelector('[aria-label="Usage insights"]'); expect(insightsEl).toBeTruthy();
    });
  });

  // ── Empty state ────────────────────────────────────────
  describe('empty state', () => {
    it('shows empty state when no history', async () => {
      vi.mocked(fetchConversationHistory).mockResolvedValue([]);
      render(<HistoryPage />);
      expect(await screen.findByText(/no history found/i)).toBeInTheDocument();
    });
  });

  // ── Export ─────────────────────────────────────────────
  describe('export', () => {
    it('calls exportConversation when Export clicked', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() => expect(exportConversation).toHaveBeenCalledWith('conv-1'));
    });
  });

  // ── Quick feedback ─────────────────────────────────────
  describe('quick feedback', () => {
    it('calls submitConversationFeedback when Mark Useful clicked', async () => {
      render(<HistoryPage />);
      await screen.findByText('How should I prepare for voting?');
      fireEvent.click(screen.getByRole('button', { name: 'Mark Useful' }));
      await waitFor(() =>
        expect(submitConversationFeedback).toHaveBeenCalledWith(
          'conv-1',
          expect.objectContaining({ rating: 5, useful: true })
        )
      );
    });
  });

  // ── Error state ────────────────────────────────────────
  describe('error state', () => {
    it('shows error message when history fetch fails', async () => {
      vi.mocked(fetchConversationHistory).mockRejectedValue(new Error('Network error'));
      render(<HistoryPage />);
      expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    });

    it('error container has role="alert"', async () => {
      vi.mocked(fetchConversationHistory).mockRejectedValue(new Error('Network error'));
      render(<HistoryPage />);
      await screen.findByText(/network error/i);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows Try Again button on error', async () => {
      vi.mocked(fetchConversationHistory).mockRejectedValue(new Error('Network error'));
      render(<HistoryPage />);
      expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('retries load when Try Again clicked', async () => {
      vi.mocked(fetchConversationHistory)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue([MOCK_ITEM]);
      render(<HistoryPage />);
      await screen.findByRole('button', { name: /try again/i });
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(await screen.findByText('How should I prepare for voting?')).toBeInTheDocument();
    });
  });
});


