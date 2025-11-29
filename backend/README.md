# Backend Data Notes

This project now manages seed data via SQL in pgAdmin. JavaScript seed scripts are deprecated to avoid accidental data wipes. This README preserves the reference content from the removed seed files.

## Majors (24 groups)
- EDU: Khoa học giáo dục & đào tạo giáo viên
- ART: Nghệ thuật
- HUM: Nhân văn
- SOC: Khoa học xã hội & hành vi
- JOUR: Báo chí & thông tin
- BUS: Kinh doanh & quản lý
- LAW: Pháp luật
- NAT: Khoa học tự nhiên
- MATH: Toán & thống kê
- ICT: Máy tính & công nghệ thông tin
- TECH: Công nghệ kỹ thuật
- ENG: Kỹ thuật
- MANUF: Sản xuất & chế biến
- ARCH: Kiến trúc & xây dựng
- AGRI: Nông – lâm – thủy sản
- VET: Thú y
- HEALTH: Sức khỏe (Y – Dược)
- SOCS: Dịch vụ xã hội
- TOUR: Du lịch, khách sạn, thể thao & dịch vụ cá nhân
- SEC: An ninh – quốc phòng
- ENV: Môi trường & bảo vệ tài nguyên
- TRANS: Giao thông vận tải
- LIFE: Khoa học sự sống
- INTER: Khoa học liên ngành

## Level 1 Orientation Questions (30)
- Tôi thích hướng dẫn người khác học tập và thiết kế hoạt động giảng dạy. — majors: EDU, SOCS
- Tôi yêu thích vẽ, âm nhạc, biểu diễn hoặc các hình thức sáng tạo nghệ thuật. — majors: ART
- Tôi thích phân tích các sự kiện lịch sử và bối cảnh văn hoá. — majors: HUM
- Tôi bị thu hút bởi việc tìm hiểu hành vi và động lực của con người. — majors: SOC, HUM
- Tôi muốn truyền đạt thông tin rõ ràng đến cộng đồng. — majors: JOUR
- Xây dựng chiến lược kinh doanh và đánh giá thị trường khiến tôi hứng thú. — majors: BUS
- Tôi quan tâm đến công lý, quyền lợi và giải quyết vấn đề pháp lý. — majors: LAW
- Tôi thích thử nghiệm các hiện tượng vật lý hoặc phản ứng hoá học. — majors: NAT, LIFE
- Tôi thích làm việc với các ký hiệu trừu tượng, chứng minh hoặc mô hình dữ liệu. — majors: MATH, ICT
- Tôi muốn thiết kế phần mềm hoặc hệ thống số. — majors: ICT
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
- Tôi muốn kết hợp công nghệ với tác động môi trường hoặc xã hội. — majors: ENV, INTER, ICT
- Tôi ưu tiên các nhiệm vụ cần phân tích định lượng chính xác. — majors: MATH, ICT
- Tôi thích lập kế hoạch và quản lý các dự án quy mô lớn. — majors: BUS, ENG, TECH
- Tôi thoải mái làm việc trong phòng thí nghiệm với thiết bị và thí nghiệm. — majors: NAT, LIFE, HEALTH
- Tôi thích giải quyết vấn đề kết hợp yếu tố con người và kỹ thuật. — majors: SOC, ICT, INTER
- Tôi được truyền cảm hứng bởi thiết kế sáng tạo nhưng vẫn có chức năng rõ ràng. — majors: ART, ARCH, ICT

## Level 2 (IT) — Notes
- Quản lý bằng SQL trong pgAdmin, với 30 câu hỏi chuyên ngành IT (CS, DS, SE, UIUX, EMB, CY, AI, NET, IS).
- Options lưu `scoring` dạng JSONB, cộng điểm theo mã chuyên ngành.

## Seeding Strategy
- App không auto-seed dữ liệu. Dùng các script SQL trong pgAdmin để chèn/cập nhật Level 1 & Level 2.
- Tránh chạy các seed JS cũ để không ghi đè dữ liệu trong DB.
