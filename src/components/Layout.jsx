import React from 'react';
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

  return (
    <div className="app-layout">
      {/* Desktop + Tablet Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>Paise</span>Wise
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
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {appData.plan === 'free' ? 'Free Plan' : appData.plan === 'pro' ? 'Pro' : 'Pro+'}
            </div>
            {appData.plan === 'free' && (
              <NavLink to="/pricing" className="btn btn-primary btn-sm btn-full">
                Upgrade
              </NavLink>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
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
