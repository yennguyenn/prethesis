import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function Home() {
  const [majors, setMajors] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await API.get("/majors");
        setMajors(Array.isArray(r.data) ? r.data : []);
      } catch (_) {
        setMajors([]);
      }
    })();
  }, []);
  return (
    <div className="">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 py-28 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Welcome to Support Career
          </h1>
          <p className="text-base md:text-xl text-primary-300 mb-8 max-w-3xl mx-auto">
            Support Career accompanies you in making career decisions based on data and personal competencies
          </p>
          <Link
            to="/quiz"
            className="inline-block px-8 py-3 bg-white text-primary-700 text-lg font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Start the assessment →
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Assessment Process</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Orientation</h3>
              <p className="text-gray-600 text-sm">Answer 60 questions about interests, learning styles, and personal values to identify suitable groups among 23 majors.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Score Analysis</h3>
              <p className="text-gray-600 text-sm">The DSS algorithm aggregates scores by major and sub-major codes to provide personalized recommendations.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Results</h3>
              <p className="text-gray-600 text-sm">Receive recommended majors/sub-majors with descriptions and skills suited to those fields.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Majors Preview (live from API) */}
      <div className="py-20 bg-gradient-to-br from-primary-100 to-primary-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">Suggestions for 23 available majors</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">A list of various fields such as: Economics, Science, Technology, Arts, ...</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-10">
            {(majors.slice(0, 23)).map((m) => {
              const rawCode = (m.code || '').trim();
              const lower = rawCode.toLowerCase();
              const initialSrc = rawCode ? `/assets/majors/${rawCode}.png` : '/assets/majors/default.svg';
              const alts = rawCode ? [`/assets/majors/${lower}.png`,`/assets/majors/${lower}.svg`,`/assets/majors/default.svg`] : [`/assets/majors/default.svg`];
              return (
                <Link key={m.id} to={`/careers/${m.code}`} className="group block bg-white rounded-xl p-5 text-center hover:shadow-lg border border-slate-100 transition">
                  <img
                    src={initialSrc}
                    alt={m.name}
                    loading="lazy"
                    className="h-12 w-12 mx-auto mb-3 object-contain"
                    data-alts={alts.join(',')}
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
                  <h3 className="font-semibold text-slate-900 group-hover:text-primary-700 line-clamp-2">{m.name || m.code}</h3>
                </Link>
              );
            })}
            {majors.length === 0 && (
              Array.from({ length: 12 }).map((_,i)=> (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 animate-pulse">
                  <div className="h-8 w-8 bg-slate-200 rounded-full mx-auto mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-2 bg-slate-100 rounded w-1/2 mx-auto" />
                </div>
              ))
            )}
          </div>
          <div className="text-center">
            <Link to="/careers" className="inline-block px-8 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 transition-colors">
              View detailed
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">60+</div>
              <div className="text-primary-300">Orientation Questions</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">23</div>
              <div className="text-primary-300">Majors</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-primary-300">Miễn phí</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to choose the right major?</h2>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete the assessment to receive major/sub-major suggestions aligned with your personality, skills, and interests.
          </p>
          <Link
            to="/quiz"
            className="inline-block px-8 py-3 bg-primary-700 text-white text-lg font-semibold rounded-xl hover:bg-primary-900 transition-colors shadow-lg"
          >
            Start now
          </Link>
        </div>
      </div>

      {/* Footer */}
      {/* Footer now globally provided via Layout */}
    </div>
  );
}
