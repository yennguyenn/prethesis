import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import QuestionList from "./QuestionList";
import EditQuestion from "./EditQuestion";
import Majors from "./Majors";
import ResultsAdmin from "./ResultsAdmin";
import UsersAdmin from "./Users";
import CriteriaAdmin from "./CriteriaAdmin";
import ResponsesAdmin from "./ResponsesAdmin";

export default function AdminDashboard(){
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-primary-100 to-primary-300 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">Bảng điều khiển quản trị</h2>
            <p className="mt-1 text-sm text-slate-600">Quản lý câu hỏi, Ngành/Chuyên ngành và xem kết quả người dùng.</p>
          </div>
          <div />
        </div>
        <nav className="flex flex-wrap gap-3 mb-6">
          <NavLink to="/admin/questions" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Câu hỏi</NavLink>
          <NavLink to="/admin/majors" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Ngành</NavLink>
          <NavLink to="/admin/results" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Kết quả người dùng</NavLink>
          <NavLink to="/admin/criteria" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Tiêu chí</NavLink>
          <NavLink to="/admin/responses" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Phản hồi</NavLink>
          <NavLink to="/admin/users" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Người dùng</NavLink>
        </nav>
        <Routes>
        <Route index element={<QuestionList />} />
        <Route path="questions" element={<QuestionList />} />
        <Route path="questions/edit/:id" element={<EditQuestion />} />
        <Route path="majors" element={<Majors />} />
        <Route path="results" element={<ResultsAdmin />} />
        <Route path="criteria" element={<CriteriaAdmin />} />
        <Route path="responses" element={<ResponsesAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        </Routes>
      </div>
    </div>
  );
}
