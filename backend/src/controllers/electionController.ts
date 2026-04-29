// ============================================================
// Election Controller — Request → Service → Response
// ============================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ElectionQuerySchema } from '../validators/electionValidators';
import { sanitizePrompt } from '../utils/promptSanitizer';
import { generateElectionGuide } from '../services/vertexAiService';
import { saveConversation, getConversationHistory } from '../services/firestoreService';
import logger from '../utils/logger';

/**
 * POST /api/election/guide
 * Validate input → sanitize prompt → call Vertex AI → save to Firestore → return JSON
 */
export async function getGuide(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate input
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

    // 2. Sanitize the question for prompt injection
    const { sanitized, isSuspicious } = sanitizePrompt(input.question);
    if (isSuspicious) {
      res.status(400).json({
        success: false,
        error: 'Your question contains disallowed patterns. Please rephrase.',
      });
      return;
    }

    // Use sanitized question
    const sanitizedInput = { ...input, question: sanitized };

    // 3. Generate AI response
    logger.info('Generating election guide', {
      userId: req.user?.uid,
      state: input.state,
    });

    const guideResponse = await generateElectionGuide(sanitizedInput);

    // 4. Save to Firestore
    let conversationId: string | undefined;
    if (req.user?.uid) {
      conversationId = await saveConversation(req.user.uid, sanitizedInput, guideResponse);
    }

    // 5. Return response
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

/**
 * GET /api/election/history
 * Return the user's past AI conversations.
 */
export async function getHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const history = await getConversationHistory(req.user.uid, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}
