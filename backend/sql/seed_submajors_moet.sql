-- Seed SubMajors theo danh mục MOET (23 ngành) để chạy trực tiếp trong pgAdmin
-- Yêu cầu: bảng "Majors" đã có đủ 23 mã (EDU, ART, HUM, SOC, JOU, BUS, LAW, LIF, NAT, MAT, CIT, TEC, ENG, MAN, ARC, AGR, VET, HEA, WEL, TOU, TRA, ENV, SEC)
-- UNIQUE CONSTRAINT: "SubMajors"."code" phải unique
-- Chạy toàn bộ script một lần trong Query Tool

WITH major_ids AS (
  SELECT id, code FROM "Majors"
),
upserts AS (
  SELECT * FROM (VALUES
    -- 1. EDU
    ('EDU-GD', 'Giáo dục học', 'Lý luận dạy học, tâm lý học giáo dục và phương pháp giảng dạy hiện đại.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-MNG', 'Quản lý giáo dục', 'Quản trị trường học, chính sách giáo dục và đảm bảo chất lượng.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-ECE', 'Giáo dục mầm non', 'Chăm sóc – giáo dục trẻ mầm non, phát triển nhận thức và kỹ năng sớm.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-PRI', 'Giáo dục tiểu học', 'Phương pháp dạy học tích hợp, đánh giá năng lực học sinh tiểu học.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SPEC', 'Giáo dục đặc biệt', 'Can thiệp sớm, hỗ trợ học sinh khuyết tật và nhu cầu đặc biệt.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-MATH', 'Sư phạm Toán', 'Phương pháp dạy Toán THCS/THPT, bồi dưỡng học sinh giỏi.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-PHY', 'Sư phạm Vật lý', 'Phương pháp dạy Vật lý, thí nghiệm và STEM.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-CHE', 'Sư phạm Hóa học', 'Dạy học hóa phân tích, hữu cơ, thí nghiệm an toàn.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-BIO', 'Sư phạm Sinh học', 'Giảng dạy sinh học, sinh thái và thực hành phòng thí nghiệm.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-LIT', 'Sư phạm Ngữ văn', 'Giảng dạy văn học, ngôn ngữ và kỹ năng đọc – viết học thuật.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-HIS', 'Sư phạm Lịch sử', 'Giảng dạy lịch sử Việt Nam và thế giới, tư liệu và phương pháp kể chuyện.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-GEO', 'Sư phạm Địa lý', 'Giảng dạy địa lý tự nhiên – kinh tế, bản đồ và GIS cơ bản.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-ENG', 'Sư phạm Tiếng Anh', 'Phương pháp giảng dạy tiếng Anh, đánh giá năng lực ngoại ngữ.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-IT', 'Sư phạm Tin học', 'Dạy lập trình cơ bản, tư duy máy tính và an toàn thông tin cho học sinh.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),
    ('EDU-SP-TECH', 'Sư phạm Kỹ thuật', 'Giảng dạy công nghệ, hướng nghiệp và kỹ năng thực hành.', NULL, (SELECT id FROM major_ids WHERE code='EDU')),

    -- 2. ART
    ('ART-MUS', 'Âm nhạc', 'Biểu diễn, sáng tác và lý thuyết âm nhạc.', NULL, (SELECT id FROM major_ids WHERE code='ART')),
    ('ART-FINE', 'Mỹ thuật', 'Hội họa, điêu khắc, nghệ thuật thị giác.', NULL, (SELECT id FROM major_ids WHERE code='ART')),
    ('ART-PERF', 'Sân khấu – Điện ảnh', 'Diễn xuất, biên kịch, đạo diễn và sản xuất phim.', NULL, (SELECT id FROM major_ids WHERE code='ART')),
    ('ART-DES', 'Thiết kế đồ họa', 'Thiết kế thương hiệu, ấn phẩm số và mỹ thuật đa phương tiện.', NULL, (SELECT id FROM major_ids WHERE code='ART')),

    -- 3. HUM
    ('HUM-LIT', 'Ngôn ngữ và Văn học', 'Ngôn ngữ học, văn học, biên tập và xuất bản.', NULL, (SELECT id FROM major_ids WHERE code='HUM')),
    ('HUM-HIS', 'Lịch sử', 'Nghiên cứu lịch sử Việt Nam và thế giới, lưu trữ tư liệu.', NULL, (SELECT id FROM major_ids WHERE code='HUM')),
    ('HUM-PHI', 'Triết học', 'Triết học phương Đông – phương Tây, logic và đạo đức học.', NULL, (SELECT id FROM major_ids WHERE code='HUM')),
    ('HUM-CULT', 'Văn hoá học', 'Di sản văn hóa, nhân học và nghiên cứu vùng miền.', NULL, (SELECT id FROM major_ids WHERE code='HUM')),

    -- 4. SOC
    ('SOC-SOC', 'Xã hội học', 'Cấu trúc xã hội, bất bình đẳng và phát triển cộng đồng.', NULL, (SELECT id FROM major_ids WHERE code='SOC')),
    ('SOC-PSY', 'Tâm lý học', 'Tâm lý lâm sàng, tổ chức và giáo dục.', NULL, (SELECT id FROM major_ids WHERE code='SOC')),
    ('SOC-SW', 'Công tác xã hội', 'Can thiệp cộng đồng, an sinh xã hội và hỗ trợ nhóm yếu thế.', NULL, (SELECT id FROM major_ids WHERE code='SOC')),
    ('SOC-POL', 'Chính trị học', 'Hệ thống chính trị, chính sách công và quan hệ quốc tế cơ bản.', NULL, (SELECT id FROM major_ids WHERE code='SOC')),

    -- 5. JOU
    ('JOU-JOUR', 'Báo chí', 'Viết báo, phóng sự điều tra, đạo đức nghề báo.', NULL, (SELECT id FROM major_ids WHERE code='JOU')),
    ('JOU-PR', 'Quan hệ công chúng', 'Truyền thông doanh nghiệp, quản trị khủng hoảng, xây dựng hình ảnh.', NULL, (SELECT id FROM major_ids WHERE code='JOU')),
    ('JOU-MEDIA', 'Truyền thông đa phương tiện', 'Sản xuất nội dung số, phát thanh – truyền hình, kỹ thuật dựng.', NULL, (SELECT id FROM major_ids WHERE code='JOU')),

    -- 6. BUS
    ('BUS-BA', 'Quản trị kinh doanh', 'Quản trị vận hành, chiến lược, nhân sự và tài chính doanh nghiệp.', NULL, (SELECT id FROM major_ids WHERE code='BUS')),
    ('BUS-MKT', 'Marketing', 'Nghiên cứu thị trường, thương hiệu, truyền thông tích hợp.', NULL, (SELECT id FROM major_ids WHERE code='BUS')),
    ('BUS-FIN', 'Tài chính – Ngân hàng', 'Đầu tư, tín dụng, quản trị rủi ro và ngân hàng số.', NULL, (SELECT id FROM major_ids WHERE code='BUS')),
    ('BUS-ACC', 'Kế toán – Kiểm toán', 'Báo cáo tài chính, kiểm toán, chuẩn mực và thuế.', NULL, (SELECT id FROM major_ids WHERE code='BUS')),
    ('BUS-LOG', 'Quản trị chuỗi cung ứng', 'Logistics, kho vận, tối ưu vận tải và nguồn cung.', NULL, (SELECT id FROM major_ids WHERE code='BUS')),

    -- 7. LAW
    ('LAW-GEN', 'Luật học', 'Pháp luật dân sự, hành chính, hình sự và tố tụng.', NULL, (SELECT id FROM major_ids WHERE code='LAW')),
    ('LAW-BIZ', 'Luật kinh tế', 'Doanh nghiệp, đầu tư, thương mại và hợp đồng.', NULL, (SELECT id FROM major_ids WHERE code='LAW')),
    ('LAW-INT', 'Luật quốc tế', 'Công pháp, tư pháp quốc tế và giải quyết tranh chấp.', NULL, (SELECT id FROM major_ids WHERE code='LAW')),

    -- 8. LIF
    ('LIF-BIO', 'Sinh học', 'Sinh học phân tử, sinh thái và vi sinh.', NULL, (SELECT id FROM major_ids WHERE code='LIF')),
    ('LIF-BIOTECH', 'Công nghệ sinh học', 'Ứng dụng sinh học trong y dược, nông nghiệp và công nghiệp.', NULL, (SELECT id FROM major_ids WHERE code='LIF')),
    ('LIF-GEN', 'Di truyền học', 'Di truyền người, di truyền thực vật/động vật và công nghệ gen.', NULL, (SELECT id FROM major_ids WHERE code='LIF')),
    ('LIF-MICRO', 'Vi sinh – miễn dịch', 'Vi sinh ứng dụng, vaccine, kiểm soát an toàn sinh học.', NULL, (SELECT id FROM major_ids WHERE code='LIF')),

    -- 9. NAT
    ('NAT-PHY', 'Vật lý học', 'Cơ học, điện từ, vật lý hiện đại và vật liệu.', NULL, (SELECT id FROM major_ids WHERE code='NAT')),
    ('NAT-CHE', 'Hóa học', 'Hóa phân tích, hữu cơ, vô cơ và hóa lý.', NULL, (SELECT id FROM major_ids WHERE code='NAT')),
    ('NAT-EARTH', 'Khoa học Trái đất', 'Địa chất, khí tượng, thủy văn và tài nguyên.', NULL, (SELECT id FROM major_ids WHERE code='NAT')),
    ('NAT-ASTRO', 'Thiên văn học', 'Quan trắc, mô phỏng và phổ kế thiên văn.', NULL, (SELECT id FROM major_ids WHERE code='NAT')),

    -- 10. MAT
    ('MAT-MATH', 'Toán học', 'Đại số, giải tích, hình học và toán học thuần túy.', NULL, (SELECT id FROM major_ids WHERE code='MAT')),
    ('MAT-APM', 'Toán ứng dụng', 'Tối ưu, mô phỏng, toán tài chính và toán cho kỹ thuật.', NULL, (SELECT id FROM major_ids WHERE code='MAT')),
    ('MAT-STAT', 'Thống kê', 'Xác suất, phân tích dữ liệu, thống kê ứng dụng.', NULL, (SELECT id FROM major_ids WHERE code='MAT')),

    -- 11. CIT
    ('CIT-CS', 'Khoa học máy tính', 'Thuật toán, cấu trúc dữ liệu, hệ điều hành và compiler.', NULL, (SELECT id FROM major_ids WHERE code='CIT')),
    ('CIT-SE', 'Kỹ thuật phần mềm', 'Phân tích yêu cầu, thiết kế, kiểm thử và DevOps.', NULL, (SELECT id FROM major_ids WHERE code='CIT')),
    ('CIT-IS', 'Hệ thống thông tin', 'Phân tích nghiệp vụ, cơ sở dữ liệu, ERP/CRM.', NULL, (SELECT id FROM major_ids WHERE code='CIT')),
    ('CIT-NET', 'Mạng máy tính', 'Hạ tầng mạng, bảo mật, cloud cơ bản.', NULL, (SELECT id FROM major_ids WHERE code='CIT')),
    ('CIT-AI', 'Trí tuệ nhân tạo', 'Học máy, học sâu, NLP và thị giác máy tính.', NULL, (SELECT id FROM major_ids WHERE code='CIT')),
    ('CIT-SEC', 'An toàn thông tin', 'Đánh giá lỗ hổng, phòng thủ và ứng phó sự cố.', NULL, (SELECT id FROM major_ids WHERE code='CIT')),

    -- 12. TEC
    ('TEC-MECH', 'Công nghệ kỹ thuật cơ khí', 'Thiết kế – chế tạo máy, gia công và bảo trì.', NULL, (SELECT id FROM major_ids WHERE code='TEC')),
    ('TEC-ELEC', 'Công nghệ kỹ thuật điện – điện tử', 'Hệ thống điện, điện tử công suất và tự động hoá cơ bản.', NULL, (SELECT id FROM major_ids WHERE code='TEC')),
    ('TEC-AUTO', 'Công nghệ kỹ thuật ô tô', 'Động lực, truyền động, chẩn đoán và dịch vụ kỹ thuật ô tô.', NULL, (SELECT id FROM major_ids WHERE code='TEC')),
    ('TEC-CHE', 'Công nghệ kỹ thuật hóa học', 'Quy trình hoá học, vật liệu và an toàn công nghệ.', NULL, (SELECT id FROM major_ids WHERE code='TEC')),
    ('TEC-ENV', 'Công nghệ kỹ thuật môi trường', 'Xử lý nước thải, khí thải và chất thải rắn.', NULL, (SELECT id FROM major_ids WHERE code='TEC')),

    -- 13. ENG
    ('ENG-CIV', 'Kỹ thuật xây dựng', 'Kết cấu, vật liệu và tổ chức thi công công trình.', NULL, (SELECT id FROM major_ids WHERE code='ENG')),
    ('ENG-TRANS', 'Kỹ thuật giao thông', 'Cầu đường, hạ tầng vận tải và công trình giao thông.', NULL, (SELECT id FROM major_ids WHERE code='ENG')),
    ('ENG-ELEC', 'Kỹ thuật điện', 'Hệ thống điện lực, truyền tải và phân phối.', NULL, (SELECT id FROM major_ids WHERE code='ENG')),
    ('ENG-MECH', 'Kỹ thuật cơ khí', 'Thiết kế, mô phỏng và chế tạo cơ khí.', NULL, (SELECT id FROM major_ids WHERE code='ENG')),

    -- 14. MAN
    ('MAN-FOOD', 'Công nghệ thực phẩm', 'Chế biến, bảo quản và kiểm soát chất lượng thực phẩm.', NULL, (SELECT id FROM major_ids WHERE code='MAN')),
    ('MAN-TEX', 'Công nghệ dệt may', 'Thiết kế sợi, dệt, may và quản lý sản xuất.', NULL, (SELECT id FROM major_ids WHERE code='MAN')),
    ('MAN-LEA', 'Công nghệ da giày', 'Thiết kế, vật liệu và quy trình sản xuất da giày.', NULL, (SELECT id FROM major_ids WHERE code='MAN')),
    ('MAN-MET', 'Luyện kim', 'Chế biến kim loại, hợp kim và công nghệ vật liệu.', NULL, (SELECT id FROM major_ids WHERE code='MAN')),

    -- 15. ARC
    ('ARC-ARC', 'Kiến trúc', 'Thiết kế công trình, mỹ thuật kiến trúc và bền vững.', NULL, (SELECT id FROM major_ids WHERE code='ARC')),
    ('ARC-PLAN', 'Quy hoạch vùng và đô thị', 'Quy hoạch tổng thể, hạ tầng và phát triển bền vững.', NULL, (SELECT id FROM major_ids WHERE code='ARC')),
    ('ARC-CON', 'Kỹ thuật xây dựng', 'Kết cấu, vật liệu xây dựng và tổ chức thi công.', NULL, (SELECT id FROM major_ids WHERE code='ARC')),
    ('ARC-PM', 'Quản lý dự án xây dựng', 'Lập kế hoạch, BIM và quản trị chi phí tiến độ.', NULL, (SELECT id FROM major_ids WHERE code='ARC')),

    -- 16. AGR
    ('AGR-CROP', 'Trồng trọt', 'Giống, canh tác và nông nghiệp bền vững.', NULL, (SELECT id FROM major_ids WHERE code='AGR')),
    ('AGR-LIV', 'Chăn nuôi', 'Dinh dưỡng, thú y cơ bản và quản lý trang trại.', NULL, (SELECT id FROM major_ids WHERE code='AGR')),
    ('AGR-FOR', 'Lâm nghiệp', 'Quản lý rừng, bảo tồn và kinh tế lâm nghiệp.', NULL, (SELECT id FROM major_ids WHERE code='AGR')),
    ('AGR-AQUA', 'Nuôi trồng thủy sản', 'Nuôi tôm, cá và hệ thống thủy sản tuần hoàn.', NULL, (SELECT id FROM major_ids WHERE code='AGR')),

    -- 17. VET
    ('VET-GEN', 'Thú y cơ sở', 'Chẩn đoán, phòng và điều trị bệnh cho vật nuôi.', NULL, (SELECT id FROM major_ids WHERE code='VET')),
    ('VET-PET', 'Thú y thú cảnh', 'Chăm sóc và điều trị vật nuôi cảnh.', NULL, (SELECT id FROM major_ids WHERE code='VET')),
    ('VET-FARM', 'Thú y chăn nuôi', 'Dịch tễ thú y, vaccine và an toàn sinh học trại.', NULL, (SELECT id FROM major_ids WHERE code='VET')),

    -- 18. HEA
    ('HEA-MED', 'Y đa khoa', 'Khám, chẩn đoán và điều trị tổng quát.', NULL, (SELECT id FROM major_ids WHERE code='HEA')),
    ('HEA-PHARM', 'Dược học', 'Bào chế, dược lý và kiểm nghiệm thuốc.', NULL, (SELECT id FROM major_ids WHERE code='HEA')),
    ('HEA-NURS', 'Điều dưỡng', 'Chăm sóc người bệnh, phục hồi chức năng và quản lý điều dưỡng.', NULL, (SELECT id FROM major_ids WHERE code='HEA')),
    ('HEA-PH', 'Y tế công cộng', 'Dịch tễ, sức khỏe môi trường và quản lý chương trình y tế.', NULL, (SELECT id FROM major_ids WHERE code='HEA')),

    -- 19. WEL
    ('WEL-CS', 'Công tác xã hội', 'Tham vấn, hỗ trợ nhóm yếu thế và phát triển cộng đồng.', NULL, (SELECT id FROM major_ids WHERE code='WEL')),
    ('WEL-CH', 'Dịch vụ chăm sóc trẻ em', 'Chăm sóc, phát triển và bảo vệ trẻ em.', NULL, (SELECT id FROM major_ids WHERE code='WEL')),
    ('WEL-ELD', 'Chăm sóc người cao tuổi', 'Chăm sóc sức khỏe, phục hồi và dịch vụ cộng đồng cho người già.', NULL, (SELECT id FROM major_ids WHERE code='WEL')),

    -- 20. TOU
    ('TOU-HTL', 'Quản trị khách sạn', 'Vận hành khách sạn, resort và dịch vụ lưu trú.', NULL, (SELECT id FROM major_ids WHERE code='TOU')),
    ('TOU-TRAV', 'Quản trị lữ hành', 'Thiết kế tour, hướng dẫn và điều hành du lịch.', NULL, (SELECT id FROM major_ids WHERE code='TOU')),
    ('TOU-EVT', 'Quản lý sự kiện', 'Tổ chức sự kiện, MICE và trải nghiệm khách hàng.', NULL, (SELECT id FROM major_ids WHERE code='TOU')),
    ('TOU-SPT', 'Quản lý thể thao và giải trí', 'Tổ chức sự kiện thể thao, fitness và dịch vụ giải trí.', NULL, (SELECT id FROM major_ids WHERE code='TOU')),

    -- 21. TRA
    ('TRA-MAR', 'Khai thác vận tải biển', 'Điều động tàu, khai thác cảng và logistics hàng hải.', NULL, (SELECT id FROM major_ids WHERE code='TRA')),
    ('TRA-LOG', 'Logistics – vận tải', 'Quản lý vận tải đa phương thức, kho bãi và giao nhận.', NULL, (SELECT id FROM major_ids WHERE code='TRA')),
    ('TRA-AIR', 'Khai thác vận tải hàng không', 'Khai thác sân bay, an toàn bay và dịch vụ hàng không.', NULL, (SELECT id FROM major_ids WHERE code='TRA')),
    ('TRA-RAIL', 'Vận tải đường sắt – đường bộ', 'Tổ chức vận tải, hạ tầng và điều hành.', NULL, (SELECT id FROM major_ids WHERE code='TRA')),

    -- 22. ENV
    ('ENV-MGT', 'Quản lý môi trường', 'ĐTM, chính sách môi trường và quản lý tài nguyên.', NULL, (SELECT id FROM major_ids WHERE code='ENV')),
    ('ENV-TECH', 'Công nghệ môi trường', 'Xử lý nước, khí thải, chất thải rắn và tuần hoàn tài nguyên.', NULL, (SELECT id FROM major_ids WHERE code='ENV')),
    ('ENV-CLIM', 'Biến đổi khí hậu', 'Thích ứng, giảm nhẹ và quản lý rủi ro thiên tai.', NULL, (SELECT id FROM major_ids WHERE code='ENV')),
    ('ENV-HSE', 'An toàn – Sức khỏe – Môi trường (HSE)', 'An toàn công nghiệp, đánh giá rủi ro và tuân thủ môi trường.', NULL, (SELECT id FROM major_ids WHERE code='ENV')),

    -- 23. SEC
    ('SEC-SAFE', 'An ninh – trật tự', 'Giữ gìn trật tự, phòng chống tội phạm và an ninh cơ sở.', NULL, (SELECT id FROM major_ids WHERE code='SEC')),
    ('SEC-FIRE', 'Phòng cháy chữa cháy', 'Kỹ thuật PCCC, cứu hộ cứu nạn và an toàn công trình.', NULL, (SELECT id FROM major_ids WHERE code='SEC')),
    ('SEC-DEF', 'Quốc phòng cơ bản', 'Tổ chức lực lượng, huấn luyện và kỹ năng quân sự cơ bản.', NULL, (SELECT id FROM major_ids WHERE code='SEC'))
  ) AS t(code, name, description, studyGroup, majorId)
)
INSERT INTO "SubMajors" (code, name, description, "studyGroup", "majorId", "createdAt", "updatedAt")
SELECT code, name, description, studyGroup, majorId, NOW(), NOW()
FROM upserts
WHERE majorId IS NOT NULL
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    "studyGroup" = EXCLUDED."studyGroup",
    "majorId" = EXCLUDED."majorId",
    "updatedAt" = NOW();

-- Kiểm tra
-- SELECT m.code AS major_code, sm.code AS sub_code, sm.name
-- FROM "SubMajors" sm JOIN "Majors" m ON sm."majorId" = m.id
-- ORDER BY m.code, sm.code;
