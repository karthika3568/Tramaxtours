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
    image: getMediaUrl('/uploads/media/demo_home_tamilnadu.jpg'),
  },
  {
    id: 'f-kerala',
    name: 'Kerala',
    slug: 'kerala',
    short_description: 'Discover Kerala with our tours.',
    image: getMediaUrl('/uploads/media/demo_home_kerala.jpg'),
  },
  {
    id: 'f-karnataka',
    name: 'Karnataka',
    slug: 'karnataka',
    short_description: 'Discover Karnataka with our tours.',
    image: getMediaUrl('/uploads/media/demo_home_karnataka.jpg'),
  },
  {
    id: 'f-goa',
    name: 'Goa',
    slug: 'goa',
    short_description: 'Discover Goa with our tours.',
    image: getMediaUrl('/uploads/media/demo_home_goa.jpg'),
  },
  {
    id: 'f-pondicherry',
    name: 'Pondicherry',
    slug: 'pondicherry',
    short_description: 'French heritage & serene coastal charm.',
    image: getMediaUrl('/uploads/media/demo_carousel_pondicherry.jpg'),
  },
];

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        setIsLoading(true);
        const res = await destinationService.getDestinations({ limit: 12, status: 'published' });
        const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setDestinations(items);
        }
      } catch {
        if (isMounted) setDestinations([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = destinations.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Routine Auto-Slide (every 3.5 seconds)
  useEffect(() => {
    if (isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total, nextSlide]);

  return (
    <section
      className="places-to-explore-section page-section"
      id="PlacesToExplore"
      aria-label="Top Destination For Your Next Vacation"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header-wrap text-center">
          <div className="pte-badge-pill">
            <span>Places To Explore</span>
          </div>
          <h2 className="pte-main-heading">
            Top Destination For Your <span className="pte-highlight-word">Next Vacation</span>
          </h2>

          <div className="pte-intro-well">
            <h3 className="pte-country-title">
              In<span className="pte-country-underline">d</span>ia
            </h3>
            <p className="pte-intro-para">
              India&apos;s languages, religions, dance, music, architecture, food, and customs differs from place to place within the country. A spell-binding country where people of unlike communities and religions <strong>live together</strong> in oneness.
            </p>
            <p className="pte-intro-para">
              India contains <strong>majestic peaks dusted with glistening snow, sun-drenched beaches, ancient hand-carved temples, and sprawling cities jam-packed with people, vehicles, and animals</strong>. Many tour India during the country&apos;s devotional festivals, which range from immense parades that convert cities into giant performance stages, to simple farming fairs dedicated to relatively obscure local deities.
            </p>
            <p className="pte-intro-para">
              India, a beautiful country which is <strong>diverse in culture, traditions, customs and heritage</strong> and which is filled with rich bio diversity has lots of things to offer to its people and to its culture. The southern part of the country which is <strong>surrounded by Arabian Sea and Bay of Bengal</strong> is listed among the most beautiful parts of the country.
            </p>
          </div>
        </div>

        {/* Carousel Slider Bar with Subheading & Next/Prev Controls */}
        <div className="pte-carousel-bar">
          <div className="pte-carousel-subheading">
            <span>Popular States & Regions</span>
          </div>
          <div className="pte-nav-controls">
            <button
              type="button"
              className="pte-nav-btn pte-btn-prev"
              onClick={prevSlide}
              aria-label="Previous destination"
              title="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="pte-nav-btn pte-btn-next"
              onClick={nextSlide}
              aria-label="Next destination"
              title="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Infinite Routine Carousel Slider Track */}
        <div className="pte-carousel-viewport">
          <div
            className="pte-slider-track-routine"
            style={{
              transform: `translateX(-${currentIndex * 268}px)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* Render 2 copies of destinations for seamless continuous routine looping */}
            {[...destinations, ...destinations].map((dest, idx) => {
              const rawImg = dest.featured_image?.file_path || dest.featured_image?.url || dest.featured_image || dest.image;
              const bgImage = typeof rawImg === 'string' && rawImg.startsWith('http')
                ? rawImg
                : getMediaUrl(rawImg);

              const destinationUrl = `/destinations/${dest.slug}`;

              return (
                <div key={`${dest.id || dest.slug}-${idx}`} className="pte-card-item">
                  <div className="pte-circle-container">
                    <div className="pte-circle-img-box">
                      <img
                        src={bgImage}
                        alt={dest.name}
                        className="pte-circle-img"
                        loading="lazy"
                      />
                      <div className="pte-circle-overlay" />
                      <div className="pte-explore-btn-wrap">
                        <Link to={destinationUrl} className="pte-btn-explore">
                          Explore
                        </Link>
                      </div>
                    </div>
                    <h4 className="pte-circle-title">
                      <Link to={destinationUrl} className="pte-title-link">
                        {dest.name.toUpperCase()}
                      </Link>
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Routine Carousel Indicator Dots */}
        <div className="pte-dots-indicator" role="tablist">
          {destinations.map((dest, idx) => (
            <button
              key={dest.id || dest.slug || idx}
              type="button"
              role="tab"
              aria-selected={currentIndex % total === idx}
              aria-label={`Go to ${dest.name}`}
              className={`pte-dot ${currentIndex % total === idx ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
