import readline from 'readline';
import db from '../src/models/index.js';
import { evaluateShortAnswer } from '../src/services/geminiAiService.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function run() {
  try {
    console.log('--- TEST CÔNG CỤ CHẤM ĐIỂM TỰ LUẬN AI (ĐỘC LẬP) ---');
    await db.sequelize.authenticate();
    
    // Tìm các Option đại diện cho câu hỏi tự luận
    // Lấy danh sách ID câu hỏi tự luận trước
    const questions = await db.Question.findAll({ where: { question_type: 'text_autocomplete' } });
    if (questions.length === 0) {
      console.log('Không tìm thấy câu hỏi tự luận nào trong Database!');
      process.exit(1);
    }

    console.log('\nDanh sách các câu hỏi tự luận có sẵn trong DB:');
    questions.forEach((q, index) => {
      console.log(`${index + 1}. [Level ${q.level_id}] ${q.text.substring(0, 80)}...`);
    });

    const choiceStr = await askQuestion('\nChọn số thứ tự câu hỏi bạn muốn test: ');
    const choice = parseInt(choiceStr) - 1;
    
    if (isNaN(choice) || choice < 0 || choice >= questions.length) {
      console.log('Lựa chọn không hợp lệ.');
      process.exit(1);
    }

    const selectedQuestion = questions[choice];
    const questionText = selectedQuestion.text;

    // Tìm Option (đáp án chuẩn) của câu này
    const option = await db.Option.findOne({ where: { questionId: selectedQuestion.id } });
    const correctAnswer = option ? option.text : "(Không có đáp án chuẩn)";

    console.log(`\n==========================================`);
    console.log(`Câu hỏi: ${questionText}`);
    console.log(`Barem chấm điểm (Đáp án chuẩn): ${correctAnswer}`);
    console.log(`==========================================`);

    const studentAnswer = await askQuestion('\nĐóng vai sinh viên và nhập câu trả lời của bạn vào đây: ');

    console.log('\n⏳ Đang gửi cho Thầy giáo AI (Gemini) chấm điểm, vui lòng đợi...');
    
    const startTime = Date.now();
    const aiResult = await evaluateShortAnswer(questionText, correctAnswer, studentAnswer);
    const endTime = Date.now();

    console.log(`\n============== KẾT QUẢ (${((endTime - startTime)/1000).toFixed(2)} giây) ===================`);
    console.log(`[ĐIỂM SỐ AI] : ${aiResult.score} / 10`);
    console.log(`[NHẬN XÉT]   : ${aiResult.feedback}`);
    console.log(`=====================================================\n`);
    
  } catch (err) {
    console.error('Lỗi khi gọi AI:', err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

run();
