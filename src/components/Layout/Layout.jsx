import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, CheckCircle, Layers, Sparkles, Users, Bell, Settings, LogOut, Home, Menu, X, MessageSquare, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

const routeLabels = {
  '/': 'Dashboard',
  '/properties': 'Properties',
  '/review-queue': 'Review Queue',
  '/property-types': 'Property Types',
  '/amenities': 'Amenities',
  '/users': 'Users',
  '/inquiries': 'Inquiries',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('pk_admin_user') || '{}');

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const isProduction = (import.meta.env.VITE_API_URL || '').includes('render');
  const currentLabel = routeLabels[location.pathname] || 'Page';

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/properties', icon: <Building2 size={18} />, label: 'Properties' },
    { to: '/review-queue', icon: <CheckCircle size={18} />, label: 'Review Queue' },
    { to: '/property-types', icon: <Layers size={18} />, label: 'Property Types' },
    { to: '/amenities', icon: <Sparkles size={18} />, label: 'Amenities' },
    { to: '/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/inquiries', icon: <MessageSquare size={18} />, label: 'Inquiries' },
    { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sl-icon"><Home size={18} /></div>
            <span>Property<b>KING</b></span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}<span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="su-avatar">{user.full_name?.[0] || 'A'}</div>
            <div>
              <p className="su-name">{user.full_name || 'Admin'}</p>
              <p className="su-role">Administrator</p>
            </div>
          </div>
          <button className="sidebar-link logout" onClick={logout}><LogOut size={18} /><span>Logout</span></button>
        </div>
      </aside>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <div className="breadcrumb">
              <a href="/">Admin</a>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text)' }}>{currentLabel}</span>
            </div>
          </div>
          <div className="header-right">
            <span className={`header-env ${isProduction ? 'env-prod' : 'env-dev'}`}>
              {isProduction ? 'Production' : 'Development'}
            </span>
          </div>
        </header>
        <div className="admin-content page-enter"><Outlet /></div>
      </div>
    </div>
  );
}
