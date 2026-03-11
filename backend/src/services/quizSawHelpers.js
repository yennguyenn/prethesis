// Helper functions for submitMajorQuizService (SAW method)
import db from '../models/index.js';

// Subjective keyword rules are stored in the `keyword_rules` DB table.
// Use getKeywordRules(level, questionId) to fetch them at runtime.

export async function getKeywordRules(level, questionId) {
  const rows = await db.sequelize.query(
    'SELECT keywords, scores FROM keyword_rules WHERE level = :level AND question_id = :questionId',
    { replacements: { level, questionId }, type: db.Sequelize.QueryTypes.SELECT }
  );
  return rows; // [{ keywords: string[], scores: { SE: 3, ... } }]
}

export async function scoreSubjectiveAnswer(level, questionId, answerText) {
  if (!answerText || !questionId) return {};
  const rules = await getKeywordRules(level, questionId);
  if (!rules || rules.length === 0) return {};
  const text = String(answerText).toLowerCase();
  const scores = {};
  for (const rule of rules) {
    const kw = Array.isArray(rule.keywords) ? rule.keywords : [];
    const hit = kw.some(k => text.includes(String(k).toLowerCase()));
    if (!hit) continue;
    const ruleScores = rule.scores || {};
    for (const [code, pts] of Object.entries(ruleScores)) {
      scores[code] = (scores[code] || 0) + (Number(pts) || 0);
    }
  }
  return scores;
}

export async function getMajorsMeta() {
  const majors = await db.Major.findAll({ attributes: ['id', 'code', 'name', 'description'] });
  const majorMeta = {};
  const majorIdToCode = {};
  for (const m of majors) {
    const effectiveCode = m.code || `M${m.id}`;
    majorMeta[effectiveCode] = { name: m.name, description: m.description };
    majorIdToCode[m.id] = effectiveCode;
  }
  return { majorMeta, majorIdToCode };
}

export async function getSubToMajorCode(majorIdToCode) {
  const submajors = await db.SubMajor.findAll({ attributes: ['code', 'majorId'] });
  const subToMajorCode = {};
  for (const s of submajors) {
    const parentCode = majorIdToCode[s.majorId];
    if (s.code && parentCode) subToMajorCode[s.code] = parentCode;
  }
  return subToMajorCode;
}

export async function getCriteria(levelId = 1) {
  let criteriaRows;
  const codePattern = levelId === 2 ? 'CCIT%' : 'C_%';
  try {
    criteriaRows = await db.sequelize.query(
      'SELECT code, name, description, weight FROM criteria WHERE level_id = :levelId ORDER BY code',
      { replacements: { levelId }, type: db.Sequelize.QueryTypes.SELECT }
    );
  } catch (err) {
    // level_id column may not exist — filter by code prefix instead
    try {
      criteriaRows = await db.sequelize.query(
        'SELECT code, name, description, weight FROM criteria WHERE code LIKE :pattern ORDER BY code',
        { replacements: { pattern: codePattern }, type: db.Sequelize.QueryTypes.SELECT }
      );
    } catch (_) {
      // weight column also missing — select without it, still filter by prefix
      criteriaRows = await db.sequelize.query(
        'SELECT code, name, description FROM criteria WHERE code LIKE :pattern ORDER BY code',
        { replacements: { pattern: codePattern }, type: db.Sequelize.QueryTypes.SELECT }
      );
    }
  }

  return criteriaRows.map(row => ({
    key: row.code,
    label: row.name,
    description: row.description,
    weight: row.weight != null ? Number(row.weight) : null,
  }));
}

export async function getQuestionToCriteriaMap() {
  const mappingRows = await db.sequelize.query(
    'SELECT question_id, criteria_code, weight FROM question_criteria_map',
    { type: db.Sequelize.QueryTypes.SELECT }
  );
  const questionToCriteria = {};
  for (const row of mappingRows) {
    questionToCriteria[row.question_id] = {
      code: row.criteria_code,
      weight: row.weight != null ? Number(row.weight) : 1,
    };
  }
  return questionToCriteria;
}

export function buildDecisionMatrix(answers, majorMeta, subToMajorCode, questionToCriteria, CRITERIA) {
  const decisionMatrix = {};
  const invalidOptionIds = [];
  const criteriaKeys = CRITERIA.map(c => c.key);
  answers.forEach(a => {
    const optId = a?.optionId;
    const qId = a?.questionId;
    if (!optId || !qId) { invalidOptionIds.push(optId); return; }
    // Option lookup must be async in main function
    // Here, just structure for sync scoring
  });
  return { decisionMatrix, invalidOptionIds };
}

export function normalizeDecisionMatrix(decisionMatrix, CRITERIA) {
  const maxPerCriteria = {};
  for (const crit of CRITERIA) {
    let maxVal = 0;
    for (const m of Object.values(decisionMatrix)) {
      if ((m[crit.key] || 0) > maxVal) maxVal = m[crit.key] || 0;
    }
    maxPerCriteria[crit.key] = maxVal || 1;
  }
  const normalizedMatrix = {};
  for (const [majorCode, scores] of Object.entries(decisionMatrix)) {
    normalizedMatrix[majorCode] = {};
    for (const crit of CRITERIA) {
      normalizedMatrix[majorCode][crit.key] = (scores[crit.key] || 0) / maxPerCriteria[crit.key];
    }
  }
  return normalizedMatrix;
}

export function calculateSAWScores(normalizedMatrix, CRITERIA, weights) {
  const sawScores = {};
  for (const [majorCode, normScores] of Object.entries(normalizedMatrix)) {
    let S = 0;
    for (const crit of CRITERIA) {
      S += (weights[crit.key] || 0) * (normScores[crit.key] || 0);
    }
    sawScores[majorCode] = S;
  }
  return sawScores;
}
