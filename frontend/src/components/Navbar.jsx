import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ activePage = 'home' }) {
  const token = localStorage.getItem('token');
  // Detect admin role in JWT to show Admin button
  let isAdmin = false;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const json = decodeURIComponent(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(json);
        isAdmin = payload?.role === 'admin' || payload?.isAdmin === true;
      }
    } catch {}
  }

  return (
    <nav className='bg-white shadow-sm'>
      <div className='container mx-auto px-8'>
        <div className='flex justify-between items-center h-20'>

          {/* LEFT: Logo + Menu */}
          <div className='flex items-center gap-12'>

            {/* Logo */}
            <Link 
              to='/' 
              className='text-2xl font-bold text-primary-700 whitespace-nowrap'
            >
              Support Career
            </Link>

            {/* Menu */}
            <div className='flex items-center gap-8'>
              {[
                { to: '/', label: 'Home', key: 'home' },
                { to: '/quiz', label: 'Career Test', key: 'quiz' },
                { to: '/careers', label: 'Careers', key: 'careers' },
                { to: '/groups', label: 'Groups', key: 'groups' },
                // Show Results in main nav only if logged in
                ...(token ? [{ to: '/results', label: 'My Results', key: 'results' }] : []),
                // Admin entry visible only for admin users
                ...(isAdmin ? [{ to: '/admin', label: 'Admin', key: 'admin' }] : []),
              ].map(item => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePage === item.key
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-primary-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

          </div>

          {/* RIGHT: Login / Logout / CTA */}
          <div className='flex items-center gap-6'>
            {token ? (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className='text-gray-600 hover:text-red-600 font-medium'
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  to='/login' 
                  className='text-gray-700 hover:text-primary-700 font-medium'
                >
                  Log In
                </Link>
                <Link 
                  to='/quiz' 
                  className='px-6 py-3 bg-white text-primary-700 font-semibold rounded-full border-2 border-primary-700 hover:bg-primary-700 hover:text-white shadow-md'
                >
                  Take the free test
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
