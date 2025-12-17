import db from '../models/index.js';

/**
 * Get questions for a given level (level id)
 */
export const getQuiz = async (req, res) => {
  try {
    const { level } = req.params;
    const { major: majorCode } = req.query;
    // Resolve target levelId
    // If a numeric level is provided, use it directly without requiring a Level row to exist.
    // This supports databases created manually in pgAdmin without seed for Levels.
    let levelId = Number(level);
    if (Number.isNaN(levelId)) {
      const levelRowByName = await db.Level.findOne({ where: { name: `Level ${level}` } });
      if (!levelRowByName) return res.status(404).json({ message: 'Level not found' });
      levelId = levelRowByName.id;
    }

    let questions = await db.Question.findAll({
      where: { levelId },
      include: [{ model: db.Option }],
      order: [['id', 'ASC']],
    });

    // Optional: for Level 2, filter by selected major code using option.scoring keys
    if (String(level) === '2' && majorCode) {
      try {
        const subList = await db.SubMajor.findAll({ where: {}, attributes: ['code', 'majorId'] });
        const majors = await db.Major.findAll({ attributes: ['id', 'code'] });
        const majorIdByCode = {}; majors.forEach(m => { if (m.code) majorIdByCode[m.code] = m.id; });
        const targetMajorId = majorIdByCode[majorCode] || null;
        const subCodes = new Set();
        subList.forEach(s => { if (s.majorId === targetMajorId && s.code) subCodes.add(s.code); });

        questions = questions.filter(q => {
          const opts = q.Options || [];
          return opts.some(o => {
            const scoring = o.scoring || o.dataValues?.scoring || {};
            // include if scoring contains the major code or any of its submajor codes
            if (scoring[majorCode] != null) return true;
            return Object.keys(scoring).some(k => subCodes.has(k));
          });
        });
      } catch (_) { /* ignore filtering errors, fallback to full set */ }
    }

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

    // Accumulate scores by submajor code from option.scoring JSON (ignore major-level codes)
    const submajorScores = {};
    const invalidOptionIds = [];

    for (const a of answers) {
      const ansId = a?.optionId;
      if (!ansId) { invalidOptionIds.push(ansId); continue; }
      const option = await db.Option.findByPk(ansId);
      if (!option) { invalidOptionIds.push(ansId); continue; }
      const scoring = option.scoring || option.dataValues?.scoring || {};
      for (const [code, pts] of Object.entries(scoring)) {
        if (!subMajorMeta[code]) continue; // only count submajor codes
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
    const majorIdToCode = {};
    for (const m of majors) {
      // Fallback code if user did not populate 'code' column
      const effectiveCode = m.code || `M${m.id}`;
      majorMeta[effectiveCode] = { name: m.name, description: m.description };
      majorIdToCode[m.id] = effectiveCode;
    }

    // Map submajor code -> parent major code (so L1 can aggregate even if data uses submajor keys)
    const submajors = await db.SubMajor.findAll({ attributes: ['code', 'majorId'] });
    const subToMajorCode = {};
    for (const s of submajors) {
      const parentCode = majorIdToCode[s.majorId];
      if (s.code && parentCode) subToMajorCode[s.code] = parentCode;
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
        // Resolve to a major code: prefer major codes; else map submajor->major; otherwise ignore
        let majorCode = null;
        if (majorMeta[code]) {
          majorCode = code;
        } else if (subToMajorCode[code]) {
          majorCode = subToMajorCode[code];
        } else {
          continue;
        }
        const points = Number(pts) || 0;
        majorScores[majorCode] = (majorScores[majorCode] || 0) + points;
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
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    const recommended = allScores[0] || null;
    const topScore = recommended ? recommended.score : 0;

    // Determine next level branching (example: IT -> Level 2 IT submajors)
    let nextLevel = null;
    let branch = null;
    if (recommended?.code === 'ICT' || recommended?.code === 'IT') {
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
