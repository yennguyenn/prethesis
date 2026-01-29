import express from 'express';
import { getQuiz, submitQuiz, submitMajorQuiz } from '../controllers/quizController.js';
import { maybeAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:level', getQuiz); // e.g. /quiz/1 (major orientation) or /quiz/2 (submajors)
// Use optional auth so we can save results if user is logged in
router.post('/submit', maybeAuth, submitQuiz); // Level 2 submajor submit
router.post('/major/submit', maybeAuth, submitMajorQuiz); // Level 1 major orientation submit

export default router;
