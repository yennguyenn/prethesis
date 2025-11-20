import db from '../src/models/index.js';

async function clearQuestions() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Clearing all questions and options...');
    await db.Option.destroy({ where: {}, truncate: true, cascade: true });
    await db.Question.destroy({ where: {}, truncate: true, cascade: true });
    
    console.log('✅ All questions and options cleared!\n');

    const count = await db.Question.count();
    console.log(`📊 Remaining questions: ${count}`);

    await db.sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearQuestions();
