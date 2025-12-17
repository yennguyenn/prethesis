import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../api';

export default function Orientation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> optionId
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      if (token) setAuthToken(token);
      const r = await API.get('/quiz/1'); // Level 1 questions
      setQuestions(r.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load orientation questions');
    } finally { setLoading(false); }
  }

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  function choose(optionId) {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  }
  function next() { if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1); }
  function prev() { if (currentIndex > 0) setCurrentIndex(i => i - 1); }

  async function submit() {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length) {
      setError(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }
    setSubmitting(true); setError('');
    try {
      const payload = { answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId: Number(questionId), optionId: Number(optionId) })) };
      const r = await API.post('/quiz/major/submit', payload);
      setResult(r.data);
      // Optionally inform user if not saved due to not logged in
      if (!localStorage.getItem('token') && r.data?.recommended) {
        setError('Login to save your orientation result and unlock specialization tracking.');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-primary-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading orientation questions...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-primary-100 py-12 px-4'>
        <div className='max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-10 h-10 text-primary-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6l4 2' />
              </svg>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Orientation Complete</h2>
            <p className='text-gray-600'>Recommended major based on your interests:</p>
          </div>
          <div className='bg-primary-100 rounded-xl p-6 mb-6'>
            <h3 className='text-2xl font-bold text-primary-900 mb-2'>{result.recommended?.name || 'No clear major'}</h3>
            <p className='text-gray-700 mb-4'>{result.recommended?.description || 'Try retaking or refine answers.'}</p>
            <div className='text-sm text-gray-600'><strong>Your Score:</strong> {result.topScore || 0} pts</div>
          </div>
          {result.allScores && result.allScores.length > 1 && (
            <div className='mb-6'>
              <h4 className='font-semibold text-gray-900 mb-3'>All Major Scores:</h4>
              <div className='space-y-2 max-h-64 overflow-auto pr-2'>
                {result.allScores.map((item, idx) => (
                  <div key={idx} className='flex items-center'>
                    <div className='flex-1'>
                      <div className='flex justify-between mb-1'>
                        <span className='text-sm font-medium text-gray-700'>{item.name}</span>
                        <span className='text-sm text-gray-600'>{item.score} pts</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div className='bg-primary-700 h-2 rounded-full transition-all' style={{ width: `${(item.score / (result.topScore || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className='flex flex-col sm:flex-row gap-4'>
            <button onClick={() => { setResult(null); setAnswers({}); setCurrentIndex(0); loadQuestions(); }} className='flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors'>Retake Orientation</button>
            {result.recommended?.code === 'ICT' && (
              <button onClick={() => navigate('/quiz')} className='flex-1 px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 transition-colors'>Proceed to IT Specialization</button>
            )}
            <button onClick={() => navigate('/')} className='flex-1 px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 transition-colors'>Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-primary-100 py-8 px-4'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white rounded-t-2xl shadow-lg p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-gray-900'>Major Orientation Assessment</h2>
            <button onClick={() => navigate('/')} className='text-gray-600 hover:text-gray-900'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
          <div className='mb-2'>
            <div className='flex justify-between text-sm text-gray-600 mb-1'>
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div className='bg-primary-700 h-2 rounded-full transition-all duration-300' style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
            <div className='flex items-center'>
              <svg className='w-5 h-5 text-red-600 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
              <span className='text-red-800'>{error}</span>
            </div>
          </div>
        )}
        {currentQuestion && (
          <div className='bg-white rounded-b-2xl shadow-lg p-8 mb-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>{currentQuestion.text}</h3>
            <div className='space-y-3'>
              {(currentQuestion.options || []).map(opt => (
                <label key={opt.id} className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion.id] === opt.id ? 'border-primary-700 bg-primary-100' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}>                  
                  <div className='flex items-center'>
                    <input type='radio' name={`q_${currentQuestion.id}`} checked={answers[currentQuestion.id] === opt.id} onChange={() => choose(opt.id)} className='w-5 h-5 text-primary-700 focus:ring-primary-500' />
                    <span className='ml-3 text-gray-800'>{opt.text}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className='flex justify-between items-center'>
          <button onClick={prev} disabled={currentIndex === 0} className='px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md'>← Previous</button>
          <div className='text-sm text-gray-600'>{Object.keys(answers).length} / {questions.length} answered</div>
          {currentIndex < questions.length - 1 ? (
            <button onClick={next} disabled={!isAnswered} className='px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md'>Next →</button>
          ) : (
            <button onClick={submit} disabled={submitting || Object.keys(answers).length < questions.length} className='px-8 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2'>
              {submitting ? (<><div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div> Submitting...</>) : (<>Submit Orientation <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
