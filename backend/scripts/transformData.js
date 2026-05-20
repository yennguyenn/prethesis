import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hàm đọc CSV xử lý được dấu phẩy và ngắt dòng bên trong dấu ngoặc kép ("")
function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"' && content[i + 1] === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(cell.trim());
      if (row.length > 0 || cell !== '') result.push(row);
      row = [];
      cell = '';
    } else if (char === '\r') {
      // Bỏ qua ký tự return
    } else {
      cell += char;
    }
  }
  
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }
  return result;
}

// Hàm chuẩn hóa chuỗi để so sánh (bỏ viết hoa, bỏ khoảng trắng thừa)
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function transformData() {
  try {
    console.log(' Đang kết nối Database để lấy dữ liệu ánh xạ (Mapping)...');
    await db.sequelize.authenticate();

    // 1. Lấy danh sách Ngành học
    const majors = await db.Major.findAll();
    const majorMap = {};
    majors.forEach(m => {
      majorMap[normalizeText(m.name)] = m.code;
    });

    // 2. Lấy danh sách Câu hỏi Level 1 và Đáp án
    const questions = await db.Question.findAll({
      where: { level_id: 1 },
      order: [['id', 'ASC']],
      include: [{ model: db.Option }]
    });

    // Tạo Map ánh xạ: ID Câu _ Nội dung đáp án -> ID Đáp án
    const optionMap = {};
    const questionIds = []; // 30 câu hỏi theo thứ tự đúng trong DB
    
    questions.forEach((q, index) => {
      questionIds.push(q.id);
      q.Options.forEach(opt => {
        const key = `${q.id}_${normalizeText(opt.text)}`;
        optionMap[key] = opt.id;
      });
    });

    console.log(` Đã tải ${majors.length} ngành và ${questionIds.length} câu hỏi Level 1 từ DB.`);

    // 3. Đọc dữ liệu thô
    const rawPath = path.join(__dirname, 'raw_data.csv');
    if (!fs.existsSync(rawPath)) {
      throw new Error(`Không tìm thấy file: ${rawPath}`);
    }

    const rawContent = fs.readFileSync(rawPath, 'utf8');
    const rows = parseCSV(rawContent);
    if (rows.length < 2) throw new Error('File CSV không có dữ liệu để chuyển đổi.');

    console.log(`⏳ Đã nạp file CSV thô với ${rows.length - 1} bản ghi (bỏ qua header). Đang xử lý...`);

    const extractedData = [];
    const headers = rows[0];

    // Xác định vị trí các cột quan trọng
    let majorColIndex = -1;
    let satisfactionColIndex = -1;
    // Cột timestamp (lúc điền form) thường ở index 0
    // Cột từ 1 -> 30 là đáp án của 30 câu
    
    headers.forEach((h, idx) => {
      const hn = normalizeText(h);
      if (hn.includes('theo học ngành nào')) majorColIndex = idx;
      if (hn.includes('hài lòng')) satisfactionColIndex = idx;
    });

    // Theo cấu trúc Google form thông thường (cột 0 là Dấu thời gian)
    // Câu 1 -> 30 sẽ ở cột 1 đến 30
    if (majorColIndex === -1) majorColIndex = 31; // Cột cho Câu 31
    if (satisfactionColIndex === -1) satisfactionColIndex = 32; // Cột cho Câu 32

    let skippedCount = 0;
    
    // Header cho output
    let outputCSV = 'StudentId,RealMajorCode';
    for(let i = 0; i < 30; i++) {
        outputCSV += `,Q${questionIds[i]}`;
    }
    outputCSV += '\n';

    // Xử lý từng dòng dữ liệu
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 32) continue; // Phải có ít nhất 32 cột (0->32 = 33 cột, hoặc ít nhất tới trả lời 32)

      const satisfyStatus = normalizeText(r[satisfactionColIndex]);
      
      // BƯỚC BỘ LỌC VÀNG: Chỉ lấy những người "Có rất hài lòng" hoặc "Hài lòng" 
      // (loại bỏ "Không hài lòng" và "Cũng bình thường" vì kết quả ngành hiện tại không phải ngành lí tưởng nhất để làm chuẩn đối sánh)
      if (satisfyStatus.includes('không') || satisfyStatus.includes('bình thường')) {
        skippedCount++;
        continue;
      }

      // Ẩn danh sinh viên bằng ID tự động (Ví dụ: SV_001, SV_002...)
      const email = `SV_${String(extractedData.length + 1).padStart(3, '0')}`;
      const rawMajorName = normalizeText(r[majorColIndex]);
      
      // Tìm mã Major. Nếu không khớp 100%, tìm ngành có tên chứa chuỗi đó
      let realMajorCode = majorMap[rawMajorName];
      if (!realMajorCode) {
        for (const [name, code] of Object.entries(majorMap)) {
           if (name.includes(rawMajorName) || rawMajorName.includes(name)) {
               realMajorCode = code;
               break;
           }
        }
      }

      if (!realMajorCode) {
        console.log(`⚠️ Bỏ qua dòng ${i+1}: Không nhận diện được ngành [${r[majorColIndex]}]`);
        continue;
      }

      let rowLine = `${email},${realMajorCode}`;
      
      // Lấy đáp án 30 câu (Tương ứng với cột 1 đến 30 trong Excel)
      let allOptionsMatched = true;
      for (let qIdx = 0; qIdx < 30; qIdx++) {
        const qId = questionIds[qIdx];
        const rawAnswerValue = normalizeText(r[qIdx + 1]);
        
        let optionIdFound = null;
        
        // Tìm kiếm chính xác và tìm kiếm tương đối (chứa từ khóa)
        const exactKey = `${qId}_${rawAnswerValue}`;
        if (optionMap[exactKey]) {
            optionIdFound = optionMap[exactKey];
        } else {
             // Tìm theo kiểu matching "chứa từ" (vì trong form có thể gắn a,b,c đằng trước)
             for (const [key, id] of Object.entries(optionMap)) {
                 if (key.startsWith(`${qId}_`) && (rawAnswerValue.includes(key.split('_')[1]) || key.split('_')[1].includes(rawAnswerValue))) {
                     optionIdFound = id;
                     break;
                 }
             }
        }
        
        if (optionIdFound) {
            rowLine += `,${optionIdFound}`;
        } else {
            console.log(`⚠️ Thiếu khớp nối Đáp án ở Câu số ${qIdx+1} của sinh viên [${email}]. Đã bỏ qua.`);
            allOptionsMatched = false;
            break;
        }
      }

      if (allOptionsMatched) {
        outputCSV += rowLine + '\n';
        extractedData.push(r);
      }
    }

    // 4. Ghi đè vào file test_cases.csv
    const outPath = path.join(__dirname, 'test_cases.csv');
    fs.writeFileSync(outPath, outputCSV);

    console.log(`\n================================`);
    console.log(` BIẾN ĐỔI DỮ LIỆU THÀNH CÔNG!`);
    console.log(`- Đã quét: ${rows.length - 1} mẫu`);
    console.log(`- Bỏ qua do không Hài lòng: ${skippedCount} mẫu`);
    console.log(`- Lưu thành công vào file test test_cases.csv: ${extractedData.length} mẫu`);
    console.log(`================================`);
    console.log(`\n Trạng thái Sẵn sàng! Hãy chạy lệnh: node scripts/evaluateModel.js để xem kết quả!`);

  } catch (err) {
    console.error('Lỗi khi biến đổi dữ liệu:', err);
  } finally {
    process.exit(0);
  }
}

transformData();
