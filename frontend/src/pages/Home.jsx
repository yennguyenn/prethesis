import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 py-28 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            DSS chọn ngành phù hợp cho bạn
          </h1>
          <p className="text-base md:text-xl text-fuchsia-100 mb-8 max-w-3xl mx-auto">
            Hệ thống hỗ trợ ra quyết định (Decision Support System) giúp gợi ý ngành học phù hợp dựa trên tính cách, kỹ năng và sở thích.
            Đánh giá 2 bước: Định hướng tổng quát (Level 1) → Chuyên sâu theo ngành (Level 2). IT chỉ là một ví dụ trong 24 ngành và sẽ được mở rộng sau.
          </p>
          <Link
            to="/quiz"
            className="inline-block px-8 py-3 bg-white text-indigo-700 text-lg font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Bắt đầu bài trắc nghiệm →
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Quy trình đánh giá</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Định hướng (Level 1)</h3>
              <p className="text-gray-600 text-sm">Trả lời 30 câu hỏi về sở thích, cách học và giá trị cá nhân để xác định nhóm ngành phù hợp trong 24 ngành.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Phân tích điểm</h3>
              <p className="text-gray-600 text-sm">Thuật toán DSS tổng hợp điểm theo mã ngành và chuyên ngành, đưa ra đề xuất cá nhân hoá.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Kết quả & lộ trình</h3>
              <p className="text-gray-600 text-sm">Nhận ngành/chuyên ngành đề xuất kèm mô tả, kỹ năng, lộ trình nghề nghiệp và liên kết trang chi tiết.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Majors Preview (sample) */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">Gợi ý 24 ngành tiêu biểu</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Danh sách nhiều ngành nghề: Kinh tế, Khoa học, Công nghệ, Xã hội, Nghệ thuật, Y tế,... 
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {[
              { icon: "💼", name: "Kinh doanh & Quản trị" },
              { icon: "📈", name: "Tài chính - Ngân hàng" },
              { icon: "📊", name: "Kế toán - Kiểm toán" },
              { icon: "📣", name: "Marketing" },
              { icon: "🏛️", name: "Luật" },
              { icon: "🧠", name: "Tâm lý học" },
              { icon: "🏥", name: "Y đa khoa" },
              { icon: "🦷", name: "Răng - Hàm - Mặt" },
              { icon: "💊", name: "Dược" },
              { icon: "🧪", name: "Hoá học" },
              { icon: "🧬", name: "Sinh học" },
              { icon: "📐", name: "Toán học" },
              { icon: "🔭", name: "Vật lý" },
              { icon: "🌍", name: "Địa lý" },
              { icon: "🏗️", name: "Kỹ thuật xây dựng" },
              { icon: "⚙️", name: "Cơ điện tử" },
              { icon: "🚗", name: "Cơ khí - Ô tô" },
              { icon: "🌿", name: "Nông nghiệp" },
              { icon: "🍽️", name: "Du lịch - Nhà hàng" },
              { icon: "🎨", name: "Thiết kế đồ hoạ" },
              { icon: "🎭", name: "Nghệ thuật biểu diễn" },
              { icon: "🏛️", name: "Khoa học xã hội" },
              { icon: "🗺️", name: "Quan hệ quốc tế" },
              { icon: "💻", name: "Công nghệ thông tin" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/careers" className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Xem ví dụ chuyên ngành CNTT
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-indigo-600">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">30+</div>
              <div className="text-indigo-200">Câu hỏi định hướng</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">9</div>
              <div className="text-indigo-200">Chuyên ngành IT</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-indigo-200">Miễn phí</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sẵn sàng chọn ngành phù hợp?</h2>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Hoàn thành bài trắc nghiệm để nhận gợi ý ngành/chuyên ngành sát với tính cách, kỹ năng và sở thích của bạn.
          </p>
          <Link
            to="/quiz"
            className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </div>

      {/* Footer */}
      {/* Footer now globally provided via Layout */}
    </div>
  );
}
