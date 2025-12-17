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
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Nghề tiêu biểu</h2>
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
          setError('The sub-major does not belong to the selected major.');
          setData(null);
        } else {
          setData(r.data);
        }
      } catch (e) {
        setError('Sub-major not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [majorCode, subCode]);

  if (loading) return <div className="max-w-3xl mx-auto py-16 px-4"><h1 className="text-2xl font-bold">Loading...</h1></div>;
  if (error) return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-2">Error</h1>
      <p className="text-slate-600 mb-6">{error}</p>
      <Link to="/careers" className="px-5 py-2 rounded-lg bg-primary-700 text-white font-medium hover:bg-primary-900 transition">Back to majors list</Link>
    </div>
  );
  if (!data) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-lg p-8 border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-primary-700 mb-2">{data.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-300">Code: {data.code}</span>
            {data.Major && (
              <Link to={`/careers/${data.Major.code}`} className="text-xs inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-300 hover:bg-primary-300/30">
                Major: {data.Major.name}
              </Link>
            )}
          </div>
        </div>
        {data.studyGroup && (
          <div className="mb-5 text-[13px] text-slate-700">Suitable study group: <span className="font-medium">{data.studyGroup}</span></div>
        )}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Description</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.description || 'No description available for this sub-major.'}</p>
        </section>
        {renderJobs(data.exampleJobs)}
        <div className="mt-10 flex gap-4">
          <Link to="/careers" className="flex-1 text-center px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition">Majors list</Link>
          {data.Major && <Link to={`/careers/${data.Major.code}`} className="flex-1 text-center px-5 py-3 rounded-xl bg-primary-700 text-white text-sm font-semibold shadow hover:shadow-md transition">View major {data.Major.name}</Link>}
        </div>
      </div>
    </div>
  );
}
