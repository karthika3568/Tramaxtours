import { useState, useEffect, useRef, useCallback } from 'react';
import testimonialService from '../../../services/testimonialService';
import { getMediaUrl } from '../../../utils/media';

function getInitials(name) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const data = await testimonialService.getTestimonials({ limit: 10 });
        const testimonialItems = data.items || (Array.isArray(data) ? data : []);

        if (isMounted) {
          const mapped = testimonialItems.map((t) => ({
            id: t.id,
            customer_name: t.client_name,
            role: t.location || null,
            content: t.message,
            image: t.client_image ? getMediaUrl(t.client_image) : null,
          }));

          setItems(mapped);
        }
      } catch {
        if (isMounted) setItems([]);
      }
    }

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = items.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto slide
  useEffect(() => {
    if (isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total, handleNext]);

  if (!items.length) return null;

  return (
    <section
      className="testimonials-carousel-section page-section"
      aria-label="Customer Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Section Heading */}
        <div className="testimonials-header">
          <h2 className="testimonials-title">Testimonials</h2>
        </div>

        {/* 3D / Cover-Flow Testimonials Slider */}
        <div className="testimonials-deck-wrapper">
          {/* Left Arrow */}
          <button
            type="button"
            className="deck-nav-btn deck-prev-btn"
            onClick={handlePrev}
            aria-label="Previous Testimonial"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Cards Track */}
          <div className="testimonials-deck-stage">
            {items.map((item, idx) => {
              // Calculate relative offset: -1 (left), 0 (center), 1 (right)
              let offset = idx - currentIndex;
              if (offset < -Math.floor(total / 2)) offset += total;
              if (offset > Math.floor(total / 2)) offset -= total;

              let cardClass = 'deck-card is-hidden';
              if (offset === 0) {
                cardClass = 'deck-card is-active';
              } else if (offset === -1) {
                cardClass = 'deck-card is-prev';
              } else if (offset === 1) {
                cardClass = 'deck-card is-next';
              }

              return (
                <article
                  key={item.id}
                  className={cardClass}
                  onClick={() => {
                    if (offset === -1) handlePrev();
                    if (offset === 1) handleNext();
                  }}
                >
                  {/* Portrait Photo Container */}
                  <div className="deck-card-photo-box">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.customer_name}
                        className="deck-card-photo"
                        loading="lazy"
                      />
                    ) : (
                      <div className="deck-card-photo-initials" aria-hidden="true">
                        {getInitials(item.customer_name)}
                      </div>
                    )}
                  </div>

                  {/* Card White Body Details */}
                  <div className="deck-card-body">
                    <h3 className="deck-card-name">{item.customer_name}</h3>
                    {item.role && (
                      <p className="deck-card-role">{item.role}</p>
                    )}
                    <p className="deck-card-quote">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            className="deck-nav-btn deck-next-btn"
            onClick={handleNext}
            aria-label="Next Testimonial"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="deck-dots-indicator" role="tablist">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-label={`Go to testimonial ${idx + 1}`}
              aria-selected={currentIndex === idx}
              className={`deck-dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
