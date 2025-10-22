import express from 'express';
import quiz from '../controllers/quizController.js';
import auth from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/levels', quiz.getLevels);
router.get('/questions/:levelId', quiz.getQuestionsByLevel); // returns questions + options (but no scoring detail if you want)
router.post('/submit', auth(), quiz.submitAnswers); // user submits array of { questionId, selectedOptionId }
router.get('/majors', quiz.listMajors);

export default router;
