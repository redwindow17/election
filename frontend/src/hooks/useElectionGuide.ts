// ============================================================
// useElectionGuide Hook — API call with loading/error state
// ============================================================

import { useState, useCallback } from 'react';
import type { ElectionQueryInput, ElectionGuideResponse } from '../types';
import { fetchElectionGuide } from '../services/apiService';

interface UseElectionGuideReturn {
  result: ElectionGuideResponse | null;
  loading: boolean;
  error: string | null;
  generateGuide: (input: ElectionQueryInput) => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

function createFallbackGuide(input: ElectionQueryInput): ElectionGuideResponse {
  const registrationStep =
    input.voterIdStatus === 'registered'
      ? 'Verify your name in the electoral roll for your current address.'
      : 'Register or update your details on the official voter portal before the deadline.';

  return {
    personalizedAdvice: `Here is a practical election guide for a voter in ${input.state}. This local preview is shown because the backend API is not reachable right now.`,
    steps: [
      {
        stepNumber: 1,
        title: 'Check Your Voter Status',
        description: registrationStep,
        requirements: ['Mobile number or email', 'EPIC number if available', 'Current address details'],
        tips: ['Use the official Voter Services Portal for the most reliable status.'],
      },
      {
        stepNumber: 2,
        title: 'Prepare Your Documents',
        description: 'Keep an accepted identity document ready before polling day.',
        requirements: ['Voter ID or accepted photo ID', 'Polling booth details'],
        tips: ['Carry the original document, not just a photo on your phone.'],
      },
      {
        stepNumber: 3,
        title: 'Plan Polling Day',
        description: 'Find your polling station, choose a convenient time, and follow the queue instructions at the booth.',
        tips: ['Avoid peak hours when possible.', 'Ask polling staff for help if anything is unclear.'],
      },
    ],
    importantDates: ['Check official ECI announcements for your constituency schedule.'],
    helplineNumbers: ['1950 - Voter Helpline'],
    additionalResources: ['https://voters.eci.gov.in', 'https://eci.gov.in'],
    conversationId: 'local-preview',
  };
}

export function useElectionGuide(): UseElectionGuideReturn {
  const [result, setResult] = useState<ElectionGuideResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGuide = useCallback(async (input: ElectionQueryInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchElectionGuide(input);
      setResult(response);
    } catch (err: any) {
      setResult(createFallbackGuide(input));
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => setResult(null), []);
  const clearError = useCallback(() => setError(null), []);

  return { result, loading, error, generateGuide, clearResult, clearError };
}
