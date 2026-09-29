import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import destinationService from '../../../services/destinationService';
import { getMediaUrl } from '../../../utils/media';

const FALLBACK_DESTINATIONS = [
  {
    id: 'f-tamil-nadu',
    name: 'Tamil Nadu',
    slug: 'tamil-nadu',
    short_description: 'Discover Tamil Nadu with our tours.',
    image: '/uploads/media/demo_home_tamilnadu.jpg',
  },
  {
    id: 'f-kerala',
    name: 'Kerala',
    slug: 'kerala',
    short_description: 'Discover Kerala with our tours.',
    image: '/uploads/media/demo_home_kerala.jpg',
  },
  {
    id: 'f-karnataka',
    name: 'Karnataka',
    slug: 'karnataka',
    short_description: 'Discover Karnataka with our tours.',
    image: '/uploads/media/demo_home_karnataka.jpg',
  },
  {
    id: 'f-goa',
    name: 'Goa',
    slug: 'goa',
    short_description: 'Discover Goa with our tours.',
    image: '/uploads/media/demo_home_goa.jpg',
  },
];

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        const res = await destinationService.getDestinations({ limit: 12, status: 'published' });
        const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && items.length > 0) {
          setDestinations(items);
        }
      } catch {
        // Retain fallback list
      }
    }

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = useCallback((direction) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cardWidth = container.querySelector('.top-dest-card')?.offsetWidth || 300;
    const scrollAmount = cardWidth + 20; // card width + gap

    if (direction === 'next') {
      const isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10;
      if (isAtEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      const isAtStart = container.scrollLeft <= 10;
      if (isAtStart) {
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // Automatic Smooth Continuous Scrolling / Carousel
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleScroll('next');
    }, 3600);

    return () => clearInterval(timer);
  }, [isPaused, handleScroll]);

  return (
    <section className="top-destinations-section" aria-label="Top Destinations">
      <div className="container top-dest-container">
        {/* Section Header with Left Title & Right Slider Controls */}
        <div className="top-dest-header">
          <div className="top-dest-title-wrap">
            <h2 className="top-dest-heading">Top Destination For Your Next Vacation</h2>
          </div>

          <div className="top-dest-nav-controls">
            <button
              type="button"
              className="top-dest-nav-btn"
              onClick={() => handleScroll('prev')}
              aria-label="Previous destination"
              title="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="top-dest-nav-btn"
              onClick={() => handleScroll('next')}
              aria-label="Next destination"
              title="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Slider Cards Track */}
        <div
          ref={sliderRef}
          className="top-dest-slider-track"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setHoveredId(null);
          }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {destinations.map((dest, index) => {
            const rawImg = dest.featured_image?.file_path || dest.featured_image?.url || dest.featured_image || dest.image;
            const bgImage = typeof rawImg === 'string' && rawImg.startsWith('http')
              ? rawImg
              : getMediaUrl(rawImg);

            const isHovered = hoveredId === dest.id || (hoveredId === null && index === 1);
            const destinationUrl = `/destinations/${dest.slug}`;

            return (
              <article
                key={dest.id || dest.slug}
                className={`top-dest-card ${isHovered ? 'is-active-card' : ''}`}
                onMouseEnter={() => setHoveredId(dest.id)}
              >
                <div
                  className="top-dest-card-bg"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="top-dest-card-overlay" />

                <div className="top-dest-card-content">
                  <h3 className="top-dest-name">{dest.name}</h3>

                  <div className="top-dest-details-reveal">
                    <p className="top-dest-sub">
                      {dest.short_description || `Discover ${dest.name} with our tours.`}
                    </p>

                    <Link
                      to={destinationUrl}
                      className="btn-see-all-tours"
                      aria-label={`See all tours in ${dest.name}`}
                    >
                      See All Tours
                    </Link>
                  </div>
                </div>

                {/* Full card clickable link */}
                <Link
                  to={destinationUrl}
                  className="top-dest-card-link"
                  aria-label={`View ${dest.name} tours`}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
