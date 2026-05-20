import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function restoreDatabase() {
  try {
    console.log('⏳ Đang kết nối lên Neon Database...');
    await db.sequelize.authenticate();
    console.log('✔️ Kết nối thành công!');

    // Tắt kiểm tra khóa ngoại trước khi xóa/tạo bảng để tránh lỗi
    // (Postgres không hỗ trợ set foreign_key_checks=0 trực tiếp như MySQL, nhưng ta có thể bỏ qua)

    const sqlPath = path.resolve(__dirname, '../../data.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Không tìm thấy file data.sql tại:', sqlPath);
      process.exit(1);
    }

    console.log('⏳ Đang đọc file data.sql...');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Xóa các dòng gây lỗi cú pháp (như \restrict từ pg_dump)
    sqlContent = sqlContent.replace(/^\\restrict.*$/gm, '');

    console.log('⏳ Đang tiến hành nạp dữ liệu vào Database trên mạng (quá trình này có thể mất 1-2 phút)...');
    
    // Chạy nguyên cục SQL
    await db.sequelize.query(sqlContent);

    console.log('🎉 XONG! Đã nạp thành công toàn bộ Database của bạn lên Neon!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

restoreDatabase();
