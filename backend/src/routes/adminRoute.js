import express from 'express';
import admin from '../controllers/adminController.js';
import { updateMajor, deleteMajor, listQuestions, updateQuestion, deleteQuestion, bootstrapFirstAdmin, getQuestionById, listSubmissions } from '../controllers/adminController.js';
import { createOption, deleteOption } from '../controllers/adminController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { listCriteria, getCriteria, listResponses } from '../controllers/adminDataController.js';

const router = express.Router();

router.post('/majors', authMiddleware, adminOnly, admin.createMajor);
router.get('/majors', authMiddleware, adminOnly, admin.listMajors);
router.put('/majors/:id', authMiddleware, adminOnly, updateMajor);
router.delete('/majors/:id', authMiddleware, adminOnly, deleteMajor);
router.post('/questions', authMiddleware, adminOnly, admin.createQuestion);
router.post('/import-questions', authMiddleware, adminOnly, admin.importQuestionsFromJson);
router.get('/questions', authMiddleware, adminOnly, listQuestions);
router.get('/questions/:id', authMiddleware, adminOnly, getQuestionById);
router.put('/questions/:id', authMiddleware, adminOnly, updateQuestion);
router.delete('/questions/:id', authMiddleware, adminOnly, deleteQuestion);
router.post('/questions/:questionId/options', authMiddleware, adminOnly, createOption);
router.delete('/options/:optionId', authMiddleware, adminOnly, deleteOption);
// Admin users management
router.post('/users', authMiddleware, adminOnly, admin.createAdminUser); // create an admin account
router.post('/users/role', authMiddleware, adminOnly, admin.setUserRole); // set role for existing user
// Bootstrap: only if there is no admin yet
router.post('/bootstrap-admin', bootstrapFirstAdmin);
// Scoring & results management
router.put('/options/:optionId/scoring', authMiddleware, adminOnly, admin.updateOptionScoring);
router.put('/results/:resultId/score', authMiddleware, adminOnly, admin.updateResultScore);
// Submissions listing for admin
router.get('/submissions', authMiddleware, adminOnly, listSubmissions);

// Criteria & Responses (admin)
router.get('/criteria', authMiddleware, adminOnly, listCriteria);
router.get('/criteria/:id', authMiddleware, adminOnly, getCriteria);
router.get('/responses', authMiddleware, adminOnly, listResponses);

export default router;
