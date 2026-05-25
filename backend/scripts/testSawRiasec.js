import db from '../src/models/index.js';
import { submitMajorQuizService } from '../src/services/quizService.js';

async function testSAW() {
  await db.sequelize.authenticate();

  // Giả lập sinh viên thích CNTT: 
  // - Trả lời đúng các câu trắc nghiệm đo lường Investigative (I) và Realistic (R)
  // - Trả lời 1 câu tự luận: "Tôi rất thích mày mò phần cứng máy tính và lập trình ứng dụng." (Câu này đang đo lường R và I)
  
  // 1. Lấy 3 câu hỏi trắc nghiệm thuộc nhóm I và R
  const optionsI = await db.Option.findAll({ 
      include: [{ model: db.Question, include: [{ model: db.QuestionCriteriaMap, where: { criteriaCode: 'I' } }] }],
      limit: 2 
  });
  const optionsR = await db.Option.findAll({ 
    include: [{ model: db.Question, include: [{ model: db.QuestionCriteriaMap, where: { criteriaCode: 'R' } }] }],
    limit: 2 
  });

  const answers = [];
  for (const o of optionsI) answers.push({ questionId: o.questionId, optionId: o.id });
  for (const o of optionsR) answers.push({ questionId: o.questionId, optionId: o.id });

  // 2. Trả lời câu tự luận số 1 (Đo lường R và I)
  const qSubj = await db.Question.findOne({ where: { question_type: 'text_autocomplete' } });
  if (qSubj) {
      answers.push({
          questionId: qSubj.id,
          text: "Tôi cực kỳ đam mê mày mò phần cứng, tôi thích lắp ráp thiết bị điện tử và lập trình."
      });
  }

  console.log("Đang giả lập nộp bài với Dữ liệu sinh viên...");
  try {
      const user = { id: 1 }; // dummy user
      const result = await submitMajorQuizService(answers, user);
      
      console.log("\n================ KẾT QUẢ ĐỊNH HƯỚNG ==================");
      if (result.recommendedMajor) {
        console.log("Ngành phù hợp nhất:", result.recommendedMajor.name, `(${result.recommendedMajor.code})`);
      } else {
        console.log("Ngành phù hợp nhất: KHÔNG VƯỢT QUA NGƯỠNG RÕ RÀNG (Khoảng cách Top 1 và 2 quá nhỏ)");
      }
      console.log("Top 3 Ngành:");
      result.allScores.slice(0, 3).forEach((s, idx) => {
          console.log(`${idx + 1}. ${s.name} (${s.code}) - Điểm SAW: ${s.score.toFixed(4)}`);
      });
      console.log("\nTrọng số học sinh (Weights - Tính cách cá nhân):", result.weights);
      console.log("======================================================");

  } catch (err) {
      console.error(err);
  } finally {
      process.exit(0);
  }
}

testSAW();
