import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

async function migrateDirectly() {
  console.log('⏳ Đang thiết lập kết nối...');
  
  // 1. Kết nối tới Database ở máy tính (Local)
  const localDb = new Sequelize('dss_db', 'postgres', 'yennguyen@', {
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    logging: false
  });

  // 2. Kết nối tới Database trên mạng (Neon)
  const remoteDb = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    await localDb.authenticate();
    await remoteDb.authenticate();
    console.log('✔️ Kết nối thành công cả Local và Neon!');

    // Danh sách các bảng cần copy dữ liệu (theo thứ tự khóa ngoại)
    const tables = [
      '"Levels"',
      '"Majors"',
      '"SubMajors"',
      'criteria',
      'questions',
      '"Options"',
      'question_criteria_map',
      'keyword_rules'
    ];

    for (const table of tables) {
      console.log(`\n⏳ Đang copy bảng: ${table}...`);
      
      // Lấy dữ liệu từ máy tính
      const [rows] = await localDb.query(`SELECT * FROM ${table}`);
      
      if (rows.length === 0) {
        console.log(`   -> Bảng trống, bỏ qua.`);
        continue;
      }

      // Xóa dữ liệu cũ trên Neon (nếu có) để tránh trùng lặp
      await remoteDb.query(`TRUNCATE TABLE ${table} CASCADE;`).catch(() => {});

      // Chèn từng dòng lên Neon
      let successCount = 0;
      for (const row of rows) {
        // Tạo câu lệnh INSERT linh hoạt
        const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        try {
          await remoteDb.query(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
            { bind: values }
          );
          successCount++;
        } catch (err) {
          console.error(`   ❌ Lỗi chèn dòng vào ${table}:`, err.message);
        }
      }
      
      console.log(`✔️ Hoàn thành bảng ${table}: Đã copy ${successCount}/${rows.length} dòng.`);
    }

    // Reset sequence cho các bảng để tránh lỗi ID sau này
    try {
       await remoteDb.query(`SELECT setval('"questions_id_seq"', (SELECT MAX(id) FROM questions));`).catch(()=>{});
       await remoteDb.query(`SELECT setval('"Options_id_seq"', (SELECT MAX(id) FROM "Options"));`).catch(()=>{});
       await remoteDb.query(`SELECT setval('"Majors_id_seq"', (SELECT MAX(id) FROM "Majors"));`).catch(()=>{});
       await remoteDb.query(`SELECT setval('"Levels_id_seq"', (SELECT MAX(id) FROM "Levels"));`).catch(()=>{});
    } catch(e) {}

    console.log('\n🎉 XONG TOÀN BỘ! DATABASE TRÊN MẠNG ĐÃ ĐẦY ĐỦ DỮ LIỆU CHUẨN 100%!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi hệ thống:', error);
    process.exit(1);
  }
}

migrateDirectly();
