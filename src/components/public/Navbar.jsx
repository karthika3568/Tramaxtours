import Icon, { SparklesIcon, StethoscopeIcon, BookOpenIcon } from '../common/Icons';
import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import tourService from '../../services/tourService';

const DEFAULT_TOUR_CATEGORIES = [
  { id: 1, name: 'City Sightseeing Tours', slug: 'city-sightseeing-tours', icon: 'building' },
  { id: 2, name: 'Cultural & Heritage Tours', slug: 'cultural-heritage-tours', icon: 'culture' },
  { id: 7, name: 'Family Tours', slug: 'family-tours', icon: 'guests' },
  { id: 3, name: 'Guided Tours', slug: 'guided-tours', icon: 'compass' },
  { id: 4, name: 'Historical Tours', slug: 'historical-tours', icon: 'book' },
  { id: 5, name: 'One Day Tours', slug: 'one-day-tours', icon: 'sun' },
  { id: 9, name: 'Pilgrimage / Temple Tours', slug: 'pilgrimage-temple-tours', icon: 'temple' },
  { id: 6, name: 'Private Tours', slug: 'private-tours', icon: 'car' },
];

export default function Navbar({ onLinkClick, className = '', isMobile = false }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(DEFAULT_TOUR_CATEGORIES);
  const [isToursDropdownOpen, setIsToursDropdownOpen] = useState(false);
  const toursDropdownRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Fetch dynamic categories from API
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await tourService.getCategories();
        const items = Array.isArray(res) ? res : (res?.data || []);
        if (isMounted && items.length > 0) {
          const nonMed = items
            .filter(
              (c) =>
                !c.slug?.includes('medical') &&
                !c.name?.toLowerCase().includes('medical') &&
                !c.slug?.includes('palm') &&
                !c.name?.toLowerCase().includes('palm') &&
                !c.slug?.includes('surf') &&
                !c.name?.toLowerCase().includes('surf')
            )
            .sort((a, b) => {
              const aSight = (a.name?.toLowerCase().includes('sightseeing') || a.slug?.includes('sightseeing')) ? 1 : 0;
              const bSight = (b.name?.toLowerCase().includes('sightseeing') || b.slug?.includes('sightseeing')) ? 1 : 0;
              return bSight - aSight;
            });
          if (nonMed.length > 0) {
            setCategories(nonMed);
          }
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    if (!isToursDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (toursDropdownRef.current && !toursDropdownRef.current.contains(e.target)) {
        setIsToursDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isToursDropdownOpen]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsToursDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsToursDropdownOpen(false);
    }, 180);
  };

  const handleSelectCategory = (slugOrName, isMedical = false) => {
    setIsToursDropdownOpen(false);
    if (onLinkClick) onLinkClick();

    if (!slugOrName) {
      navigate('/tours');
    } else if (isMedical) {
      navigate('/tours?category=medical-tourism');
    } else {
      navigate(`/tours?category=${encodeURIComponent(slugOrName)}`);
    }
  };

  const handleTestimonialsClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onLinkClick) onLinkClick();

    const doScrollToTestimonials = () => {
      const el = document.getElementById('testimonials');
      if (el) {
        const navHeight = 85;
        const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        return true;
      }
      return false;
    };

    if (location.pathname === '/') {
      doScrollToTestimonials();
    } else {
      navigate('/?scroll=testimonials#testimonials');
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (doScrollToTestimonials() || attempts > 30) {
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const navItems = [
    { label: t('nav_home', 'Home'), path: '/', end: true },
    { label: t('nav_destinations', 'Destinations'), path: '/destinations' },
    { label: t('nav_tours', 'Tours'), path: '/tours', isTours: true },
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
      <ul
        className="primary-nav-list"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '8px' : '4px',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {navItems.map((item) => {
          if (item.isTestimonials) {
            return (
              <li
                key={item.path}
                className="primary-nav-item"
                style={{ flexShrink: 0, display: isMobile ? 'block' : 'inline-flex', alignItems: 'center' }}
              >
                <a
                  href="/#testimonials"
                  onClick={handleTestimonialsClick}
                  className="primary-nav-link"
                  style={{ cursor: 'pointer' }}
                >
                  {item.label}
                </a>
              </li>
            );
          }

          if (item.isCta) {
            return (
              <li
                key={item.path}
                className="primary-nav-item"
                style={{ flexShrink: 0, display: isMobile ? 'block' : 'inline-flex', alignItems: 'center' }}
              >
                <NavLink
                  to={item.path}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    `nav-cta-pill ${isActive ? 'nav-cta-active' : ''}`
                  }
                  style={{
                    background: 'linear-gradient(135deg, #01aa90 0%, #01806c 100%)',
                    color: '#ffffff',
                    padding: isMobile ? '12px 20px' : '8px 18px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: isMobile ? '16px' : '14.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    lineHeight: '1.2',
                    boxShadow: '0 4px 16px rgba(1, 170, 144, 0.35)',
                    transition: 'all 0.25s ease',
                    marginLeft: isMobile ? '0' : '6px',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><SparklesIcon size={14} color="#f59e0b" /> {item.label}</span>
                  </span>
                </NavLink>
              </li>
            );
          }

          if (item.isTours) {
            const isToursActive = location.pathname.startsWith('/tours');

            if (isMobile) {
              return (
                <li key={item.path} className="primary-nav-item" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                    <NavLink
                      to="/tours"
                      onClick={() => {
                        if (onLinkClick) onLinkClick();
                      }}
                      className={() =>
                        `primary-nav-link ${isToursActive ? 'nav-link-active' : ''}`
                      }
                      style={{ flex: 1, paddingRight: '48px' }}
                    >
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      aria-label="Toggle Tours Submenu"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsToursDropdownOpen((prev) => !prev);
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '10px',
                        color: isToursActive ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: isToursDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile Tours Submenu */}
                  {isToursDropdownOpen && (
                    <div
                      style={{
                        padding: '8px 0 8px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        borderLeft: '2px solid #01aa90',
                        marginLeft: '16px',
                        marginTop: '6px',
                        marginBottom: '6px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          border: 'none',
                          background: 'transparent',
                          color: '#1e293b',
                          fontSize: '15px',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <SparklesIcon size={15} color="#f59e0b" />
                        <span>All Tours</span>
                      </button>

                      {categories.map((cat) => {
                        const catName = cat.name || cat.slug;
                        return (
                          <button
                            key={cat.id || cat.slug}
                            type="button"
                            onClick={() => handleSelectCategory(catName)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              color: '#475569',
                              fontSize: '14.5px',
                              fontWeight: 600,
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <span>{catName}</span>
                          </button>
                        );
                      })}

                      <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '6px 4px' }} />

                      {/* Surfing Tour at bottom */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('surfing-tour')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          border: '1px solid #bae6fd',
                          background: '#f0f9ff',
                          borderRadius: '8px',
                          color: '#0369a1',
                          fontSize: '14.5px',
                          fontWeight: 800,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <CompassIcon size={15} color="#0284c7" />
                        <span>Surfing Tour</span>
                        <span style={{ fontSize: '10px', background: '#0284c7', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                          Waves
                        </span>
                      </button>

                      {/* Medical Tour at bottom */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('medical-tourism', true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          border: '1px solid #ccfbf1',
                          background: '#f0fdfa',
                          borderRadius: '8px',
                          color: '#0f766e',
                          fontSize: '14.5px',
                          fontWeight: 800,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <StethoscopeIcon size={15} color="#01aa90" />
                        <span>Medical Tour</span>
                        <span style={{ fontSize: '10px', background: '#01aa90', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                          Special
                        </span>
                      </button>

                      {/* Palm Leaf Horoscope at bottom */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('palm-leaf-horoscope')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          border: '1px solid #fef3c7',
                          background: '#fffbeb',
                          borderRadius: '8px',
                          color: '#92400e',
                          fontSize: '14.5px',
                          fontWeight: 800,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <SparklesIcon size={15} color="#d97706" />
                        <span>Palm Leaf Horoscope</span>
                        <span style={{ fontSize: '10px', background: '#d97706', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                          Nadi
                        </span>
                      </button>
                    </div>
                  )}
                </li>
              );
            }

            // Desktop View with Dropdown Popover
            return (
              <li
                key={item.path}
                className="primary-nav-item nav-item-tours-dropdown"
                ref={toursDropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                  <NavLink
                    to="/tours"
                    onClick={() => {
                      if (!isMobile && onLinkClick) onLinkClick();
                    }}
                    className={() => `primary-nav-link ${isToursActive ? 'nav-link-active' : ''}`}
                    style={{ paddingRight: '26px' }}
                  >
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    aria-label="Toggle Tours Dropdown"
                    aria-expanded={isToursDropdownOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsToursDropdownOpen((prev) => !prev);
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isToursActive ? '#ffffff' : '#64748b',
                      transform: isToursDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease, color 0.2s ease',
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Tours Dropdown Menu (Desktop) */}
                {isToursDropdownOpen && (
                  <div
                    className="nav-tours-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '0',
                      minWidth: '290px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.9)',
                      padding: '10px',
                      zIndex: 1100,
                      animation: 'navPopoverFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {/* All Tours Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('')}
                      className="nav-dropdown-item-btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        textAlign: 'left',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                    >
                      <SparklesIcon size={17} color="#f59e0b" />
                      <div style={{ flex: 1 }}>
                        <div>All Tours</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                          Browse all available tour packages
                        </div>
                      </div>
                    </button>

                    <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '6px 4px' }} />

                    <div
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Sightseeing &amp; Tours
                    </div>

                    {/* Tour Categories List (Sightseeing First) */}
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                      {categories.map((cat) => {
                        const catName = cat.name || cat.slug;
                        return (
                          <button
                            key={cat.id || cat.slug}
                            type="button"
                            onClick={() => handleSelectCategory(catName)}
                            className="nav-dropdown-item-btn"
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: '#334155',
                              textAlign: 'left',
                              transition: 'background 0.15s ease, color 0.15s ease',
                            }}
                          >
                            <span style={{ flex: 1 }}>{catName}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '6px 4px' }} />

                    <div
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#01aa90',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Special Experiences
                    </div>

                    {/* Surfing Tour Option (At Bottom) */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('surfing-tour')}
                      className="nav-dropdown-item-btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        marginTop: '2px',
                        border: '1px solid #bae6fd',
                        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(186, 230, 253, 0.3) 100%)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#0369a1',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CompassIcon size={17} color="#0284c7" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Surfing Tour</span>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              background: '#0284c7',
                              color: '#ffffff',
                              padding: '1px 5px',
                              borderRadius: '5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Waves
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#0369a1', opacity: 0.85, fontWeight: 500 }}>
                          Ocean wave lessons at Covelong Point
                        </div>
                      </div>
                    </button>

                    {/* Medical Tour Option (At Bottom) */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('medical-tourism', true)}
                      className="nav-dropdown-item-btn nav-dropdown-item-medical"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        marginTop: '2px',
                        border: '1px solid #ccfbf1',
                        background: 'linear-gradient(135deg, rgba(1, 170, 144, 0.08) 0%, rgba(204, 251, 241, 0.3) 100%)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#0f766e',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <StethoscopeIcon size={17} color="#01aa90" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Medical Tour</span>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              background: '#01aa90',
                              color: '#ffffff',
                              padding: '1px 5px',
                              borderRadius: '5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Health
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#0f766e', opacity: 0.85, fontWeight: 500 }}>
                          Health checks, MRI scans &amp; biomarkers
                        </div>
                      </div>
                    </button>

                    {/* Palm Leaf Horoscope Option (At Bottom) */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('palm-leaf-horoscope')}
                      className="nav-dropdown-item-btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        marginTop: '4px',
                        border: '1px solid #fef3c7',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(254, 243, 199, 0.4) 100%)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#92400e',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <SparklesIcon size={17} color="#d97706" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Palm Leaf Horoscope</span>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              background: '#d97706',
                              color: '#ffffff',
                              padding: '1px 5px',
                              borderRadius: '5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Nadi
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#92400e', opacity: 0.85, fontWeight: 500 }}>
                          Ancient destiny predictions (Maharishis)
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </li>
            );
          }

          return (
            <li
              key={item.path}
              className="primary-nav-item"
              style={{ flexShrink: 0, display: isMobile ? 'block' : 'inline-flex', alignItems: 'center' }}
            >
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
          );
        })}
      </ul>
    </nav>
  );
}
