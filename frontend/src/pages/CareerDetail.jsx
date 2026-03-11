import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';

// Centralized mapping for IT submajors (codes used in Level 2 results)
const SUBMAJORS = {
  SE: {
    name: 'Kỹ thuật phần mềm',
    intro: 'Thiết kế, xây dựng, kiểm thử và duy trì phần mềm với trọng tâm vào chất lượng và khả năng mở rộng.',
    description: 'Kỹ thuật phần mềm tập trung vào quy trình phát triển phần mềm chuyên nghiệp: phân tích yêu cầu, thiết kế hệ thống, lập trình, kiểm thử, triển khai và vận hành (DevOps). Kỹ sư phần mềm cần phối hợp đa nhóm, bảo đảm hiệu năng, bảo mật và tính dễ bảo trì.',
    skills: ['Lập trình', 'Thiết kế hệ thống', 'Kiểm thử/QA', 'DevOps', 'Quản lý phiên bản', 'Agile/Scrum'],
    studyGroup: 'Toán, Tin, Công nghệ',
    careers: ['Lập trình viên phần mềm', 'Kỹ sư Backend', 'Kỹ sư Full‑Stack', 'Kỹ sư QA', 'Kỹ sư DevOps', 'Trưởng nhóm kỹ thuật']
  },
  IS: {
    name: 'Hệ thống thông tin',
    intro: 'Kết nối công nghệ thông tin với nghiệp vụ, tối ưu hoá quy trình và dữ liệu doanh nghiệp.',
    description: 'Hệ thống thông tin tập trung khai thác, tổ chức và quản trị dữ liệu phục vụ ra quyết định. Vai trò bao gồm phân tích nghiệp vụ, quản lý hệ thống ERP/CRM, thiết kế luồng thông tin và bảo đảm tính nhất quán dữ liệu.',
    skills: ['Phân tích nghiệp vụ', 'Cơ sở dữ liệu', 'Mô hình hoá quy trình', 'Báo cáo', 'Quản lý dự án'],
    studyGroup: 'Toán, Kinh tế, Tin',
    careers: ['Chuyên viên phân tích nghiệp vụ', 'Chuyên viên phân tích hệ thống', 'Điều phối CNTT', 'Chuyên viên ERP', 'Chủ sản phẩm (Product Owner)']
  },
  UIUX: {
    name: 'Thiết kế UI/UX',
    intro: 'Thiết kế giao diện và trải nghiệm người dùng trực quan, thân thiện, nhất quán.',
    description: 'Thiết kế UI/UX chú trọng nghiên cứu người dùng, luồng tương tác, bố cục trực quan và ngôn ngữ thiết kế. Kết hợp mỹ thuật với tâm lý hành vi để tạo sản phẩm số dễ dùng và hấp dẫn.',
    skills: ['Phác thảo khung (Wireframe)', 'Tạo mẫu (Prototype)', 'Nghiên cứu người dùng', 'Thiết kế thị giác', 'Khả năng tiếp cận'],
    studyGroup: 'Mỹ thuật, Tin, Truyền thông',
    careers: ['Thiết kế UI', 'Nghiên cứu UX', 'Thiết kế sản phẩm', 'Thiết kế tương tác']
  },
  CS: {
    name: 'Khoa học máy tính',
    intro: 'Nền tảng lý thuyết tính toán, thuật toán và cấu trúc dữ liệu phục vụ đổi mới lâu dài.',
    description: 'Khoa học máy tính đào sâu thuật toán, độ phức tạp, lập trình hệ thống, trình biên dịch (compiler) và mô hình tính toán. Thích hợp cho nghiên cứu, tối ưu và phát triển công nghệ lõi.',
    skills: ['Thuật toán', 'Cấu trúc dữ liệu', 'Toán rời rạc', 'Độ phức tạp', 'Giải quyết vấn đề'],
    studyGroup: 'Toán, Lý, Tin',
    careers: ['Kỹ sư thuật toán', 'Kỹ sư nghiên cứu', 'Lập trình hệ thống', 'Nghiên cứu viên học thuật']
  },
  AI: {
    name: 'Trí tuệ nhân tạo',
    intro: 'Phát triển hệ thống thông minh: học máy, học sâu, xử lý ngôn ngữ và thị giác máy.',
    description: 'AI kết hợp thống kê, tối ưu hoá và lập trình để xây dựng mô hình dự đoán, nhận dạng và tự động hoá. Ứng dụng trong y tế, tài chính, robot và sản phẩm số thông minh.',
    skills: ['Học máy', 'Học sâu', 'Python', 'Xử lý dữ liệu', 'Đánh giá mô hình'],
    studyGroup: 'Toán, Tin, Lý',
    careers: ['Kỹ sư ML', 'Nghiên cứu AI', 'Nhà khoa học dữ liệu', 'Kỹ sư NLP', 'Kỹ sư thị giác máy tính']
  },
  DS: {
    name: 'Khoa học dữ liệu',
    intro: 'Phân tích dữ liệu, mô hình thống kê và trực quan hoá để hỗ trợ quyết định.',
    description: 'Khoa học dữ liệu sử dụng thống kê, xử lý dữ liệu lớn và học máy mức ứng dụng để khai thác insight. Tập trung chất lượng dữ liệu, diễn giải (storytelling) và tối ưu hiệu suất mô hình.',
    skills: ['Thống kê', 'SQL', 'Python/R', 'Trực quan hoá dữ liệu', 'Kỹ thuật đặc trưng'],
    studyGroup: 'Toán, Thống kê, Tin',
    careers: ['Nhà khoa học dữ liệu', 'Chuyên viên phân tích dữ liệu', 'Lập trình BI', 'Kỹ sư phân tích']
  },
  NET: {
    name: 'Mạng máy tính',
    intro: 'Thiết kế, quản trị hạ tầng mạng và kết nối an toàn, tin cậy.',
    description: 'Mạng máy tính bao gồm kiến trúc mạng, giao thức, định tuyến, ảo hoá và hạ tầng cloud. Đảm bảo thông suốt, hiệu năng và bảo mật truyền thông dữ liệu.',
    skills: ['TCP/IP', 'Định tuyến/Chuyển mạch', 'Bảo mật mạng', 'Kiến thức Cloud cơ bản', 'Linux'],
    studyGroup: 'Toán, Lý, Tin',
    careers: ['Kỹ sư mạng', 'Kỹ sư hạ tầng', 'Chuyên gia mạng Cloud']
  },
  CY: {
    name: 'An ninh mạng',
    intro: 'Phòng thủ và kiểm thử an ninh hệ thống, bảo vệ dữ liệu và quyền riêng tư.',
    description: 'An ninh mạng gồm đánh giá lỗ hổng, giám sát sự kiện, ứng phó sự cố và xây dựng chính sách bảo mật. Kết hợp tư duy tấn công & phòng thủ.',
    skills: ['Phân tích mối đe doạ', 'Kiểm thử xâm nhập', 'Mã hoá', 'Ứng phó sự cố', 'SIEM'],
    studyGroup: 'Toán, Tin, An ninh',
    careers: ['Chuyên viên an ninh', 'Chuyên viên kiểm thử xâm nhập', 'Kỹ sư SOC', 'Tư vấn bảo mật']
  },
  EMB: {
    name: 'Hệ thống nhúng',
    intro: 'Kết hợp phần cứng và phần mềm mức thấp cho thiết bị thông minh & IoT.',
    description: 'Hệ thống nhúng tập trung vi điều khiển, cảm biến, firmware, giao tiếp ngoại vi và tối ưu dung lượng/hiệu năng hệ thống nhúng.',
    skills: ['C/C++', 'Vi điều khiển', 'Điện tử', 'RTOS', 'Giao thức truyền thông nối tiếp'],
    studyGroup: 'Điện tử, Lý, Tin',
    careers: ['Kỹ sư nhúng', 'Lập trình firmware', 'Kỹ sư IoT', 'Chuyên viên tích hợp phần cứng']
  }
};

