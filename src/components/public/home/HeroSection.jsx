import { useState, useEffect, useCallback, useRef } from 'react';
import homeHeroService from '../../../services/homeHeroService';
import { getMediaUrl } from '../../../utils/media';

const FALLBACK_HERO_SLIDES = [
  {
    id: 1,
    image: getMediaUrl('/uploads/media/demo_carousel_tamilnadu.jpg'),
  },
  {
    id: 2,
    image: getMediaUrl('/uploads/media/demo_carousel_kerala.jpg'),
  },
  {
    id: 3,
    image: getMediaUrl('/uploads/media/demo_carousel_karnataka.jpg'),
  },
  {
    id: 4,
    image: getMediaUrl('/uploads/media/demo_carousel_goa.jpg'),
  },
  {
    id: 5,
    image: getMediaUrl('/uploads/media/demo_carousel_pondicherry.jpg'),
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
              image: mediaUrl || FALLBACK_HERO_SLIDES[idx % FALLBACK_HERO_SLIDES.length].image,
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
      className="hero-section hero-pure-carousel hero-images-only"
      aria-roledescription="carousel"
      aria-label="South India Visual Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
    >
      {/* Background Slides - Pure Images with Smooth Transitions */}
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
                alt=""
                className="hero-background-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
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
