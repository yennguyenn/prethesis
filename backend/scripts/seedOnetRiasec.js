import db from '../src/models/index.js';

async function seedRiasec() {
  try {
    console.log("Đang đồng bộ Database (Alter table)...");
    await db.sequelize.sync({ alter: true }); // Thêm cột riasec_scores vào bảng majors

    console.log("Cập nhật lại Bảng Tiêu chí (Criteria) sang RIASEC chuẩn...");
    
    // Xoá các criteria cũ của Level 1 (những cái có code là C1, C2, C3...)
    // Nhưng giữ lại CCIT cho Level 2
    await db.sequelize.query("DELETE FROM criteria WHERE code IN ('C1', 'C2', 'C3', 'C4', 'C5', 'R', 'I', 'A', 'S', 'E', 'C')");
    
    // Reset sequence id của PostgreSQL để tránh lỗi duplicate key
    await db.sequelize.query("SELECT setval(pg_get_serial_sequence('criteria', 'id'), coalesce(max(id), 0) + 1, false) FROM criteria;");

    const riasecData = [
      { code: 'R', name: 'Realistic (Thực tế)', description: 'Thích máy móc, công cụ, hoạt động ngoài trời', level_id: 1, weight: 1 },
      { code: 'I', name: 'Investigative (Nghiên cứu)', description: 'Thích phân tích, quan sát, giải quyết vấn đề khoa học', level_id: 1, weight: 1 },
      { code: 'A', name: 'Artistic (Nghệ thuật)', description: 'Thích sáng tạo, tự do, nghệ thuật', level_id: 1, weight: 1 },
      { code: 'S', name: 'Social (Xã hội)', description: 'Thích giúp đỡ, giảng dạy, làm việc với con người', level_id: 1, weight: 1 },
      { code: 'E', name: 'Enterprising (Kinh doanh)', description: 'Thích thuyết phục, lãnh đạo, kinh doanh', level_id: 1, weight: 1 },
      { code: 'C', name: 'Conventional (Tổ chức)', description: 'Thích quy tắc, dữ liệu, tính toán chính xác', level_id: 1, weight: 1 },
    ];
    
    for (const crit of riasecData) {
      await db.Criteria.create(crit);
    }

    // Remap các câu hỏi trắc nghiệm cũ sang RIASEC ngẫu nhiên tương đối để test
    // C1 -> R, C2 -> I, C3 -> A, C4 -> S, C5 -> E. (C thiếu nên cho E và S xen kẽ)
    await db.sequelize.query("UPDATE question_criteria_map SET criteria_code = 'R' WHERE criteria_code = 'C1'");
    await db.sequelize.query("UPDATE question_criteria_map SET criteria_code = 'I' WHERE criteria_code = 'C2'");
    await db.sequelize.query("UPDATE question_criteria_map SET criteria_code = 'A' WHERE criteria_code = 'C3'");
    await db.sequelize.query("UPDATE question_criteria_map SET criteria_code = 'S' WHERE criteria_code = 'C4'");
    await db.sequelize.query("UPDATE question_criteria_map SET criteria_code = 'E' WHERE criteria_code = 'C5'");

    console.log("Cập nhật cấu hình O*NET RIASEC cho 23 Ngành học...");
    
    // Gán điểm O*NET chuẩn cho các nhóm ngành (Thang điểm 0 - 100)
    // Dữ liệu giả lập theo chuẩn O*NET
    const majorRiasecProfiles = {
      'CIT': { I: 83, R: 50, C: 33, S: 0, E: 10, A: 0 },
      'TEC': { R: 80, I: 70, C: 40, S: 0, E: 10, A: 0 },
      'ENG': { R: 85, I: 75, C: 30, S: 0, E: 15, A: 0 },
      'MAT': { I: 90, C: 60, R: 20, S: 0, E: 0, A: 0 },
      'NAT': { I: 85, R: 40, C: 30, S: 0, E: 0, A: 0 },
      'AGR': { R: 80, I: 60, C: 20, S: 0, E: 10, A: 0 },
      'ENV': { I: 70, R: 60, S: 30, C: 10, E: 10, A: 0 },
      'TRA': { R: 70, E: 60, C: 50, I: 20, S: 0, A: 0 },

      'BUS': { E: 90, C: 70, S: 40, I: 10, R: 0, A: 0 },
      'MAN': { E: 85, C: 60, S: 50, I: 10, R: 0, A: 0 },
      'ECO': { I: 70, E: 60, C: 50, S: 10, R: 0, A: 0 },
      'LAW': { E: 80, I: 60, S: 50, C: 30, R: 0, A: 0 },
      'TOU': { E: 70, S: 70, A: 20, C: 20, R: 10, I: 0 },
      
      'ART': { A: 90, S: 20, E: 20, I: 10, R: 10, C: 0 },
      'ARC': { A: 85, I: 60, R: 40, C: 20, E: 10, S: 0 },
      'JOU': { A: 80, E: 60, S: 40, I: 20, C: 10, R: 0 },
      
      'EDU': { S: 90, A: 40, E: 30, I: 20, C: 10, R: 0 },
      'SOC': { S: 85, I: 60, E: 30, A: 20, C: 10, R: 0 },
      'WEL': { S: 90, E: 40, C: 20, I: 10, A: 0, R: 0 },
      'HUM': { A: 70, S: 60, I: 50, E: 20, C: 10, R: 0 },
      
      'HEA': { I: 80, S: 80, R: 40, C: 30, E: 10, A: 0 },
      'VET': { I: 70, R: 70, S: 40, C: 20, E: 10, A: 0 },
      'LIF': { I: 90, R: 50, C: 20, S: 10, E: 0, A: 0 },
      
      'SEC': { R: 80, C: 70, E: 50, S: 30, I: 20, A: 0 }
    };

    const majors = await db.Major.findAll();
    for (const m of majors) {
      if (majorRiasecProfiles[m.code]) {
        m.riasec_scores = majorRiasecProfiles[m.code];
        await m.save();
      }
    }

    console.log("XONG! Đã thiết lập xong Dữ liệu O*NET và RIASEC.");
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    process.exit(0);
  }
}

seedRiasec();
