-- ==============================
-- Database: dss_major_selection
-- ==============================

CREATE DATABASE dss_db;


-- ==============================
-- Table: majors
-- ==============================
CREATE TABLE majors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- ==============================
-- Table: sub_majors
-- ==============================
CREATE TABLE sub_majors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    major_id INT REFERENCES majors(id) ON DELETE CASCADE
);

-- ==============================
-- Insert Data for Majors
-- ==============================
INSERT INTO majors (name, description)
VALUES 
('Information Technology', 'Ngành học về máy tính, phần mềm, hệ thống và ứng dụng công nghệ trong đời sống.');

-- ==============================
-- Insert Data for Sub-Majors (10 chuyên ngành IT)
-- ==============================
INSERT INTO sub_majors (name, description, major_id) VALUES
('Computer Science', 'Nghiên cứu thuật toán, cấu trúc dữ liệu và nguyên lý tính toán.', 1),
('Software Engineering', 'Phát triển, kiểm thử và bảo trì phần mềm.', 1),
('Information Systems', 'Phân tích và quản lý thông tin trong tổ chức.', 1),
('Computer Networks and Data Communication', 'Thiết kế và quản trị mạng, truyền dữ liệu an toàn.', 1),
('Cybersecurity', 'Bảo mật hệ thống, mã hóa và phòng chống tấn công mạng.', 1),
('Artificial Intelligence', 'Máy học, xử lý ngôn ngữ tự nhiên và robot thông minh.', 1),
('Data Science', 'Khai thác và phân tích dữ liệu lớn để hỗ trợ ra quyết định.', 1),
('Graphic Design & Multimedia', 'Tạo sản phẩm trực quan như hình ảnh, video và giao diện.', 1),
('Embedded Systems & Hardware', 'Phát triển vi điều khiển, cảm biến, và thiết bị IoT.', 1),
('Mobile Application Development', 'Xây dựng ứng dụng trên Android và iOS.', 1);
