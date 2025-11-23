import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ activePage = 'home' }) {
  const token = localStorage.getItem('token');

  return (
    <nav className='bg-white shadow-sm'>
      <div className='container mx-auto px-8'>
        <div className='flex justify-between items-center h-20'>

          {/* LEFT: Logo + Menu */}
          <div className='flex items-center gap-12'>

            {/* Logo */}
            <Link 
              to='/' 
              className='text-2xl font-bold text-indigo-700 whitespace-nowrap'
            >
              IT Career Path
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
              ].map(item => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePage === item.key
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
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
                  className='text-gray-700 hover:text-indigo-600 font-medium'
                >
                  Log In
                </Link>
                <Link 
                  to='/quiz' 
                  className='px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white shadow-md'
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
