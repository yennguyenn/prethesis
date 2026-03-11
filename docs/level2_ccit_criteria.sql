-- -- ============================================================
-- -- Level 2 CIT – Thêm tiêu chí CCIT1-CCIT4 và mapping câu hỏi
-- -- Chạy trong pgAdmin 4 (Query Tool) trên database DSS
-- -- ============================================================


-- -- ── Bước 1: Thêm cột weight và level_id vào bảng criteria ──
-- ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS weight    FLOAT;
-- ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS level_id  INTEGER NOT NULL DEFAULT 1;

-- -- Điền weight cho C1-C5 (Level 1)
-- UPDATE public.criteria SET weight = 0.25, level_id = 1 WHERE code = 'C1';
-- UPDATE public.criteria SET weight = 0.30, level_id = 1 WHERE code = 'C2';
-- UPDATE public.criteria SET weight = 0.20, level_id = 1 WHERE code = 'C3';
-- UPDATE public.criteria SET weight = 0.15, level_id = 1 WHERE code = 'C4';
-- UPDATE public.criteria SET weight = 0.10, level_id = 1 WHERE code = 'C5';


-- -- ── Bước 2: Insert 4 tiêu chí Level 2 (CCIT1-CCIT4) ──
-- INSERT INTO public.criteria (code, name, description, weight, level_id) VALUES
--   (
--     'CCIT1',
--     'Academic Ability',
--     'Năng lực học thuật và tư duy logic, toán học – nền tảng cho lập trình và thuật toán',
--     0.25,
--     2
--   ),
--   (
--     'CCIT2',
--     'Technical Interest & Skills',
--     'Hứng thú và kỹ năng kỹ thuật chuyên biệt: lập trình, mạng, bảo mật, AI, dữ liệu, thiết kế',
--     0.35,
--     2
--   ),
--   (
--     'CCIT3',
--     'Personal Traits',
--     'Tính cách và phong cách làm việc: sáng tạo, có tổ chức, giao tiếp, teamwork',
--     0.25,
--     2
--   ),
--   (
--     'CCIT4',
--     'Career Orientation',
--     'Định hướng nghề nghiệp và mục tiêu phát triển trong lĩnh vực CNTT',
--     0.15,
--     2
--   )
-- ON CONFLICT (code) DO UPDATE
--   SET weight   = EXCLUDED.weight,
--       level_id = EXCLUDED.level_id;


-- -- ── Bước 3: Map Q31-Q60 → CCIT1-CCIT4 ──
-- -- CCIT1 – Academic Ability (5 câu: Q31-Q35)
-- --   Q31: Thích giải câu đố logic
-- --   Q32: Toán hàm số, xác suất
-- --   Q33: Tự hỏi "Vì sao công thức đúng?"
-- --   Q34: Kiên nhẫn với bài tập khó, thử nhiều cách
-- --   Q35: Tìm lỗi sai, sửa logic

-- -- CCIT2 – Technical Interest & Skills (10 câu: Q36-Q45)
-- --   Q36: Viết chương trình, website, app/game
-- --   Q37: Robot, thiết bị thông minh, điện tử
-- --   Q38: Thiết kế giao diện, vẽ poster
-- --   Q39: Internet, mạng máy tính
-- --   Q40: Toán dữ liệu: xác suất thống kê, đại số tuyến tính
-- --   Q41: Bảo mật, ngăn chặn hacker/virus
-- --   Q42: Dự đoán kết quả dựa trên dữ liệu
-- --   Q43: Vẽ biểu đồ, data visualization
-- --   Q44: Hệ thống quản lý thông tin doanh nghiệp
-- --   Q45: Cảm biến, chip, robot nhỏ

-- -- CCIT3 – Personal Traits (8 câu: Q46-Q53)
-- --   Q46: Làm việc có hệ thống, từng bước, chi tiết
-- --   Q47: Viết báo cáo, sắp xếp thông tin
-- --   Q48: Teamwork tốt, phân chia nhiệm vụ
-- --   Q49: Lập kế hoạch
-- --   Q50: Sáng tạo ý tưởng mới, tạo sản phẩm
-- --   Q51: Giao tiếp tốt
-- --   Q52: Lắp ráp/sửa thiết bị điện tử
-- --   Q53: Thử nghiệm công cụ phần mềm mới

-- -- CCIT4 – Career Orientation (7 câu: Q54-Q60)
-- --   Q54: Trình bày, thuyết phục người khác
-- --   Q55: Khám phá cách app hoạt động, thay đổi chúng
-- --   Q56: Học công nghệ mới: AI, robot, Big Data
-- --   Q57: Tối ưu quy trình, làm nhanh hơn
-- --   Q58: Thiết kế/sáng tạo game, poster, sản phẩm
-- --   Q59: Bảo vệ thông tin, tránh lừa đảo/virus
-- --   Q60: Phân tích dữ liệu để dự đoán và ra quyết định

