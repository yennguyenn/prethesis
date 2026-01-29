import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function Careers() {
  const [majors, setMajors] = useState([]);
  // Admin controls removed per request

  useEffect(() => {
    // No admin mode
    load();
  }, []);

  const load = async () => {
    const r = await API.get("/majors");
    setMajors(r.data || []);
  };

  // Admin mutations removed per request

  return (
    <div className="">
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4"> 23 majors available in Vietnam </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Overview of 23 majors currently being taught at universities and colleges in Vietnam
          </p>
        </div>
      </div>

      {/* Admin controls removed per request */}

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {majors.map(m => (
            <div key={m.id} className="relative bg-white rounded-2xl shadow-lg p-7 hover:shadow-xl border border-slate-100 transition group">
              <div className="flex items-start mb-5">
                <img
                  src={(m.code && m.code.trim()) ? `/assets/majors/${m.code.trim()}.png` : '/assets/majors/default.svg'}
                  alt={m.name}
                  loading="lazy"
                  className="h-10 w-10 mr-4 object-contain"
                  data-alts={(m.code && m.code.trim()) ? `/assets/majors/${m.code.trim()}.png,/assets/majors/${m.code.trim()}.svg,/assets/majors/default.svg` : '/assets/majors/default.svg'}
                  data-idx="0"
                  onError={(e)=>{
                    const el = e.currentTarget;
                    const list = (el.getAttribute('data-alts')||'').split(',').filter(Boolean);
                    const idx = parseInt(el.getAttribute('data-idx')||'0',10);
                    if (idx < list.length) {
                      el.src = list[idx];
                      el.setAttribute('data-idx', String(idx+1));
                    } else {
                      el.onerror = null;
                      el.src = '/assets/majors/default.svg';
                    }
                  }}
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition">{m.name || m.code}</h2>
                  <p className="text-sm text-slate-600 mb-1">{m.code}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{m.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link to={`/careers/${m.code}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900">
                  More details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                {/* Admin inline actions removed per request */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 mb-12">
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-3xl p-12 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Khám phá phù hợp của bạn</h2>
          <p className="text-base md:text-lg mb-8 opacity-95 max-w-2xl mx-auto">
            Làm bài trắc nghiệm để hệ thống đề xuất ngành/chuyên ngành phù hợp nhất với sở thích và năng lực hiện tại của bạn.
          </p>
          <Link to="/quiz" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-slate-100 transition shadow">
            Bắt đầu đánh giá
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
