import db from '../src/models/index.js';

async function viewAllQuestions() {
  try {
    await db.sequelize.authenticate();
    
    const allQuestions = await db.Question.findAll({
      include: [{
        model: db.Option,
        as: 'Options',
        include: [{
          model: db.Major,
          as: 'Major'
        }]
      }],
      order: [['id', 'ASC']]
    });

    console.log(`📊 Total questions in database: ${allQuestions.length}\n`);
    
    // Separate IT questions from others
    const itQuestions = allQuestions.filter(q => q.id <= 30);
    const otherQuestions = allQuestions.filter(q => q.id > 30);

    if (itQuestions.length > 0) {
      console.log('💻 IT SUBMAJOR QUESTIONS:\n');
      // Show first 3 questions in detail
      itQuestions.slice(0, 3).forEach((q, idx) => {
        console.log(`${idx + 1}. [ID: ${q.id}] ${q.text}`);
        if (q.Options && q.Options.length > 0) {
          q.Options.forEach((opt, i) => {
            const scoring = typeof opt.scoring === 'string' ? JSON.parse(opt.scoring) : opt.scoring;
            const scores = Object.entries(scoring || {})
              .map(([major, score]) => `${major}:${score}`)
              .join(', ');
            console.log(`   ${String.fromCharCode(97 + i)}) ${opt.text}`);
            console.log(`      Scoring: [${scores}]`);
          });
        }
        console.log('');
      });
    }

    if (otherQuestions.length > 0) {
      console.log('\n📚 OTHER QUESTIONS:\n');
      otherQuestions.slice(0, 5).forEach((q, idx) => {
        console.log(`${idx + 1}. [ID: ${q.id}] ${q.text}`);
        if (q.Options && q.Options.length > 0) {
          q.Options.forEach((opt, i) => {
            const major = opt.Major ? opt.Major.name : 'N/A';
            console.log(`   ${String.fromCharCode(97 + i)}) ${opt.text} [Major: ${major}]`);
          });
        }
        console.log('');
      });
      
      if (otherQuestions.length > 5) {
        console.log(`   ... and ${otherQuestions.length - 5} more questions\n`);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   - IT Submajor questions: ${itQuestions.length}`);
    console.log(`   - Other questions: ${otherQuestions.length}`);
    console.log(`   - Total: ${allQuestions.length}`);

    await db.sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewAllQuestions();
