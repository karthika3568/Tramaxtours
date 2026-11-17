import {
  BookOpenIcon,
  ChartBarIcon,
  ChevronDownIcon,
  CompassIcon,
  FileTextIcon,
  HomeIcon,
  ImageIcon,
  LayersIcon,
  LinkIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  PlaneIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SlidersIcon,
  SparklesIcon,
  StarIcon,
  StethoscopeIcon,
  UsersIcon,
  XIcon,
} from '../components/common/Icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import inquiryService from '../services/inquiryService';
import { getAccessToken } from '../utils/storage';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const toast = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const userDropdownRef = useRef(null);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleGroup = useCallback((groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Fetch live new trip requests count from API
  useEffect(() => {
    let isMounted = true;
    const token = getAccessToken();
    if (!token || !user) {
      return;
    }

    async function loadStats() {
      try {
        const stats = await inquiryService.getInquiryStats();
        if (isMounted && stats && typeof stats.new === 'number') {
          setNewRequestsCount(stats.new);
        }
      } catch {
        // Silently ignore network / auth errors on background polling
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Handle escape key to close mobile drawer and user dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (sidebarOpen) setSidebarOpen(false);
        if (userDropdownOpen) setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, userDropdownOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

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

  // Ensure body scroll is unlocked and dropdown closed on route change
  useEffect(() => {
    document.body.style.overflow = '';
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navGroups = [
    {
      id: 'overview',
      groupTitle: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', exact: true, permission: 'dashboard.view', icon: <ChartBarIcon size={18} /> },
      ],
    },
    {
      id: 'website',
      groupTitle: 'Website Management',
      items: [
        { label: 'Home Page', path: '/admin/website/home', permission: 'homepage.manage', icon: <HomeIcon size={18} /> },
        { label: 'Navigation & Header', path: '/admin/website/navigation', permission: 'settings.view', icon: <CompassIcon size={18} /> },
        { label: 'Hero Carousel', path: '/admin/website/home/hero', permission: 'homepage.manage', icon: <SlidersIcon size={18} /> },
        { label: 'Homepage Sections', path: '/admin/website/home/sections', permission: 'homepage.manage', icon: <LayersIcon size={18} /> },
        { label: 'Why Us (Benefits)', path: '/admin/website/home/benefits', permission: 'homepage.manage', icon: <SparklesIcon size={18} /> },
        { label: 'About Page', path: '/admin/website/about', permission: 'pages.manage', icon: <BookOpenIcon size={18} /> },
        { label: 'Contact Page', path: '/admin/website/contact', permission: 'settings.view', icon: <PhoneIcon size={18} /> },
        { label: 'Footer Manager', path: '/admin/website/footer', permission: 'footer.manage', icon: <LinkIcon size={18} /> },
      ],
    },
    {
      id: 'operations',
      groupTitle: 'Operations & Catalog',
      items: [
        {
          label: 'Trip Requests',
          path: '/admin/trip-requests',
          permission: 'trip_requests.view',
          fallbackPermission: 'contact.view',
          icon: <PlaneIcon size={18} />,
          badgeCount: newRequestsCount,
        },
        {
          label: 'Inquiries & Leads',
          path: '/admin/inquiries',
          permission: 'trip_requests.view',
          fallbackPermission: 'contact.view',
          icon: <MailIcon size={18} />,
        },
        { label: 'Bookings & Orders', path: '/admin/bookings', permission: 'bookings.view', icon: <FileTextIcon size={18} /> },
        { label: 'Curated Tours', path: '/admin/tours', permission: 'tours.view', icon: <CompassIcon size={18} /> },
        { label: 'Medical Trips', path: '/admin/medical-trips', permission: 'tours.view', icon: <StethoscopeIcon size={18} /> },
        { label: 'Destinations', path: '/admin/destinations', permission: 'destinations.view', icon: <MapPinIcon size={18} /> },
        { label: 'Media Library', path: '/admin/media', permission: 'media.view', icon: <ImageIcon size={18} /> },
        { label: 'Guest Reviews', path: '/admin/reviews', permission: 'reviews.view', icon: <StarIcon size={18} /> },
        { label: 'Standard Pages', path: '/admin/pages', permission: 'pages.manage', icon: <FileTextIcon size={18} /> },
      ],
    },
    {
      id: 'users',
      groupTitle: 'Customer & Staff Management',
      items: [
        { label: 'Customers & Bookings', path: '/admin/users', permission: 'users.view', icon: <UsersIcon size={18} /> },
        { label: 'Staff Roles & Permissions', path: '/admin/roles', permission: 'roles.view', icon: <ShieldCheckIcon size={18} /> },
      ],
    },
    {
      id: 'settings',
      groupTitle: 'System Settings',
      items: [
        { label: 'Site Settings', path: '/admin/settings', permission: 'settings.view', icon: <SettingsIcon size={18} /> },
        { label: 'Footer Links', path: '/admin/footer-links', permission: 'footer.manage', icon: <LinkIcon size={18} /> },
        { label: 'Social Channels', path: '/admin/social-links', permission: 'social.manage', icon: <PhoneIcon size={18} /> },
      ],
    },
  ];

  // RBAC check: super_admin and admin roles have full visibility; granular permission check for others
  const isUserAllowed = useCallback((item) => {
    if (!item.permission) return true;
    if (!user) return false;
    const roles = user.roles || (user.role ? [user.role] : []);
    if (roles.includes('super_admin') || user.role === 'super_admin' || roles.includes('admin') || user.role === 'admin') {
      return true;
    }
    if (hasPermission(item.permission)) {
      return true;
    }
    if (item.fallbackPermission && hasPermission(item.fallbackPermission)) {
      return true;
    }
    return false;
  }, [user, hasPermission]);

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
            <img src="/logo.png" alt="Wonderer South India" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
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
            <XIcon size={18} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navGroups.map((group) => {
            const accessibleItems = group.items.filter(isUserAllowed);
            if (accessibleItems.length === 0) return null;

            // Check if any child item is currently active
            const hasActiveChild = accessibleItems.some((item) => {
              if (item.exact) return location.pathname === item.path;
              const isHomePath = (item.path === '/admin/website/home' || item.path === '/admin/homepage') && (location.pathname === '/admin/website/home' || location.pathname === '/admin/homepage');
              return isHomePath || location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            });

            // Group is collapsed only if explicitly collapsed AND none of its children are currently active
            const isCollapsed = Boolean(collapsedGroups[group.id]) && !hasActiveChild;

            return (
              <div key={group.id || group.groupTitle} className="admin-nav-group">
                <button
                  type="button"
                  className="admin-nav-group-header"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`nav-group-${group.id}`}
                  title={`${isCollapsed ? 'Expand' : 'Collapse'} ${group.groupTitle}`}
                >
                  <span className="admin-nav-group-title">{group.groupTitle}</span>
                  <span className="admin-nav-group-meta">
                    <span className="admin-nav-group-count">{accessibleItems.length}</span>
                    <span className={`admin-nav-group-chevron ${isCollapsed ? 'is-collapsed' : ''}`} aria-hidden="true">
                      <ChevronDownIcon size={13} />
                    </span>
                  </span>
                </button>

                {!isCollapsed && (
                  <ul id={`nav-group-${group.id}`} className="admin-nav-list">
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
                            {item.badgeCount > 0 && (
                              <span className="admin-nav-badge">
                                {item.badgeCount}
                              </span>
                            )}
                            {isActive && <span className="active-indicator" aria-hidden="true" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
                <span>Wanderer Operations</span>
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

            {/* Interactive User Account Dropdown */}
            <div className="admin-user-dropdown-container" ref={userDropdownRef}>
              <button
                type="button"
                className={`admin-user-profile-btn ${userDropdownOpen ? 'is-active' : ''}`}
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="Toggle user account menu"
              >
                <div className="admin-user-avatar" aria-hidden="true">
                  {userInitial}
                </div>
                <div className="admin-user-meta hide-on-mobile-sm">
                  <span className="admin-user-name">{user?.name || 'Administrator'}</span>
                  <span className="admin-user-role-badge">
                    {isSuperAdmin && <ShieldCheckIcon size={12} color="#f59e0b" title="Super Administrator" />}
                    <span>{roleDisplay}</span>
                  </span>
                </div>
                <span className={`admin-user-chevron ${userDropdownOpen ? 'is-open' : ''}`} aria-hidden="true">
                  <ChevronDownIcon size={14} />
                </span>
              </button>

              {userDropdownOpen && (
                <div className="admin-user-dropdown-menu" role="menu" aria-label="User account actions">
                  <div className="admin-user-dropdown-header">
                    <div className="admin-dropdown-avatar">{userInitial}</div>
                    <div className="admin-dropdown-user-details">
                      <span className="admin-dropdown-name">{user?.name || 'Administrator'}</span>
                      <span className="admin-dropdown-email">{user?.email || 'admin@tramaxtours.com'}</span>
                      <span className="admin-dropdown-role-tag">{roleDisplay}</span>
                    </div>
                  </div>

                  <div className="admin-dropdown-divider" />

                  <div className="admin-dropdown-section">
                    <Link
                      to="/admin"
                      className="admin-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ChartBarIcon size={15} />
                      <span>Dashboard Overview</span>
                    </Link>
                    <Link
                      to="/admin/bookings"
                      className="admin-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FileTextIcon size={15} />
                      <span>Bookings & Orders</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="admin-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <SettingsIcon size={15} />
                      <span>Site Settings</span>
                    </Link>
                    <Link
                      to="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <CompassIcon size={15} />
                      <span>Live Public Website ↗</span>
                    </Link>
                  </div>

                  <div className="admin-dropdown-divider" />

                  <button
                    type="button"
                    className="admin-dropdown-logout-btn"
                    role="menuitem"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOutIcon size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm btn-logout hide-on-mobile-sm"
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
