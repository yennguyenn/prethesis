# Backend Data Notes

This project now manages seed data via SQL in pgAdmin. JavaScript seed scripts are deprecated to avoid accidental data wipes. This README preserves the reference content from the removed seed files.

## Majors (23 groups)
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
1. Đâu là kiểu hoạt động mà bạn thích nhất?
A. Đi thiện nguyện, hỗ trợ giúp đỡ người khác+4 SOC +2WEL
B. Thực hành các thí nghiệm khoa học +4SCI, +2LIF
C. Viết lách, sáng tạo nội dung + 2 ART, +2 HUM, +3 JOU
D. Tính toán, giải các bài toán, câu đố logic  +3MAT +2 CIT
2. Môn học mà bạn tự tin là mình học tốt nhất ?
A. Ngữ văn +4 HUM + +2 JOU 1 EDU 
B. Toán +4 MAT +2 CIT
C. Sinh +3 LIF, +3 HEA +1 ENV
D. Sử, Địa +4 SOC, +3 HUM
3. Bạn thích môi trường học tập như thế nào?
A. Lớp học có kỷ luật nghiêm túc, giống quân độI (+4 SEC)
B. Ở phòng lab thí nghiệm, tiến hành trực tiếp (+4 SCI, +2 TEC +1 ENV)
C. Ở Studio nghệ thuật, môi trường sáng tạo có tính linh hoạt (+4 ART, +2 JOU)
D. Ở văn phòng hiện đại, có máy tính và các thiết bị công nghệ (+4 CIT, +2 BUS)
4. Đâu là kĩ năng mà bạn giỏi nhất?
A. Bạn là người có kĩ năng giao tiếp và giải thích, bạn tự tin có thể truyền đạt được thông tin đến người khác một cách tốt nhất  (+4 EDU, +2LAW)
B. Bạn là người có tư duy về mặt sáng tạo hình ảnh hoặc âm thanh (+4 ART, +2ARC)
C. Bạn là người có tư duy phân tích dữ liệu, thông tin tốt (+4 MAT, +2 CIT)
D. Bạn là người có tính kiên nhẫn quan sát, và rất thích chăm sóc người khác (+4 HEA, +2 WEL, +1 VET)
5. Trong công việc tương lai, bạn muốn đảm nhận vai trò nào nhất?
A. Thiết kế, xây dựng bố cục cho không gian mới  (+4 ARC)
B. Quản lý, điều phối nhóm hoặc dự án, đảm bảo mọi việc vận hành trơn tru  (+4 BUS, +1 TRA)
C. Nghiên cứu, phân tích, khám phá, tìm hiểu kiến thức mới  (+4 SCI, +2 LIF, +1 ENV)
D. Tham gia sản xuất, chế tạo sản phẩm, vận hành máy móc, kiểm tra chất lượng sản phẩm (+4 MAN, +2 TEC)

6. Đâu là kiểu công việc mà bạn nghĩ mình có thể làm được tốt? 
A. Công việc chăm sóc, hỗ trợ và theo dõi sức khỏe con người  (+4 HEA, +1 WEL, +1 SOC)
B. Công việc thiết kế, sáng tạo sản phẩm, không gian hoặc nội dung  (+4 ARC, +2 ART)
C. Công việc phát triển phần mềm, hệ thống hoặc ứng dụng   (+4 CIT, +2 ENG)
D. Công việc phân tích xã hội, nghiên cứu hành vi của con người (+4 SOC, +1 WEL)

7. Khi rảnh rỗi bạn thích làm gì nhất?
A. Đọc sách, viết nhật ký  (+4 HUM +2 JOU)
B. Sửa đồ điện tử, ráp máy mô hình  (+4 TEC, +2 ENG)
C. Chơi thể thao, trải nghiệm hoạt động ngoài trời  (+4 TOU)
D. Chăm sóc thú cưng  (+4 VET, +1 LIF)
8. Bạn quan tâm đến vấn đề nào nhất trong xã hội?
 A. Vấn đề về giáo dục và sự phát triển con trẻ (+4 EDU)
 B. Vấn đề ô nhiễm môi trường ngày càng tăng(+4 ENV)
 C. Vấn đề về pháp luật, công lý và quyền con người trong xã hội (+4 LAW)
 D. Vấn đề về các kênh truyền thông, báo chí đưa thông tin xuyên tạc, sai lệch (+4 JOU)

