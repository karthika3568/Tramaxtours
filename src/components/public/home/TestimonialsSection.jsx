import { useState, useEffect, useRef, useCallback } from 'react';
import reviewService from '../../../services/reviewService';
import { getMediaUrl } from '../../../utils/media';

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Fetch verified reviews from backend
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        setLoading(true);
        const data = await reviewService.getReviews({ limit: 12, status: 'approved' });
        const reviewItems = data.items || (Array.isArray(data) ? data : []);

        if (isMounted) {
          if (reviewItems.length > 0) {
            const mapped = reviewItems.map((r) => {
              const mediaUrl = r.media && r.media.length > 0 ? getMediaUrl(r.media[0]) : (r.image_url || r.image || null);
              return {
                id: r.id,
                customer_name: r.customer_name || 'Verified Explorer',
                role: r.customer_country ? `Guest from ${r.customer_country}` : (r.title || 'Traveler'),
                content: r.content || r.review_text || '',
                image: mediaUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customer_name || 'Guest')}&background=0D9488&color=fff&size=128`,
                rating: Number(r.rating || 5),
              };
            });
            setItems(mapped);
          } else {
            setItems([]);
          }
        }
      } catch {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
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
      id="testimonials"
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
                  {/* Liquid Glass Testimonial Card */}
                  <div
                    className="deck-card-inner glass-card-panel"
                    style={{
                      padding: '32px 28px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      maxWidth: '620px',
                      margin: '0 auto',
                    }}
                  >
                    {/* 5-Star Rating Row */}
                    <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', fontSize: '18px', marginBottom: '16px' }} aria-label="5 stars rating">
                      ★★★★★
                    </div>

                    {/* Large Prominent Review Message */}
                    <blockquote
                      style={{
                        fontSize: '18px',
                        lineHeight: 1.65,
                        fontWeight: 500,
                        color: '#1e293b',
                        fontStyle: 'italic',
                        margin: '0 0 24px 0',
                        position: 'relative',
                      }}
                    >
                      &ldquo;{item.content}&rdquo;
                    </blockquote>

                    {/* Client Info with Small Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto' }}>
                      <img
                        src={item.image}
                        alt={item.customer_name}
                        loading="lazy"
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #01AA90',
                          boxShadow: '0 2px 8px rgba(1, 170, 144, 0.2)',
                        }}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {item.customer_name}
                        </h4>
                        {item.role && (
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0', fontWeight: 600 }}>
                            {item.role}
                          </p>
                        )}
                      </div>
                    </div>
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
