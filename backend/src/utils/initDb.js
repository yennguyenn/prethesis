import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

export async function initializeDatabase() {
  try {
    // Check if database already has data
    const questionCount = await db.Question.count();
    
    if (questionCount > 0) {
      console.log(`✅ Database already initialized with ${questionCount} questions`);
      return;
    }
    
    console.log('🌱 Database is empty. Running seed...');
    
    // Import and run seed script
    const seedModule = await import('../seed/seed-it-submajors.mjs');
    if (seedModule.seedITSubmajorQuestions) {
      await seedModule.seedITSubmajorQuestions();
    }
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    // Don't throw - let server continue even if seed fails
  }
}

export default { initializeDatabase };