9. Bạn thích làm việc cùng đối tượng nào? 
 A. Hàng hóa (+4 TRA, +2 MAN)
 B. Động vật (+4 VET, +2ARC)
 C. Máy móc (+4 TEC, +1 ENG) 
 D. Dữ liệu – số liệu (+3 MAT, +3 CIT, +1SCI)

10. Bạn thích nơi làm việc nào? 
 A. Văn phòng, công ty (+4 BUS)
 B. Bệnh viện (+4 HEA)
 C. Công trình xây dựng (+ 4ENG, +1 ARC)
 D. Cánh đồng, trang trại (+4 AGR, +1 ENV)

11. Điều gì khiến bạn cảm thấy hứng thú nhất khi làm việc?
A. Khi mọi người phối hợp nhịp nhàng theo kế hoạch bạn đề ra  (+4 BUS)
B. Khi thông tin bạn tạo ra có ảnh hưởng đến nhiều người  (+4 JOU)
C. Khi tìm ra giải pháp cho một vấn đề phức tạp  (+4 SCI, +2 LIF)
D. Khi bạn tạo ra được một hệ thống phần mềm hoạt động được  (+4 CIT, +1 TEC)

12, Điều bạn sợ nhất khi làm việc? 
 A. Công việc có thu nhập không ổn định, phụ thuộc vào thị trường hoặc khách hàng (+2 EDU +2SEC)
 B. Sự khô khan, thiếu tính sáng tạo (+4 ART, +1 HUM, + 1JOU)
 C. Không được tương tác, làm việc với con người (+4 SOC, +1 WEL)
 D. Những việc làm theo cảm tính,  không rõ ràng và thiếu logic (+3 MAT, +1 CIT, +1 TEC)

13. Bạn thường giải quyết một vấn đề bằng cách nào?
A. Trao đổi, giao tiếp, lắng nghe mọi người để hiểu suy nghĩ và cảm xúc của họ, từ đó tìm ra cách xử lý phù hợp (+4 WEL, +1 SOC)
B. Vẽ sơ đồ, mindmap hoặc phác thảo các ý tưởng để tìm hướng giải quyết (+4 ART, +2 ARC)
C. Phân tích vấn đề một cách chi tiết, từng bước logic (+4 MAT, +2CIT, +2SCI)
D. Bắt tay vào thử nghiệm trực tiếp để rút ra phương án hiệu quả (+4 TEC, +2 ENG)

14. Khi làm việc nhóm, bạn thường là…
A. Người hướng dẫn và hỗ trợ các thành viên khác (+4 EDU)
B. Người đưa ra ý tưởng và định hướng sáng tạo (+4 ART, +1 ARC)
C. Người kiểm tra dữ liệu và đảm bảo tính logic (+4 MAT, +1 CIT)
D. Người điều phối công việc và quản lý nhóm (+4 BUS)

15. Bạn thích loại phương tiện truyền thông nào?
A. Sách, báo in hoặc tài liệu chữ viết (+4 HUM +2 JOU)
B. Video, hình ảnh trực quan (+4 ART)
C. Mạng xã hội và các kênh tin tức (+4 JOU)
D. Công cụ và nền tảng phân tích dữ liệu (+4 CIT)


16. Bạn muốn đóng góp cho đất nước theo cách nào?
A. Nâng cao chất lượng giáo dục và đào tạo con người (+4 EDU)
B. Phát triển kinh tế, doanh nghiệp và việc làm (+4 BUS)
C. Bảo vệ an ninh, trật tự và chủ quyền quốc gia (+4 SEC +2 LAW)
D. Bảo vệ môi trường và phát triển bền vững (+4 ENV)



