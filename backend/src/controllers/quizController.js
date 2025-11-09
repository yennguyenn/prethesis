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

    // load majors and submajors to understand codes
    const majors = await db.Major.findAll({ attributes: ['id', 'code', 'name'] });
    const submajors = await db.SubMajor.findAll({ attributes: ['id', 'code', 'name'] });
    const majorCodes = new Set(majors.map((m) => m.code));
    const subMajorCodes = new Set(submajors.map((s) => s.code));

    const majorScores = {};
    const submajorScores = {};
    const otherScores = {};
    const invalidOptionIds = [];

    for (const a of answers) {
      const ansId = a?.optionId;
      if (!ansId) {
        invalidOptionIds.push(ansId);
        continue;
      }
      const option = await db.Option.findByPk(ansId);
      if (!option) {
        invalidOptionIds.push(ansId);
        continue;
      }

      const scoring = option.scoring || option.dataValues?.scoring || {};
      for (const [key, val] of Object.entries(scoring)) {
        const points = Number(val) || 0;
        if (majorCodes.has(key)) {
          majorScores[key] = (majorScores[key] || 0) + points;
        } else if (subMajorCodes.has(key)) {
          submajorScores[key] = (submajorScores[key] || 0) + points;
        } else {
          otherScores[key] = (otherScores[key] || 0) + points;
        }
      }
    }

    if (invalidOptionIds.length > 0) {
      return res.status(400).json({ message: 'Invalid optionId(s) provided', invalidOptionIds });
    }

    const topMajor = Object.entries(majorScores).sort((a, b) => b[1] - a[1])[0] || null;
    const topSubmajor = Object.entries(submajorScores).sort((a, b) => b[1] - a[1])[0] || null;

    // Build code -> name maps for majors and submajors
  const majorNameMap = {};
  for (const m of majors) { if (m.code) majorNameMap[m.code] = m.name; }
  const subMajorNameMap = {};
  for (const s of submajors) { if (s.code) subMajorNameMap[s.code] = s.name; }

    res.json({
      message: 'Quiz submitted successfully',
      majorScores,
      submajorScores,
      otherScores,
      majorNames: majorNameMap,
      subMajorNames: subMajorNameMap,
      recommendedMajor: topMajor ? { code: topMajor[0], name: majorNameMap[topMajor[0]] || null, score: topMajor[1] } : null,
      recommendedSubmajor: topSubmajor ? { code: topSubmajor[0], name: subMajorNameMap[topSubmajor[0]] || null, score: topSubmajor[1] } : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
