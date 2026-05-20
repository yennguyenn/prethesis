import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/models/index.js';
import { submitMajorQuizService } from '../src/services/quizService.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"' && content[i + 1] === '"') { cell += '"'; i++; } 
    else if (char === '"') { inQuotes = !inQuotes; } 
    else if (char === ',' && !inQuotes) { row.push(cell.trim()); cell = ''; } 
    else if (char === '\n' && !inQuotes) {
      row.push(cell.trim());
      if (row.length > 0 || cell !== '') result.push(row);
      row = []; cell = '';
    } else if (char === '\r') {} 
    else { cell += char; }
  }
  if (cell !== '' || row.length > 0) { row.push(cell.trim()); result.push(row); }
  return result;
}

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function importDataToDB() {
  try {
    console.log('⏳ Tiến hành nhập dữ liệu vào cơ sở dữ liệu...');
    await db.sequelize.authenticate();

    // 1. Ánh xạ câu hỏi 
    const questions = await db.Question.findAll({
      where: { level_id: 1 },
      order: [['id', 'ASC']],
      include: [{ model: db.Option }]
    });

    const optionMap = {};
    const questionIds = []; 
    questions.forEach((q) => {
      questionIds.push(q.id);
      q.Options.forEach(opt => {
        optionMap[`${q.id}_${normalizeText(opt.text)}`] = opt.id;
      });
    });

    // 2. Đọc file raw_data.csv (Bản nguyên gốc tải từ Google Form)
    const rawPath = path.join(__dirname, 'raw_data.csv');
    if (!fs.existsSync(rawPath)) {
      console.error(`❌ Không tìm thấy file: ${rawPath}. Vui lòng bỏ file raw_data.csv vào thư mục scripts.`);
      process.exit(1);
    }
    const rawContent = fs.readFileSync(rawPath, 'utf8');
    const rows = parseCSV(rawContent);

    // Bỏ qua header
    let majorColIndex = 31; 
    let satisfactionColIndex = 32;
    let emailColIndex = -1;

    const headers = rows[0];
    headers.forEach((h, idx) => {
      const hn = normalizeText(h);
      if (hn.includes('theo học ngành nào')) majorColIndex = idx;
      if (hn.includes('hài lòng')) satisfactionColIndex = idx;
      if (hn.includes('email')) emailColIndex = idx;
    });

    let successCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 32) continue;

      const satisfyStatus = normalizeText(r[satisfactionColIndex]);
      
      // Chỉ giữ lại những sinh viên "Hài lòng" hoặc "Có rất hài lòng"
      if (!satisfyStatus.includes('hài lòng')) {
        continue;
      }

      const answers = [];
      let allOptionsMatched = true;

      for (let qIdx = 0; qIdx < 30; qIdx++) {
        const qId = questionIds[qIdx];
        const rawAnswerValue = normalizeText(r[qIdx + 1]); // Cột 1->30
        
        let optionIdFound = null;
        const exactKey = `${qId}_${rawAnswerValue}`;

        if (optionMap[exactKey]) {
            optionIdFound = optionMap[exactKey];
        } else {
             for (const [key, id] of Object.entries(optionMap)) {
                 if (key.startsWith(`${qId}_`) && (rawAnswerValue.includes(key.split('_')[1]) || key.split('_')[1].includes(rawAnswerValue))) {
                     optionIdFound = id;
                     break;
                 }
             }
        }
        
        if (optionIdFound) {
            answers.push({ questionId: qId, optionId: optionIdFound });
        } else {
            console.log(`⚠️ Thiếu đáp án Câu ${qIdx+1} tại Sinh viên số ${i}. Bỏ qua.`);
            allOptionsMatched = false;
            break;
        }
      }

      if (allOptionsMatched && answers.length === 30) {
        // Nạp vào dữ liệu thật (chấm SAW và tự động create Submission)
        let userEmail = `student_${i}@googleform.com`;
        if (emailColIndex !== -1 && r[emailColIndex]) {
          userEmail = r[emailColIndex].trim().toLowerCase();
        }

        let studentUser = await db.User.findOne({ where: { email: userEmail } });
        if (!studentUser) {
          const hashedPassword = await bcrypt.hash('123456', 10);
          studentUser = await db.User.create({
            name: `Học sinh ${i} (Google Form)`,
            email: userEmail,
            passwordHash: hashedPassword,
            role: 'user'
          });
        }

        await submitMajorQuizService(answers, studentUser);
        console.log(`✔️ Đã nạp thành công bài đánh giá của Học sinh ${i} vào Database.`);
        successCount++;
      }
    }
    
    console.log(`\n🎉 HOÀN TẤT! Nạp thành công ${successCount} dữ liệu từ file CSV vào Database.`);
    console.log(`Truy cập bằng phần Admin -> Responses (Kết quả) để xem các kết quả này.`);
    process.exit(0);

  } catch (err) {
    console.error('Lỗi quá trình nạp DB:', err);
    process.exit(1);
  }
}

importDataToDB();
