import { CalendarIcon, KeyIcon, LockIcon, LogOutIcon, SettingsIcon, TicketIcon, UserIcon } from '../common/Icons';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import useAuth from '../../hooks/useAuth';
import { isAdminRole } from '../../utils/roles';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  const { getSetting } = useSiteSettings();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();

  const siteName = getSetting('site_name', 'Wonderer South India');
  const logoUrl = getSetting('site_logo_url', '') || getSetting('site_logo', '') || '/logo.png';
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Main Sticky Header */}
      <header className={`public-header ${isScrolled ? 'header-scrolled' : ''}`.trim()} id="site-header">
        <div className="container header-main-inner">
          {/* Brand Logo */}
          <Link to="/" className="site-brand-link" aria-label={`${siteName} Home`}>
            <img src={logoUrl} alt={siteName} className="site-brand-logo-img" />
          </Link>

          {/* Desktop Navigation */}
          <div className="header-nav-wrapper">
            <Navbar className="desktop-only" />
          </div>

          {/* Header Action & Authentication Controls */}
          <div className="header-actions-wrapper">
            {/* Language Switcher (EN / DE) */}
            <div className="hide-on-mobile">
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <div className="header-user-badge-wrap hide-on-mobile" ref={userDropdownRef} style={{ position: 'relative' }}>
                {isAdmin ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/admin" className="btn btn-outline btn-sm btn-admin-console" title="Open Admin Console" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <SettingsIcon size={14} /> {t('nav_admin_console', 'Admin Console')}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-ghost btn-sm btn-header-logout"
                      title="Sign Out"
                    >
                      {t('nav_sign_out', 'Sign Out')}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                      className="btn btn-outline btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '9999px',
                        padding: '0.35rem 0.85rem',
                        borderColor: isUserDropdownOpen ? '#0d9488' : '#e2e8f0',
                        background: isUserDropdownOpen ? '#f0fdfa' : '#ffffff',
                        fontWeight: 600,
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#0d9488',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          overflow: 'hidden',
                        }}
                      >
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (user?.name || 'C')[0].toUpperCase()
                        )}
                      </div>
                      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name?.split(' ')[0] || 'My Account'}
                      </span>
                      <span style={{ fontSize: '0.7rem' }}>▼</span>
                    </button>

                    {isUserDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          right: 0,
                          width: '230px',
                          background: '#ffffff',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                          padding: '0.5rem 0',
                          zIndex: 1000,
                        }}
                      >
                        <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
                            {user?.name || 'Customer'}
                          </p>
                          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/customer/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 1rem',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          <UserIcon size={16} color="#0d9488" /> 1. My Profile
                        </Link>

                        <Link
                          to="/customer/bookings"
                          onClick={() => setIsUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 1rem',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          <CalendarIcon size={16} color="#0d9488" /> 2. My Bookings
                        </Link>

                        <Link
                          to="/customer/bookings?status=confirmed"
                          onClick={() => setIsUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 1rem',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          <TicketIcon size={16} color="#0d9488" /> 3. Upcoming Tours
                        </Link>

                        <Link
                          to="/customer/bookings?status=completed"
                          onClick={() => setIsUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 1rem',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          <CalendarIcon size={16} color="#0d9488" /> 4. Booking History
                        </Link>

                        <Link
                          to="/customer/bookings?status=confirmed"
                          onClick={() => setIsUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 1rem',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          <TicketIcon size={16} color="#0d9488" /> 5. My Tickets
                        </Link>

                        <Link
                          to="/customer/profile#password"
                          onClick={() => setIsUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 1rem',
                            color: '#334155',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            borderBottom: '1px solid #f1f5f9',
                          }}
                        >
                          <LockIcon size={16} color="#0d9488" /> 6. Change Password
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '0.6rem 1rem',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <LogOutIcon size={16} /> 7. Logout
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-on-mobile">
                <Link to="/login" className="btn btn-outline btn-sm header-signin-btn">
                  {t('nav_sign_in', 'Sign In')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                  Sign Up
                </Link>
              </div>
            )}

            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label="Open navigation menu"
            >
              <span className="hamburger-box">
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
