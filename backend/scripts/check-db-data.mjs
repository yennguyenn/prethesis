import db from '../src/models/index.js';

async function checkData() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Count questions
    const questionCount = await db.Question.count();
    console.log(`📊 Total questions: ${questionCount}`);

    // Sample questions
    if (questionCount > 0) {
      const questions = await db.Question.findAll({ limit: 3 });
      console.log('\n📝 Sample questions:');
      questions.forEach((q, i) => {
        console.log(`${i + 1}. [ID: ${q.id}] ${q.text}`);
      });
    }

    // Count options
    const optionCount = await db.Option.count();
    console.log(`\n🔘 Total options: ${optionCount}`);

    // Count majors
    const majorCount = await db.Major.count();
    console.log(`\n🎓 Total majors: ${majorCount}`);
    
    if (majorCount > 0) {
      const majors = await db.Major.findAll();
      console.log('Majors:');
      majors.forEach(m => {
        console.log(`  - ${m.name}`);
      });
    }

    // Count submajors
    const submajorCount = await db.SubMajor.count();
    console.log(`\n📚 Total submajors: ${submajorCount}`);

    if (submajorCount > 0) {
      const submajors = await db.SubMajor.findAll({ limit: 5 });
      console.log('Sample submajors:');
      submajors.forEach(s => {
        console.log(`  - ${s.name}`);
      });
    }

    // Count levels
    const levelCount = await db.Level.count();
    console.log(`\n📊 Total levels: ${levelCount}`);

    // Count users
    const userCount = await db.User.count();
    console.log(`👥 Total users: ${userCount}`);

    await db.sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
