import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Centralized mapping for IT submajors (codes used in Level 2 results)
const SUBMAJORS = {
  SE: {
    name: 'Software Engineering',
    intro: 'Thiết kế, xây dựng, kiểm thử và duy trì phần mềm với trọng tâm vào chất lượng và khả năng mở rộng.',
    description: 'Software Engineering tập trung vào quy trình phát triển phần mềm chuyên nghiệp: phân tích yêu cầu, thiết kế hệ thống, lập trình, kiểm thử, triển khai và vận hành (DevOps). Kỹ sư phần mềm cần phối hợp đa nhóm, bảo đảm hiệu năng, bảo mật và tính dễ bảo trì.',
    skills: ['Programming', 'System Design', 'Testing/QA', 'DevOps', 'Version Control', 'Agile/Scrum'],
    studyGroup: 'Toán, Tin, Công nghệ',
    careers: ['Software Developer', 'Backend Engineer', 'Full‑Stack Engineer', 'QA Engineer', 'DevOps Engineer', 'Technical Lead']
  },
  IS: {
    name: 'Information Systems',
    intro: 'Kết nối công nghệ thông tin với nghiệp vụ, tối ưu hoá quy trình và dữ liệu doanh nghiệp.',
    description: 'Information Systems tập trung khai thác, tổ chức và quản trị dữ liệu phục vụ ra quyết định. Vai trò bao gồm phân tích nghiệp vụ, quản lý hệ thống ERP/CRM, thiết kế luồng thông tin và bảo đảm tính nhất quán dữ liệu.',
    skills: ['Business Analysis', 'Database', 'Process Modeling', 'Reporting', 'Project Management'],
    studyGroup: 'Toán, Kinh tế, Tin',
    careers: ['Business Analyst', 'System Analyst', 'IT Coordinator', 'ERP Specialist', 'Product Owner']
  },
  UIUX: {
    name: 'UI/UX Design',
    intro: 'Thiết kế giao diện và trải nghiệm người dùng trực quan, thân thiện, nhất quán.',
    description: 'UI/UX Design chú trọng nghiên cứu người dùng, luồng tương tác, bố cục trực quan và ngôn ngữ thiết kế. Kết hợp mỹ thuật với tâm lý hành vi để tạo sản phẩm số dễ dùng và hấp dẫn.',
    skills: ['Wireframing', 'Prototyping', 'User Research', 'Visual Design', 'Accessibility'],
    studyGroup: 'Mỹ thuật, Tin, Truyền thông',
    careers: ['UI Designer', 'UX Researcher', 'Product Designer', 'Interaction Designer']
  },
  CS: {
    name: 'Computer Science',
    intro: 'Nền tảng lý thuyết tính toán, thuật toán và cấu trúc dữ liệu phục vụ đổi mới lâu dài.',
    description: 'Computer Science đào sâu thuật toán, độ phức tạp, lập trình hệ thống, compiler, và mô hình tính toán. Thích hợp cho nghiên cứu, tối ưu và phát triển công nghệ lõi.',
    skills: ['Algorithms', 'Data Structures', 'Discrete Math', 'Complexity', 'Problem Solving'],
    studyGroup: 'Toán, Lý, Tin',
    careers: ['Algorithm Engineer', 'Research Engineer', 'Systems Developer', 'Academic Researcher']
  },
  AI: {
    name: 'Artificial Intelligence',
    intro: 'Phát triển hệ thống thông minh: học máy, học sâu, xử lý ngôn ngữ và thị giác máy.',
    description: 'AI kết hợp thống kê, tối ưu hoá và lập trình để xây dựng mô hình dự đoán, nhận dạng và tự động hoá. Ứng dụng trong y tế, tài chính, robot và sản phẩm số thông minh.',
    skills: ['Machine Learning', 'Deep Learning', 'Python', 'Data Processing', 'Model Evaluation'],
    studyGroup: 'Toán, Tin, Lý',
    careers: ['ML Engineer', 'AI Researcher', 'Data Scientist', 'NLP Engineer', 'Computer Vision Engineer']
  },
  DS: {
    name: 'Data Science',
    intro: 'Phân tích dữ liệu, mô hình thống kê và trực quan hoá để hỗ trợ quyết định.',
    description: 'Data Science sử dụng thống kê, xử lý dữ liệu lớn và học máy mức ứng dụng để khai thác insight. Tập trung chất lượng dữ liệu, storytelling và tối ưu hiệu suất mô hình.',
    skills: ['Statistics', 'SQL', 'Python/R', 'Data Visualization', 'Feature Engineering'],
    studyGroup: 'Toán, Thống kê, Tin',
    careers: ['Data Scientist', 'Data Analyst', 'BI Developer', 'Analytics Engineer']
  },
  NET: {
    name: 'Computer Networks',
    intro: 'Thiết kế, quản trị hạ tầng mạng và kết nối an toàn, tin cậy.',
    description: 'Computer Networks bao gồm kiến trúc mạng, giao thức, định tuyến, ảo hoá và hạ tầng cloud. Đảm bảo thông suốt, hiệu năng và bảo mật truyền thông dữ liệu.',
    skills: ['TCP/IP', 'Routing/Switching', 'Network Security', 'Cloud Basics', 'Linux'],
    studyGroup: 'Toán, Lý, Tin',
    careers: ['Network Engineer', 'Infrastructure Engineer', 'Cloud Networking Specialist']
  },
  CY: {
    name: 'Cybersecurity',
    intro: 'Phòng thủ và kiểm thử an ninh hệ thống, bảo vệ dữ liệu và quyền riêng tư.',
    description: 'Cybersecurity gồm đánh giá lỗ hổng, giám sát sự kiện, ứng phó sự cố và xây dựng chính sách bảo mật. Kết hợp tư duy tấn công & phòng thủ.',
    skills: ['Threat Analysis', 'Pen Testing', 'Encryption', 'Incident Response', 'SIEM'],
    studyGroup: 'Toán, Tin, An ninh',
    careers: ['Security Analyst', 'Penetration Tester', 'SOC Engineer', 'Security Consultant']
  },
  EMB: {
    name: 'Embedded Systems',
    intro: 'Kết hợp phần cứng và phần mềm mức thấp cho thiết bị thông minh & IoT.',
    description: 'Embedded Systems tập trung vi điều khiển, cảm biến, firmware, giao tiếp ngoại vi và tối ưu dung lượng/hiệu năng hệ thống nhúng.',
    skills: ['C/C++', 'Microcontrollers', 'Electronics', 'RTOS', 'Serial Protocols'],
    studyGroup: 'Điện tử, Lý, Tin',
    careers: ['Embedded Engineer', 'Firmware Developer', 'IoT Engineer', 'Hardware Integration Specialist']
  }
};

export default function CareerDetail() {
  const { code } = useParams();
  const data = SUBMAJORS[code];

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-4">Chuyên ngành không tìm thấy</h1>
        <p className="text-slate-600 mb-6">Mã chuyên ngành "{code}" không tồn tại hoặc chưa được định nghĩa.</p>
        <Link to="/careers" className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">Quay về danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-lg p-8 border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-3">{data.name}</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">{data.intro}</p>
          <div className="text-xs inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Khối học: {data.studyGroup}</div>
        </div>
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Tổng quan</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{data.description}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Kỹ năng chính</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <span key={s} className="px-3 py-1 text-xs bg-violet-50 text-violet-700 rounded-full border border-violet-200">{s}</span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Lộ trình nghề nghiệp</h2>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {data.careers.map(c => <li key={c}>{c}</li>)}
            </ul>
          </section>
        </div>
        <div className="mt-10 flex gap-4">
          <Link to="/careers" className="flex-1 text-center px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition">Danh sách chuyên ngành</Link>
          <Link to="/quiz" className="flex-1 text-center px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow hover:shadow-md transition">Làm trắc nghiệm</Link>
        </div>
      </div>
    </div>
  );
}
