import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../App';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { path: '/chat', label: 'Chat', icon: '◆' },
  { path: '/reports', label: 'Reports', icon: '▤' },
  { path: '/goals', label: 'Goals', icon: '◎' },
  { path: '/pricing', label: 'Pro Plans', icon: '⬡' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

const MOBILE_NAV = [
  { path: '/dashboard', label: 'Home', icon: '⌂' },
  { path: '/chat', label: 'Chat', icon: '◆', isChat: true },
  { path: '/reports', label: 'Reports', icon: '▤' },
  { path: '/goals', label: 'Goals', icon: '◎' },
  { path: '/settings', label: 'More', icon: '⋯' },
];

export default function Layout() {
  const { appData } = useApp();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch {}
  }, [collapsed]);

  return (
    <div className="app-layout">
      {/* Desktop + Tablet Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">PaiseWise</span>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▸' : '◂'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="footer-details" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {appData.plan === 'free' ? 'Free Plan' : appData.plan === 'pro' ? 'Pro' : 'Pro+'}
            </div>
          </div>
          {appData.plan === 'free' && (
            <NavLink to="/pricing" className="btn btn-primary btn-sm btn-full">
              Upgrade
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {MOBILE_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            data-chat={item.isChat ? 'true' : undefined}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
