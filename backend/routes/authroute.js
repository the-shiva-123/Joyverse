import express from 'express';
import { signup, signin } from '../Controllers/authcontrol.js';
import { logEmotionAndScore, logFinalScore } from '../Controllers/usercontrol.js';


const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/log-emotion', logEmotionAndScore);
router.post('/log-score', logFinalScore);

export default router;