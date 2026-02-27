import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Support Career</h3>
            <p className="text-gray-400 text-sm">Giúp học sinh định hướng nghề nghiệp phù hợp thông qua bài đánh giá thông minh.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link to="/quiz" className="text-gray-400 hover:text-white transition-colors">Làm trắc nghiệm</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Ngành học</Link></li>
              <li><Link to="/groups" className="text-gray-400 hover:text-white transition-colors">Khối thi</Link></li>
              <li><Link to="/results" className="text-gray-400 hover:text-white transition-colors">Kết quả của tôi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">Tài nguyên</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách quyền riêng tư</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-xs">
          <p>&copy; 2026 Support Career. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
