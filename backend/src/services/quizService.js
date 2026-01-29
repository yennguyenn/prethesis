import db from '../models/index.js';
import {
  getMajorsMeta,
  getSubToMajorCode,
  getCriteria,
  getQuestionToCriteriaMap,
  normalizeDecisionMatrix,
  calculateSAWScores
} from './quizSawHelpers.js';

export const getQuizService = async (level, majorCode) => {
  // ...existing logic from getQuiz...
  let levelId = Number(level);
  if (Number.isNaN(levelId)) {
    const levelRowByName = await db.Level.findOne({ where: { name: `Level ${level}` } });
    if (!levelRowByName) throw new Error('Level not found');
    levelId = levelRowByName.id;
  }

  let questions = await db.Question.findAll({
    where: { levelId },
    include: [{ model: db.Option }],
    order: [['id', 'ASC']],
  });

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
          if (scoring[majorCode] != null) return true;
          return Object.keys(scoring).some(k => subCodes.has(k));
        });
      });
    } catch (_) { /* ignore filtering errors */ }
  }

  return questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: (q.Options || []).map((o) => ({ id: o.id, text: o.text })),
  }));
};

export const submitQuizService = async (answers, user) => {
  // ...existing logic from submitQuiz...
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error('No answers submitted');
  }

  const submajors = await db.SubMajor.findAll({ attributes: ['id', 'code', 'name', 'description', 'studyGroup'] });
  const subMajorMeta = {};
  for (const s of submajors) {
    if (s.code) subMajorMeta[s.code] = { name: s.name, description: s.description, studyGroup: s.studyGroup };
  }

  const submajorScores = {};
  const invalidOptionIds = [];

  for (const a of answers) {
    const ansId = a?.optionId;
    if (!ansId) { invalidOptionIds.push(ansId); continue; }
    const option = await db.Option.findByPk(ansId);
    if (!option) { invalidOptionIds.push(ansId); continue; }
    const scoring = option.scoring || option.dataValues?.scoring || {};
    for (const [code, pts] of Object.entries(scoring)) {
      if (!subMajorMeta[code]) continue;
      const points = Number(pts) || 0;
      submajorScores[code] = (submajorScores[code] || 0) + points;
    }
  }

  if (invalidOptionIds.length > 0) {
    const err = new Error('Invalid optionId(s) provided');
    err.invalidOptionIds = invalidOptionIds;
    throw err;
  }

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

  let recommendedMajor = null;
  try {
    const it = await db.Major.findOne({ where: { code: 'IT' } });
    if (it) recommendedMajor = { code: it.code, name: it.name, description: it.description };
  } catch (_) { /* ignore */ }

  if (user && recommended) {
    try {
      await db.Submission.create({
        userId: user.id,
        majorCode: null,
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
    } catch (e) {
      // log error
    }
  }

  const recommendedSubmajor = recommended ? {
    code: recommended.code,
    name: recommended.name,
    description: recommended.description,
    studyGroup: subMajorMeta[recommended.code]?.studyGroup || null
  } : null;

  return {
    recommendedMajor,
    recommendedSubmajor,
    topScore,
    allScores,
    totalAnswered: answers.length,
    totalSubmajors: allScores.length
  };
};


// SAW (Simple Additive Weighting) implementation for major recommendation
export const submitMajorQuizService = async (answers, user) => {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error('No answers submitted');
  }

  // Step 1: Load meta
  const { majorMeta, majorIdToCode } = await getMajorsMeta();
  const subToMajorCode = await getSubToMajorCode(majorIdToCode);
  const CRITERIA = await getCriteria();
  const questionToCriteria = await getQuestionToCriteriaMap();

  // Step 2: Build decision matrix
  const decisionMatrix = {};
  const invalidOptionIds = [];
  for (const a of answers) {
    const optId = a?.optionId;
    const qId = a?.questionId;
    if (!optId || !qId) { invalidOptionIds.push(optId); continue; }
    const option = await db.Option.findByPk(optId);
    if (!option) { invalidOptionIds.push(optId); continue; }
    const scoring = option.scoring || option.dataValues?.scoring || {};
    for (const [code, pts] of Object.entries(scoring)) {
      let majorCode = null;
      if (majorMeta[code]) {
        majorCode = code;
      } else if (subToMajorCode[code]) {
        majorCode = subToMajorCode[code];
      } else {
        continue;
      }
      if (!decisionMatrix[majorCode]) decisionMatrix[majorCode] = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0 };
      const crit = questionToCriteria[qId] || CRITERIA[0]?.key || 'C1';
      decisionMatrix[majorCode][crit] += Number(pts) || 0;
    }
  }
  if (invalidOptionIds.length > 0) {
    const err = new Error('Invalid optionId(s) provided');
    err.invalidOptionIds = invalidOptionIds;
    throw err;
  }

  // Step 3: Normalize and calculate SAW
  const normalizedMatrix = normalizeDecisionMatrix(decisionMatrix, CRITERIA);
  const weights = { C1: 0.25, C2: 0.3, C3: 0.2, C4: 0.15, C5: 0.1 };
  const sawScores = calculateSAWScores(normalizedMatrix, CRITERIA, weights);

  // Step 4: Rank majors by SAW score
  const allScores = Object.entries(sawScores)
    .map(([code, score]) => ({
      code,
      name: majorMeta[code]?.name || code,
      description: majorMeta[code]?.description || null,
      score: Number(score.toFixed(4)),
      raw: decisionMatrix[code] || {},
      normalized: normalizedMatrix[code] || {},
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Threshold logic
  const threshold = 0.03;
  const first = allScores[0] || null;
  const second = allScores[1] || null;
  let recommended = null;
  let proceedToLevel2 = false;
  if (first && second && (first.score - second.score) >= threshold) {
    recommended = first;
    proceedToLevel2 = true;
  } else if (first && !second) {
    recommended = first;
    proceedToLevel2 = true;
  } else {
    recommended = null;
    proceedToLevel2 = false;
  }
  const topScore = recommended ? recommended.score : 0;

  let nextLevel = null;
  let branch = null;
  if (recommended?.code === 'ICT' || recommended?.code === 'IT') {
    nextLevel = 2;
    branch = 'IT';
  }

  let submissionId = null;
  if (user && recommended) {
    try {
      const submission = await db.Submission.create({
        userId: user.id,
        majorCode: recommended.code || null,
        majorName: recommended.name || null,
        subMajorCode: null,
        subMajorName: null,
        score: topScore,
        details: {
          decisionMatrix,
          normalizedMatrix,
          sawScores,
          recommendedMajor: recommended,
          allScores,
          totalAnswered: answers.length,
          weights,
          criteria: CRITERIA,
        }
      });
      submissionId = submission.id;
    } catch (e) {
      // log error
    }
  }

  return {
    recommendedMajor: recommended,
    topScore,
    allScores,
    totalAnswered: answers.length,
    totalMajors: allScores.length,
    saved: !!submissionId,
    submissionId,
    nextLevel,
    branch,
    proceedToLevel2,
    criteria: CRITERIA,
    weights,
    threshold,
  };
};