export default function CareerDetail() {
  const { code } = useParams();
  const [major, setMajor] = useState(null);
  const [loading, setLoading] = useState(true);

  const renderMajorDescription = (text) => {
    if (!text) return <p className="text-sm text-slate-700">Chưa có mô tả cho ngành này.</p>;
    const raw = String(text).replace(/\r\n/g, '\n');
    const blocks = raw.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

    // Heuristic formatting: treat section starting with "Sinh viên" as intro to list
    const idxSinhVien = blocks.findIndex(b => /^sinh viên/i.test(b));
    // Detect the first concluding paragraph after the checklist intro
    const idxKet = blocks.findIndex(b => /^(đây là ngành|ngành học này|it là ngành|nhân văn mở ra|kết luận|tổng kết)/i.test(b));

    if (idxSinhVien !== -1) {
      const head = blocks.slice(0, idxSinhVien);
      const tailStart = idxKet !== -1 ? idxKet : blocks.length;
      // Exclude any unusually long paragraph-like item accidentally parsed into list
      const listItems = blocks
        .slice(idxSinhVien + 1, tailStart)
        .filter(li => li.split(/\s+/).length <= 20 || li.length <= 140);
      const tail = idxKet !== -1 ? blocks.slice(idxKet) : (blocks.length > tailStart ? blocks.slice(tailStart) : []);

      return (
        <div className="space-y-5">
          {head.map((p, i) => (
            <p key={`p-h-${i}`} className="text-sm text-slate-700 leading-relaxed">{p}</p>
          ))}
          <div className="rounded-2xl border border-primary-300 bg-primary-100/60 p-4">
            <div className="text-sm font-semibold text-primary-700 mb-3">{blocks[idxSinhVien]}</div>
            {listItems.length > 0 && (
              <ul className="space-y-2">
                {listItems.map((li, i) => (
                  <li key={`li-${i}`} className="flex items-start gap-2 text-sm text-slate-800">
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-700 text-white text-[10px] select-none">✓</span>
                    <span className="leading-relaxed">{li}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {tail.map((p, i) => (
            <p key={`p-t-${i}`} className="text-sm text-slate-700 leading-relaxed">{p}</p>
          ))}
        </div>
      );
    }

    // Default: paragraphs
    return (
      <div className="space-y-4">
        {blocks.map((p, i) => (
          <p key={`p-${i}`} className="text-sm text-slate-700 leading-relaxed">{p}</p>
        ))}
      </div>
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const r = await API.get(`/majors/code/${code}`);
        if (mounted) setMajor(r.data || null);
      } catch (e) {
        if (mounted) setMajor(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  const data = SUBMAJORS[code];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#8b5cf6" }}>Đang tải...</h1>
      </div>
    );
  }

  // If backend has a major with this code, show that first
  if (major) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-lg p-8 border border-slate-100">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2" style={{ color: "#8b5cf6" }}>{major.name}</h1>
            <div className="text-xs inline-block px-3 py-1 rounded-full border" style={{ background: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' }}>Mã: {major.code}</div>
          </div>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Giới thiệu</h2>
            {renderMajorDescription(major.description)}
          </section>
          {Array.isArray(major.SubMajors) && major.SubMajors.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Các chuyên ngành</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {major.SubMajors.map(sm => (
                  <Link to={`/careers/${major.code}/${sm.code}`} key={sm.id} className="block p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow transition">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-primary-700">{sm.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ background: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' }}>{sm.code}</span>
                    </div>
                    {sm.studyGroup && <div className="text-[11px] text-slate-600 mb-1">Khối học: {sm.studyGroup}</div>}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">{sm.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <div className="mt-10 flex gap-4">
            <Link to="/careers" className="flex-1 text-center px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition">Danh sách ngành</Link>
            <Link to="/quiz" className="flex-1 text-center px-5 py-3 rounded-xl text-white text-sm font-semibold shadow hover:shadow-md transition" style={{ background: '#8b5cf6' }}>Làm trắc nghiệm</Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: static IT submajors detail by code
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-4">Chuyên ngành không tìm thấy</h1>
        <p className="text-slate-600 mb-6">Mã chuyên ngành "{code}" không tồn tại hoặc chưa được định nghĩa.</p>
        <Link to="/careers" className="px-5 py-2 rounded-lg bg-primary-700 text-white font-medium hover:bg-primary-900 transition">Quay về danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-lg p-8 border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-primary-700 mb-3">{data.name}</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">{data.intro}</p>
          <div className="text-xs inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-300">Khối học: {data.studyGroup}</div>
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
                <span key={s} className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-full border border-primary-300">{s}</span>
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
          <Link to="/quiz" className="flex-1 text-center px-5 py-3 rounded-xl text-white text-sm font-semibold shadow hover:shadow-md transition" style={{ background: '#8b5cf6' }}>Làm trắc nghiệm</Link>
        </div>
      </div>
    </div>
  );
}
