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
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#8b5cf6" }}> 23 ngành học của Việt Nam </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tổng quan 23 ngành học hiện đang được đào tạo tại các trường đại học và cao đẳng ở Việt Nam
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
                  onError={(e) => {
                    const el = e.currentTarget;
                    const list = (el.getAttribute('data-alts') || '').split(',').filter(Boolean);
                    const idx = parseInt(el.getAttribute('data-idx') || '0', 10);
                    if (idx < list.length) {
                      el.src = list[idx];
                      el.setAttribute('data-idx', String(idx + 1));
                    } else {
                      el.onerror = null;
                      el.src = '/assets/majors/default.svg';
                    }
                  }}
                />
                <div>
                  <h2 className="text-xl font-bold mb-1 transition" style={{ color: "#8b5cf6" }}>{m.name || m.code}</h2>
                  <span className="text-xs inline-block px-2 py-0.5 rounded-full border mb-1" style={{ background: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' }}>{m.code}</span>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{m.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link to={`/careers/${m.code}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900">
                  Xem chi tiết
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                {/* Admin inline actions removed per request */}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
