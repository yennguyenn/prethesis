import db from '../src/models/index.js';

const questionsData = [
  // Realistic (R)
  { text: "Lắp ráp, chế tạo máy móc hoặc thiết bị điện tử.", trait: "R" },
  { text: "Sửa chữa đồ điện, đồ gia dụng trong nhà hoặc sửa xe.", trait: "R" },
  { text: "Làm các công việc thực hành ngoài trời, gần gũi với thiên nhiên.", trait: "R" },
  { text: "Vận hành máy móc, thiết bị hoặc sử dụng các công cụ cầm tay.", trait: "R" },
  { text: "Xây dựng, mộc, hoặc tự tay làm các vật dụng gia đình.", trait: "R" },

  // Investigative (I)
  { text: "Nghiên cứu khoa học, làm thí nghiệm sinh học hoặc hóa học.", trait: "I" },
  { text: "Giải các bài toán phức tạp, hoặc viết code phần mềm máy tính.", trait: "I" },
  { text: "Nghiên cứu cách thức hoạt động của cơ thể con người hoặc tự nhiên.", trait: "I" },
  { text: "Phân tích dữ liệu, số liệu và tìm ra quy luật logic.", trait: "I" },
  { text: "Đọc các bài báo khoa học, khám phá công nghệ mới.", trait: "I" },

  // Artistic (A)
  { text: "Sáng tác nhạc, đánh đàn, hoặc hát.", trait: "A" },
  { text: "Vẽ tranh, thiết kế đồ họa, hoặc trang trí nội thất.", trait: "A" },
  { text: "Sáng tác truyện, viết kịch bản, làm tiểu thuyết hoặc viết blog.", trait: "A" },
  { text: "Chụp ảnh nghệ thuật, quay phim, dựng video.", trait: "A" },
  { text: "Biểu diễn trên sân khấu (diễn xuất, múa, thuyết trình nghệ thuật).", trait: "A" },

  // Social (S)
  { text: "Dạy học, hướng dẫn hoặc truyền đạt kiến thức cho người khác.", trait: "S" },
  { text: "Giúp đỡ những người gặp khó khăn, bệnh tật hoặc y tế.", trait: "S" },
  { text: "Lắng nghe, tư vấn tâm lý và giải quyết mâu thuẫn cho bạn bè.", trait: "S" },
  { text: "Tổ chức các hoạt động cộng đồng, làm việc nhóm, từ thiện.", trait: "S" },
  { text: "Chăm sóc trẻ em, người già hoặc làm công tác xã hội.", trait: "S" },

  // Enterprising (E)
  { text: "Quản lý một cửa hàng, kinh doanh hoặc tự làm chủ.", trait: "E" },
  { text: "Thuyết phục mọi người mua sản phẩm hoặc ủng hộ ý tưởng của mình.", trait: "E" },
  { text: "Đứng đầu một nhóm hoặc dự án (làm trưởng nhóm, quản lý).", trait: "E" },
  { text: "Khởi nghiệp, tìm kiếm cơ hội kiếm tiền và tạo ra mô hình kinh doanh.", trait: "E" },
  { text: "Đàm phán thương lượng, diễn thuyết trước đám đông để gây ảnh hưởng.", trait: "E" },

  // Conventional (C)
  { text: "Ghi chép sổ sách, làm kế toán, hoặc quản lý tài chính cá nhân/nhóm.", trait: "C" },
  { text: "Sắp xếp, phân loại tài liệu, hồ sơ một cách có hệ thống, gọn gàng.", trait: "C" },
  { text: "Sử dụng phần mềm máy tính để nhập liệu, xử lý văn bản, lập bảng biểu.", trait: "C" },
  { text: "Lập kế hoạch chi tiết, làm theo quy trình chuẩn và theo dõi ngân sách.", trait: "C" },
  { text: "Kiểm tra tỉ mỉ các lỗi sai trong văn bản, hợp đồng hoặc số liệu.", trait: "C" }
];

const likertScale = [
  { text: "A. Hoàn toàn không thích", weight: 1 },
  { text: "B. Không thích", weight: 2 },
  { text: "C. Không chắc chắn", weight: 3 },
  { text: "D. Thích", weight: 4 },
  { text: "E. Rất thích", weight: 5 }
];

async function seedQuestions() {
  try {
    console.log("Đang xoá 30 câu trắc nghiệm cũ (Level 1)...");
    
    // Xóa tất cả câu hỏi level 1 (Trắc nghiệm)
    // Lưu ý: Các câu tự luận có question_type = 'text_autocomplete' nên ta giữ lại
    await db.Question.destroy({ 
        where: { 
            level_id: 1, 
            question_type: 'multiple_choice' 
        } 
    });

    // Reset sequence id của questions, options, question_criteria_map (nếu cần thiết để id không bị lỗi duplicate key)
    const qTable = db.Question.tableName;
    const oTable = db.Option.tableName;
    const qcmTable = db.QuestionCriteriaMap.tableName;
    await db.sequelize.query(`SELECT setval(pg_get_serial_sequence('"${qTable}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${qTable}";`);
    await db.sequelize.query(`SELECT setval(pg_get_serial_sequence('"${oTable}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${oTable}";`);
    await db.sequelize.query(`SELECT setval(pg_get_serial_sequence('"${qcmTable}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${qcmTable}";`);
    
    console.log("Đang tạo 30 câu hỏi O*NET chuẩn...");

    // Cần random (trộn) mảng để người dùng không bị nhàm chán (ví dụ không làm 5 câu R liên tục)
    const shuffledQuestions = questionsData.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    for (let i = 0; i < shuffledQuestions.length; i++) {
        const qData = shuffledQuestions[i];
        
        // Tạo Câu hỏi
        const q = await db.Question.create({
            text: `Câu ${i + 1}: Bạn có hứng thú với việc: ${qData.text}`,
            level_id: 1,
            question_type: 'multiple_choice'
        });

        // Tạo Map với Criteria (Để hiển thị hoặc thống kê sau này nếu cần, dù logic tính điểm mới đã lấy từ Option)
        await db.QuestionCriteriaMap.create({
            questionId: q.id,
            criteriaCode: qData.trait,
            weight: 1
        });

        // Tạo 5 Options theo chuẩn Likert Scale
        for (const likert of likertScale) {
            const scoringObj = {};
            scoringObj[qData.trait] = likert.weight; // Ví dụ: { "R": 5 }

            await db.Option.create({
                questionId: q.id,
                text: likert.text,
                scoring: scoringObj
            });
        }
    }

    console.log("XONG! Đã tạo thành công 30 câu hỏi trắc nghiệm Likert Scale theo chuẩn O*NET.");
    
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    process.exit(0);
  }
}

seedQuestions();
