// ============================================================
// Election Controller - Request -> Google-backed services -> Response
// ============================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ConversationFeedbackSchema, ElectionQuerySchema } from '../validators/electionValidators';
import { sanitizePrompt } from '../utils/promptSanitizer';
import { generateElectionGuide } from '../services/vertexAiService';
import {
  getConversation,
  getConversationHistory,
  incrementConversationExportCount,
  saveConversation,
  saveConversationFeedback,
} from '../services/firestoreService';
import { exportConversationToStorage } from '../services/storageService';
import {
  getElectionInsights,
  trackExportCreated,
  trackFeedbackSubmitted,
  trackGuideCreated,
} from '../services/analyticsService';
import logger from '../utils/logger';

function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.uid ?? null;
}

export async function getGuide(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const parseResult = ElectionQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }

    const input = parseResult.data;
    const { sanitized, isSuspicious } = sanitizePrompt(input.question);
    if (isSuspicious) {
      res.status(400).json({
        success: false,
        error: 'Your question contains disallowed patterns. Please rephrase.',
      });
      return;
    }

    const sanitizedInput = { ...input, question: sanitized };

    logger.info('Generating election guide', {
      userId,
      state: input.state,
    });

    const guideResponse = await generateElectionGuide(sanitizedInput);
    const conversationId = await saveConversation(userId, sanitizedInput, guideResponse);
    await trackGuideCreated(userId, sanitizedInput, conversationId);

    res.status(200).json({
      success: true,
      data: {
        ...guideResponse,
        conversationId,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const history = await getConversationHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportConversation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const conversationId = req.params.id;
    const conversation = await getConversation(userId, conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    const exportResult = await exportConversationToStorage(userId, conversation);
    await incrementConversationExportCount(userId, conversationId);
    await trackExportCreated(userId, conversation, exportResult.provider);

    res.status(200).json({
      success: true,
      data: exportResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitFeedback(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const parseResult = ConversationFeedbackSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }

    const conversationId = req.params.id;
    const conversation = await getConversation(userId, conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    const feedback = await saveConversationFeedback(userId, conversationId, parseResult.data);
    await trackFeedbackSubmitted(userId, conversation, feedback);

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInsights(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const insights = await getElectionInsights();
    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
}
