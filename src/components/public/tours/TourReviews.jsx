import { useState, useEffect } from 'react';
import reviewService from '../../../services/reviewService';
import { getMediaUrl } from '../../../utils/media';
import Loading from '../../ui/Loading';

export default function TourReviews({ tourId, tourTitle }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchTourReviews() {
      if (!tourId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await reviewService.getReviews({
          tour_id: tourId,
          status: 'approved',
        });
        if (mounted) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setReviews([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTourReviews();

    return () => {
      mounted = false;
    };
  }, [tourId]);

  if (loading) {
    return (
      <div className="tour-reviews-section detail-content-block">
        <Loading message="Loading customer experiences..." />
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Calculate average rating
  const avgRating = (
    reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="tour-reviews-section detail-content-block">
      <div className="section-title-with-actions">
        <div>
          <h3 className="detail-section-title">Traveler Reviews</h3>
          <p className="section-subtitle-sm">
            What guests say about their {tourTitle} expedition
          </p>
        </div>
        <div className="tour-rating-summary">
          <span className="rating-score">{avgRating}</span>
          <div className="rating-details">
            <div className="stars-row" aria-label={`Average rating ${avgRating} out of 5 stars`}>
              {'★'.repeat(Math.round(Number(avgRating)))}
              {'☆'.repeat(5 - Math.round(Number(avgRating)))}
            </div>
            <span className="rating-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
      </div>

      <div className="tour-reviews-grid">
        {reviews.map((rev) => {
          const avatarUrl = rev.avatar ? getMediaUrl(rev.avatar) : null;
          const rating = Number(rev.rating || 5);

          return (
            <article key={rev.id} className="tour-review-card">
              <div className="review-card-header">
                <div className="reviewer-info">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={rev.customer_name}
                      className="reviewer-avatar-img"
                    />
                  ) : (
                    <div className="reviewer-avatar-initial" aria-hidden="true">
                      {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                  <div>
                    <h4 className="reviewer-name">{rev.customer_name}</h4>
                    {rev.customer_country && (
                      <span className="reviewer-country">{rev.customer_country}</span>
                    )}
                  </div>
                </div>

                <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
                  {'★'.repeat(rating)}
                  {'☆'.repeat(5 - rating)}
                </div>
              </div>

              {rev.review_title && (
                <h5 className="review-title">{rev.review_title}</h5>
              )}

              <p className="review-body">{rev.review_text}</p>

              {rev.travel_date && (
                <div className="review-date">
                  Traveled in {rev.travel_date}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
