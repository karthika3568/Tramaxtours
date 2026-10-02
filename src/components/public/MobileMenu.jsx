import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import LanguageSwitcher from './LanguageSwitcher';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import useAuth from '../../hooks/useAuth';
import SocialLinks from './SocialLinks';
import { isAdminRole } from '../../utils/roles';

export default function MobileMenu({ isOpen, onClose }) {
  const { getSetting } = useSiteSettings();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const drawerRef = useRef(null);

  const siteName = getSetting('site_name', 'Wanderer South India');
  const siteTagline = getSetting('site_tagline', 'Curated Luxury & Adventure Travel');
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="mobile-menu-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={drawerRef}
        className="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        id="mobile-navigation-drawer"
      >
        <div className="mobile-menu-header">
          <Link to="/" className="site-logo" onClick={onClose}>
            <span className="logo-brand">{siteName.toUpperCase()}</span>
          </Link>
          <button
            type="button"
            className="mobile-menu-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            &times;
          </button>
        </div>

        {siteTagline && <p className="mobile-menu-tagline">{siteTagline}</p>}

        {/* Mobile Language Selector */}
        <LanguageSwitcher isMobile={true} />

        <div className="mobile-menu-nav">
          <Navbar isMobile onLinkClick={onClose} />
        </div>

        <div className="mobile-menu-cta" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="btn btn-outline btn-full"
                  onClick={onClose}
                >
                  ⚙️ {t('nav_admin_console', 'Admin Console')}
                </Link>
              ) : (
                <Link
                  to="/my-bookings"
                  className="btn btn-outline btn-full"
                  onClick={onClose}
                >
                  👤 {t('nav_my_bookings', 'My Bookings')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="btn btn-ghost btn-full"
              >
                {t('nav_sign_out', 'Sign Out')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn btn-outline btn-full"
              onClick={onClose}
            >
              {t('nav_sign_in', 'Sign In')}
            </Link>
          )}
        </div>

        <div className="mobile-menu-footer">
          <span className="social-heading">Follow Our Journeys</span>
          <SocialLinks variant="compact" />
        </div>
      </div>
    </div>
  );
}
