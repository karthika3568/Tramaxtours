import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const isInteractingRef = useRef(false);

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

  // Multiplied destination list for seamless infinite continuous sliding
  const repeatCount = destinations.length > 0 ? (destinations.length <= 4 ? 3 : 2) : 1;
  const slidingDestinations = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];
    return Array.from({ length: repeatCount }, () => destinations).flat();
  }, [destinations, repeatCount]);

  // Automatic Smooth Continuous Sliding (60/120fps hardware-accelerated ticker)
  useEffect(() => {
    const container = sliderRef.current;
    if (!container || slidingDestinations.length === 0) return;

    let animationFrameId;
    let lastTime = performance.now();
    const speed = 42; // pixels per second for silky smooth, continuous luxurious sliding

    const animate = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused && !isInteractingRef.current && container) {
        container.scrollLeft += speed * delta;

        const singleSetWidth = container.scrollWidth / repeatCount;
        if (singleSetWidth > 0 && container.scrollLeft >= singleSetWidth) {
          container.scrollLeft -= singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, slidingDestinations.length, repeatCount]);

  const handleScroll = useCallback((direction) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.querySelector('.top-dest-card');
    const cardWidth = card ? card.offsetWidth + 22 : 340; // card width + gap

    isInteractingRef.current = true;
    container.style.scrollBehavior = 'smooth';

    if (direction === 'next') {
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }

    setTimeout(() => {
      if (container) {
        container.style.scrollBehavior = 'auto';
        const singleSetWidth = container.scrollWidth / repeatCount;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * (repeatCount - 1)) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }
      isInteractingRef.current = false;
    }, 450);
  }, [repeatCount]);

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

        {/* Continuous Automatic Smooth Sliding Track */}
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
          {slidingDestinations.map((dest, index) => {
            const uniqueKey = `${dest.id || dest.slug}-${index}`;
            const rawImg = dest.featured_image?.file_path || dest.featured_image?.url || dest.featured_image || dest.image;
            const bgImage = typeof rawImg === 'string' && rawImg.startsWith('http')
              ? rawImg
              : getMediaUrl(rawImg);

            const isHovered = hoveredId === uniqueKey;
            const destinationUrl = `/destinations/${dest.slug}`;

            return (
              <article
                key={uniqueKey}
                className={`top-dest-card ${isHovered ? 'is-active-card' : ''}`}
                onMouseEnter={() => setHoveredId(uniqueKey)}
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
