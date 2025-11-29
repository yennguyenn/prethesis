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
    const submajors = await db.SubMajor.findAll({ attributes: ['id', 'code', 'name', 'description', 'studyGroup'] });
    const subMajorMeta = {};
    for (const s of submajors) {
      if (s.code) subMajorMeta[s.code] = { name: s.name, description: s.description, studyGroup: s.studyGroup };
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

    // Level 2 is IT specialization; include recommended Major = IT for clarity
    let recommendedMajor = null;
    try {
      const it = await db.Major.findOne({ where: { code: 'IT' } });
      if (it) recommendedMajor = { code: it.code, name: it.name, description: it.description };
    } catch (_) { /* ignore */ }

    // Persist if user logged in
    let submissionId = null;
    if (req.user && recommended) {
      try {
        await db.Submission.create({
          userId: req.user.id,
          majorCode: null, // Level 2 specialization only
          majorName: null,
          subMajorCode: recommended.code || null,
          subMajorName: recommended.name || null,
          score: topScore,
          details: {
            submajorScores,
            recommendedSubmajor: recommended,
            allScores,
            totalAnswered: answers.length
          }
        });
        // Don't expose internal details beyond id for now
      } catch (e) {
        console.warn('[submitQuiz] Failed to persist submission:', e.message);
      }
    }

    const recommendedSubmajor = recommended ? {
      code: recommended.code,
      name: recommended.name,
      description: recommended.description,
      studyGroup: subMajorMeta[recommended.code]?.studyGroup || null
    } : null;

    res.json({
      message: 'Quiz submitted successfully',
      recommendedMajor,
      recommendedSubmajor,
      topScore,
      allScores,
      totalAnswered: answers.length,
      totalSubmajors: allScores.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Submit Level 1 Major Orientation quiz answers.
 * Similar to submitQuiz but aggregates scores by Major codes (from Option.scoring).
 */
export const submitMajorQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted' });
    }

    // Load majors (code->meta)
    const majors = await db.Major.findAll({ attributes: ['id', 'code', 'name', 'description'] });
    const majorMeta = {};
    for (const m of majors) {
      if (m.code) majorMeta[m.code] = { name: m.name, description: m.description };
    }

    const majorScores = {};
    const invalidOptionIds = [];
    for (const a of answers) {
      const optId = a?.optionId;
      if (!optId) { invalidOptionIds.push(optId); continue; }
      const option = await db.Option.findByPk(optId);
      if (!option) { invalidOptionIds.push(optId); continue; }
      const scoring = option.scoring || option.dataValues?.scoring || {};
      for (const [code, pts] of Object.entries(scoring)) {
        if (!majorMeta[code]) continue; // ignore codes not in majors list
        const points = Number(pts) || 0;
        majorScores[code] = (majorScores[code] || 0) + points;
      }
    }

    if (invalidOptionIds.length > 0) {
      return res.status(400).json({ message: 'Invalid optionId(s) provided', invalidOptionIds });
    }

    const allScores = Object.entries(majorScores)
      .map(([code, score]) => ({
        code,
        name: majorMeta[code]?.name || code,
        description: majorMeta[code]?.description || null,
        score
      }))
      .sort((a, b) => b.score - a.score);

    const recommended = allScores[0] || null;
    const topScore = recommended ? recommended.score : 0;

    // Determine next level branching (example: ICT -> Level 2 IT submajors)
    let nextLevel = null;
    let branch = null;
    if (recommended?.code === 'ICT') {
      nextLevel = 2; // IT specialization level
      branch = 'IT';
    }

    // Persist if user logged in
    let submissionId = null;
    if (req.user && recommended) {
      try {
        const submission = await db.Submission.create({
          userId: req.user.id,
            majorCode: recommended.code || null,
            majorName: recommended.name || null,
            subMajorCode: null,
            subMajorName: null,
            score: topScore,
            details: {
              majorScores,
              recommendedMajor: recommended,
              allScores,
              totalAnswered: answers.length
            }
        });
        submissionId = submission.id;
      } catch (e) {
        console.warn('[submitMajorQuiz] Failed to persist submission:', e.message);
      }
    }

    res.json({
      message: 'Major quiz submitted successfully',
      recommendedMajor: recommended,
      topScore,
      allScores,
      totalAnswered: answers.length,
      totalMajors: allScores.length,
      saved: !!submissionId,
      submissionId,
      nextLevel,
      branch
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
