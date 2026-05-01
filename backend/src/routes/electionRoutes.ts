// ============================================================
// Election Routes — All behind authMiddleware
// ============================================================

import { Router } from 'express';
import {
  exportConversation,
  getGuide,
  getHistory,
  getInsights,
  submitFeedback,
} from '../controllers/electionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { appCheckMiddleware } from '../middleware/appCheckMiddleware';

const router = Router();

// All election routes require authentication
router.use(authMiddleware as any);
router.use(appCheckMiddleware as any);

router.post('/guide', getGuide as any);
router.get('/history', getHistory as any);
router.get('/insights', getInsights as any);
router.post('/conversations/:id/export', exportConversation as any);
router.post('/conversations/:id/feedback', submitFeedback as any);

export default router;
