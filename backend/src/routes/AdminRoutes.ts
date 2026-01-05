import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { adminLogin, adminAuth, adminLogout } from '../middleware/AdminMiddleware';
import { validate } from '../middleware/ValidationMiddleware';
import { loginSchema, setDailyPuzzleSchema } from '../validators/AdminValidator';

const router = Router();
const adminController = new AdminController();

router.post('/login', validate(loginSchema), adminLogin);
router.post('/logout', adminAuth, adminLogout);

router.post('/puzzle/generate', adminAuth, adminController.generatePuzzle);
router.get('/puzzle/all', adminAuth, adminController.getAllPuzzles);
router.put('/puzzle/:id/approve', adminAuth, adminController.approvePuzzle);
router.delete('/puzzle/:id/reject', adminAuth, adminController.rejectPuzzle);

router.post('/daily', adminAuth, validate(setDailyPuzzleSchema), adminController.setDailyPuzzle);

router.get('/stats', adminAuth, adminController.getAdminStats);
router.get('/logs', adminAuth, adminController.getAdminLogs);
router.get('/quota', adminAuth, adminController.getQuota);

export default router;

