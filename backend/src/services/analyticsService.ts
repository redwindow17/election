// ============================================================
// Analytics Service - Sanitized event tracking and insights
// ============================================================

import { getConfig } from '../config/environment';
import type { ElectionQueryInput } from '../types';
import {
  AnalyticsEventRecord,
  ConversationFeedback,
  ConversationHistoryRecord,
  getAnalyticsEventCountsFromFirestore,
  getDemoAnalyticsEventCounts,
  InsightCounts,
  saveAnalyticsEvent,
} from './firestoreService';
import { insertAnalyticsEvent, queryInsightCounts } from './bigQueryService';
import { createEventId, hashIdentifier } from '../utils/hash';
import logger from '../utils/logger';

type EventName = 'guide_created' | 'export_created' | 'feedback_submitted';

function getAgeGroup(age?: number): string | undefined {
  if (!age) return undefined;
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 50) return '35-49';
  if (age < 65) return '50-64';
  return '65+';
}

function createBaseEvent(
  eventName: EventName,
  userId: string,
  conversationId?: string
): AnalyticsEventRecord {
  const config = getConfig();
  return {
    eventId: createEventId(eventName),
    eventName,
    userHash: hashIdentifier(userId, config.ANALYTICS_SALT),
    timestamp: new Date().toISOString(),
    conversationId,
    source: 'express',
  };
}

async function recordEvent(event: AnalyticsEventRecord): Promise<void> {
  const results = await Promise.allSettled([saveAnalyticsEvent(event), insertAnalyticsEvent(event)]);
  for (const result of results) {
    if (result.status === 'rejected') {
      logger.warn('Analytics event sink failed', { error: result.reason, eventName: event.eventName });
    }
  }
}

export async function trackGuideCreated(
  userId: string,
  input: ElectionQueryInput,
  conversationId?: string
): Promise<void> {
  await recordEvent({
    ...createBaseEvent('guide_created', userId, conversationId),
    state: input.state,
    language: input.language,
    voterIdStatus: input.voterIdStatus,
    ageGroup: getAgeGroup(input.age),
  });
}

export async function trackExportCreated(
  userId: string,
  conversation: ConversationHistoryRecord,
  exportProvider: string
): Promise<void> {
  await recordEvent({
    ...createBaseEvent('export_created', userId, conversation.id),
    state: conversation.query.state,
    language: conversation.query.language,
    voterIdStatus: conversation.query.voterIdStatus,
    ageGroup: getAgeGroup(conversation.query.age),
    exportProvider,
  });
}

export async function trackFeedbackSubmitted(
  userId: string,
  conversation: ConversationHistoryRecord,
  feedback: ConversationFeedback
): Promise<void> {
  await recordEvent({
    ...createBaseEvent('feedback_submitted', userId, conversation.id),
    state: conversation.query.state,
    language: conversation.query.language,
    voterIdStatus: conversation.query.voterIdStatus,
    ageGroup: getAgeGroup(conversation.query.age),
    feedbackRating: feedback.rating,
    feedbackUseful: feedback.useful,
  });
}

export async function getElectionInsights(): Promise<InsightCounts> {
  const bigQueryCounts = await queryInsightCounts().catch((error) => {
    logger.warn('BigQuery insights unavailable, falling back', { error });
    return null;
  });
  if (bigQueryCounts) return bigQueryCounts;

  const firestoreCounts = await getAnalyticsEventCountsFromFirestore();
  if (firestoreCounts) return firestoreCounts;

  return getDemoAnalyticsEventCounts();
}
