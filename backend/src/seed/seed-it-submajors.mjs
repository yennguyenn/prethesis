import fs from 'fs';
import path from 'path';
import db from '../models/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedITSubmajorQuestions() {
  try {
    console.log('🗑️  Clearing existing data...\n');

    // Delete all existing data
    await db.Option.destroy({ where: {}, truncate: true, cascade: true });
    await db.Question.destroy({ where: {}, truncate: true, cascade: true });
    await db.SubMajor.destroy({ where: {}, truncate: true, cascade: true });
    await db.Major.destroy({ where: {}, truncate: true, cascade: true });
    await db.Level.destroy({ where: {}, truncate: true, cascade: true });
    
    console.log('✅ All data cleared\n');

    console.log('🌱 Starting seed process...\n');

    // Read questions file
    const filePath = path.join(__dirname, '../../data/it_submajor_questions.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);

    // Sync database
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced\n');

    // Create Level 2 only (since Level 1 is skipped - default to IT major)
    console.log('📊 Creating level...');
    await db.Level.create({
      id: 2,
      name: 'IT Specialization',
      description: 'Questions to determine your IT specialization'
    });
    console.log('✅ Level created\n');

    // Create IT major
    console.log('🎓 Creating IT major...');
    const itMajor = await db.Major.create({
      id: 1,
      name: 'Information Technology',
      description: 'Information Technology and Computer Science'
    });
    console.log('✅ IT major created\n');

    // Create 10 IT submajors (based on init.sql)
    console.log('📚 Creating IT submajors...');
    const submajors = [
      { code: 'CS', name: 'Computer Science', description: 'Algorithms, data structures, and computational theory' },
      { code: 'SE', name: 'Software Engineering', description: 'Software development, testing, and maintenance' },
      { code: 'IS', name: 'Information Systems', description: 'Business information analysis and management' },
      { code: 'NET', name: 'Computer Networks and Data Communication', description: 'Network design, management, and secure data transmission' },
      { code: 'CY', name: 'Cybersecurity', description: 'System security, encryption, and cyber threat prevention' },
      { code: 'AI', name: 'Artificial Intelligence', description: 'Machine learning, NLP, and intelligent robotics' },
      { code: 'DS', name: 'Data Science', description: 'Big data mining and analysis for decision support' },
      { code: 'GD', name: 'Graphic Design & Multimedia', description: 'Visual products like images, videos, and interfaces' },
      { code: 'EMB', name: 'Embedded Systems & Hardware', description: 'Microcontroller, sensor, and IoT device development' },
      { code: 'MOB', name: 'Mobile Application Development', description: 'Android and iOS application development' }
    ];

    const submajorMap = {};
    for (const sm of submajors) {
      const submajor = await db.SubMajor.create({
        name: sm.name,
        description: sm.description,
        majorId: itMajor.id
      });
      submajorMap[sm.code] = submajor;
      console.log(`  ✓ ${sm.name}`);
    }
    console.log('✅ Submajors created\n');

    // Seed questions
    console.log('📝 Creating questions:\n');
    let totalOptions = 0;

    for (const qData of questions) {
      const question = await db.Question.create({
        id: qData.id,
        text: qData.text,
        levelId: qData.levelId
      });

      // Create options
      for (const optData of qData.options) {
        await db.Option.create({
          text: optData.text,
          questionId: question.id,
          majorId: itMajor.id, // All options belong to IT major
          scoring: optData.scoring // Store submajor scoring as JSONB
        });
        
        totalOptions++;
      }

      console.log(`  ✓ Question ${question.id}: "${qData.text.substring(0, 60)}..."`);
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Major: 1 (Information Technology)`);
    console.log(`   - Submajors: ${submajors.length}`);
    console.log(`   - Level: 1 (IT Specialization only)`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Options: ${totalOptions}`);

    // Don't close connection when called from initDb
    // await db.sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    throw error; // Re-throw for caller to handle
  }
}

// Run directly if this file is executed (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedITSubmajorQuestions()
    .then(() => {
      console.log('\n✅ Standalone seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Standalone seed failed:', error);
      process.exit(1);
    });
}
