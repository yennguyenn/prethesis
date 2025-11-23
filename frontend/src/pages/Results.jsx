import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../api";
import Navbar from "../components/Navbar";

export default function Results() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar activePage="results" />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Assessment Results</h1>

        {!token && (
          <div className="bg-white border border-indigo-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-indigo-700 mb-3">Login Required</h2>
            <p className="text-gray-700 mb-6">You need to log in to view saved assessment results.</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Go to Login
            </a>
          </div>
        )}

        {token && loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4" />
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
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Take an Assessment
            </a>
          </div>
        )}

        {token && !loading && !error && results.length > 0 && (
          <div className="space-y-6">
            {results.map((r) => {
              const d = r.details || {};
              const explicitSub = d.recommendedSubmajor;
              let subDisplay = "N/A";
              if (explicitSub && (explicitSub.name || explicitSub.code)) {
                subDisplay = `${explicitSub.name || explicitSub.code}${Number.isFinite(explicitSub.score) ? ` (${explicitSub.score})` : ""}`;
              } else {
                const top = pickTop(d.submajorScores);
                if (top) {
                  const [code, score] = top;
                  const name = d.subMajorNames?.[code] ?? code;
                  subDisplay = `${name}${Number.isFinite(score) ? ` (${score})` : ""}`;
                }
              }
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                      <h2 className="text-xl font-semibold text-indigo-700 mt-1">Assessment #{r.id}</h2>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                      Score: {r.score}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-indigo-800 mb-1">Recommended Major</h3>
                      <p className="text-gray-800">{r.major_name || "N/A"}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-800 mb-1">Recommended Submajor</h3>
                      <p className="text-gray-800">{subDisplay}</p>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">View Raw Details</summary>
                    <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64">{JSON.stringify(r.details, null, 2)}</pre>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
