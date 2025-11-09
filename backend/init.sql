-- ==============================
-- Database: dss_major_selection
-- ==============================

-- CREATE DATABASE dss_db;  -- Commented out since database already exists


-- ==============================
-- Table: majors
-- ==============================
CREATE TABLE IF NOT EXISTS majors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- ==============================
-- Table: sub_majors
-- ==============================
CREATE TABLE IF NOT EXISTS sub_majors (
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
('Information Technology', 'Nganh hoc ve may tinh, phan mem, he thong va ung dung cong nghe trong doi song.')
ON CONFLICT (name) DO NOTHING;

-- ==============================
-- Insert Data for Sub-Majors (10 chuyen nganh IT)
-- ==============================
INSERT INTO sub_majors (name, description, major_id) VALUES
('Computer Science', 'Nghien cuu thuat toan, cau truc du lieu va nguyen ly tinh toan.', 1),
('Software Engineering', 'Phat trien, kiem thu va bao tri phan mem.', 1),
('Information Systems', 'Phan tich va quan ly thong tin trong to chuc.', 1),
('Computer Networks and Data Communication', 'Thiet ke va quan tri mang, truyen du lieu an toan.', 1),
('Cybersecurity', 'Bao mat he thong, ma hoa va phong chong tan cong mang.', 1),
('Artificial Intelligence', 'May hoc, xu ly ngon ngu tu nhien va robot thong minh.', 1),
('Data Science', 'Khai thac va phan tich du lieu lon de ho tro ra quyet dinh.', 1),
('Graphic Design & Multimedia', 'Tao san pham truc quan nhu hinh anh, video va giao dien.', 1),
('Embedded Systems & Hardware', 'Phat trien vi dieu khien, cam bien, va thiet bi IoT.', 1),
('Mobile Application Development', 'Xay dung ung dung tren Android va iOS.', 1)
ON CONFLICT (name) DO NOTHING;
