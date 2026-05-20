import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/models/index.js';
import { submitMajorQuizService } from '../src/services/quizService.js';

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

async function evaluateRawData() {
  try {
    console.log('--- BẮT ĐẦU ĐÁNH GIÁ THUẬT TOÁN BẰNG DATA GOOGLE FORM (raw_data.csv) ---');
    await db.sequelize.authenticate();

    // 1. Ánh xạ câu hỏi và Options
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

    // 2. Lấy danh sách Ngành từ DB để so khớp
    const majors = await db.Major.findAll();
    const majorCodeToName = {};
    majors.forEach(m => {
      majorCodeToName[m.code] = normalizeText(m.name);
    });

    // 3. Đọc file raw_data.csv
    const rawPath = path.join(__dirname, 'raw_data.csv');
    if (!fs.existsSync(rawPath)) {
      console.error(`❌ Không tìm thấy file: ${rawPath}`);
      process.exit(1);
    }
    const rawContent = fs.readFileSync(rawPath, 'utf8');
    const rows = parseCSV(rawContent);

    let majorColIndex = 31; 
    let satisfactionColIndex = 32;

    const headers = rows[0];
    headers.forEach((h, idx) => {
      const hn = normalizeText(h);
      if (hn.includes('theo học ngành nào')) majorColIndex = idx;
      if (hn.includes('hài lòng')) satisfactionColIndex = idx;
    });

    let correctCountTop1 = 0;
    let correctCountTop3 = 0;
    let totalValidCases = 0;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 32) continue;

      const satisfyStatus = normalizeText(r[satisfactionColIndex]);
      
      // Chỉ giữ lại những sinh viên "Hài lòng" hoặc "Có rất hài lòng"
      if (!satisfyStatus.includes('hài lòng')) {
        continue;
      }

      const expectedMajorText = normalizeText(r[majorColIndex]);

      const answers = [];
      let allOptionsMatched = true;

      for (let qIdx = 0; qIdx < 30; qIdx++) {
        const qId = questionIds[qIdx];
        const rawAnswerValue = normalizeText(r[qIdx + 1]);
        
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
            allOptionsMatched = false;
            break;
        }
      }

      if (allOptionsMatched && answers.length === 30) {
        totalValidCases++;
        console.log(`\n Đang chấm điểm cho [Học sinh ${i}]...`);
        console.log(` > Ngành thực tế đang học (Hài lòng): [${expectedMajorText.toUpperCase()}]`);

        const mockUser = { id: 1 };
        const result = await submitMajorQuizService(answers, mockUser);
        
        const topMajors = result.allScores.slice(0, 3);
        const top1MajorName = majorCodeToName[topMajors[0].code] || '';
        const top3MajorNames = topMajors.map(m => majorCodeToName[m.code] || '');

        console.log(` >> Hệ thống dự đoán Top 3: [${top3MajorNames.map(n => n.toUpperCase()).join(', ')}]`);

        // So khớp text tương đối
        let isHitTop1 = top1MajorName.includes(expectedMajorText) || expectedMajorText.includes(top1MajorName);
        let isHitTop3 = false;
        
        for (const mName of top3MajorNames) {
           if (mName.includes(expectedMajorText) || expectedMajorText.includes(mName)) {
               isHitTop3 = true;
               break;
           }
        }

        if (isHitTop1) correctCountTop1++;
        if (isHitTop3) correctCountTop3++;

        if (isHitTop1) {
          console.log(` ✔️ KẾT QUẢ ĐÚNG (TOP 1)`);
        } else if (isHitTop3) {
          console.log(` ✔️ KẾT QUẢ CHẤP NHẬN ĐƯỢC (TOP 3)`);
        } else {
          console.log(` ❌ DỰ ĐOÁN SAI`);
        }
      }
    }
    
    console.log('\n======================================================');
    console.log('        BÁO CÁO ĐÁNH GIÁ TỪ DỮ LIỆU GOOGLE FORM       ');
    console.log('======================================================');
    console.log(`- Tổng số người đã tham gia đánh giá (loại trừ nhiễu): ${totalValidCases}`);
    if (totalValidCases > 0) {
      console.log(`- Độ chính xác tuyệt đối (Đoán trúng ngay Top 1): ${((correctCountTop1 / totalValidCases) * 100).toFixed(2)}%`);
      console.log(`- Độ chính xác tương đối (Đoán trúng trong Top 3): ${((correctCountTop3 / totalValidCases) * 100).toFixed(2)}%`);
    }
    console.log('------------------------------------------------------');
    process.exit(0);

  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
}

evaluateRawData();
