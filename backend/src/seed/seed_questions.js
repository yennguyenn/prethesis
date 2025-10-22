import fs from 'fs';
import path from 'path';
import db from '../models/index.js';
import { fileURLToPath } from 'url';

// Thiết lập __dirname vì ES Modules không có biến này
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    const filePath = path.join(__dirname, '../sample_questions.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);

    await db.sequelize.sync({ alter: true });

    for (const q of questions) {
      const question = await db.Question.create({
        text: q.question,
        levelId: q.level,
      });

      for (const opt of q.options) {
        await db.Option.create({
          questionId: question.id,
          text: opt.text,
          majors: opt.majors.join(', '),
        });
      }
    }

    console.log('✅ Imported questions successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing questions:', err);
    process.exit(1);
  }
})();
