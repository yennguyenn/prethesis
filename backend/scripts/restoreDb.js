import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
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

    const candidatePaths = [
      path.resolve(__dirname, '../../backup/backup.sql'),
      path.resolve(__dirname, '../../dss_db_backup.sql')
    ];
    const sqlPath = candidatePaths.find((candidate) => fs.existsSync(candidate));

    if (!sqlPath) {
      console.error('❌ Không tìm thấy file backup SQL. Đã thử:', candidatePaths.join(' | '));
      process.exit(1);
    }

    const firstBytes = fs.readFileSync(sqlPath, { encoding: null, flag: 'r' }).subarray(0, 4).toString('utf8');
    const isCustomDump = firstBytes === 'GDMP';
    const clientCommand = isCustomDump ? 'pg_restore' : 'psql';
    const env = { ...process.env };
    const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_PUBLIC || '';

    if (!dbUrl) {
      console.error('❌ Thiếu DATABASE_URL trong môi trường.');
      process.exit(1);
    }

    const args = isCustomDump
      ? ['--verbose', '--no-owner', '--no-privileges', '--dbname', dbUrl, sqlPath]
      : ['--single-transaction', '--set', 'ON_ERROR_STOP=on', '--dbname', dbUrl, '--file', sqlPath];

    console.log(`⏳ Đang nạp dữ liệu bằng ${clientCommand}...`);

    await new Promise((resolve, reject) => {
      const child = spawn(clientCommand, args, { env, shell: true, stdio: 'inherit' });
      child.on('error', reject);
      child.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${clientCommand} exited with code ${code}`));
      });
    });

    console.log('🎉 XONG! Đã nạp thành công toàn bộ Database của bạn lên Neon!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

restoreDatabase();
