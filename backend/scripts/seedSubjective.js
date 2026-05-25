import db from '../src/models/index.js';

async function seed() {
  try {
    console.log("Đang xoá các câu hỏi tự luận nháp cũ...");
    await db.Question.destroy({ where: { question_type: 'text_autocomplete' }});

    console.log("Đang tạo 3 câu hỏi hoàn toàn mới (Version 3)...");

    // Câu 1: Nhóm Kỹ thuật - Khoa học
    const q1 = await db.Question.create({
      text: "Khi sử dụng một ứng dụng trên điện thoại bị lỗi hoặc máy tính bị treo, bạn thường có xu hướng tự mày mò tìm cách sửa lỗi trên mạng hay nhờ người khác làm giúp ngay? Tại sao?",
      level_id: 1,
      question_type: 'text_autocomplete'
    });
    await db.Option.create({
      questionId: q1.id,
      text: "Học sinh có tính tò mò, thích mày mò sửa chữa công nghệ, có tư duy phân tích tìm nguyên nhân gốc rễ và khả năng giải quyết vấn đề kỹ thuật độc lập.",
      scoring: { "R": 5, "I": 5 }
    });

    // Câu 2: Nhóm Kinh tế - Luật - Quản trị
    const q2 = await db.Question.create({
      text: "Giả sử bạn đang rất cần một người bạn thân tham gia vào dự án nhóm của mình nhưng họ từ chối. Bạn sẽ nói gì để thuyết phục họ đổi ý?",
      level_id: 1,
      question_type: 'text_autocomplete'
    });
    await db.Option.create({
      questionId: q2.id,
      text: "Học sinh thể hiện khả năng giao tiếp khéo léo, lập luận logic, kỹ năng đàm phán, thuyết phục người khác và có tố chất lãnh đạo đội nhóm.",
      scoring: { "E": 10 }
    });

    // Câu 3: Nhóm Xã hội - Nghệ thuật
    const q3 = await db.Question.create({
      text: "Nếu bạn có một ngày nghỉ hoàn toàn rảnh rỗi và không bị ràng buộc bởi bài vở, bạn sẽ chọn làm hoạt động gì để thể hiện rõ nhất cá tính của mình?",
      level_id: 1,
      question_type: 'text_autocomplete'
    });
    await db.Option.create({
      questionId: q3.id,
      text: "Học sinh có tâm hồn tự do, thích các hoạt động nghệ thuật, sáng tạo, đọc sách, viết lách, thiết kế, âm nhạc hoặc các hoạt động mang tính nhân văn.",
      scoring: { "A": 5, "S": 5 }
    });

    console.log("Đã đổi sang 3 câu hỏi mới! Các tình huống thiết thực hơn rất nhiều.");
    
  } catch (error) {
    console.error("Lỗi khi seed data:", error);
  } finally {
    process.exit(0);
  }
}

seed();