17. Điều gì khiến bạn thấy vui vẻ và hạnh phúc khi làm?
A. Khi bạn giúp người khác hiểu rõ kiến thức hoặc kỹ năng mới (+4 EDU)
B. Khi bạn tạo ra một sản phẩm hoặc giải pháp có thể sử dụng được trong thực tế (+4 TEC, +2 ENG, +1 CIT)
C. Khi bạn giải được một bài toán hoặc vấn đề logic phức tạp (+4 MAT, +1 SCI)
D. Khi bạn hỗ trợ, cải thiện cuộc sống cho những người gặp khó khăn trong xã hội (+4 SOC, + 2 WEL)


18. Ví dụ trường bạn tổ chức một hoạt động để học sinh tham gia bảo vệ trật tự và an ninh xã hội, bạn sẽ chọn tham gia hoạt động nào sau đây?
A. Tham gia mô phỏng các tình huống an ninh, phòng cháy chữa cháy (+4 SEC)
B. Tổ chức các chiến dịch tuyên truyền an toàn cộng đồng (+4 SOC)
C. Phát triển phần mềm giám sát an ninh (+4 CIT)
D. Hỗ trợ hướng dẫn người dân trong các hoạt động phòng tránh rủi ro (+4 HEA)

19. Bạn thích nghiên cứu, tìm hiểu về lĩnh vực nào?
A. Ngôn ngữ, văn hóa (+4 HUM)
B. Con người, xã hội (+4 SOC, + 2WEL +2LAW)
C. Sinh học, sự sống (+4 LIF, + 2 ENV, +2 HEA)
D. Kỹ thuật, máy móc, chế tạo robot hoặc thiết bị tự động (+4 ENG, +2TEC, +2CIT, +2MAN)

20. Bạn hãy chọn câu mô tả đúng nhất về tính cách của bản thân:
A. Kiên nhẫn, thích làm việc và vui chơi với trẻ em (+4 EDU)
B. Tỉ mỉ, cẩn trọng, đề cao độ chính xác (+4 MAT, +2 CIT)
C. Năng động, dễ thích nghi, hướng ngoại và thích những trải nghiệm mới(+4 TOU)
D. Điềm tĩnh, có trách nhiệm, chịu được áp lực, thích chăm sóc người khác (+4 HEA)


21, Nếu phải chọn làm một công việc, bạn sẽ chọn công việc nào dưới đây?
 A. Chỉnh sửa một đoạn video, hình ảnh  (+4 ART)
 B. Giải một bài toán khó yêu cầu nhiều bước (+4 MAT, +2 CIT) 
 C. Viết một đoạn văn hoặc bài luận (+4 HUM)
 D. Quan sát các hiện tượng tự nhiên và ghi lại những gì đã quan sát được (+4 SCI, +2 ENV, +2 LIF)

22. Nếu được chọn thử nghiệm một dự án nhỏ của CLB ở trường thì bạn sẽ chọn dự án nào?
 A. Tham gia một dự án kinh doanh nhỏ (+4 BUS)
 B. Tham gia sáng tạo một ứng dụng trên điện thoại (+4 CIT) 
 C. Tham gia lắp ráp mô hình robot mini (+4 TEC, +2 ENG)
 D. Tham gia sáng tạo một video truyền thông quảng bá địa điểm du lịch ở địa phương (+4 JOU, +1 TOU)

23, Bạn muốn tạo ra giá trị gì cho xã hội? 
 A. Giáo dục tri thức (+4 EDU) 
 B. Phát triển công nghệ (+4 CIT, +2 TEC) 
 C. Khám phá và phát triển khoa học mới (+4 SCI, +2 LIF)
 D. Hỗ trợ cộng đồng khó khăn (+4 SOC)

24. Bạn muốn thử thách bản thân bằng hoạt động nào?
A. Tham gia giải thể thao ngoài trời (+4 TOU)
B. Tham gia thi các cuộc thi về toán học, lập trình (+4 MAT, +4 CIT)
C. Tổ chức sự kiện, talkshow để giáo dục, hướng dẫn cho trẻ em về kiến thức hoặc kinh nghiệm sống (+4 EDU, +1 HUM)
D. Thực hiện dự án nghệ thuật có ý nghĩa cho cộng đồng (+4 ART, +1 SOC)

