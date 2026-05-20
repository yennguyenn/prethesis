import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/models/index.js';
import { submitMajorQuizService } from '../src/services/quizService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper hàm để đọc file CSV đơn giản bằng module fs có sẵn
const readCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    let row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  return data;
};

// Chạy bài test đánh giá
const runEvaluation = async () => {
  try {
    console.log('--- BẮT ĐẦU ĐÁNH GIÁ THUẬT TOÁN SAW ---');
    // 1. Kết nối DB
    await db.sequelize.authenticate();
    console.log(' Đã kết nối Database.');

    // 2. Đọc file CSV
    const csvPath = path.join(__dirname, 'test_cases.csv');
    if (!fs.existsSync(csvPath)) {
      console.log(' Không tìm thấy file test_cases.csv! Hãy cạo template ở dòng dưới và lưu vào folder scripts!');
      process.exit(1);
    }

    const testCases = readCSV(csvPath);
    console.log(` Đã tải ${testCases.length} mẫu test case từ file CSV.`);

    let correctCountTop1 = 0;
    let correctCountTop3 = 0;
    const totalCases = testCases.length;

    // 3. Tiến hành chạy từng Case
    for (const [index, row] of testCases.entries()) {
      const expectedMajor = row['RealMajorCode']?.toUpperCase();
      const studentId = row['StudentId'] || `SV_${index + 1}`;
      
      // Tập hợp mảng câu trả lời. Định dạng cột trong CSV: Q1, Q2, Q3... chứa Option ID tương ứng
      const answers = [];
      for (const key of Object.keys(row)) {
        if (key.startsWith('Q')) {
          const questionId = parseInt(key.replace('Q', ''));
          const optionId = parseInt(row[key]);
          if (!isNaN(questionId) && !isNaN(optionId)) {
            answers.push({ questionId, optionId });
          }
        }
      }

      console.log(`\n Đang chấm điểm cho [${studentId}]... Ngành thực tế mong muốn: [${expectedMajor}]`);

      // Mock user dummy
      const mockUser = { id: 1 }; // Không bắt buộc lưu db thật nếu không muốn bị rác DB
      
      const result = await submitMajorQuizService(answers, mockUser);
      
      const topMajors = result.allScores.slice(0, 3).map(m => m.code);
      const top1Major = topMajors[0];

      console.log(`>> Hệ thống dự đoán Top 3: [${topMajors.join(', ')}]`);

      let isHitTop1 = top1Major === expectedMajor;
      let isHitTop3 = topMajors.includes(expectedMajor);

      if (isHitTop1) correctCountTop1++;
      if (isHitTop3) correctCountTop3++;

      if (isHitTop3) {
        console.log(` KIỂM THỬ ĐÚNG: Nằm trong Top 3`);
      } else {
        console.log(` KIỂM THỬ SAI: Thuật toán dự đoán lệch lạc!`);
      }
    }

    // 4. Báo cáo thống kê
    console.log('\n======================================================');
    console.log('               BÁO CÁO KẾT QUẢ ĐÁNH GIÁ               ');
    console.log('======================================================');
    console.log(`- Tổng số Test Case đã chạy : ${totalCases}`);
    console.log(`- Độ chính xác tuyệt đối (Top 1): ${((correctCountTop1 / totalCases) * 100).toFixed(2)}%`);
    console.log(`- Độ chính xác chấp nhận (Top 3): ${((correctCountTop3 / totalCases) * 100).toFixed(2)}%`);
    console.log('------------------------------------------------------');

    if (correctCountTop3 / totalCases >= 0.75) {
      console.log('\n KẾT LUẬN: THUẬT TOÁN ĐÃ ĐƯỢC TUNING RẤT TỐT!');
    } else {
      console.log('\n KẾT LUẬN: ĐỘ CHÍNH XÁC QUÁ THẤP. HÃY KIỂM TRA LẠI');
    }

  } catch (error) {
    console.error('Lỗi quá trình kiểm thử:', error);
  } finally {
    process.exit(0);
  }
};

runEvaluation();