-- INSERT INTO public.question_criteria_map (question_id, criteria_code, weight) VALUES
--   -- CCIT1 – Academic Ability
--   (31, 'CCIT1', 1),
--   (32, 'CCIT1', 1),
--   (33, 'CCIT1', 1),
--   (34, 'CCIT1', 1),
--   (35, 'CCIT1', 1),
--   -- CCIT2 – Technical Interest & Skills
--   (36, 'CCIT2', 1),
--   (37, 'CCIT2', 1),
--   (38, 'CCIT2', 1),
--   (39, 'CCIT2', 1),
--   (40, 'CCIT2', 1),
--   (41, 'CCIT2', 1),
--   (42, 'CCIT2', 1),
--   (43, 'CCIT2', 1),
--   (44, 'CCIT2', 1),
--   (45, 'CCIT2', 1),
--   -- CCIT3 – Personal Traits
--   (46, 'CCIT3', 1),
--   (47, 'CCIT3', 1),
--   (48, 'CCIT3', 1),
--   (49, 'CCIT3', 1),
--   (50, 'CCIT3', 1),
--   (51, 'CCIT3', 1),
--   (52, 'CCIT3', 1),
--   (53, 'CCIT3', 1),
--   -- CCIT4 – Career Orientation
--   (54, 'CCIT4', 1),
--   (55, 'CCIT4', 1),
--   (56, 'CCIT4', 1),
--   (57, 'CCIT4', 1),
--   (58, 'CCIT4', 1),
--   (59, 'CCIT4', 1),
--   (60, 'CCIT4', 1);


-- -- ── Kiểm tra kết quả ──
-- SELECT code, name, weight, level_id FROM public.criteria ORDER BY level_id, code;
-- SELECT COUNT(*) AS total_level2_maps FROM public.question_criteria_map WHERE criteria_code LIKE 'CCIT%';


-- ============================================================
-- Bước 4: Cập nhật Q31-Q60 sang level_id = 2
--         Chạy phần này nếu chưa chạy bước này
-- ============================================================
UPDATE public.questions SET level_id = 2 WHERE id BETWEEN 31 AND 60;


-- ============================================================
-- Bước 5: Thêm 5 câu tự luận Level 2 (Q86-Q90)
-- ============================================================
WITH new_qs AS (
  INSERT INTO public.questions (text, "createdAt", "updatedAt", level_id)
  VALUES
    (
      'Trong lĩnh vực Công nghệ thông tin, bạn thích mảng kỹ thuật nào nhất? (Ví dụ: lập trình web, AI, bảo mật, mạng, thiết kế giao diện, phân tích dữ liệu,...)',
      NOW(), NOW(), 2
    ),
    (
      'Bạn đã tự học hoặc thử tìm hiểu công nghệ nào ngoài chương trình học chưa? (Ví dụ: Python, HTML, JavaScript, SQL, Figma,...)',
      NOW(), NOW(), 2
    ),
    (
      'Hãy mô tả điểm mạnh tính cách của bạn phù hợp với ngành CNTT. (Ví dụ: logic, sáng tạo, tỉ mỉ, giao tiếp tốt,...)',
      NOW(), NOW(), 2
    ),
    (
      'Bạn mong muốn làm nghề gì trong ngành CNTT sau khi tốt nghiệp? (Ví dụ: lập trình viên, kỹ sư AI, chuyên gia bảo mật, kỹ sư mạng,...)',
      NOW(), NOW(), 2
    ),
    (
      'Hãy kể một dự án hoặc trải nghiệm liên quan đến máy tính/công nghệ mà bạn thích nhất.',
      NOW(), NOW(), 2
    )
  RETURNING id, text
),
criteria_assign AS (
  SELECT id,
    CASE
      WHEN text LIKE '%mảng kỹ thuật%'    THEN 'CCIT2'
      WHEN text LIKE '%tự học%'            THEN 'CCIT1'
      WHEN text LIKE '%điểm mạnh tính cách%' THEN 'CCIT3'
      WHEN text LIKE '%làm nghề gì%'       THEN 'CCIT4'
      WHEN text LIKE '%dự án%'             THEN 'CCIT2'
    END AS criteria_code
  FROM new_qs
)
INSERT INTO public.question_criteria_map (question_id, criteria_code, weight)
SELECT id, criteria_code, 1
FROM criteria_assign
WHERE criteria_code IS NOT NULL;


-- ── Kiểm tra kết quả ──
SELECT id, LEFT(text, 60) AS preview, level_id
FROM public.questions
WHERE level_id = 2
ORDER BY id;

SELECT qcm.question_id, qcm.criteria_code, LEFT(q.text, 50) AS question_preview
FROM public.question_criteria_map qcm
JOIN public.questions q ON q.id = qcm.question_id
WHERE qcm.criteria_code LIKE 'CCIT%'
ORDER BY qcm.criteria_code, qcm.question_id;
