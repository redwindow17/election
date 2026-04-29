// ============================================================
// API Service — Fetch wrapper with auth token
// ============================================================

import { auth } from '../config/firebase';
import type { ApiResponse, ElectionGuideResponse, ElectionQueryInput, ConversationHistoryItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * POST /api/election/guide — Get personalized election guide
 */
export async function fetchElectionGuide(
  input: ElectionQueryInput
): Promise<ElectionGuideResponse> {
  const response = await apiRequest<ElectionGuideResponse>('/api/election/guide', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response.data!;
}

/**
 * GET /api/election/history — Get user's conversation history
 */
export async function fetchConversationHistory(
  limit = 20
): Promise<ConversationHistoryItem[]> {
  const response = await apiRequest<ConversationHistoryItem[]>(
    `/api/election/history?limit=${limit}`
  );

  return response.data!;
}

/**
 * GET /api/health — Health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
