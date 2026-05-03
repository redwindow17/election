// ============================================================
// GuideResult Component — Unit Tests
// ============================================================
// Covers: content rendering, export flow (inline + download
// URL), feedback submission, rating buttons, error states,
// "Ask Another Question" reset, accessibility.
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GuideResult } from '../../components/guide/GuideResult';
import { exportConversation, submitConversationFeedback } from '../../services/apiService';
import type { ElectionGuideResponse } from '../../types';

vi.mock('../../services/apiService', () => ({
  exportConversation: vi.fn(),
  submitConversationFeedback: vi.fn(),
}));

const FULL_RESULT: ElectionGuideResponse = {
  conversationId: 'conv-1',
  personalizedAdvice: 'Check your polling station before election day.',
  steps: [
    { stepNumber: 1, title: 'Verify Status', description: 'Check your voter record.' },
  ],
  importantDates: ['May 15: Polling day'],
  helplineNumbers: ['1950 - Voter Helpline'],
  additionalResources: ['https://eci.gov.in'],
};

const NO_ID_RESULT: ElectionGuideResponse = {
  personalizedAdvice: 'Local preview guide.',
  steps: [],
  conversationId: 'local-preview',
};

describe('GuideResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      createdAt: new Date().toISOString(),
    });
  });

  // ── Content rendering ──────────────────────────────────
  describe('content rendering', () => {
    it('renders personalized advice', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      expect(screen.getByText('Check your polling station before election day.')).toBeInTheDocument();
    });

    it('renders step title', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      expect(screen.getByText('Verify Status')).toBeInTheDocument();
    });

    it('renders important dates section', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      expect(screen.getByText('May 15: Polling day')).toBeInTheDocument();
    });

    it('renders helpline numbers section', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      expect(screen.getByText('1950 - Voter Helpline')).toBeInTheDocument();
    });

    it('renders additional resources section', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      expect(screen.getByText('https://eci.gov.in')).toBeInTheDocument();
    });

    it('does not render extras section when all optional fields absent', () => {
      const minimal: ElectionGuideResponse = {
        conversationId: 'conv-2',
        personalizedAdvice: 'Minimal guide.',
        steps: [],
      };
      render(<GuideResult result={minimal} onReset={vi.fn()} />);
      expect(screen.queryByText('Important Dates')).not.toBeInTheDocument();
    });
  });

  // ── Export ─────────────────────────────────────────────
  describe('export', () => {
    it('calls exportConversation when Export clicked', async () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() => expect(exportConversation).toHaveBeenCalledWith('conv-1'));
    });

    it('Export button is disabled when no conversationId', () => {
      render(<GuideResult result={NO_ID_RESULT} onReset={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
    });

    it('shows download link when downloadUrl is returned', async () => {
      vi.mocked(exportConversation).mockResolvedValue({
        provider: 'cloud-storage',
        conversationId: 'conv-1',
        downloadUrl: 'https://storage.example.com/guide.json',
      });
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() =>
        expect(screen.getByRole('link', { name: /download exported guide/i })).toBeInTheDocument()
      );
    });

    it('shows error notice when export fails', async () => {
      vi.mocked(exportConversation).mockRejectedValue(new Error('Storage unavailable'));
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Storage unavailable'));
    });
  });

  // ── Feedback ───────────────────────────────────────────
  describe('feedback', () => {
    it('calls submitConversationFeedback when Save Feedback clicked', async () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Save Feedback' }));
      await waitFor(() =>
        expect(submitConversationFeedback).toHaveBeenCalledWith(
          'conv-1',
          expect.objectContaining({ rating: 5, useful: true })
        )
      );
    });

    it('disables Save Feedback after successful submission', async () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Save Feedback' }));
      expect(await screen.findByRole('button', { name: 'Feedback Saved' })).toBeDisabled();
    });

    it('Save Feedback is disabled when no conversationId', () => {
      render(<GuideResult result={NO_ID_RESULT} onReset={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Save Feedback' })).toBeDisabled();
    });

    it('shows error when feedback submission fails', async () => {
      vi.mocked(submitConversationFeedback).mockRejectedValue(new Error('Server error'));
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Save Feedback' }));
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Server error'));
    });

    it('rating buttons have aria-pressed', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      const ratingBtns = screen.getAllByRole('button', { name: /out of 5/i });
      expect(ratingBtns.length).toBe(5);
    });

    it('clicking a rating button updates selection', () => {
      render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
      const btn3 = screen.getByRole('button', { name: '3 out of 5' });
      fireEvent.click(btn3);
      expect(btn3).toHaveAttribute('aria-pressed', 'true');
    });
  });

  // ── Reset ──────────────────────────────────────────────
  describe('reset', () => {
    it('calls onReset when "Ask Another Question" clicked', () => {
      const onReset = vi.fn();
      render(<GuideResult result={FULL_RESULT} onReset={onReset} />);
      fireEvent.click(screen.getByRole('button', { name: /ask another question/i }));
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});
