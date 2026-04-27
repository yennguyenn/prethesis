import db from '../models/index.js';
import {
  getMajorsMeta,
  getSubToMajorCode,
  getCriteria,
  getQuestionToCriteriaMap,
  normalizeDecisionMatrix,
  calculateSAWScores,
  scoreSubjectiveAnswer
} from './quizSawHelpers.js';

const BASE_SAW_WEIGHTS = { C1: 0.25, C2: 0.3, C3: 0.2, C4: 0.15, C5: 0.1 };
const LEVEL2_ALLOWED_CODES = ['CIT', 'IT', 'ICT'];

const buildEmptyScores = (CRITERIA) => {
  if (!Array.isArray(CRITERIA) || CRITERIA.length === 0) {
    return { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0 };
  }
  return CRITERIA.reduce((acc, crit) => {
    acc[crit.key] = 0;
    return acc;
  }, {});
};

const getWeightsForCriteria = (CRITERIA) => {
  if (!Array.isArray(CRITERIA) || CRITERIA.length === 0) return { ...BASE_SAW_WEIGHTS };

  const weightsFromDb = CRITERIA.map(c => ({ key: c.key, weight: Number(c.weight) })).filter(c => c.weight > 0);
  const totalDbWeight = weightsFromDb.reduce((sum, c) => sum + c.weight, 0);

  if (totalDbWeight > 0) {
    // Normalize DB weights to sum = 1
    return weightsFromDb.reduce((acc, c) => {
      acc[c.key] = c.weight / totalDbWeight;
      return acc;
    }, {});
  }

  const defaultWeight = 1 / CRITERIA.length;
  return CRITERIA.reduce((acc, crit) => {
    acc[crit.key] = BASE_SAW_WEIGHTS[crit.key] ?? defaultWeight;
    return acc;
  }, {});
};

export const getQuizService = async (level, majorCode) => {
  let levelId = Number(level);
  if (Number.isNaN(levelId)) {
    const levelRowByName = await db.Level.findOne({ where: { name: `Level ${level}` } });
    if (!levelRowByName) throw new Error('Level not found');
    levelId = levelRowByName.id;
  }

  const normalizedMajorCode = majorCode ? String(majorCode).toUpperCase() : null;

  // Helper: fetch questions by raw id list with their options
  const fetchByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const options = await db.Option.findAll({
      where: { questionId: ids },
      order: [['id', 'ASC']],
    });
    const optionsByQuestionId = {};
    for (const o of options) {
      const qId = o.questionId;
      if (!optionsByQuestionId[qId]) optionsByQuestionId[qId] = [];
      optionsByQuestionId[qId].push({ id: o.id, text: o.text });
    }
    return ids.map(id => ({ id, options: optionsByQuestionId[id] || [] }));
  };

  let whereClause = { level_id: levelId };
  if (levelId === 2 && normalizedMajorCode) {
    whereClause.major_code = normalizedMajorCode;
  }

  // Primary: query by level_id column (model uses snake_case field)
  let questions = await db.Question.findAll({
    where: whereClause,
    include: [{ model: db.Option }],
    order: [['id', 'ASC']],
    limit: levelId === 2 ? 50 : 30,
  });

  if (questions && questions.length > 0) {
    return questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: (q.Options || []).map((o) => ({ id: o.id, text: o.text })),
    }));
  }

  const skipFallbackForMajor = levelId === 2 && normalizedMajorCode && !LEVEL2_ALLOWED_CODES.includes(normalizedMajorCode);

  if (skipFallbackForMajor) {
    const err = new Error('Level 2 question bank is not available for this major');
    err.status = 404;
    throw err;
  }

  // Fallback A: raw SQL with level_id
  let questionRows = [];
  try {
    questionRows = await db.sequelize.query(
      'SELECT id, text FROM questions WHERE level_id = :levelId ORDER BY id ASC LIMIT 30',
      { replacements: { levelId }, type: db.Sequelize.QueryTypes.SELECT }
    );
  } catch (_) { /* ignore */ }

  if (questionRows && questionRows.length > 0) {
    const byId = await fetchByIds(questionRows.map(q => q.id));
    const optMap = Object.fromEntries(byId.map(r => [r.id, r.options]));
    return questionRows.map(q => ({ id: q.id, text: q.text, options: optMap[q.id] || [] }));
  }

  // Fallback B: when requesting Level 2 but no level_id=2 rows exist,
  // serve the second batch of level_id=1 questions (Q31-Q60) which are
  // the CIT / IT-specialisation questions.
  if (levelId === 2) {
    try {
      questionRows = await db.sequelize.query(
        'SELECT id, text FROM questions WHERE level_id = 1 ORDER BY id ASC LIMIT 30 OFFSET 30',
        { type: db.Sequelize.QueryTypes.SELECT }
      );
    } catch (_) { /* ignore */ }

    if (questionRows && questionRows.length > 0) {
      const byId = await fetchByIds(questionRows.map(q => q.id));
      const optMap = Object.fromEntries(byId.map(r => [r.id, r.options]));
      return questionRows.map(q => ({ id: q.id, text: q.text, options: optMap[q.id] || [] }));
    }
  }

  return [];
};

