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
              const rawImg = r.image || r.image_url || (r.media && r.media.length > 0 ? r.media[0] : null);
              const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customer_name || 'Guest')}&background=1226de&color=fff&size=128`;
              const mediaUrl = rawImg ? getMediaUrl(rawImg, avatarFallback) : avatarFallback;
              return {
                id: r.id,
                customer_name: r.customer_name || 'Verified Explorer',
                role: r.customer_country ? `Guest from ${r.customer_country}` : (r.title || 'Traveler'),
                content: r.content || r.review_text || '',
                image: mediaUrl,
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
                      padding: '32px 30px',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(16px)',
                      border: '1.5px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      maxWidth: '640px',
                      margin: '0 auto',
                    }}
                  >
                    {/* 1. TOP-LEFT: Client Avatar & Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', width: '100%' }}>
                      <img
                        src={item.image}
                        alt={item.customer_name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.customer_name || 'Guest')}&background=1226de&color=fff&size=96`;
                        }}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #1226de',
                          boxShadow: '0 2px 8px rgba(18, 38, 222, 0.25)',
                          flexShrink: 0,
                        }}
                      />
                      <div>
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

                    {/* 2. MIDDLE: Review Content Below Image */}
                    <blockquote
                      style={{
                        fontSize: '16.5px',
                        lineHeight: 1.7,
                        fontWeight: 500,
                        color: '#1e293b',
                        fontStyle: 'normal',
                        margin: '0 0 18px 0',
                        position: 'relative',
                        letterSpacing: '-0.01em',
                        flex: '1 1 auto',
                      }}
                    >
                      &ldquo;{item.content}&rdquo;
                    </blockquote>

                    {/* 3. BOTTOM: Star Rating Below Review Content */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#f59e0b',
                        fontSize: '18px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f1f5f9',
                        width: '100%',
                      }}
                      aria-label={`${item.rating || 5} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ color: star <= (item.rating || 5) ? '#f59e0b' : '#cbd5e1' }}>
                          ★
                        </span>
                      ))}
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b', marginLeft: '6px' }}>
                        {item.rating || 5}.0 / 5.0
                      </span>
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
