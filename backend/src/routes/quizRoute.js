import express from 'express';
import { getQuiz, submitQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.get('/:level', getQuiz);
router.post('/submit', submitQuiz);

export default router;
