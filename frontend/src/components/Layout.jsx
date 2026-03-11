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
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left sidebar */}
      <Navbar activePage={activePage} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-auto bg-white">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
