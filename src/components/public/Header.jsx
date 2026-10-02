import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import useAuth from '../../hooks/useAuth';
import { isAdminRole } from '../../utils/roles';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getSetting } = useSiteSettings();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();

  const siteName = getSetting('site_name', 'Wanderer South India');
  const logoUrl = getSetting('site_logo_url', '') || '/logo.png';
  const isAdmin = isAdminRole(user?.role);

  return (
    <>
      {/* Main Sticky Header */}
      <header className="public-header" id="site-header">
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
              <div className="header-user-badge-wrap hide-on-mobile">
                {isAdmin ? (
                  <Link to="/admin" className="btn btn-outline btn-sm btn-admin-console" title="Open Admin Console">
                    ⚙️ {t('nav_admin_console', 'Admin Console')}
                  </Link>
                ) : (
                  <Link to="/my-bookings" className="btn btn-outline btn-sm btn-customer-portal" title="My Bookings & Profile">
                    👤 {t('nav_my_bookings', 'My Bookings')}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-ghost btn-sm btn-header-logout"
                  title="Sign Out"
                >
                  {t('nav_sign_out', 'Sign Out')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm header-signin-btn hide-on-mobile">
                {t('nav_sign_in', 'Sign In')}
              </Link>
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
