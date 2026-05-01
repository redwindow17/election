import { BigQuery } from '@google-cloud/bigquery';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { buildConversationCreatedEvent } from './analyticsEvent';

initializeApp();

const ANALYTICS_SALT = process.env.ANALYTICS_SALT || 'demo-analytics-salt';
const BIGQUERY_DATASET = process.env.BIGQUERY_DATASET;
const BIGQUERY_EVENTS_TABLE = process.env.BIGQUERY_EVENTS_TABLE || 'election_events';
const BIGQUERY_ROLLUPS_TABLE = process.env.BIGQUERY_ROLLUPS_TABLE || 'daily_rollups';

export const conversationCreatedAnalytics = onDocumentCreated(
  'users/{userId}/conversations/{conversationId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const analyticsEvent = buildConversationCreatedEvent(
      {
        userId: event.params.userId,
        conversationId: event.params.conversationId,
        query: data.query,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.(),
      },
      ANALYTICS_SALT
    );

    await getFirestore().collection('analyticsEvents').doc(analyticsEvent.eventId).set({
      ...analyticsEvent,
      createdAt: FieldValue.serverTimestamp(),
    });

    logger.info('Conversation analytics event created', {
      conversationId: analyticsEvent.conversationId,
      eventName: analyticsEvent.eventName,
    });
  }
);

export const dailyBigQueryRollup = onSchedule('every 24 hours', async () => {
  const db = getFirestore();
  const rollupDate = new Date().toISOString().slice(0, 10);

  if (!BIGQUERY_DATASET) {
    const snapshot = await db.collection('analyticsEvents').limit(1000).get();
    const fallbackCounts = snapshot.docs.reduce(
      (acc, doc) => {
        const eventName = doc.data().eventName;
        if (eventName === 'guide_created') acc.guideCreated += 1;
        if (eventName === 'export_created') acc.exportCreated += 1;
        if (eventName === 'feedback_submitted') acc.feedbackSubmitted += 1;
        return acc;
      },
      { guideCreated: 0, exportCreated: 0, feedbackSubmitted: 0 }
    );

    await db.collection('metrics').doc(`daily-${rollupDate}`).set(
      {
        date: rollupDate,
        source: 'firestore-fallback',
        ...fallbackCounts,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  const bigQuery = new BigQuery();
  const [rows] = await bigQuery.query({
    query: `
      SELECT eventName, COUNT(1) AS eventCount
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${BIGQUERY_DATASET}.${BIGQUERY_EVENTS_TABLE}\`
      WHERE DATE(timestamp) = CURRENT_DATE()
      GROUP BY eventName
    `,
    useLegacySql: false,
  });

  const counts = rows.reduce(
    (acc, row: any) => {
      if (row.eventName === 'guide_created') acc.guideCreated = Number(row.eventCount);
      if (row.eventName === 'export_created') acc.exportCreated = Number(row.eventCount);
      if (row.eventName === 'feedback_submitted') acc.feedbackSubmitted = Number(row.eventCount);
      return acc;
    },
    { guideCreated: 0, exportCreated: 0, feedbackSubmitted: 0 }
  );

  await db.collection('metrics').doc(`daily-${rollupDate}`).set(
    {
      date: rollupDate,
      source: 'bigquery',
      bigQueryTable: `${BIGQUERY_DATASET}.${BIGQUERY_ROLLUPS_TABLE}`,
      ...counts,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
});
