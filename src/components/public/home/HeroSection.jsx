import { useState, useEffect, useCallback, useRef } from 'react';
import homeHeroService from '../../../services/homeHeroService';
import { getMediaUrl } from '../../../utils/media';

export default function HeroSection() {
  const [slides, setSlides] = useState([]);
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
          const mapped = slideList
            .map((s, idx) => {
              const mediaUrl = getMediaUrl(s.desktop_media || s.desktop_media?.file_path || s.desktop_media?.url || s.media || s.image_url);
              return {
                id: s.id || `slide-${idx}`,
                image: mediaUrl,
              };
            })
            .filter((s) => Boolean(s.image));
          setSlides(mapped);
        }
      } catch (err) {
        console.warn('Failed to load dynamic hero slides:', err);
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
    if (isPaused || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, nextSlide, totalSlides]);

  if (totalSlides === 0) {
    return null;
  }

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
