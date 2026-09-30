import { useState, useEffect, useRef, useCallback } from 'react';
import reviewService from '../../../services/reviewService';
import { getMediaUrl } from '../../../utils/media';

const CURATED_TESTIMONIALS = [
  {
    id: 1,
    customer_name: 'Marc Knulle',
    role: 'Hockey Player',
    content: 'The tour was well organized and completely hassle-free. Great planning and smooth travel experience.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    customer_name: 'Sophie Vandermeer',
    role: 'Traveler from Netherlands',
    content: 'South India with Wonderer South India was the highlight of our year. Our driver was so polite and the heritage monuments were breathtaking.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    customer_name: 'David Miller',
    role: 'Guest from United Kingdom',
    content: 'Impeccable private vehicle, punctuality and authentic cultural experiences. We felt safe and thoroughly looked after throughout our tour.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    customer_name: 'Elena Rostova',
    role: 'Architect from Germany',
    content: 'Flawless arrangements and warm hospitality. The attention to detail was top-tier. Highly recommended for international explorers!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    customer_name: 'Jean-Luc Moreau',
    role: 'Historian from France',
    content: 'The day tour from Mahabalipuram to Pondicherry exceeded all expectations. Exceptional chauffeur guide and first-class service.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
  },
];

export default function TestimonialsSection() {
  const [items, setItems] = useState(CURATED_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Fetch verified reviews from backend and merge
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        const data = await reviewService.getReviews({ limit: 10, status: 'approved' });
        const reviewItems = data.items || (Array.isArray(data) ? data : []);

        if (isMounted && reviewItems.length > 0) {
          const mapped = reviewItems.map((r, idx) => {
            const mediaUrl = r.media && r.media.length > 0 ? getMediaUrl(r.media[0]) : null;
            const fallback = CURATED_TESTIMONIALS[idx % CURATED_TESTIMONIALS.length];

            return {
              id: r.id,
              customer_name: r.customer_name || fallback.customer_name,
              role: r.customer_country ? `Guest from ${r.customer_country}` : (r.title || fallback.role),
              content: r.content || fallback.content,
              image: mediaUrl || fallback.image,
            };
          });

          setItems(mapped);
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadReviews();

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
                    <img
                      src={item.image}
                      alt={item.customer_name}
                      className="deck-card-photo"
                      loading="lazy"
                    />
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
