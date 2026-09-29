import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ onLinkClick, className = '', isMobile = false }) {
  const { t } = useLanguage();

  const navItems = [
    { label: t('nav_home', 'Home'), path: '/', end: true },
    { label: t('nav_destinations', 'Destinations'), path: '/destinations' },
    { label: t('nav_tours', 'Tours'), path: '/tours' },
    { label: t('nav_about', 'About'), path: '/about' },
    { label: t('nav_contact', 'Contact'), path: '/contact' },
  ];

  return (
    <nav
      className={`primary-navbar ${isMobile ? 'navbar-mobile' : 'navbar-desktop'} ${className}`.trim()}
      aria-label={isMobile ? 'Mobile Navigation' : 'Main Desktop Navigation'}
    >
      <ul className="primary-nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="primary-nav-item">
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
          </li>
        ))}
      </ul>
    </nav>
  );
}
