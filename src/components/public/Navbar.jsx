import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ onLinkClick, className = '', isMobile = false }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleTestimonialsClick = (e) => {
    if (onLinkClick) onLinkClick();
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('testimonials');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      e.preventDefault();
      navigate('/#testimonials');
    }
  };

  const navItems = [
    { label: t('nav_home', 'Home'), path: '/', end: true },
    { label: t('nav_destinations', 'Destinations'), path: '/destinations' },
    { label: t('nav_tours', 'Tours'), path: '/tours' },
    { label: t('nav_testimonials', 'Testimonials'), path: '/#testimonials', isTestimonials: true },
    { label: t('nav_about', 'About'), path: '/about' },
    { label: t('nav_contact', 'Contact'), path: '/contact' },
    { label: t('nav_request_trip', 'Request My Trip'), path: '/request-my-trip', isCta: true },
  ];

  return (
    <nav
      className={`primary-navbar ${isMobile ? 'navbar-mobile' : 'navbar-desktop'} ${className}`.trim()}
      aria-label={isMobile ? 'Mobile Navigation' : 'Main Desktop Navigation'}
    >
      <ul className="primary-nav-list" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '4px', margin: 0, padding: 0, listStyle: 'none' }}>
        {navItems.map((item) => (
          <li key={item.path} className="primary-nav-item">
            {item.isTestimonials ? (
              <a
                href="/#testimonials"
                onClick={handleTestimonialsClick}
                className="primary-nav-link"
                style={{ cursor: 'pointer' }}
              >
                {item.label}
              </a>
            ) : item.isCta ? (
              <NavLink
                to={item.path}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `nav-cta-pill ${isActive ? 'nav-cta-active' : ''}`
                }
                style={{
                  background: 'linear-gradient(135deg, #01AA90 0%, #01806C 100%)',
                  color: '#ffffff',
                  padding: isMobile ? '10px 18px' : '8px 18px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(1, 170, 144, 0.25)',
                  transition: 'all 0.2s ease',
                  marginLeft: isMobile ? '0' : '8px',
                }}
              >
                <span>✨ {item.label}</span>
              </NavLink>
            ) : (
              <NavLink
                to={item.path}
                end={item.end}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `primary-nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

