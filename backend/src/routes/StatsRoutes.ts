import { Router } from 'express';
import { StatsController } from '../controllers/StatsController';
import { validate } from '../middleware/ValidationMiddleware';
import { syncStatsSchema } from '../validators/AdminValidator';

const router = Router();
const statsController = new StatsController();

router.get('/:username', statsController.getUserStats);
router.get('/leaderboard/top', statsController.getLeaderboard);
router.post('/sync', validate(syncStatsSchema), statsController.syncLocalStats);

export default router;

