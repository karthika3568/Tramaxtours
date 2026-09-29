import { useState, useEffect, useCallback, useRef } from 'react';
import homeHeroService from '../../../services/homeHeroService';
import { getMediaUrl } from '../../../utils/media';

const FALLBACK_HERO_SLIDES = [
  { id: 1, title: 'Kerala Backwaters & Houseboats', image: '/uploads/media/demo_carousel_kerala.jpg' },
  { id: 2, title: 'Munnar Misty Hills & Tea Estates', image: '/uploads/media/demo_kerala_munnar.jpg' },
  { id: 3, title: 'Karnataka Royal Palaces & Heritage', image: '/uploads/media/demo_carousel_karnataka.jpg' },
  { id: 4, title: 'Goa Coastal Serenity', image: '/uploads/media/demo_carousel_goa.jpg' },
  { id: 5, title: 'Pondicherry French Promenade', image: '/uploads/media/demo_carousel_pondicherry.jpg' },
  { id: 6, title: 'Taj Mahal Iconic Wonders', image: '/uploads/media/demo_carousel_tajmahal.jpg' },
  { id: 7, title: 'Rajasthan Desert Safaris & Forts', image: '/uploads/media/demo_carousel_rajasthan.jpg' },
  { id: 8, title: 'Delhi Cultural Monuments', image: '/uploads/media/demo_carousel_delhi.jpg' },
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
            const mediaUrl = s.desktop_media?.url || (s.desktop_media?.file_path ? getMediaUrl(s.desktop_media.file_path) : (s.media ? getMediaUrl(s.media) : null));
            const fallback = FALLBACK_HERO_SLIDES[idx % FALLBACK_HERO_SLIDES.length];
            return {
              id: s.id || fallback.id,
              title: s.title || fallback.title,
              image: mediaUrl || fallback.image,
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

  // Auto-advance continuous carousel timer (1 second per slide)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 1000);

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
      aria-label="Tramax Tours Travel Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
    >
      {/* Background Slides with Ken Burns Zoom & Smooth Fade Transitions */}
      <div className="hero-background-wrapper">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`hero-slide-layer ${currentIndex === idx ? 'slide-active' : ''}`}
            aria-hidden={currentIndex !== idx}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-background-img"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="hero-overlay-gradient-clean" />
          </div>
        ))}
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
    </section>
  );
}
