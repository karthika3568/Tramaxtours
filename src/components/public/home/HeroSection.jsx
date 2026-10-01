import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import homeHeroService from '../../../services/homeHeroService';
import { getMediaUrl } from '../../../utils/media';

const FALLBACK_HERO_SLIDES = [
  {
    id: 1,
    title: 'Wanderer South India',
    subtitle: 'Plan your memorable journey across majestic temples, pristine beaches & heritage',
    image: getMediaUrl('/uploads/media/demo_carousel_tamilnadu.jpg'),
    link: '/destinations/tamil-nadu',
  },
  {
    id: 2,
    title: 'Kerala Emerald Backwaters',
    subtitle: 'Cruise through peaceful lagoons, lush spice plantations & Ayurvedic wellness',
    image: getMediaUrl('/uploads/media/demo_carousel_kerala.jpg'),
    link: '/destinations/kerala',
  },
  {
    id: 3,
    title: 'Karnataka Royal Dynasties',
    subtitle: 'Explore the grand palaces of Mysore and ancient ruins of UNESCO Hampi',
    image: getMediaUrl('/uploads/media/demo_carousel_karnataka.jpg'),
    link: '/destinations/karnataka',
  },
  {
    id: 4,
    title: 'Goa Golden Shores & Sunshine',
    subtitle: 'Sun-drenched coastal beauty, Portuguese heritage & vibrant beach getaways',
    image: getMediaUrl('/uploads/media/demo_carousel_goa.jpg'),
    link: '/destinations/goa',
  },
  {
    id: 5,
    title: 'Pondicherry French Riviera of the East',
    subtitle: 'Colonial boulevards, vibrant cafes, spiritual tranquility & beachside promenades',
    image: getMediaUrl('/uploads/media/demo_carousel_pondicherry.jpg'),
    link: '/destinations/pondicherry',
  },
];

export default function HeroSection() {
  const [slides, setSlides] = useState(FALLBACK_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Fetch active hero slides from backend
  useEffect(() => {
    let isMounted = true;
    async function loadSlides() {
      try {
        const res = await homeHeroService.getSlides({ status: 'active', sort_by: 'display_order', sort_order: 'ASC' });
        const slideList = res?.data?.slides || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && slideList.length > 0) {
          const mapped = slideList.map((s, idx) => {
            const mediaUrl = getMediaUrl(s.desktop_media || s.desktop_media?.file_path || s.desktop_media?.url || s.media);
            return {
              id: s.id || `slide-${idx}`,
              title: s.title || FALLBACK_HERO_SLIDES[idx % FALLBACK_HERO_SLIDES.length].title,
              subtitle: s.subtitle || FALLBACK_HERO_SLIDES[idx % FALLBACK_HERO_SLIDES.length].subtitle,
              image: mediaUrl || FALLBACK_HERO_SLIDES[idx % FALLBACK_HERO_SLIDES.length].image,
              link: s.link_url || '/tours',
            };
          });
          setSlides(mapped);
        }
      } catch {
        // Retain fallback slides seamlessly
      }
    }
    loadSlides();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-advance continuous carousel timer (5 seconds per slide)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, nextSlide]);

  return (
    <section
      className="hero-section hero-pure-carousel"
      aria-roledescription="carousel"
      aria-label="Wonderer South India Travel Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
    >
      {/* Background Slides with Ken Burns Zoom & Smooth Fade Transitions */}
      <div className="hero-background-wrapper">
        {slides.map((slide, idx) => {
          const isActive = currentIndex === idx;
          return (
            <div
              key={slide.id || idx}
              className={`hero-slide-layer ${isActive ? 'slide-active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="hero-background-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              <div className="hero-overlay-gradient-clean" />

              {/* Slide Caption Box */}
              {isActive && (
                <div className="hero-slide-caption-box">
                  <div className="hero-caption-inner">
                    <span className="hero-caption-pill">Explore South India</span>
                    <h1 className="hero-caption-title">{slide.title}</h1>
                    <p className="hero-caption-subtitle">{slide.subtitle}</p>
                    <div className="hero-caption-btns">
                      <Link to="/plan-trip" className="hero-btn-primary">
                        Plan My Trip
                      </Link>
                      <Link to="/tours" className="hero-btn-secondary">
                        View Tours &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Carousel Navigation Arrows */}
      <button
        type="button"
        className="hero-nav-arrow arrow-prev"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        &#10094;
      </button>

      <button
        type="button"
        className="hero-nav-arrow arrow-next"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        &#10095;
      </button>

      {/* Carousel Slide Indicators */}
      <div className="hero-dots-container" role="tablist" aria-label="Hero Slides">
        {slides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            type="button"
            role="tab"
            aria-selected={currentIndex === idx}
            aria-label={`Slide ${idx + 1}`}
            className={`hero-dot ${currentIndex === idx ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </section>
  );
}
