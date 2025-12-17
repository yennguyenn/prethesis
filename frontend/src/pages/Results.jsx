import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { setAuthToken } from "../api";
// Navbar & Footer provided by Layout

export default function Results() {
  const SUBMAJOR_LABELS = {
    SE: 'Software Engineering',
    IS: 'Information Systems',
    UIUX: 'UI/UX Design',
    AI: 'Artificial Intelligence',
    CS: 'Computer Science',
    DS: 'Data Science',
    NET: 'Computer Networks',
    CY: 'Cybersecurity',
    EMB: 'Embedded Systems'
  };
  const MAJOR_DISPLAY = {
    IT: 'Công nghệ thông tin - IT',
    'Information Technology': 'Công nghệ thông tin - IT'
  };
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    API.get("/results/me")
      .then((r) => setResults(r.data || []))
      .catch((e) => {
        if (e?.response?.status === 401) {
          setError("Your session is invalid or expired. Please log in again.");
          localStorage.removeItem("token");
        } else {
          setError(e?.response?.data?.message || "Failed to load results");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const pickTop = (scoresObj) => {
    if (!scoresObj || typeof scoresObj !== "object") return null;
    const entries = Object.entries(scoresObj);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Assessment Results</h1>

        {!token && (
          <div className="bg-white border border-primary-300 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-primary-700 mb-3">Login Required</h2>
            <p className="text-gray-700 mb-6">You need to log in to view saved assessment results.</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 transition-colors shadow-md"
            >
              Go to Login
            </a>
          </div>
        )}

        {token && loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700 mx-auto mb-4" />
              <p className="text-gray-600">Loading your results...</p>
            </div>
          </div>
        )}

        {token && !loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {token && !loading && !error && results.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Results Yet</h2>
            <p className="text-gray-600 mb-6">You haven't completed any assessments while logged in.</p>
            <a
              href="/quiz"
              className="inline-block px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 transition-colors shadow-md"
            >
              Take an Assessment
            </a>
          </div>
        )}

        {token && !loading && !error && results.length > 0 && (
          <div className="space-y-6">
            {results.map((r) => {
              const d = r.details || {};
              const recommendedMajor = d.recommendedMajor;
              const recommendedSubmajor = d.recommendedSubmajor;
              // Fallbacks
              const rawMajorName = r.major_name || recommendedMajor?.name || recommendedMajor?.code || "N/A";
              const majorName = MAJOR_DISPLAY[recommendedMajor?.code] || MAJOR_DISPLAY[rawMajorName] || rawMajorName;
              const majorDesc = recommendedMajor?.description || "";
              let subName = "N/A";
              let subDesc = "";
              if (recommendedSubmajor && (recommendedSubmajor.name || recommendedSubmajor.code)) {
                subName = SUBMAJOR_LABELS[recommendedSubmajor.code] || recommendedSubmajor.name || recommendedSubmajor.code;
                subDesc = recommendedSubmajor.description || "";
              } else {
                const top = pickTop(d.submajorScores);
                if (top) {
                  const [code] = top;
                  subName = SUBMAJOR_LABELS[code] || d.subMajorNames?.[code] || code;
                }
              }
              return (
                <div key={r.id} className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
                      <h2 className="text-lg font-semibold text-slate-900 mt-1">Bài đánh giá #{r.id}</h2>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full border border-primary-300">
                      Điểm: {r.score}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-primary-300 bg-gradient-to-br from-primary-100 to-primary-300/40 p-4">
                      <div className="text-[11px] uppercase tracking-wide text-primary-700 font-medium mb-1">Ngành gợi ý</div>
                      <div className="text-base font-semibold text-primary-900">{majorName}</div>
                      {majorDesc && <p className="mt-1 text-xs text-slate-700">{majorDesc}</p>}
                    </div>
                    <div className="rounded-xl border border-primary-300 bg-gradient-to-br from-primary-100 to-primary-300/40 p-4">
                      <div className="text-[11px] uppercase tracking-wide text-primary-700 font-medium mb-1">Chuyên ngành gợi ý</div>
                      <div className="text-base font-semibold text-primary-900">
                        {d.recommendedSubmajor?.code || d.recommendedSubmajor?.name ? (
                          <Link to={`/careers/${d.recommendedSubmajor?.code || d.recommendedSubmajor?.name}`} className="hover:underline decoration-primary-500 underline-offset-4">
                            {subName}
                          </Link>
                        ) : (
                          subName
                        )}
                      </div>
                      {subDesc && <p className="mt-1 text-xs text-slate-700">{subDesc}</p>}
                      {d.recommendedSubmajor?.studyGroup && (
                        <div className="mt-1 text-[11px] text-slate-600"><span className="font-semibold text-primary-700">Khối học:</span> {d.recommendedSubmajor.studyGroup}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Footer is global via Layout */}
    </div>
  );
}
