import express from 'express';
import { logEmotionAndScore } from '../Controllers/gameControl.js';

const router = express.Router();

// POST: log emotion + score per question
router.post('/log-game-session', logEmotionAndScore);

export default router;
