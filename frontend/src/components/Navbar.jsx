import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/', key: 'home', label: 'Trang chủ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    to: '/quiz', key: 'quiz', label: 'Trắc nghiệm',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    to: '/careers', key: 'careers', label: 'Ngành học',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  // { to: '/groups', key: 'groups', label: 'Khối thi', hidden: true 
];

export default function Navbar({ activePage = 'home' }) {
  const [collapsed, setCollapsed] = useState(false);

  const token = localStorage.getItem('token');
  let isAdmin = false;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const json = decodeURIComponent(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(json);
        isAdmin = payload?.role === 'admin' || payload?.isAdmin === true;
      }
    } catch (error) {
      console.warn('Failed to parse auth token payload', error);
    }
  }

  const items = [
    ...NAV_ITEMS,
    ...(token ? [{ to: '/results', key: 'results', label: 'Kết quả của tôi', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> }] : []),
    ...(isAdmin ? [{ to: '/admin', key: 'admin', label: 'Quản trị', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> }] : []),
  ];

  return (
    <aside
      className="flex flex-col flex-shrink-0 shadow-2xl transition-all duration-300"
      style={{ width: collapsed ? 64 : 240, background: '#f1f5f9' }}
    >
      {/* Brand + collapse toggle */}
      <div
        className="flex items-center border-b border-slate-200 flex-shrink-0"
        style={{ padding: collapsed ? '18px 14px' : '18px 16px', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'space-between' }}
      >
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl text-slate-700 font-black text-sm"
              style={{ width: 34, height: 34, background: '#8b5cf6' }}
            >
              S
            </div>
            <span className="text-slate-800 font-bold text-sm tracking-wide truncate">Support Career</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex-shrink-0 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ width: 32, height: 32, color: 'rgba(0,0,0,0.4)', border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            {collapsed ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></> : <><line x1="18" y1="6" x2="6" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="18" y1="18" x2="6" y2="18"/></>}
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1 px-2">
          {items.map(item => {
            const active = activePage === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className="flex items-center rounded-xl transition-all"
                style={{
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                  color: active ? '#8b5cf6' : '#475569',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom: login/logout */}
      <div className="border-t border-slate-200 p-2 flex-shrink-0">
        {token ? (
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }}
            className="flex items-center w-full rounded-xl transition-all hover:bg-white/10"
            style={{
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#64748b',
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center w-full rounded-xl transition-all hover:bg-white/10"
            style={{
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#64748b',
              fontSize: 14,
              textDecoration: 'none',
            }}
            title={collapsed ? 'Đăng nhập' : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            {!collapsed && <span>Đăng nhập</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
