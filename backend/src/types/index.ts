// ============================================================
// Shared TypeScript Interfaces for AI Election Guide Backend
// ============================================================

import { Request } from 'express';

/** Decoded Firebase user attached to request */
export interface DecodedUser {
  uid: string;
  email?: string;
  name?: string;
}

/** Express request with authenticated user */
export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}

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
}

/** Firestore conversation document */
export interface ConversationDocument {
  userId: string;
  query: ElectionQueryInput;
  response: ElectionGuideResponse;
  createdAt: FirebaseFirestore.Timestamp;
}

/** API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Health check response */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
}
