import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hàm parse CSV đơn giản
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

async function importExistingUsers() {
  try {
    console.log('⏳ Tiến hành nhập dữ liệu người dùng từ file CSV...');
    await db.sequelize.authenticate();

    // Đọc file users.csv từ thư mục scripts
    const rawPath = path.join(__dirname, 'users.csv');
    if (!fs.existsSync(rawPath)) {
      console.error(`❌ Không tìm thấy file: ${rawPath}. Vui lòng tạo file users.csv vào thư mục scripts, với cột đầu là Email, cột 2 là Tên.`);
      process.exit(1);
    }
    
    const rawContent = fs.readFileSync(rawPath, 'utf8');
    const rows = parseCSV(rawContent);

    if (rows.length < 2) {
      console.error(`❌ File CSV quá ngắn (cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu).`);
      process.exit(1);
    }

    let successCount = 0;
    
    // Bỏ qua dòng 0 vì là header
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 1) continue;

      const email = r[0]; // Giả sử cột 1 là Email
      const name = r.length > 1 ? r[1] : 'Google Form User'; // Cột 2 là Tên

      if (!email || email.trim() === '') continue;

      const cleanEmail = email.trim().toLowerCase();

      // Kiểm tra xem user đã tồn tại chưa
      let user = await db.User.findOne({ where: { email: cleanEmail } });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8);
        user = await db.User.create({
          name: name ? name.trim() : 'Google Form User',
          email: cleanEmail,
          passwordHash: randomPassword,
          role: 'user'
        });
        console.log(`✔️ Đã tạo tài khoản cho: ${cleanEmail}`);
        successCount++;
      } else {
        console.log(`⚠️ Bỏ qua: ${cleanEmail} đã tồn tại trong database.`);
      }
    }
    
    console.log(`\n🎉 HOÀN TẤT! Đã nhập thành công ${successCount} người dùng mới từ file CSV.`);
    process.exit(0);

  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
}

importExistingUsers();
