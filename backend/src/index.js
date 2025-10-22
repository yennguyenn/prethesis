import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import db from './models/index.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import quizRoutes from './routes/quiz.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);

const PORT = process.env.PORT || 4000;

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
