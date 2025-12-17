import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Pages like login/register may have full-screen forms; still we keep consistent navbar/footer unless we decide otherwise.
export default function Layout() {
  const location = useLocation();
  // Determine active page key from pathname for Navbar highlight
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary-100 to-primary-300 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <Navbar activePage={activePage} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
