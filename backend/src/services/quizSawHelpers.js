// Helper functions for submitMajorQuizService (SAW method)
import db from '../models/index.js';

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

export async function getCriteria() {
  const criteriaRows = await db.sequelize.query(
    'SELECT code, name, description FROM criteria ORDER BY code',
    { type: db.Sequelize.QueryTypes.SELECT }
  );
  return criteriaRows.map(row => ({ key: row.code, label: row.name, description: row.description }));
}

export async function getQuestionToCriteriaMap() {
  const mappingRows = await db.sequelize.query(
    'SELECT question_id, criteria_code FROM question_criteria_map',
    { type: db.Sequelize.QueryTypes.SELECT }
  );
  const questionToCriteria = {};
  for (const row of mappingRows) {
    questionToCriteria[row.question_id] = row.criteria_code;
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