25. Bạn muốn đóng góp cho môi trường bằng cách nào?
A. Tham gia dọn rác, trồng cây gây rừng, bảo vệ môi trường (+4 ENV +3AGR)
B. Nghiên cứu các giải pháp cho năng lượng xanh (+4 SCI, +1 TEC)
C. Tổ chức chiến dịch nâng cao nhận thức cộng đồng (+4 SOC, +2 EDU)
D. Sáng tạo các sản phẩm truyền thông để tuyên truyền về môi trường (+4 ART, +1 HUM)
26. Bạn tự đánh giá mình mạnh về lĩnh vực nào nhất?
 A. Giao tiếp, thuyết phục và truyền đạt thông tin (+2 HUM, +2 EDU, +2LAW)
 B. Tư duy logic, tính toán, phân tích số liệu (+4 MAT, + 2 CIT)
 C. Thể chất, vận động, sức bền và kỹ năng thể thao (+4 TOU)
 D. Sáng tạo, thiết kế hình ảnh hoặc nội dung nghệ thuật (+4 ART)
27. Ví dụ lớp bạn tổ chức một buổi trò chơi, bạn muốn tham gia hoạt động nào nhất?
A. Quản lý, thiết kế và chế tạo dụng cụ trò chơi (+4 MAN)
B. Phân phối, sắp xếp nguyên vật liệu cho mọi người (+4 TRA)
C. Trồng cây, chăm sóc khu vườn nhỏ (+4 AGR, +2 ENV)
D. Tham gia biểu diễn văn nghệ (+4 ART)

28. Khi xem video trực tuyến, bạn thích chủ đề nào nhất?
A. Giáo dục, hướng dẫn học tập, mẹo học tập (+4 EDU)
B. Công nghệ, AI, robot và các phát minh kỹ thuật mới (+4 CIT, +2 TEC)
C. Đời sống, xã hội, các vấn đề con người và cộng đồng (+4 SOC, + 2WEL, +2 LAW)
D. Kiến trúc nhà cửa, thiết kế nội thất hoặc nghệ thuật và sáng tạo hình ảnh (+4 ARC, +2 ART)

29. Nếu phải chọn 1 trong 4 trải nghiệm sau, bạn sẽ chọn tham gia trải nghiệm nào?
A. Tham gia lớp học hoặc workshop về cách quản lý và điều hành một công ty (+4 BUS)
B. Tham gia trải nghiệm khám phá, du lịch, thám hiểm địa phương (+4 TOU)
C. Tham quan, nghiên cứu và học hỏi tại bệnh viện hoặc trung tâm y tế (+4 HEA)
D. Tham gia tìm hiểu về robot hoặc thử nghiệm công nghệ (+4 ENG, +2 TEC)
30. Nếu được thử tham gia một hoạt động, bạn sẽ chọn hoạt động nào?

A. Tham gia sản xuất và kiểm tra chất lượng sản phẩm của một công ty (+4 MAN)
B. Tham gia một hoạt động nông nghiệp về trồng và chăm sóc cây cối, đánh bắt hoặc chăm sóc vật nuôi (+4AGR)
C. Sắp xếp, tổ chức và điều phối giao thông (+4 TRA)
D. Tham gia chứng kiến một phiên tòa xử lý một vụ kiện tụng (+4LAW)


## Level 2 (IT) — Notes
- Quản lý bằng SQL trong pgAdmin, với 30 câu hỏi chuyên ngành IT (CS, DS, SE, UIUX, EMB, CY, AI, NET, IS).
- Options lưu `scoring` dạng JSONB, cộng điểm theo mã chuyên ngành.

## Seeding Strategy
- App không auto-seed dữ liệu. Dùng các script SQL trong pgAdmin để chèn/cập nhật Level 1 & Level 2.
- Tránh chạy các seed JS cũ để không ghi đè dữ liệu trong DB.
