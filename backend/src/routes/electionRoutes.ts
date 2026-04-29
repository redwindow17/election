// ============================================================
// Election Routes — All behind authMiddleware
// ============================================================

import { Router } from 'express';
import { getGuide, getHistory } from '../controllers/electionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All election routes require authentication
router.use(authMiddleware as any);

router.post('/guide', getGuide as any);
router.get('/history', getHistory as any);

export default router;
