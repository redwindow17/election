import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HistoryPage } from './HistoryPage';
import {
  exportConversation,
  fetchConversationHistory,
  fetchElectionInsights,
  submitConversationFeedback,
} from '../services/apiService';

vi.mock('../services/apiService', () => ({
  exportConversation: vi.fn(),
  fetchConversationHistory: vi.fn(),
  fetchElectionInsights: vi.fn(),
  submitConversationFeedback: vi.fn(),
}));

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConversationHistory).mockResolvedValue([
      {
        id: 'conversation-1',
        createdAt: '2026-05-01T00:00:00.000Z',
        exportCount: 0,
        query: {
          age: 28,
          state: 'Delhi',
          question: 'How should I prepare?',
          voterIdStatus: 'registered',
          language: 'en',
        },
        response: {
          personalizedAdvice: 'Check your polling station and carry accepted identification.',
          steps: [],
        },
      },
    ]);
    vi.mocked(fetchElectionInsights).mockResolvedValue({
      guideCreated: 3,
      exportCreated: 1,
      feedbackSubmitted: 2,
      source: 'demo',
    });
    vi.mocked(exportConversation).mockResolvedValue({
      provider: 'inline-demo',
      conversationId: 'conversation-1',
      inlineExport: {
        fileName: 'guide.json',
        contentType: 'application/json',
        data: { conversationId: 'conversation-1' },
      },
    });
    vi.mocked(submitConversationFeedback).mockResolvedValue({
      rating: 5,
      useful: true,
      createdAt: '2026-05-01T00:00:00.000Z',
    });
  });

  it('shows insights and supports history export and quick feedback', async () => {
    render(<HistoryPage />);

    expect(await screen.findByText('How should I prepare?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Exports')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    await waitFor(() => expect(exportConversation).toHaveBeenCalledWith('conversation-1'));

    fireEvent.click(screen.getByRole('button', { name: 'Mark Useful' }));
    await waitFor(() =>
      expect(submitConversationFeedback).toHaveBeenCalledWith(
        'conversation-1',
        expect.objectContaining({ rating: 5, useful: true })
      )
    );
  });
});
