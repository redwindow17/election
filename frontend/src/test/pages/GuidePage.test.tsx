// ============================================================
// GuidePage — Unit Tests
// ============================================================
// Covers: initial render, successful guide generation,
// fallback guide on API failure, error message display.
// ============================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GuidePage } from '../../pages/GuidePage';
import { fetchElectionGuide } from '../../services/apiService';

vi.mock('../../services/apiService', () => ({
  fetchElectionGuide: vi.fn(),
  exportConversation: vi.fn(),
  submitConversationFeedback: vi.fn(),
}));

const MOCK_GUIDE = {
  personalizedAdvice: 'Check your voter registration before election day.',
  steps: [{ stepNumber: 1, title: 'Verify Status', description: 'Check your record.' }],
  conversationId: 'conv-1',
};

function fillAndSubmitForm() {
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '28' } });
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[0], { target: { value: 'Delhi' } });
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'How do I register to vote?' },
  });
  fireEvent.click(screen.getByRole('button', { name: /generate/i }));
}

describe('GuidePage', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Initial render ─────────────────────────────────────
  describe('initial render', () => {
    it('renders page heading', () => {
      render(<GuidePage />);
      expect(screen.getByRole('heading', { name: /your election guide/i })).toBeInTheDocument();
    });

    it('renders GuideForm initially', () => {
      render(<GuidePage />);
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('does not render GuideResult initially', () => {
      render(<GuidePage />);
      expect(screen.queryByText(/personalized election guide/i)).not.toBeInTheDocument();
    });
  });

  // ── Successful generation ──────────────────────────────
  describe('successful generation', () => {
    it('shows GuideResult after successful API call', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_GUIDE);
      render(<GuidePage />);
      fillAndSubmitForm();
      await waitFor(() =>
        expect(screen.getByText('Check your voter registration before election day.')).toBeInTheDocument()
      );
    });

    it('hides GuideForm after result is shown', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_GUIDE);
      render(<GuidePage />);
      fillAndSubmitForm();
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /generate/i })).not.toBeInTheDocument()
      );
    });
  });

  // ── API failure / fallback ─────────────────────────────
  describe('API failure', () => {
    it('shows fallback guide when API fails', async () => {
      vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Network error'));
      render(<GuidePage />);
      fillAndSubmitForm();
      await waitFor(() =>
        expect(screen.getByText(/personalized election guide/i)).toBeInTheDocument()
      );
    });

    it('fallback guide has local-preview conversationId (Export disabled)', async () => {
      vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Network error'));
      render(<GuidePage />);
      fillAndSubmitForm();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled());
    });
  });

  // ── Reset ──────────────────────────────────────────────
  describe('reset', () => {
    it('shows GuideForm again after "Ask Another Question"', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_GUIDE);
      render(<GuidePage />);
      fillAndSubmitForm();
      await waitFor(() => screen.getByRole('button', { name: /ask another question/i }));
      fireEvent.click(screen.getByRole('button', { name: /ask another question/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
      );
    });
  });
});
