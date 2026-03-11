import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';

export default function SubMajorDetail() {
  const { code: majorCode, subCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const renderJobs = (jobs) => {
    if (!Array.isArray(jobs) || jobs.length === 0) return null;
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: "#8b5cf6" }}>Nghề tiêu biểu</h2>
        <div className="rounded-2xl border border-primary-300 bg-primary-100/60 p-4">
          <ul className="grid sm:grid-cols-2 gap-2">
            {jobs.map((j, i) => (
              <li key={`job-${i}`} className="flex items-start gap-2 text-sm text-slate-800">
                <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-700 text-white text-[10px] select-none">★</span>
                <span className="leading-relaxed">{j}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const r = await API.get(`/submajors/code/${subCode}`);
        if (!mounted) return;
        // Optional: verify belongs to majorCode if provided
        if (r.data?.Major?.code && majorCode && r.data.Major.code !== majorCode) {
          setError('Chuyên ngành này không thuộc ngành đã chọn.');
          setData(null);
        } else {
          setData(r.data);
        }
      } catch (e) {
        setError('Không tìm thấy chuyên ngành.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [majorCode, subCode]);

  if (loading) return <div className="max-w-3xl mx-auto py-16 px-4"><h1 className="text-2xl font-bold" style={{ color: "#8b5cf6" }}>Đang tải...</h1></div>;
  if (error) return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#8b5cf6" }}>Lỗi</h1>
      <p className="text-slate-600 mb-6">{error}</p>
      <Link to="/careers" className="px-5 py-2 rounded-lg bg-primary-700 text-white font-medium hover:bg-primary-900 transition">Quay về danh sách ngành</Link>
    </div>
  );
  if (!data) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-lg p-8 border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "#8b5cf6" }}>{data.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs inline-block px-3 py-1 rounded-full border" style={{ background: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' }}>Mã: {data.code}</span>
            {data.Major && (
              <Link to={`/careers/${data.Major.code}`} className="text-xs inline-block px-3 py-1 rounded-full border" style={{ background: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' }}>
                Ngành: {data.Major.name}
              </Link>
            )}
          </div>
        </div>
        {data.studyGroup && (
          <div className="mb-5 text-[13px] text-slate-700">Khối học phù hợp: <span className="font-medium">{data.studyGroup}</span></div>
        )}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: "#8b5cf6" }}>Mô tả</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.description || 'Chưa có mô tả cho chuyên ngành này.'}</p>
        </section>
        {renderJobs(data.exampleJobs)}
        <div className="mt-10 flex gap-4">
          <Link to="/careers" className="flex-1 text-center px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition">Danh sách ngành</Link>
          {data.Major && <Link to={`/careers/${data.Major.code}`} className="flex-1 text-center px-5 py-3 rounded-xl text-white text-sm font-semibold shadow hover:shadow-md transition" style={{ background: '#8b5cf6' }}>Xem ngành {data.Major.name}</Link>}
        </div>
      </div>
    </div>
  );
}
