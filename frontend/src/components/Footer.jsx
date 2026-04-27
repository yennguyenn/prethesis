import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="flex-shrink-0 bg-white border-t border-slate-200 flex items-center justify-center" style={{ minHeight: 44 }}>
      <span className="text-xs text-slate-400">© {new Date().getFullYear()} Support Career – Hệ thống hỗ trợ quyết định chọn ngành</span>
    </footer>
  );
}
