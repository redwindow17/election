// ============================================================
// Shared TypeScript Interfaces for Frontend
// ============================================================

/** Input payload for the election guide endpoint */
export interface ElectionQueryInput {
  age: number;
  state: string;
  question: string;
  voterIdStatus?: 'registered' | 'not_registered' | 'unsure';
  language?: 'en' | 'hi';
}

/** A single step in the election guide response */
export interface ElectionStep {
  stepNumber: number;
  title: string;
  description: string;
  requirements?: string[];
  tips?: string[];
}

/** Full AI-generated election guide response */
export interface ElectionGuideResponse {
  personalizedAdvice: string;
  steps: ElectionStep[];
  importantDates?: string[];
  helplineNumbers?: string[];
  additionalResources?: string[];
  conversationId?: string;
}

/** API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

/** Conversation history item */
export interface ConversationHistoryItem {
  id: string;
  query: ElectionQueryInput;
  response: ElectionGuideResponse;
  createdAt: string;
}

/** Firebase user */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
