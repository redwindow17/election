// ============================================================
// Cloud Storage Service - Private guide exports with demo fallback
// ============================================================

import { Storage } from '@google-cloud/storage';
import { getConfig } from '../config/environment';
import { ConversationHistoryRecord } from './firestoreService';
import { hashIdentifier } from '../utils/hash';
import logger from '../utils/logger';

export interface ConversationExportResult {
  provider: 'cloud-storage' | 'inline-demo';
  conversationId: string;
  storagePath?: string;
  gcsUri?: string;
  downloadUrl?: string;
  inlineExport?: {
    fileName: string;
    contentType: 'application/json';
    data: unknown;
  };
}

function getProjectId(): string | undefined {
  const config = getConfig();
  return config.GOOGLE_CLOUD_PROJECT || config.FIREBASE_PROJECT_ID;
}

export function isCloudStorageConfigured(): boolean {
  const config = getConfig();
  return Boolean(getProjectId() && config.GCS_EXPORT_BUCKET);
}

export function getCloudStorageStatus() {
  const config = getConfig();
  return {
    configured: isCloudStorageConfigured(),
    projectId: getProjectId() ? 'configured' : 'missing',
    bucket: config.GCS_EXPORT_BUCKET ? 'configured' : 'missing',
  };
}

function buildExportPayload(conversation: ConversationHistoryRecord) {
  return {
    exportedAt: new Date().toISOString(),
    conversationId: conversation.id,
    query: conversation.query,
    response: conversation.response,
    createdAt: conversation.createdAt,
  };
}

function inlineExport(conversation: ConversationHistoryRecord): ConversationExportResult {
  return {
    provider: 'inline-demo',
    conversationId: conversation.id,
    inlineExport: {
      fileName: `election-guide-${conversation.id}.json`,
      contentType: 'application/json',
      data: buildExportPayload(conversation),
    },
  };
}

export async function exportConversationToStorage(
  userId: string,
  conversation: ConversationHistoryRecord
): Promise<ConversationExportResult> {
  const config = getConfig();

  if (!isCloudStorageConfigured()) {
    return inlineExport(conversation);
  }

  try {
    const storage = new Storage({ projectId: getProjectId() });
    const userHash = hashIdentifier(userId, config.ANALYTICS_SALT).slice(0, 32);
    const storagePath = `exports/${userHash}/${conversation.id}.json`;
    const bucket = storage.bucket(config.GCS_EXPORT_BUCKET!);
    const file = bucket.file(storagePath);

    await file.save(JSON.stringify(buildExportPayload(conversation), null, 2), {
      contentType: 'application/json',
      resumable: false,
      metadata: {
        cacheControl: 'private, max-age=0, no-store',
      },
    });

    const [downloadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + config.GCS_SIGNED_URL_TTL_MINUTES * 60 * 1000,
    });

    return {
      provider: 'cloud-storage',
      conversationId: conversation.id,
      storagePath,
      gcsUri: `gs://${config.GCS_EXPORT_BUCKET}/${storagePath}`,
      downloadUrl,
    };
  } catch (error) {
    logger.warn('Cloud Storage export failed; returning inline demo export', {
      error,
      conversationId: conversation.id,
    });
    return inlineExport(conversation);
  }
}
