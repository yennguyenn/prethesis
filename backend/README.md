# Backend Data Notes

This project now manages seed data via SQL in pgAdmin. JavaScript seed scripts are deprecated to avoid accidental data wipes. This README preserves the reference content from the removed seed files.

## Majors (22 groups)
- EDU: Khoa học giáo dục và đào tạo giáo viên — Nhóm ngành đào tạo giáo viên, nghiên cứu giáo dục, phương pháp dạy học, quản lý lớp học.
- ART: Nghệ thuật — Nhóm ngành phát triển năng khiếu, sáng tạo nghệ thuật, biểu diễn, thiết kế, mỹ thuật.
- HUM: Nhân văn — Nhóm ngành nghiên cứu xã hội, văn hóa, lịch sử, ngôn ngữ, triết học, nhân học.
- SOC: Khoa học xã hội và hành vi — Nhóm ngành nghiên cứu xã hội, hành vi, tâm lý, các quá trình xã hội và con người.
- JOU: Báo chí và thông tin — Nhóm ngành báo chí, truyền thông, thu thập, xử lý, truyền đạt thông tin.
- BUS: Kinh doanh và quản lý — Nhóm ngành quản lý, kinh doanh, lãnh đạo tổ chức, doanh nghiệp.
- LAW: Pháp luật — Nhóm ngành luật, hệ thống pháp luật, công lý, quyền lợi xã hội.
- LIF: Khoa học sự sống — Nhóm ngành sinh học, y sinh, nghiên cứu sự sống, cấu trúc và chức năng hệ sinh vật.
- SCI: Khoa học tự nhiên — Nhóm ngành vật lý, hóa học, toán, thiên văn, nghiên cứu quy luật tự nhiên.
- MAT: Toán và thống kê — Nhóm ngành toán học, thống kê, mô hình hóa, phân tích dữ liệu.
- CIT: Máy tính và công nghệ thông tin — Nhóm ngành phần mềm, hệ thống, mạng, phát triển ứng dụng CNTT.
- TEC: Công nghệ kỹ thuật — Nhóm ngành áp dụng kỹ thuật, thực hành thiết kế, xây dựng, vận hành hệ thống công nghiệp.
- ENG: Kỹ thuật — Nhóm ngành kỹ thuật, giải quyết vấn đề công nghiệp, xây dựng, công trình, hệ thống.
- MAN: Sản xuất và chế biến — Nhóm ngành sản xuất, chế biến, quản lý quy trình, vật liệu, chất lượng.
- ARC: Kiến trúc và xây dựng — Nhóm ngành thiết kế, xây dựng, quản lý, bảo tồn công trình kiến trúc, hạ tầng.
- AGR: Nông, lâm nghiệp và thủy sản — Nhóm ngành sản xuất, quản lý, phát triển tài nguyên nông, lâm, thủy sản.
- VET: Thú y — Nhóm ngành chăm sóc, điều trị, bảo vệ sức khỏe động vật, y học thú y.
- HEA: Sức khỏe — Nhóm ngành chăm sóc, điều trị, quản lý sức khỏe con người, y học, dược học.
- WEL: Dịch vụ xã hội — Nhóm ngành công tác xã hội, tư vấn, giáo dục, quản lý dịch vụ xã hội.
- TOU: Du lịch, khách sạn, thể thao và dịch vụ cá nhân — Nhóm ngành quản lý, phát triển, cung cấp dịch vụ du lịch, khách sạn, thể thao, cá nhân.
- TRA: Dịch vụ vận tải — Nhóm ngành quản lý, điều hành, cung cấp dịch vụ vận chuyển, giao thông.
- ENV: Môi trường và bảo vệ môi trường — Nhóm ngành nghiên cứu, quản lý, bảo vệ tài nguyên, môi trường, phát triển bền vững.
- SEC: An ninh, Quốc phòng — Nhóm ngành an ninh, quốc phòng, trật tự xã hội, đào tạo tại các trường công an, quân sự.

