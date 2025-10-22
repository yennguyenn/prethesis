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
  /**
   expected body:
  {
    text: "Question text",
    levelId: 2,
    options: [
      { text: "A", scoring: { "CS":2, "AI":1 } },
      ...
    ]
  }
  */
  try {
    const { text, levelId, options } = req.body;
    const q = await db.Question.create({ text, levelId });
    for (const opt of options) {
      await db.Option.create({ text: opt.text, scoring: opt.scoring, questionId: q.id });
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
      const q = await db.Question.create({ text: qq.text, levelId: qq.levelId });
      for (const op of qq.options) {
        await db.Option.create({ text: op.text, scoring: op.scoring, questionId: q.id });
      }
    }
    res.json({ message: 'imported', count: questions.length });
  } catch (err){ res.status(500).json({ error: err.message }); }
};

export default { createMajor, listMajors, createQuestion, importQuestionsFromJson };
