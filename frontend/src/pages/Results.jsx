import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../api";

export default function Results(){
  const [results, setResults] = useState([]);
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    API.get("/results/me").then(r => setResults(r.data)).catch(()=>{});
  }, []);
  
  const pickTop = (scoresObj) => {
    if (!scoresObj || typeof scoresObj !== 'object') return null;
    const entries = Object.entries(scoresObj);
    if (entries.length === 0) return null;
    entries.sort((a,b) => b[1] - a[1]);
    return entries[0]; // [code, score]
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Results</h2>
      {results.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", marginBottom: 8, padding: 8 }}>
          <div>Date: {new Date(r.created_at).toLocaleString()}</div>
          <div>Score: {r.score}</div>
          <div>Suggested Major: {r.major_name || "N/A"}</div>
          {/* Derive Suggested Submajor from details if available */}
          {(() => {
            const d = r.details || {};
            // Prefer explicit recommendedSubmajor if present
            const explicit = d.recommendedSubmajor;
            if (explicit && (explicit.name || explicit.code)) {
              return (
                <div>
                  Suggested Submajor: {explicit.name || explicit.code} {Number.isFinite(explicit.score) ? `(${explicit.score})` : ""}
                </div>
              );
            }
            // Else compute from submajorScores and subMajorNames map
            const top = pickTop(d.submajorScores);
            if (top) {
              const [code, score] = top;
              const name = d.subMajorNames?.[code] ?? code;
              return (
                <div>Suggested Submajor: {name} {Number.isFinite(score) ? `(${score})` : ""}</div>
              );
            }
            return <div>Suggested Submajor: N/A</div>;
          })()}
          <details><summary>Details</summary><pre>{JSON.stringify(r.details, null, 2)}</pre></details>
        </div>
      ))}
    </div>
  );
}
