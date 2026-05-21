import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;
  const activePage =
    path === '/' ? 'home'
    : path.startsWith('/quiz') ? 'quiz'
    : path.startsWith('/careers') ? 'careers'
    : path.startsWith('/groups') ? 'groups'
    : path.startsWith('/results') ? 'results'
    : path.startsWith('/admin') ? 'admin'
    : undefined;

  return (
    <div className="flex h-screen w-screen p-3 md:p-6 overflow-hidden" style={{ fontFamily: "'Mulish', sans-serif", background: "var(--surface-body)" }}>
      {/* App Container */}
      <div className="flex flex-1 overflow-hidden shadow-sm rounded-[32px] border border-slate-100" style={{ background: "var(--surface-app)" }}>
        {/* Left sidebar */}
        <Navbar activePage={activePage} />
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 rounded-[32px]">
          <main className="flex-1 overflow-auto custom-scrollbar">
            <Outlet />
          </main>
          {/* <Footer /> - Temporarily hidden or keep it depending on design */}
        </div>
      </div>
    </div>
  );
}
