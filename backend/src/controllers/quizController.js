
import { getQuizService, submitQuizService, submitMajorQuizService } from '../services/quizService.js';

/**
 * Get questions for a given level (level id)
 */
export const getQuiz = async (req, res) => {
  try {
    const { level } = req.params;
    const { major: majorCode } = req.query;
    const payload = await getQuizService(level, majorCode);
    res.json(payload);
  } catch (err) {
    if (err.message === 'Level not found') {
      err.status = 404;
    }
    throw err;
  }
};

/**
 * Nhận kết quả trắc nghiệm và xác định chuyên ngành phù hợp
 */
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const result = await submitQuizService(answers, req.user);
    res.json({
      message: 'Quiz submitted successfully',
      ...result
    });
  } catch (err) {
    if (err.invalidOptionIds) {
      err.status = 400;
    }
    if (err.message === 'No answers submitted') {
      err.status = 400;
    }
    throw err;
  }
};

/**
 * Submit Level 1 Major Orientation quiz answers.
 * Similar to submitQuiz but aggregates scores by Major codes (from Option.scoring).
 */
export const submitMajorQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const result = await submitMajorQuizService(answers, req.user);
    res.json({
      message: 'Major quiz submitted successfully',
      ...result
    });
  } catch (err) {
    if (err.invalidOptionIds) {
      err.status = 400;
    }
    if (err.message === 'No answers submitted') {
      err.status = 400;
    }
    throw err;
  }
};
