// ============================================================
// apiService — Unit Tests
// ============================================================
// Covers: fetchElectionGuide, fetchConversationHistory,
// exportConversation, submitConversationFeedback,
// fetchElectionInsights, checkHealth — success and error paths.
// ============================================================

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchElectionGuide,
  fetchConversationHistory,
  exportConversation,
  submitConversationFeedback,
  fetchElectionInsights,
  checkHealth,
} from '../../services/apiService';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockOkResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data }),
  } as Response);
}

function mockErrorResponse(status: number, error: string) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ success: false, error }),
  } as Response);
}

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── fetchElectionGuide ─────────────────────────────────
  describe('fetchElectionGuide', () => {
    const INPUT = {
      age: 28,
      state: 'Delhi',
      question: 'How do I vote?',
      voterIdStatus: 'registered' as const,
      language: 'en' as const,
    };

    const GUIDE_RESPONSE = {
      personalizedAdvice: 'Check your registration.',
      steps: [],
      conversationId: 'conv-1',
    };

    it('returns guide data on success', async () => {
      mockFetch.mockReturnValue(mockOkResponse(GUIDE_RESPONSE));
      const result = await fetchElectionGuide(INPUT);
      expect(result).toEqual(GUIDE_RESPONSE);
    });

    it('calls POST /api/election/guide', async () => {
      mockFetch.mockReturnValue(mockOkResponse(GUIDE_RESPONSE));
      await fetchElectionGuide(INPUT);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/election/guide'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on API error response', async () => {
      mockFetch.mockReturnValue(mockErrorResponse(400, 'Validation failed'));
      await expect(fetchElectionGuide(INPUT)).rejects.toThrow('Validation failed');
    });

    it('throws on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await expect(fetchElectionGuide(INPUT)).rejects.toThrow('Network error');
    });
  });

  // ── fetchConversationHistory ───────────────────────────
  describe('fetchConversationHistory', () => {
    it('returns history array on success', async () => {
      const history = [{ id: 'conv-1', query: {}, response: {}, createdAt: '' }];
      mockFetch.mockReturnValue(mockOkResponse(history));
      const result = await fetchConversationHistory(10);
      expect(result).toEqual(history);
    });

    it('includes limit in query string', async () => {
      mockFetch.mockReturnValue(mockOkResponse([]));
      await fetchConversationHistory(5);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5'),
        expect.any(Object)
      );
    });

    it('throws on error', async () => {
      mockFetch.mockReturnValue(mockErrorResponse(401, 'Unauthorized'));
      await expect(fetchConversationHistory()).rejects.toThrow('Unauthorized');
    });
  });

  // ── exportConversation ─────────────────────────────────
  describe('exportConversation', () => {
    const EXPORT_RESULT = {
      provider: 'inline-demo',
      conversationId: 'conv-1',
      inlineExport: { fileName: 'guide.json', contentType: 'application/json', data: {} },
    };

    it('returns export result on success', async () => {
      mockFetch.mockReturnValue(mockOkResponse(EXPORT_RESULT));
      const result = await exportConversation('conv-1');
      expect(result).toEqual(EXPORT_RESULT);
    });

    it('calls POST /api/election/conversations/:id/export', async () => {
      mockFetch.mockReturnValue(mockOkResponse(EXPORT_RESULT));
      await exportConversation('conv-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/conv-1/export'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on 404', async () => {
      mockFetch.mockReturnValue(mockErrorResponse(404, 'Conversation not found'));
      await expect(exportConversation('bad-id')).rejects.toThrow('Conversation not found');
    });
  });

  // ── submitConversationFeedback ─────────────────────────
  describe('submitConversationFeedback', () => {
    const FEEDBACK_INPUT = { rating: 5, useful: true };
    const FEEDBACK_RESULT = { rating: 5, useful: true, createdAt: '2026-05-01T00:00:00.000Z' };

    it('returns feedback result on success', async () => {
      mockFetch.mockReturnValue(mockOkResponse(FEEDBACK_RESULT));
      const result = await submitConversationFeedback('conv-1', FEEDBACK_INPUT);
      expect(result).toEqual(FEEDBACK_RESULT);
    });

    it('calls POST /api/election/conversations/:id/feedback', async () => {
      mockFetch.mockReturnValue(mockOkResponse(FEEDBACK_RESULT));
      await submitConversationFeedback('conv-1', FEEDBACK_INPUT);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/conv-1/feedback'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on error', async () => {
      mockFetch.mockReturnValue(mockErrorResponse(400, 'Invalid rating'));
      await expect(submitConversationFeedback('conv-1', FEEDBACK_INPUT)).rejects.toThrow('Invalid rating');
    });
  });

  // ── fetchElectionInsights ──────────────────────────────
  describe('fetchElectionInsights', () => {
    const INSIGHTS = { guideCreated: 5, exportCreated: 2, feedbackSubmitted: 3, source: 'demo' };

    it('returns insights on success', async () => {
      mockFetch.mockReturnValue(mockOkResponse(INSIGHTS));
      const result = await fetchElectionInsights();
      expect(result).toEqual(INSIGHTS);
    });

    it('throws on error', async () => {
      mockFetch.mockReturnValue(mockErrorResponse(500, 'Server error'));
      await expect(fetchElectionInsights()).rejects.toThrow('Server error');
    });
  });

  // ── checkHealth ────────────────────────────────────────
  describe('checkHealth', () => {
    it('returns true when server is healthy', async () => {
      mockFetch.mockReturnValue(Promise.resolve({ ok: true } as Response));
      const result = await checkHealth();
      expect(result).toBe(true);
    });

    it('returns false when server returns error', async () => {
      mockFetch.mockReturnValue(Promise.resolve({ ok: false } as Response));
      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('returns false on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const result = await checkHealth();
      expect(result).toBe(false);
    });
  });
});
