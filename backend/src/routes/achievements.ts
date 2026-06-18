import { Router } from 'express';
import {
  getAchievements,
  getLeaderboard,
} from '../controllers/achievementController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAchievements as any);
router.get('/leaderboard', authenticate, getLeaderboard as any);

export default router;