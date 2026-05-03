// ============================================================
// GuidePage Tests
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GuidePage } from './GuidePage';
import { fetchElectionGuide } from '../services/apiService';

vi.mock('../services/apiService', () => ({
  fetchElectionGuide: vi.fn(),
  exportConversation: vi.fn(),
  submitConversationFeedback: vi.fn(),
}));

vi.mock('../services/telemetryService', () => ({
  measureAsync: vi.fn((_, fn) => fn()),
  trackClientEvent: vi.fn(),
}));

const mockGuideResponse = {
  personalizedAdvice: 'Check your voter registration before election day.',
  steps: [
    { stepNumber: 1, title: 'Verify Status', description: 'Check your voter record.' },
  ],
  conversationId: 'conv-1',
};

describe('GuidePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    render(<GuidePage />);
    expect(screen.getByRole('heading', { name: /your election guide/i })).toBeInTheDocument();
  });

  it('renders the GuideForm initially', () => {
    render(<GuidePage />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('shows fallback guide when API fails', async () => {
    vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Server error'));
    render(<GuidePage />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '28' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'How do I register to vote?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    // The hook shows fallback guide on error, so GuideResult should appear
    await waitFor(() => {
      expect(screen.getByText(/personalized election guide/i)).toBeInTheDocument();
    });
  });

  it('shows GuideResult after successful submission', async () => {
    vi.mocked(fetchElectionGuide).mockResolvedValue(mockGuideResponse);
    render(<GuidePage />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '28' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'How do I register to vote?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Check your voter registration before election day.')).toBeInTheDocument();
    });
  });
});
