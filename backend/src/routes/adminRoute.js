import express from 'express';
import admin from '../controllers/adminController.js';
import auth from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/majors', auth('admin'), admin.createMajor);
router.get('/majors', auth('admin'), admin.listMajors);
router.post('/questions', auth('admin'), admin.createQuestion);
router.post('/import-questions', auth('admin'), admin.importQuestionsFromJson);
// Admin users management
router.post('/users', auth('admin'), admin.createAdminUser); // create an admin account
router.post('/users/role', auth('admin'), admin.setUserRole); // set role for existing user

export default router;
