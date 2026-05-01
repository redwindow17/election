// ============================================================
// Firestore Service - User data with demo-safe fallbacks
// ============================================================

import admin from 'firebase-admin';
import { getFirestore } from './firebaseAdmin';
import { ElectionGuideResponse, ElectionQueryInput } from '../types';
import logger from '../utils/logger';

const COLLECTION_USERS = 'users';
const SUBCOLLECTION_CONVERSATIONS = 'conversations';
const SUBCOLLECTION_FEEDBACK = 'feedback';
const COLLECTION_ANALYTICS_EVENTS = 'analyticsEvents';

export interface ConversationHistoryRecord {
  id: string;
  query: ElectionQueryInput;
  response: ElectionGuideResponse;
  createdAt: string;
  exportCount?: number;
  lastFeedback?: ConversationFeedback;
}

export interface ConversationFeedback {
  rating: number;
  useful: boolean;
  comment?: string;
  createdAt?: string;
}

export interface AnalyticsEventRecord {
  eventId: string;
  eventName: string;
  userHash: string;
  timestamp: string;
  conversationId?: string;
  state?: string;
  language?: string;
  voterIdStatus?: string;
  ageGroup?: string;
  exportProvider?: string;
  feedbackRating?: number;
  feedbackUseful?: boolean;
  source: 'express' | 'functions';
}

export interface InsightCounts {
  guideCreated: number;
  exportCreated: number;
  feedbackSubmitted: number;
  source: 'bigquery' | 'firestore' | 'demo';
}

const demoConversations = new Map<string, ConversationHistoryRecord[]>();
const demoAnalyticsEvents: AnalyticsEventRecord[] = [];
let demoConversationSequence = 0;

function getDemoUserConversations(userId: string): ConversationHistoryRecord[] {
  const existing = demoConversations.get(userId);
  if (existing) return existing;

  const next: ConversationHistoryRecord[] = [];
  demoConversations.set(userId, next);
  return next;
}

function timestampToIso(value: any): string {
  return value?.toDate?.()?.toISOString?.() ?? new Date().toISOString();
}

export async function saveConversation(
  userId: string,
  query: ElectionQueryInput,
  response: ElectionGuideResponse
): Promise<string> {
  const db = getFirestore();

  if (!db) {
    const id = `demo-conversation-${++demoConversationSequence}`;
    getDemoUserConversations(userId).unshift({
      id,
      query,
      response,
      createdAt: new Date().toISOString(),
      exportCount: 0,
    });
    logger.info('Conversation saved to demo store', { userId, conversationId: id });
    return id;
  }

  const docRef = await db
    .collection(COLLECTION_USERS)
    .doc(userId)
    .collection(SUBCOLLECTION_CONVERSATIONS)
    .add({
      userId,
      query,
      response,
      exportCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  logger.info('Conversation saved to Firestore', {
    userId,
    conversationId: docRef.id,
  });

  return docRef.id;
}

export async function getConversationHistory(
  userId: string,
  limit = 20
): Promise<ConversationHistoryRecord[]> {
  const db = getFirestore();

  if (!db) {
    return getDemoUserConversations(userId).slice(0, limit);
  }

  const snapshot = await db
    .collection(COLLECTION_USERS)
    .doc(userId)
    .collection(SUBCOLLECTION_CONVERSATIONS)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      query: data.query as ElectionQueryInput,
      response: data.response as ElectionGuideResponse,
      createdAt: timestampToIso(data.createdAt),
      exportCount: data.exportCount ?? 0,
      lastFeedback: data.lastFeedback as ConversationFeedback | undefined,
    };
  });
}

export async function getConversation(
  userId: string,
  conversationId: string
): Promise<ConversationHistoryRecord | null> {
  const db = getFirestore();

  if (!db) {
    return getDemoUserConversations(userId).find((item) => item.id === conversationId) ?? null;
  }

  const doc = await db
    .collection(COLLECTION_USERS)
    .doc(userId)
    .collection(SUBCOLLECTION_CONVERSATIONS)
    .doc(conversationId)
    .get();

  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    id: doc.id,
    query: data.query as ElectionQueryInput,
    response: data.response as ElectionGuideResponse,
    createdAt: timestampToIso(data.createdAt),
    exportCount: data.exportCount ?? 0,
    lastFeedback: data.lastFeedback as ConversationFeedback | undefined,
  };
}

export async function incrementConversationExportCount(
  userId: string,
  conversationId: string
): Promise<void> {
  const db = getFirestore();

  if (!db) {
    const conversation = getDemoUserConversations(userId).find((item) => item.id === conversationId);
    if (conversation) {
      conversation.exportCount = (conversation.exportCount ?? 0) + 1;
    }
    return;
  }

  await db
    .collection(COLLECTION_USERS)
    .doc(userId)
    .collection(SUBCOLLECTION_CONVERSATIONS)
    .doc(conversationId)
    .set(
      {
        exportCount: admin.firestore.FieldValue.increment(1),
        lastExportedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

export async function saveConversationFeedback(
  userId: string,
  conversationId: string,
  feedback: ConversationFeedback
): Promise<ConversationFeedback> {
  const normalizedFeedback: ConversationFeedback = {
    rating: feedback.rating,
    useful: feedback.useful,
    comment: feedback.comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const db = getFirestore();

  if (!db) {
    const conversation = getDemoUserConversations(userId).find((item) => item.id === conversationId);
    if (conversation) conversation.lastFeedback = normalizedFeedback;
    return normalizedFeedback;
  }

  const conversationRef = db
    .collection(COLLECTION_USERS)
    .doc(userId)
    .collection(SUBCOLLECTION_CONVERSATIONS)
    .doc(conversationId);

  await conversationRef.collection(SUBCOLLECTION_FEEDBACK).doc('user-feedback').set({
    ...normalizedFeedback,
    userId,
    conversationId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await conversationRef.set(
    {
      lastFeedback: normalizedFeedback,
      lastFeedbackAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return normalizedFeedback;
}

export async function saveAnalyticsEvent(event: AnalyticsEventRecord): Promise<void> {
  demoAnalyticsEvents.push(event);

  const db = getFirestore();
  if (!db) return;

  await db.collection(COLLECTION_ANALYTICS_EVENTS).doc(event.eventId).set({
    ...event,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function getAnalyticsEventCountsFromFirestore(): Promise<InsightCounts | null> {
  const db = getFirestore();
  if (!db) return null;

  try {
    const snapshot = await db.collection(COLLECTION_ANALYTICS_EVENTS).limit(1000).get();
    return countEvents(
      snapshot.docs.map((doc) => doc.data() as AnalyticsEventRecord),
      'firestore'
    );
  } catch (error) {
    logger.warn('Firestore analytics fallback failed', { error });
    return null;
  }
}

export function getDemoAnalyticsEventCounts(): InsightCounts {
  return countEvents(demoAnalyticsEvents, 'demo');
}

function countEvents(
  events: AnalyticsEventRecord[],
  source: InsightCounts['source']
): InsightCounts {
  return events.reduce<InsightCounts>(
    (acc, event) => {
      if (event.eventName === 'guide_created') acc.guideCreated += 1;
      if (event.eventName === 'export_created') acc.exportCreated += 1;
      if (event.eventName === 'feedback_submitted') acc.feedbackSubmitted += 1;
      return acc;
    },
    { guideCreated: 0, exportCreated: 0, feedbackSubmitted: 0, source }
  );
}
