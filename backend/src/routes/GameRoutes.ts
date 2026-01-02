import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { validate } from '../middleware/ValidationMiddleware';
import { startGameSchema, submitGuessSchema } from '../validators/GameValidator';

const router = Router();
const gameController = new GameController();

router.get('/daily', gameController.getDailyPuzzle);
router.get('/random', gameController.getRandomPuzzle);
router.post('/start', validate(startGameSchema), gameController.startGame);
router.post('/submit', validate(submitGuessSchema), gameController.submitGuess);
router.get('/:sessionId', gameController.getGameSession);

export default router;

