// ============================================================
// API Service - Fetch wrapper with Auth and optional App Check
// ============================================================

import { auth, getAppCheckToken, getDemoCurrentUserId, isFirebaseConfigured } from '../config/firebase';
import { trackClientEvent } from './telemetryService';
import type {
  ApiResponse,
  ConversationExportResult,
  ConversationFeedback,
  ConversationFeedbackInput,
  ConversationHistoryItem,
  ElectionGuideResponse,
  ElectionInsights,
  ElectionQueryInput,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (!isFirebaseConfigured) {
      headers.Authorization = 'Bearer demo-token';
      headers['X-Demo-User'] = getDemoCurrentUserId() ?? user.uid ?? 'demo-user';
    }
  }

  const appCheckToken = await getAppCheckToken().catch(() => null);
  if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;

  return headers;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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

export async function fetchElectionGuide(input: ElectionQueryInput): Promise<ElectionGuideResponse> {
  const response = await apiRequest<ElectionGuideResponse>('/api/election/guide', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  await trackClientEvent('guide_created_client', {
    state: input.state,
    language: input.language,
    voter_status: input.voterIdStatus,
  });

  return response.data!;
}

export async function fetchConversationHistory(limit = 20): Promise<ConversationHistoryItem[]> {
  const response = await apiRequest<ConversationHistoryItem[]>(
    `/api/election/history?limit=${limit}`
  );
  await trackClientEvent('history_loaded_client', { limit });
  return response.data!;
}

export async function exportConversation(
  conversationId: string
): Promise<ConversationExportResult> {
  const response = await apiRequest<ConversationExportResult>(
    `/api/election/conversations/${conversationId}/export`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
  await trackClientEvent('guide_exported_client', {
    provider: response.data?.provider,
  });
  return response.data!;
}

export async function submitConversationFeedback(
  conversationId: string,
  feedback: ConversationFeedbackInput
): Promise<ConversationFeedback> {
  const response = await apiRequest<ConversationFeedback>(
    `/api/election/conversations/${conversationId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify(feedback),
    }
  );
  await trackClientEvent('guide_feedback_client', {
    rating: feedback.rating,
    useful: feedback.useful,
  });
  return response.data!;
}

export async function fetchElectionInsights(): Promise<ElectionInsights> {
  const response = await apiRequest<ElectionInsights>('/api/election/insights');
  await trackClientEvent('insights_loaded_client', { source: response.data?.source });
  return response.data!;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
