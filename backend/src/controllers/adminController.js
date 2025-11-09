import db from '../models/index.js';

async function createMajor(req,res) {
  try {
    const { code, name, description } = req.body;
    const m = await db.Major.create({ code, name, description });
    res.json(m);
  } catch (err){ res.status(500).json({ error: err.message }); }
};
async function listMajors(req,res) {
  const majors = await db.Major.findAll();
  res.json(majors);
}

async function createQuestion(req,res) {
  
  try {
    const { text, level, options } = req.body;
    if (!text || !level || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: text, level, options[]' });
    }
    const lvl = Number(level) || 1;
    const [levelRow] = await db.Level.findOrCreate({ where: { name: `Level ${lvl}` }, defaults: { name: `Level ${lvl}` } });
    const q = await db.Question.create({ text, levelId: levelRow.id });
    for (const opt of options) {
      const scoring = opt.scoring || {};
      await db.Option.create({ text: opt.text, scoring, questionId: q.id });
    }
    const qFull = await db.Question.findByPk(q.id, { include: db.Option });
    res.json(qFull);
  } catch (err){ res.status(500).json({ error: err.message }); }
}

async function importQuestionsFromJson(req,res) {
  // accept { questions: [...] } JSON for bulk import
  try {
    const { questions } = req.body;
    for (const qq of questions) {
      const lvl = Number(qq.level) || 1;
      const [levelRow] = await db.Level.findOrCreate({ where: { name: `Level ${lvl}` }, defaults: { name: `Level ${lvl}` } });
      const q = await db.Question.create({ text: qq.text, levelId: levelRow.id });
      if (!Array.isArray(qq.options)) continue;
      for (const op of qq.options) {
        const scoring = op.scoring || {};
        await db.Option.create({ text: op.text, scoring, questionId: q.id });
      }
    }
    res.json({ message: 'imported', count: questions.length });
  } catch (err){ res.status(500).json({ error: err.message }); }
};

export default { createMajor, listMajors, createQuestion, importQuestionsFromJson };
