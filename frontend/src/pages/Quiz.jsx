import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../api";

export default function Quiz(){
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionId }
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadQuestions = async (lv) => {
    setLoading(true);
    setError("");
    setAnswers({});
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);
      const r = await API.get(`/quiz/${lv}`);
      // r.data is [{ id, text, options: [{id,text}] }]
      setQuestions(r.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Không tải được câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> { loadQuestions(level); }, [level]);

  const choose = (qId, optionId) => {
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const submit = async () => {
    try {
      setError("");
      const payload = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId: Number(optionId),
        }))
      };
      const r = await API.post("/quiz/submit", payload);
      setResult(r.data);
      // If logged in, also persist this result silently
      const token = localStorage.getItem("token");
      if (token) {
        setAuthToken(token);
        API.post("/results/submit", { answers: payload.answers }).catch(() => {});
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Gửi bài thất bại");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Bài trắc nghiệm định hướng</h2>

      <div style={{ marginBottom: 16 }}>
        <label>Chọn level: </label>
        <select value={level} onChange={(e)=> setLevel(Number(e.target.value))}>
          <option value={1}>Level 1 (Chọn ngành)</option>
          <option value={2}>Level 2 (Chọn chuyên ngành)</option>
        </select>
        <button style={{ marginLeft: 8 }} onClick={()=> loadQuestions(level)} disabled={loading}>
          Tải lại
        </button>
      </div>

      {loading && <div>Đang tải câu hỏi…</div>}
      {!!error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

      {questions.map(q => (
        <div key={q.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.id}. {q.text}</div>
          <div>
            {(q.options || []).map(opt => (
              <label key={opt.id} style={{ display: 'block', marginBottom: 6 }}>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={()=> choose(q.id, opt.id)}
                />
                <span style={{ marginLeft: 8 }}>{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {questions.length > 0 && (
        <button onClick={submit} disabled={Object.keys(answers).length === 0}>
          Nộp bài
        </button>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Kết quả gợi ý</h3>
          <div style={{ marginBottom: 8 }}>
            Ngành phù hợp: {result.recommendedMajor ? `${result.recommendedMajor.name || result.recommendedMajor.code} (${result.recommendedMajor.score})` : 'Không xác định'}
          </div>
          <div>
            Chuyên ngành: {result.recommendedSubmajor ? `${result.recommendedSubmajor.name || result.recommendedSubmajor.code} (${result.recommendedSubmajor.score})` : 'Không xác định'}
          </div>
          <details style={{ marginTop: 8 }}>
            <summary>Xem chi tiết điểm</summary>
            <pre style={{ background: '#f7f7f7', padding: 12, borderRadius: 6 }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
