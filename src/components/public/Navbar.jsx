import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import destinationService from '../../services/destinationService';
import { getMediaUrl } from '../../utils/media';

export default function Navbar({ onLinkClick, className = '', isMobile = false }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Destinations data & search state
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [destSearch, setDestSearch] = useState('');
  const [isDestOpen, setIsDestOpen] = useState(false);

  // Fetch published destinations on mount
  useEffect(() => {
    let mounted = true;
    async function loadDestinations() {
      try {
        setLoadingDestinations(true);
        const res = await destinationService.getDestinations({ status: 'published', limit: 20 });
        if (mounted) {
          setDestinations(res?.data || res?.items || []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (mounted) setLoadingDestinations(false);
      }
    }
    loadDestinations();
    return () => {
      mounted = false;
    };
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    if (!isDestOpen || isMobile) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDestOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDestOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDestOpen, isMobile]);

  const filteredDestinations = destinations.filter((d) => {
    if (!destSearch.trim()) return true;
    const term = destSearch.toLowerCase().trim();
    return (
      (d.name && d.name.toLowerCase().includes(term)) ||
      (d.slug && d.slug.toLowerCase().includes(term)) ||
      (d.short_description && d.short_description.toLowerCase().includes(term))
    );
  });

  const handleSelectDestination = (slug) => {
    setIsDestOpen(false);
    setDestSearch('');
    if (onLinkClick) onLinkClick();
    navigate(`/tour-destination/${slug}`);
  };

  const navItems = [
    { label: t('nav_home', 'Home'), path: '/', end: true },
    { label: t('nav_destinations', 'Destinations'), path: '/destinations', hasDropdown: true },
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
        {navItems.map((item) => {
          if (item.hasDropdown) {
            return (
              <li
                key={item.path}
                className="primary-nav-item nav-item-dropdown"
                ref={dropdownRef}
              >
                <div className="nav-dropdown-trigger-group">
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (!isMobile) {
                        // Allow navigation to all destinations
                        if (onLinkClick) onLinkClick();
                      }
                    }}
                    className={({ isActive }) =>
                      `primary-nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    className={`nav-dropdown-toggle-btn ${isDestOpen ? 'is-open' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDestOpen((prev) => !prev);
                    }}
                    aria-expanded={isDestOpen}
                    aria-label="Toggle Destination Search Menu"
                    title="Search Destinations"
                  >
                    <span className="dropdown-arrow-icon">{isDestOpen ? '▲' : '▼'}</span>
                  </button>
                </div>

                {/* Dropdown Menu / Search Drawer */}
                {isDestOpen && (
                  <div className={`nav-destination-popover ${isMobile ? 'popover-mobile' : 'popover-desktop'}`}>
                    {/* Search Input Bar */}
                    <div className="nav-dest-search-bar">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="nav-dest-search-input"
                        placeholder="Search destinations (e.g. Tamil Nadu, Kerala, Karnataka, Goa)..."
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        autoFocus={!isMobile}
                      />
                      {destSearch && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setDestSearch('')}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Destinations Result List */}
                    <div className="nav-dest-results-list">
                      {loadingDestinations ? (
                        <div className="nav-dest-loading-state">
                          <span>Fetching destinations...</span>
                        </div>
                      ) : filteredDestinations.length > 0 ? (
                        filteredDestinations.map((dest) => {
                          const imgUrl = getMediaUrl(dest.featured_image);
                          return (
                            <button
                              type="button"
                              key={dest.slug || dest.id}
                              className="nav-dest-item-btn"
                              onClick={() => handleSelectDestination(dest.slug)}
                            >
                              <div className="nav-dest-thumb-wrap">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={dest.name}
                                    className="nav-dest-thumb-img"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="nav-dest-thumb-fallback">📍</span>
                                )}
                              </div>
                              <div className="nav-dest-info">
                                <strong className="nav-dest-name">{dest.name}</strong>
                                {dest.short_description && (
                                  <span className="nav-dest-desc">
                                    {dest.short_description.slice(0, 60)}...
                                  </span>
                                )}
                              </div>
                              <span className="nav-dest-arrow">→</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="nav-dest-empty-state">
                          <p>No destinations match &quot;{destSearch}&quot;</p>
                          <NavLink
                            to="/destinations"
                            onClick={() => {
                              setIsDestOpen(false);
                              if (onLinkClick) onLinkClick();
                            }}
                            className="nav-dest-view-all-link"
                          >
                            Explore all destinations catalog &rarr;
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* Bottom Footer Link */}
                    <div className="nav-dest-footer">
                      <NavLink
                        to="/destinations"
                        onClick={() => {
                          setIsDestOpen(false);
                          if (onLinkClick) onLinkClick();
                        }}
                        className="nav-dest-all-btn"
                      >
                        Browse All Destinations Directory &rarr;
                      </NavLink>
                    </div>
                  </div>
                )}
              </li>
            );
          }

          return (
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
          );
        })}
      </ul>
    </nav>
  );
}