export const submitQuizService = async (answers, user) => {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error('No answers submitted');
  }
  const { majorMeta, majorIdToCode } = await getMajorsMeta();
  const submajors = await db.SubMajor.findAll({ attributes: ['id', 'code', 'name', 'description', 'studyGroup', 'majorId'] });
  const subMajorMeta = {};
  const subToMajorCode = {};
  for (const s of submajors) {
    if (s.code) subMajorMeta[s.code] = { name: s.name, description: s.description, studyGroup: s.studyGroup };
    if (s.code && s.majorId) {
      const parentCode = majorIdToCode[s.majorId];
      if (parentCode) subToMajorCode[s.code] = parentCode;
    }
  }

  const CRITERIA = await getCriteria(2);  // Level 2: dùng CCIT1-CCIT4
  const questionToCriteria = await getQuestionToCriteriaMap();
  const emptyScoresTemplate = buildEmptyScores(CRITERIA);

  const decisionMatrix = {};
  const invalidOptionIds = [];

  for (const a of answers) {
    const optId = a?.optionId;
    const freeText = a?.text;
    const qId = a?.questionId;
    if (!qId) { invalidOptionIds.push(optId); continue; }
    const { code: mappedCode, weight: mappedWeight } = questionToCriteria[qId] || {};
    const critKey = mappedCode || CRITERIA[0]?.key || 'C1';
    const critWeight = Number(mappedWeight) || 1;

    if (optId) {
      const option = await db.Option.findByPk(optId);
      if (!option) { invalidOptionIds.push(optId); continue; }
      const scoring = option.scoring || option.dataValues?.scoring || {};
      for (const [code, pts] of Object.entries(scoring)) {
        if (!subMajorMeta[code]) continue;
        if (!decisionMatrix[code]) decisionMatrix[code] = { ...emptyScoresTemplate };
        decisionMatrix[code][critKey] += (Number(pts) || 0) * critWeight;
      }
    } else if (freeText) {
      const keywordScores = await scoreSubjectiveAnswer(2, qId, freeText);
      for (const [code, pts] of Object.entries(keywordScores)) {
        if (!subMajorMeta[code]) continue;
        if (!decisionMatrix[code]) decisionMatrix[code] = { ...emptyScoresTemplate };
        decisionMatrix[code][critKey] += (Number(pts) || 0) * critWeight;
      }
    } else {
      invalidOptionIds.push(optId);
    }
  }

  if (invalidOptionIds.length > 0) {
    const err = new Error('Invalid optionId(s) provided');
    err.invalidOptionIds = invalidOptionIds;
    throw err;
  }

  const normalizedMatrix = normalizeDecisionMatrix(decisionMatrix, CRITERIA);
  const weights = getWeightsForCriteria(CRITERIA);
  const sawScores = calculateSAWScores(normalizedMatrix, CRITERIA, weights);

  const allScores = Object.entries(sawScores)
    .map(([code, score]) => {
      const rawValues = Object.values(decisionMatrix[code] || {});
      const totalPoints = rawValues.reduce((sum, v) => sum + (Number(v) || 0), 0);
      return {
        code,
        name: subMajorMeta[code]?.name || code,
        description: subMajorMeta[code]?.description || null,
        studyGroup: subMajorMeta[code]?.studyGroup || null,
        score: Number(score.toFixed(4)),
        percentage: Number((score * 100).toFixed(2)),
        totalPoints: Number(totalPoints.toFixed(2)),
        raw: decisionMatrix[code] || {},
        normalized: normalizedMatrix[code] || {},
      };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const recommended = allScores[0] || null;
  const topScore = recommended ? recommended.score : 0;

  let recommendedMajor = null;
  if (recommended) {
    const parentMajorCode = subToMajorCode[recommended.code];
    if (parentMajorCode && majorMeta[parentMajorCode]) {
      recommendedMajor = {
        code: parentMajorCode,
        name: majorMeta[parentMajorCode]?.name,
        description: majorMeta[parentMajorCode]?.description,
      };
    }
  }
  if (!recommendedMajor) {
    try {
      const it = await db.Major.findOne({ where: { code: 'IT' } });
      if (it) recommendedMajor = { code: it.code, name: it.name, description: it.description };
    } catch (_) { /* ignore */ }
  }

  if (user && recommended) {
    try {
      await db.Submission.create({
        userId: user.id,
        majorCode: recommendedMajor?.code || null,
        majorName: recommendedMajor?.name || null,
        subMajorCode: recommended.code || null,
        subMajorName: recommended.name || null,
        score: topScore,
        percentage: recommended.percentage,
        totalPoints: recommended.totalPoints,
        details: {
          decisionMatrix,
          normalizedMatrix,
          sawScores,
          weights,
          criteria: CRITERIA,
          recommendedSubmajor: recommended,
          allScores,
          totalAnswered: answers.length,
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
    studyGroup: recommended.studyGroup || subMajorMeta[recommended.code]?.studyGroup || null
  } : null;

  return {
    recommendedMajor,
    recommendedSubmajor,
    topScore,
    allScores,
    totalAnswered: answers.length,
    totalSubmajors: allScores.length,
    weights,
    criteria: CRITERIA,
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
  const CRITERIA = await getCriteria(1);  // Level 1: dùng C1-C5
  const questionToCriteria = await getQuestionToCriteriaMap();
  const emptyScoresTemplate = buildEmptyScores(CRITERIA);

  // Step 2: Build decision matrix
  const decisionMatrix = {};
  const invalidOptionIds = [];
  for (const a of answers) {
    const optId = a?.optionId;
    const freeText = a?.text;
    const qId = a?.questionId;
    if (!qId) { invalidOptionIds.push(optId); continue; }
    let scoring = null;
    if (optId) {
      const option = await db.Option.findByPk(optId);
      if (!option) { invalidOptionIds.push(optId); continue; }
      scoring = option.scoring || option.dataValues?.scoring || {};
    } else if (freeText) {
      scoring = await scoreSubjectiveAnswer(1, qId, freeText);
    } else {
      invalidOptionIds.push(optId);
      continue;
    }

    const { code: mappedCode, weight: mappedWeight } = questionToCriteria[qId] || {};
    const crit = mappedCode || CRITERIA[0]?.key || 'C1';
    const critWeight = Number(mappedWeight) || 1;
    for (const [code, pts] of Object.entries(scoring || {})) {
      let majorCode = null;
      if (majorMeta[code]) {
        majorCode = code;
      } else if (subToMajorCode[code]) {
        majorCode = subToMajorCode[code];
      } else {
        continue;
      }
      if (!decisionMatrix[majorCode]) decisionMatrix[majorCode] = { ...emptyScoresTemplate };
      decisionMatrix[majorCode][crit] += (Number(pts) || 0) * critWeight;
    }
  }
  if (invalidOptionIds.length > 0) {
    const err = new Error('Invalid optionId(s) provided');
    err.invalidOptionIds = invalidOptionIds;
    throw err;
  }

  // Step 3: Normalize and calculate SAW
  const normalizedMatrix = normalizeDecisionMatrix(decisionMatrix, CRITERIA);
  const weights = getWeightsForCriteria(CRITERIA);
  const sawScores = calculateSAWScores(normalizedMatrix, CRITERIA, weights);

  // Step 4: Rank majors by SAW score
  const allScores = Object.entries(sawScores)
    .map(([code, score]) => {
      const rawValues = Object.values(decisionMatrix[code] || {});
      const totalPoints = rawValues.reduce((sum, v) => sum + (Number(v) || 0), 0);
      return {
        code,
        name: majorMeta[code]?.name || code,
        description: majorMeta[code]?.description || null,
        score: Number(score.toFixed(4)),
        percentage: Number((score * 100).toFixed(2)),
        totalPoints: Number(totalPoints.toFixed(2)),
        raw: decisionMatrix[code] || {},
        normalized: normalizedMatrix[code] || {},
      };
    })
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
        percentage: recommended.percentage,
        totalPoints: recommended.totalPoints,
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
