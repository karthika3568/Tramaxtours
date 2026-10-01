import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import tourService from '../../../services/tourService';
import TourCard from '../tours/TourCard';
import Loading from '../../ui/Loading';

const FALLBACK_POPULAR_TOURS = [
  {
    id: 'fb-maha',
    title: 'Mahabalipuram Day Tour',
    slug: 'mahabalipuram-day-tour',
    destination: { name: 'Mahabalipuram' },
    featured_image: '/uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    rating: 4.9,
    reviews_count: 18,
    categories: [
      { name: 'City Sightseeing Tours' },
      { name: 'Cultural & Heritage Tours' },
      { name: 'Guided Tours' },
    ],
  },
  {
    id: 'fb-kanchi',
    title: 'Kanchipuram Temple & Silk Tour',
    slug: 'kanchipuram-day-tour',
    destination: { name: 'Kanchipuram' },
    featured_image: '/uploads/media/demo_tamilnadu_kanchipuram.jpg',
    rating: 4.8,
    reviews_count: 14,
    categories: [
      { name: 'Cultural & Heritage Tours' },
      { name: 'Pilgrimage / Temple Tours' },
    ],
  },
  {
    id: 'fb-pondy',
    title: 'Pondicherry French Colony Tour',
    slug: 'pondicherry-day-tour',
    destination: { name: 'Pondicherry (Puducherry)' },
    featured_image: '/uploads/media/demo_tamilnadu_pondicherry.jpg',
    rating: 5.0,
    reviews_count: 22,
    categories: [
      { name: 'City Sightseeing Tours' },
      { name: 'One Day Tours' },
    ],
  },
  {
    id: 'fb-chennai',
    title: 'Chennai Heritage & City Tour',
    slug: 'chennai-day-tour',
    destination: { name: 'Chennai' },
    featured_image: '/uploads/media/demo_tamilnadu_chennai.jpg',
    rating: 4.9,
    reviews_count: 19,
    categories: [
      { name: 'City Sightseeing Tours' },
      { name: 'Family Tours' },
    ],
  },
  {
    id: 'fb-thanjavur',
    title: 'Thanjavur Brihadisvara Temple Tour',
    slug: 'thanjavur-day-tour',
    destination: { name: 'Thanjavur' },
    featured_image: '/uploads/media/demo_tamilnadu_thanjavur.jpg',
    rating: 5.0,
    reviews_count: 25,
    categories: [
      { name: 'UNESCO World Heritage' },
      { name: 'Temple Tours' },
    ],
  },
];

export default function FeaturedTours() {
  const [tours, setTours] = useState(FALLBACK_POPULAR_TOURS);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        setIsLoading(true);
        const res = await tourService.getTours({ limit: 12, status: 'published', sort_by: 'display_order', order: 'ASC' });
        const list = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && list.length > 0) {
          setTours(list);
        }
      } catch {
        // Retain fallback list
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = useCallback((direction) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.querySelector('.tour-slider-item');
    const cardWidth = card ? card.offsetWidth : 320;
    const scrollAmount = cardWidth + 24;

    if (direction === 'next') {
      const isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 15;
      if (isAtEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      const isAtStart = container.scrollLeft <= 15;
      if (isAtStart) {
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleScroll('next');
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, handleScroll]);

  return (
    <section
      className="popular-activities-section page-section"
      aria-label="Popular Activities and Tours"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container popular-activities-container">
        {/* Section Header with Navigation Controls */}
        <div className="popular-activities-header">
          <div className="popular-activities-title-wrap">
            <span className="section-badge">Handpicked Packages</span>
            <h2 className="popular-activities-heading">Popular Activities & Tours</h2>
          </div>

          <div className="popular-tours-nav-actions">
            <div className="popular-tours-nav-btns">
              <button
                type="button"
                className="tours-nav-btn tours-btn-prev"
                onClick={() => handleScroll('prev')}
                aria-label="Previous tours"
                title="Previous"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="tours-nav-btn tours-btn-next"
                onClick={() => handleScroll('next')}
                aria-label="Next tours"
                title="Next"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <Link to="/tours" className="popular-activities-all-link">
              See All Tours &rarr;
            </Link>
          </div>
        </div>

        {/* Dynamic Tours Carousel Slider Track */}
        {isLoading && tours.length === 0 ? (
          <Loading message="Loading Popular Activities..." />
        ) : (
          <div
            ref={sliderRef}
            className="popular-tours-slider-track"
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {tours.map((tour) => (
              <div key={tour.id || tour.slug} className="tour-slider-item">
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
