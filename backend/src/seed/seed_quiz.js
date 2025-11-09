import fs from 'fs';
import path from 'path';
import db from '../models/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
  const filePath = path.join(__dirname, '../../sample_questions.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);

    await db.sequelize.sync({ alter: true });

    // Ensure majors and submajors from scoring keys exist (simple pass)
    const majorMap = {}; // code -> { code, name }
    const submajorMap = {}; // code -> { code, name, majorCode }

    // Helper map from submajor names (in sample_questions.json) to codes
    const nameToCode = {
      'Software Engineering': 'SE',
      'Computer Science': 'CS',
      'UI/UX Design': 'UI',
      'Information Systems': 'IS',
      'Data Science & Analytics': 'DS',
      'Cyber Security': 'CY',
      'Network & System Administration': 'NET',
      'IoT & Embedded Systems': 'IOT',
      'Computer Engineering': 'CE',
      'Robotics & Automation': 'ROB',
      'Artificial Intelligence & Machine Learning': 'AI',
    };

    // Build reverse map: code -> readable name
    const codeToName = Object.fromEntries(
      Object.entries(nameToCode).map(([name, code]) => [code, name])
    );

    // Pre-populate majorMap with these 11 majors to ensure they exist even if absent in some scoring
    for (const [name, code] of Object.entries(nameToCode)) {
      majorMap[code] = { code, name };
    }

    for (const q of questions) {
      for (const opt of q.options) {
        // support both formats: scoring object OR majors array
        const scoring = opt.scoring || (Array.isArray(opt.majors)
          ? opt.majors.reduce((acc, name) => {
              const code = nameToCode[name] || name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
              acc[code] = (acc[code] || 0) + 1; // default weight = 1 per major name
              return acc;
            }, {})
          : {});

        for (const key of Object.keys(scoring)) {
          if (key.includes('_')) {
            const parts = key.split('_');
            const majorCode = parts[0];
            submajorMap[key] = { code: key, name: key, majorCode };
            majorMap[majorCode] = majorMap[majorCode] || { code: majorCode, name: codeToName[majorCode] || majorCode };
          } else {
            majorMap[key] = majorMap[key] || { code: key, name: codeToName[key] || key };
          }
        }

        // Persist the normalized scoring back to can reuse below
        opt.__normalizedScoring = scoring;
      }
    }

    // create majors
    const createdMajors = {};
    for (const m of Object.values(majorMap)) {
      const [maj] = await db.Major.findOrCreate({ where: { code: m.code }, defaults: { name: m.name, description: m.name } });
      createdMajors[m.code] = maj;
    }

    // create submajors
    for (const s of Object.values(submajorMap)) {
      const parent = createdMajors[s.majorCode];
      const where = { code: s.code };
      const defaults = { name: s.name, majorId: parent ? parent.id : null };
      await db.SubMajor.findOrCreate({ where, defaults });
    }

    // ensure Levels exist and map numeric level -> levelId
    const uniqueLevels = Array.from(new Set(questions.map((q) => q.level)));
    const levelIdMap = {};
    for (const lv of uniqueLevels) {
      const [lvl] = await db.Level.findOrCreate({ where: { name: `Level ${lv}` }, defaults: { name: `Level ${lv}` } });
      levelIdMap[lv] = lvl.id;
    }

    // create questions/options
    for (const q of questions) {
      const question = await db.Question.create({ text: q.question, levelId: levelIdMap[q.level] });

      for (const opt of q.options) {
        const scoring = opt.__normalizedScoring || opt.scoring || (Array.isArray(opt.majors) ? {} : {});
        await db.Option.create({ questionId: question.id, text: opt.text, scoring });
      }
    }

  console.log('Imported quiz questions successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error importing quiz questions:', err);
    process.exit(1);
  }
})();
