import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuideResult } from './GuideResult';
import { exportConversation, submitConversationFeedback } from '../../services/apiService';
import type { ElectionGuideResponse } from '../../types';

vi.mock('../../services/apiService', () => ({
  exportConversation: vi.fn(),
  submitConversationFeedback: vi.fn(),
}));

const guideResult: ElectionGuideResponse = {
  conversationId: 'conversation-1',
  personalizedAdvice: 'Check your polling details before election day.',
  steps: [
    {
      stepNumber: 1,
      title: 'Check status',
      description: 'Verify your voter record.',
    },
  ],
  importantDates: ['Check official ECI dates'],
  helplineNumbers: ['1950 - Voter Helpline'],
  additionalResources: ['https://eci.gov.in'],
};

describe('GuideResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      createdAt: new Date().toISOString(),
    });
  });

  it('exports a guide and saves feedback', async () => {
    render(<GuideResult result={guideResult} onReset={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    await waitFor(() => expect(exportConversation).toHaveBeenCalledWith('conversation-1'));

    fireEvent.click(screen.getByRole('button', { name: 'Save Feedback' }));
    await waitFor(() =>
      expect(submitConversationFeedback).toHaveBeenCalledWith(
        'conversation-1',
        expect.objectContaining({ rating: 5, useful: true })
      )
    );

    expect(await screen.findByRole('button', { name: 'Feedback Saved' })).toBeDisabled();
  });
});
