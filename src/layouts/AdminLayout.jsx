import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const toast = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Handle body scroll lock when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const navGroups = [
    {
      groupTitle: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', exact: true, permission: 'dashboard.view', icon: '📊' },
      ],
    },
    {
      groupTitle: 'Website Management',
      items: [
        { label: 'Home Page', path: '/admin/website/home', permission: 'homepage.manage', icon: '🏠' },
        { label: 'Navigation & Header', path: '/admin/website/navigation', permission: 'settings.view', icon: '🧭' },
        { label: 'Hero Carousel', path: '/admin/website/home/hero', permission: 'homepage.manage', icon: '🌄' },
        { label: 'Homepage Sections', path: '/admin/website/home/sections', permission: 'homepage.manage', icon: '🧩' },
        { label: 'Why Us (Benefits)', path: '/admin/website/home/benefits', permission: 'homepage.manage', icon: '⭐' },
        { label: 'About Page', path: '/admin/website/about', permission: 'pages.manage', icon: '📖' },
        { label: 'Contact Page', path: '/admin/website/contact', permission: 'settings.view', icon: '📞' },
        { label: 'Footer Manager', path: '/admin/website/footer', permission: 'footer.manage', icon: '🔗' },
      ],
    },
    {
      groupTitle: 'Operations & Catalog',
      items: [
        { label: 'Inquiries & Leads', path: '/admin/inquiries', permission: 'contact.view', icon: '📩' },
        { label: 'Bookings & Orders', path: '/admin/bookings', permission: 'bookings.view', icon: '📋' },
        { label: 'Curated Tours', path: '/admin/tours', permission: 'tours.view', icon: '🗺️' },
        { label: 'Destinations', path: '/admin/destinations', permission: 'destinations.view', icon: '📍' },
        { label: 'Media Library', path: '/admin/media', permission: 'media.view', icon: '🖼️' },
        { label: 'Guest Reviews', path: '/admin/reviews', permission: 'reviews.view', icon: '💬' },
        { label: 'Standard Pages', path: '/admin/pages', permission: 'pages.manage', icon: '📄' },
      ],
    },
    {
      groupTitle: 'Customer Management',
      items: [
        { label: 'Customers & Bookings', path: '/admin/users', permission: 'users.view', icon: '👥' },
      ],
    },
    {
      groupTitle: 'System Settings',
      items: [
        { label: 'Site Settings', path: '/admin/settings', permission: 'settings.view', icon: '⚙️' },
        { label: 'Footer Links', path: '/admin/footer-links', permission: 'footer.manage', icon: '📑' },
        { label: 'Social Channels', path: '/admin/social-links', permission: 'social.manage', icon: '📱' },
      ],
    },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.info('You have been signed out successfully.', 'Signed Out');
      navigate('/admin/login', { replace: true });
    } catch {
      navigate('/admin/login', { replace: true });
    }
  }, [logout, toast, navigate]);

  // Determine current section title and breadcrumb
  const getCurrentPageMeta = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.exact ? location.pathname === item.path : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) {
          return { title: item.label, group: group.groupTitle };
        }
      }
    }
    if (location.pathname.includes('/new')) return { title: 'Create New Item', group: 'Management' };
    if (location.pathname.includes('/edit')) return { title: 'Edit Item', group: 'Management' };
    return { title: 'Operations Console', group: 'Wonderer South India' };
  };

  const pageMeta = getCurrentPageMeta();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const roleDisplay = user?.role ? user.role.replace(/_/g, ' ') : 'Administrator';
  const isSuperAdmin = user?.role === 'super_admin' || (user?.roles && user.roles.includes('super_admin'));

  return (
    <div className="admin-layout-wrapper">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="admin-sidebar-nav"
        className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        aria-label="Admin Portal Navigation"
      >
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand-link" onClick={closeSidebar}>
            <div className="admin-logo-box">
              <span className="logo-symbol">WSI</span>
            </div>
            <div className="admin-brand-info">
              <span className="admin-brand-title">WONDERER SOUTH INDIA</span>
              <span className="admin-portal-badge">TRAVEL MANAGEMENT</span>
            </div>
          </Link>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close admin menu"
          >
            ✕
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navGroups.map((group) => {
            const accessibleItems = group.items.filter((item) => {
              if (!item.permission) return true;
              return hasPermission(item.permission);
            });

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.groupTitle} className="admin-nav-group">
                <span className="admin-nav-group-title">{group.groupTitle}</span>
                <ul className="admin-nav-list">
                  {accessibleItems.map((item) => {
                    const isHomePath = (item.path === '/admin/website/home' || item.path === '/admin/homepage') && (location.pathname === '/admin/website/home' || location.pathname === '/admin/homepage');
                    const isActive = isHomePath || (item.exact
                      ? location.pathname === item.path
                      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));

                    return (
                      <li key={item.path} className="admin-nav-item">
                        <Link
                          to={item.path}
                          className={`admin-nav-link ${isActive ? 'active' : ''}`}
                          aria-current={isActive ? 'page' : undefined}
                          onClick={closeSidebar}
                        >
                          <span className="nav-item-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                          <span className="nav-item-label">{item.label}</span>
                          {isActive && <span className="active-indicator" aria-hidden="true" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user-mini">
            <div className="mini-user-avatar">{userInitial}</div>
            <div className="mini-user-meta">
              <span className="mini-user-name">{user?.name || 'Administrator'}</span>
              <span className="mini-user-role">{roleDisplay}</span>
            </div>
          </div>
          <Link to="/" className="btn-website-link" target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">↗</span> Public Website
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Wrapper */}
      <div className="admin-main-wrapper">
        {/* Admin Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-menu-toggle-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar-nav"
              aria-label={sidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
            >
              <span className="toggle-bar" />
              <span className="toggle-bar" />
              <span className="toggle-bar" />
            </button>

            <div className="admin-header-context">
              <div className="admin-breadcrumb">
                <span>Tramax Operations</span>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{pageMeta.group}</span>
              </div>
              <h1 className="context-title">{pageMeta.title}</h1>
            </div>
          </div>

          <div className="admin-header-right">
            <Link to="/" className="btn-header-site hide-on-mobile-sm" target="_blank" rel="noopener noreferrer">
              <span>↗</span> Live Website
            </Link>

            <div className="admin-user-profile-badge">
              <div className="admin-user-avatar" aria-hidden="true">
                {userInitial}
              </div>
              <div className="admin-user-meta">
                <span className="admin-user-name">{user?.name || 'Administrator'}</span>
                <span className="admin-user-role-badge">
                  {isSuperAdmin && <span className="role-crown" title="Super Administrator">👑</span>}
                  {roleDisplay}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm btn-logout"
              onClick={handleLogout}
              aria-label="Sign out of administration portal"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Routed Content Area */}
        <main className="admin-content" id="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
