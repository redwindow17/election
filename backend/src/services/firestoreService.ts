// ============================================================
// Firestore Service — Read/Write helpers scoped to user
// ============================================================

import { getFirestore } from './firebaseAdmin';
import { ElectionGuideResponse, ElectionQueryInput } from '../types';
import logger from '../utils/logger';
import admin from 'firebase-admin';

const COLLECTION_USERS = 'users';
const SUBCOLLECTION_CONVERSATIONS = 'conversations';

/**
 * Save an AI conversation to the user's Firestore subcollection.
 */
export async function saveConversation(
  userId: string,
  query: ElectionQueryInput,
  response: ElectionGuideResponse
): Promise<string> {
  const db = getFirestore();

  const docRef = await db
    .collection(COLLECTION_USERS)
    .doc(userId)
    .collection(SUBCOLLECTION_CONVERSATIONS)
    .add({
      userId,
      query,
      response,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  logger.info('Conversation saved to Firestore', {
    userId,
    conversationId: docRef.id,
  });

  return docRef.id;
}

/**
 * Fetch the conversation history for a user, ordered by creation date (newest first).
 */
export async function getConversationHistory(
  userId: string,
  limit = 20
): Promise<Array<{ id: string; query: ElectionQueryInput; response: ElectionGuideResponse; createdAt: string }>> {
  const db = getFirestore();

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
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  });
}
