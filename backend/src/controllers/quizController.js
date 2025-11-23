import db from '../models/index.js';

/**
 * Get questions for a given level (level id)
 */
export const getQuiz = async (req, res) => {
  try {
    const { level } = req.params;

    const questions = await db.Question.findAll({
      where: { levelId: level },
      include: [{ model: db.Option }],
      order: [['id', 'ASC']],
    });

    const payload = questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: (q.Options || []).map((o) => ({ id: o.id, text: o.text })),
    }));

    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Nhận kết quả trắc nghiệm và xác định chuyên ngành phù hợp
 */
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted' });
    }

    // Load submajors (specializations) and map code->meta
    const submajors = await db.SubMajor.findAll({ attributes: ['id', 'code', 'name', 'description'] });
    const subMajorMeta = {};
    for (const s of submajors) {
      if (s.code) subMajorMeta[s.code] = { name: s.name, description: s.description };
    }

    // Accumulate scores by submajor code from option.scoring JSON
    const submajorScores = {};
    const invalidOptionIds = [];

    for (const a of answers) {
      const ansId = a?.optionId;
      if (!ansId) { invalidOptionIds.push(ansId); continue; }
      const option = await db.Option.findByPk(ansId);
      if (!option) { invalidOptionIds.push(ansId); continue; }
      const scoring = option.scoring || option.dataValues?.scoring || {};
      for (const [code, pts] of Object.entries(scoring)) {
        const points = Number(pts) || 0;
        submajorScores[code] = (submajorScores[code] || 0) + points;
      }
    }

    if (invalidOptionIds.length > 0) {
      return res.status(400).json({ message: 'Invalid optionId(s) provided', invalidOptionIds });
    }

    // Build sorted scores array
    const allScores = Object.entries(submajorScores)
      .map(([code, score]) => ({
        code,
        name: subMajorMeta[code]?.name || code,
        description: subMajorMeta[code]?.description || null,
        score
      }))
      .sort((a, b) => b.score - a.score);

    const recommended = allScores[0] || null;
    const topScore = recommended ? recommended.score : 0;

    res.json({
      message: 'Quiz submitted successfully',
      recommended,
      topScore,
      allScores,
      totalAnswered: answers.length,
      totalSubmajors: allScores.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
