import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

export async function initializeDatabase() {
  try {
    // Check if database already has data
    const questionCount = await db.Question.count();

    if (questionCount > 0) {
      console.log(`Database already initialized with ${questionCount} questions`);
      return;
    }

    // Skip auto-seed to avoid overwriting manual pgAdmin data
    console.log('Database is empty. Skipping auto-seed (managed externally via SQL).');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    // Don't throw - let server continue
  }
}

export default { initializeDatabase };
