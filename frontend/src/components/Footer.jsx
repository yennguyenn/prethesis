import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="flex-shrink-0 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between" style={{ padding: '0 32px', minHeight: 44 }}>
      <span className="text-xs text-slate-400">© {new Date().getFullYear()} Support Career – Hệ thống hỗ trợ quyết định chọn ngành</span>
      <span className="text-xs text-slate-400">v1.0</span>
    </footer>
  );
}
