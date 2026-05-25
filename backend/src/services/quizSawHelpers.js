// Helper functions for submitMajorQuizService (SAW method)
import db from '../models/index.js';
import { evaluateShortAnswer } from './geminiAiService.js';

// Sử dụng bảng Option làm nơi lưu trữ đáp án chuẩn và phân bổ điểm cho câu tự luận.
// Với mỗi câu hỏi tự luận, Admin chỉ cần tạo ĐÚNG 1 Option.
// - Option.text: Chứa đáp án mẫu (những ý chính cần có).
// - Option.scoring: Chứa phân bổ điểm cho các ngành (Ví dụ: {"CIT": 5, "IS": 3}).

export async function scoreSubjectiveAnswer(level, questionId, answerText) {
  if (!answerText || !questionId) return {};

  // Tìm Option duy nhất của câu hỏi tự luận này
  const option = await db.Option.findOne({ where: { questionId } });
  
  if (!option) {
    console.warn(`[AI Grading] Không tìm thấy Option (đáp án chuẩn) cho câu hỏi tự luận ID: ${questionId}`);
    return {};
  }

  // Lấy Đáp án chuẩn và Cấu hình điểm tối đa từ Option
  const correctAnswerText = option.text || "";
  const baseScores = option.scoring || {};
  
  if (Object.keys(baseScores).length === 0) {
    console.warn(`[AI Grading] Option của câu hỏi ${questionId} chưa có cấu hình điểm (scoring).`);
    return {};
  }

  // Lấy nội dung câu hỏi để AI hiểu ngữ cảnh
  let questionText = `Câu hỏi tự luận (ID: ${questionId})`;
  try {
    const q = await db.Question.findByPk(questionId);
    if (q && q.text) questionText = q.text;
  } catch (e) {}

  const correctAnswer = `Đáp án chuẩn lý tưởng cần chứa các ý sau: ${correctAnswerText}`;
  const scores = {};

  try {
    // Gọi Gemini AI chấm điểm (trả về thang 10)
    const aiResult = await evaluateShortAnswer(questionText, correctAnswer, answerText);
    const ratio = aiResult.score / 10.0;
    
    console.log(`[AI Grading] Q:${questionId} | Điểm AI: ${aiResult.score}/10 | Tỷ lệ: ${ratio} | Feedback: ${aiResult.feedback}`);

    // Phân bổ điểm cho các ngành theo tỷ lệ
    // Nếu AI cho 8/10 -> ratio = 0.8 -> Điểm ngành CIT = 5 * 0.8 = 4
    for (const [code, pts] of Object.entries(baseScores)) {
      scores[code] = (Number(pts) || 0) * ratio;
    }
  } catch (error) {
    console.error(`[AI Grading Error] Q:${questionId} | Lỗi chấm điểm AI:`, error.message);
    // Nếu lỗi gọi API, hệ thống đành chịu trả về 0 điểm vì không có fallback.
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
      'SELECT code, name, description FROM criteria WHERE level_id = :levelId ORDER BY code',
      { replacements: { levelId }, type: db.Sequelize.QueryTypes.SELECT }
    );
  } catch (err) {
    // Nếu bảng chưa có level_id thì fallback
    try {
      criteriaRows = await db.sequelize.query(
        'SELECT code, name, description FROM criteria WHERE code LIKE :pattern ORDER BY code',
        { replacements: { pattern: codePattern }, type: db.Sequelize.QueryTypes.SELECT }
      );
    } catch (_) {
      criteriaRows = [];
    }
  }

  return criteriaRows.map(row => ({
    key: row.code,
    label: row.name,
    description: row.description,
    weight: 1,
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
