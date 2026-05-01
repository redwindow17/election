// ============================================================
// BigQuery Service - Sanitized analytics via REST API
// ============================================================

import { getConfig } from '../config/environment';
import type { AnalyticsEventRecord, InsightCounts } from './firestoreService';
import logger from '../utils/logger';

const BIGQUERY_SCOPE = 'https://www.googleapis.com/auth/bigquery';

function getProjectId(): string | undefined {
  const config = getConfig();
  return config.GOOGLE_CLOUD_PROJECT || config.FIREBASE_PROJECT_ID;
}

export function isBigQueryConfigured(): boolean {
  const config = getConfig();
  return Boolean(getProjectId() && config.BIGQUERY_DATASET && config.BIGQUERY_EVENTS_TABLE);
}

export function getBigQueryStatus() {
  const config = getConfig();
  return {
    configured: isBigQueryConfigured(),
    projectId: getProjectId() ? 'configured' : 'missing',
    dataset: config.BIGQUERY_DATASET ? 'configured' : 'missing',
    eventsTable: config.BIGQUERY_EVENTS_TABLE ? 'configured' : 'missing',
    rollupsTable: config.BIGQUERY_ROLLUPS_TABLE ? 'configured' : 'missing',
  };
}

async function getAccessToken(): Promise<string | null> {
  const moduleName = 'google-auth-library';
  const { GoogleAuth } = (await import(moduleName)) as any;
  const auth = new GoogleAuth({ scopes: [BIGQUERY_SCOPE] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token ?? null;
}

export async function insertAnalyticsEvent(event: AnalyticsEventRecord): Promise<'bigquery' | 'noop'> {
  if (!isBigQueryConfigured()) return 'noop';

  const config = getConfig();
  const projectId = getProjectId()!;
  const token = await getAccessToken();
  if (!token) return 'noop';

  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets/${config.BIGQUERY_DATASET}/tables/${config.BIGQUERY_EVENTS_TABLE}/insertAll`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind: 'bigquery#tableDataInsertAllRequest',
      skipInvalidRows: true,
      ignoreUnknownValues: true,
      rows: [
        {
          insertId: event.eventId,
          json: event,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.warn('BigQuery insert failed', { status: response.status, body });
    return 'noop';
  }

  return 'bigquery';
}

export async function queryInsightCounts(): Promise<InsightCounts | null> {
  if (!isBigQueryConfigured()) return null;

  const config = getConfig();
  const projectId = getProjectId()!;
  const token = await getAccessToken();
  if (!token) return null;

  const tableRef = `\`${projectId}.${config.BIGQUERY_DATASET}.${config.BIGQUERY_EVENTS_TABLE}\``;
  const query = `
    SELECT eventName, COUNT(1) AS eventCount
    FROM ${tableRef}
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    GROUP BY eventName
  `;

  const response = await fetch(
    `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, useLegacySql: false }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    logger.warn('BigQuery insights query failed', { status: response.status, body });
    return null;
  }

  const data = (await response.json()) as any;
  const counts: InsightCounts = {
    guideCreated: 0,
    exportCreated: 0,
    feedbackSubmitted: 0,
    source: 'bigquery',
  };

  for (const row of data.rows ?? []) {
    const eventName = row.f?.[0]?.v;
    const eventCount = Number(row.f?.[1]?.v ?? 0);
    if (eventName === 'guide_created') counts.guideCreated = eventCount;
    if (eventName === 'export_created') counts.exportCreated = eventCount;
    if (eventName === 'feedback_submitted') counts.feedbackSubmitted = eventCount;
  }

  return counts;
}