## Level 1 Orientation Questions (30)
- Tôi thích hướng dẫn người khác học tập và thiết kế hoạt động giảng dạy. — majors: EDU, SOCS
- Tôi yêu thích vẽ, âm nhạc, biểu diễn hoặc các hình thức sáng tạo nghệ thuật. — majors: ART
- Tôi thích phân tích các sự kiện lịch sử và bối cảnh văn hoá. — majors: HUM
- Tôi bị thu hút bởi việc tìm hiểu hành vi và động lực của con người. — majors: SOC, HUM
- Tôi muốn truyền đạt thông tin rõ ràng đến cộng đồng. — majors: JOUR
- Xây dựng chiến lược kinh doanh và đánh giá thị trường khiến tôi hứng thú. — majors: BUS
- Tôi quan tâm đến công lý, quyền lợi và giải quyết vấn đề pháp lý. — majors: LAW
- Tôi thích thử nghiệm các hiện tượng vật lý hoặc phản ứng hoá học. — majors: NAT, LIFE
- Tôi thích làm việc với các ký hiệu trừu tượng, chứng minh hoặc mô hình dữ liệu. — majors: MATH, IT
- Tôi muốn thiết kế phần mềm hoặc hệ thống số. — majors: IT
- Áp dụng giải pháp kỹ thuật để cải tiến quy trình sản xuất làm tôi hứng thú. — majors: TECH, MANUF
- Tôi thích thiết kế máy móc, kết cấu hoặc thiết bị. — majors: ENG, TECH
- Tôi muốn tối ưu hoá dây chuyền sản xuất và xử lý vật liệu. — majors: MANUF
- Thiết kế công trình hoặc quy hoạch đô thị hấp dẫn tôi. — majors: ARCH
- Làm việc với cây trồng, đất, rừng hoặc hệ sinh thái nước khiến tôi thấy ý nghĩa. — majors: AGRI
- Tôi quan tâm sâu sắc tới sức khoẻ và phúc lợi của động vật. — majors: VET, HEALTH
- Tôi có động lực thúc đẩy sức khoẻ con người hoặc phát triển thuốc. — majors: HEALTH
- Cung cấp dịch vụ hỗ trợ cộng đồng rất quan trọng với tôi. — majors: SOCS
- Tôi thích tạo ra trải nghiệm tuyệt vời cho khách du lịch hoặc sự kiện. — majors: TOUR
- Tôi coi trọng các vấn đề về an ninh và chiến lược quốc phòng. — majors: SEC
- Bảo vệ môi trường và tài nguyên thiên nhiên rất quan trọng với tôi. — majors: ENV
- Tôi quan tâm đến logistics, vận chuyển và hệ thống giao thông. — majors: TRANS
- Tôi tò mò về sinh vật ở cấp độ tế bào hoặc phân tử. — majors: LIFE
- Tôi thích kết hợp kiến thức nhiều lĩnh vực để giải quyết vấn đề phức tạp. — majors: INTER
- Tôi muốn kết hợp công nghệ với tác động môi trường hoặc xã hội. — majors: ENV, INTER, IT
- Tôi ưu tiên các nhiệm vụ cần phân tích định lượng chính xác. — majors: MATH, IT
- Tôi thích lập kế hoạch và quản lý các dự án quy mô lớn. — majors: BUS, ENG, TECH
- Tôi thoải mái làm việc trong phòng thí nghiệm với thiết bị và thí nghiệm. — majors: NAT, LIFE, HEALTH
- Tôi thích giải quyết vấn đề kết hợp yếu tố con người và kỹ thuật. — majors: SOC, IT, INTER
- Tôi được truyền cảm hứng bởi thiết kế sáng tạo nhưng vẫn có chức năng rõ ràng. — majors: ART, ARCH, IT

## Level 2 (IT) — Notes
- Quản lý bằng SQL trong pgAdmin, với 30 câu hỏi chuyên ngành IT (CS, DS, SE, UIUX, EMB, CY, AI, NET, IS).
- Options lưu `scoring` dạng JSONB, cộng điểm theo mã chuyên ngành.

## Seeding Strategy
- App không auto-seed dữ liệu. Dùng các script SQL trong pgAdmin để chèn/cập nhật Level 1 & Level 2.
- Tránh chạy các seed JS cũ để không ghi đè dữ liệu trong DB.
