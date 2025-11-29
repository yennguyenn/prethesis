import React from "react";
import { Link } from "react-router-dom";
// Navbar supplied by Layout

// Đồng bộ với dữ liệu chi tiết chuyên ngành IT (Level 2)
// Mô tả ngắn gọn (intro) + mô tả mở rộng (description) đã xuất hiện ở trang chi tiết.
// Trang tổng quan này trình bày súc tích các lựa chọn chính và cho phép điều hướng đến chi tiết.
const careers = [
  {
    id: 'SE', icon: '⚙️', name: 'Software Engineering',
    intro: 'Thiết kế, xây dựng, kiểm thử và bảo trì phần mềm quy mô.',
    description: 'Tập trung quy trình chuyên nghiệp (phân tích yêu cầu, thiết kế, lập trình, kiểm thử, triển khai, vận hành) với mục tiêu hiệu năng, bảo mật, dễ mở rộng.',
    skills: ['Programming', 'System Design', 'Testing/QA', 'DevOps', 'Version Control'],
    careers: ['Software Developer', 'Backend Engineer', 'Full‑Stack Engineer', 'DevOps Engineer'],
  },
  {
    id: 'IS', icon: '📊', name: 'Information Systems',
    intro: 'Kết nối CNTT và nghiệp vụ, tối ưu hoá quy trình dữ liệu.',
    description: 'Quản trị thông tin, ERP/CRM, phân tích nghiệp vụ và hỗ trợ ra quyết định dựa trên dữ liệu nhất quán.',
    skills: ['Business Analysis', 'Database', 'Process Modeling', 'Reporting', 'Project Management'],
    careers: ['Business Analyst', 'System Analyst', 'ERP Specialist', 'Product Owner'],
  },
  {
    id: 'UIUX', icon: '🎨', name: 'UI/UX Design',
    intro: 'Thiết kế giao diện & trải nghiệm người dùng trực quan.',
    description: 'Nghiên cứu người dùng, luồng tương tác, bố cục và ngôn ngữ thiết kế để tạo sản phẩm số dễ dùng, hấp dẫn.',
    skills: ['Wireframing', 'Prototyping', 'User Research', 'Visual Design', 'Accessibility'],
    careers: ['UI Designer', 'UX Researcher', 'Product Designer'],
  },
  {
    id: 'CS', icon: '💻', name: 'Computer Science',
    intro: 'Nền tảng lý thuyết tính toán và thuật toán.',
    description: 'Thuật toán, độ phức tạp, cấu trúc dữ liệu, hệ thống và mô hình tính toán phục vụ nghiên cứu & tối ưu lõi.',
    skills: ['Algorithms', 'Data Structures', 'Discrete Math', 'Complexity'],
    careers: ['Algorithm Engineer', 'Research Engineer', 'Systems Developer'],
  },
  {
    id: 'AI', icon: '🤖', name: 'Artificial Intelligence',
    intro: 'Xây dựng mô hình thông minh học máy & học sâu.',
    description: 'Dự đoán, nhận dạng, xử lý ngôn ngữ & thị giác; ứng dụng trong sản phẩm thông minh và tự động hoá.',
    skills: ['Machine Learning', 'Deep Learning', 'Python', 'Data Processing'],
    careers: ['ML Engineer', 'AI Researcher', 'NLP Engineer'],
  },
  {
    id: 'DS', icon: '📈', name: 'Data Science',
    intro: 'Khai thác & phân tích dữ liệu hỗ trợ quyết định.',
    description: 'Thống kê, trực quan hoá, xử lý dữ liệu lớn và học máy ứng dụng để tạo insight giá trị.',
    skills: ['Statistics', 'SQL', 'Python/R', 'Visualization'],
    careers: ['Data Scientist', 'Data Analyst', 'BI Developer'],
  },
  {
    id: 'NET', icon: '🌐', name: 'Computer Networks',
    intro: 'Thiết kế & quản trị hạ tầng mạng hiệu năng, an toàn.',
    description: 'Giao thức, định tuyến, ảo hoá, giám sát và tối ưu kết nối cho hệ thống và dịch vụ.',
    skills: ['TCP/IP', 'Routing', 'Network Security', 'Linux'],
    careers: ['Network Engineer', 'Infrastructure Engineer'],
  },
  {
    id: 'CY', icon: '🔒', name: 'Cybersecurity',
    intro: 'Bảo vệ hệ thống & dữ liệu trước mối đe doạ.',
    description: 'Đánh giá lỗ hổng, giám sát, ứng phó sự cố và xây dựng chính sách bảo mật toàn diện.',
    skills: ['Pen Testing', 'Threat Analysis', 'Encryption', 'Incident Response'],
    careers: ['Security Analyst', 'Penetration Tester', 'SOC Engineer'],
  },
  {
    id: 'EMB', icon: '🔧', name: 'Embedded Systems',
    intro: 'Kết hợp phần cứng & phần mềm cho thiết bị thông minh.',
    description: 'Vi điều khiển, firmware, cảm biến, giao tiếp ngoại vi và tối ưu tài nguyên hệ thống nhúng.',
    skills: ['C/C++', 'Microcontrollers', 'RTOS', 'Electronics'],
    careers: ['Embedded Engineer', 'Firmware Developer', 'IoT Engineer'],
  }
];

export default function Careers() {
  return (
    <div className="">

      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chuyên ngành Công nghệ thông tin</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tổng quan các hướng chuyên sâu trong ngành CNTT. Chọn lĩnh vực phù hợp với thế mạnh và định hướng học tập của bạn.
          </p>
        </div>
      </div>

      {/* Careers Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {careers.map(c => (
            <div key={c.id} className="relative bg-white rounded-2xl shadow-lg p-7 hover:shadow-xl border border-slate-100 transition group">
              <div className="flex items-start mb-5">
                <div className="text-4xl mr-4 select-none">{c.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition">{c.name}</h2>
                  <p className="text-sm text-slate-600 mb-1">{c.intro}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{c.description}</p>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Kỹ năng chính</h3>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] rounded-full border border-indigo-100">{s}</span>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Lộ trình nghề nghiệp</h3>
                <div className="flex flex-wrap gap-1.5">
                  {c.careers.map(job => (
                    <span key={job} className="px-2 py-1 bg-violet-50 text-violet-700 text-[11px] rounded border border-violet-100">{job}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Link to={`/careers/${c.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Xem chi tiết
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

  {/* CTA Section */}
  <div className="container mx-auto px-4 py-12 mb-12">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Khám phá phù hợp của bạn</h2>
          <p className="text-base md:text-lg mb-8 opacity-95 max-w-2xl mx-auto">
            Làm bài trắc nghiệm để hệ thống đề xuất chuyên ngành IT phù hợp nhất với sở thích và năng lực hiện tại của bạn.
          </p>
          <Link to="/quiz" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-slate-100 transition shadow">
            Bắt đầu đánh giá
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </Link>
        </div>
      </div>
      {/* Footer provided by Layout */}
    </div>
  );
}
