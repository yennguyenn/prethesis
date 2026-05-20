import express from 'express';
import { googleFormWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/google-form', googleFormWebhook);

export default router;
