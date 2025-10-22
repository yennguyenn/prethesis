import db from '../models/index.js';

/**
 * trả về level list
 */
async function getLevels(req,res) {
  const levels = await db.Level.findAll();
  res.json(levels);
}

async function getQuestionsByLevel(req,res) {
  const levelId = req.params.levelId;
  const questions = await db.Question.findAll({
    where: { levelId },
    include: [{ model: db.Option, attributes: ['id','text'] }]
  });
  res.json(questions);
}

async function listMajors(req,res) {
  const majors = await db.Major.findAll();
  res.json(majors);
}

/**
 * submitAnswers: compute scores per major based on selected options' scoring maps
 * body: { answers: [ { questionId, selectedOptionId } ] }
 */
async function submitAnswers(req,res) {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ message: 'Bad payload' });
    // gather majors from DB
    const majors = await db.Major.findAll();
    const majorMap = {};
    majors.forEach(m => majorMap[m.code] = { id: m.id, name: m.name, score: 0 });

    // for storing responses
    const responseRecords = [];

    for (const a of answers) {
      const option = await db.Option.findByPk(a.selectedOptionId);
      if (!option) continue;
      const scoring = option.scoring || {};
      // scoring keys might be major code or id; here we assume code
      for (const key of Object.keys(scoring)) {
        if (!majorMap[key]) {
          // if key is an id, try match by id
          const found = majors.find(m => m.id === key);
          if (found) {
            majorMap[found.code].score += Number(scoring[key]) || 0;
          } else {
            // unknown key: ignore
          }
        } else {
          majorMap[key].score += Number(scoring[key]) || 0;
        }
      }

      // save response
      responseRecords.push({
        userId: req.user ? req.user.id : null,
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
        scoringSnapshot: option.scoring
      });
    }

    // persist responses (bulk create)
    await db.Response.bulkCreate(responseRecords);

    // convert majorMap to sorted array
    const results = Object.values(majorMap).sort((a,b) => b.score - a.score);

    // compute percentages (simple normalization)
    const maxScore = results.length ? results[0].score : 0;
    const normalized = results.map(r => ({
      id: r.id,
      name: r.name,
      score: r.score,
      confidence: maxScore ? Math.round((r.score / maxScore) * 100) : 0
    }));

    res.json({ results: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export default { getLevels, getQuestionsByLevel, listMajors, submitAnswers };
