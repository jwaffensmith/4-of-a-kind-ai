import { Router } from 'express';
import gameRoutes from './GameRoutes';
import statsRoutes from './StatsRoutes';
import adminRoutes from './AdminRoutes';

const router = Router();

router.use('/game', gameRoutes);
router.use('/stats', statsRoutes);
router.use('/admin', adminRoutes);

export default router;

