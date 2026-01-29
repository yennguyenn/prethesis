import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './models/index.js';
import authRoutes from './routes/authRoute.js';
import quizRoutes from './routes/quizRoute.js';
import questionRoutes from './routes/questionsRoute.js';
import resultRoutes from './routes/resultsRoute.js';
import majorsRoutes from './routes/majorsRoute.js';
import submajorsRoutes from './routes/submajorsRoute.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
// Enable flexible CORS for any localhost port in dev
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: (origin, cb) => {
    // Allow tools like Postman (no origin) and any localhost:<port>
    if (!origin) return cb(null, true);
    if (corsOrigin) {
      if (origin === corsOrigin) return cb(null, true);
      return cb(new Error('CORS blocked: origin not allowed'));
    }
    if (/^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: origin not permitted'));
  },
  credentials: true
}));
app.get('/api/health', (req, res) => {
  res.json({ ok: true, port: process.env.PORT || 5000, time: new Date().toISOString() });
});
//public routes
app.use('/api/auth', authRoutes);
import adminRoutes from './routes/adminRoute.js';
import { errorHandler } from './middleware/errorHandler.js';
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/majors', majorsRoutes);
app.use('/api/submajors', submajorsRoutes);
// Prefer plural path; keep legacy singular for backward compatibility
app.use('/api/questions', questionRoutes);

app.use('/api/results', resultRoutes);

// Global error handler (should be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

import { initializeDatabase } from './utils/initDb.js';

async function start() {
  try {
    // Try initializing database first
    try {
      await initializeDatabase();
      console.log('Database initialization completed');
    } catch (initErr) {
      if (initErr.code === 'ENOENT') {
        console.warn('psql command not found. Please ensure PostgreSQL is installed and in PATH');
      } else {
        console.warn('Database initialization skipped:', initErr.message);
      }
    }

    await db.sequelize.authenticate();
    console.log('DB connected');
    // Clean up orphaned rows before adding/altering FKs
    try {
      // Remove Options with non-existing questionId
      await db.sequelize.query(
        'DELETE FROM "Options" o WHERE o."questionId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "questions" q WHERE q.id = o."questionId")'
      );
      // Remove Options with non-existing majorId (if any)
      await db.sequelize.query(
        'DELETE FROM "Options" o WHERE o."majorId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Majors" m WHERE m.id = o."majorId")'
      );
      // Remove Submissions with non-existing userId
      await db.sequelize.query(
        'DELETE FROM "Submissions" s WHERE s."userId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Users" u WHERE u.id = s."userId")'
      );
    } catch (cleanErr) {
      console.warn('Pre-sync cleanup warning:', cleanErr.message);
    }
    await db.sequelize.sync({ alter: true }); // dev: alter true; prod: use migrations

    // try listening; if port is in use, try next ports up to +10
    let port = Number(PORT);
    for (let i = 0; i < 10; i++) {
      try {
        await new Promise((resolve, reject) => {
          const srv = app.listen(port, () => {
            console.log(`Server listening ${port}`);
            resolve();
          });
          srv.on('error', (e) => reject(e));
        });
        break;
      } catch (err) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} in use, trying ${port + 1}`);
          port++;
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
