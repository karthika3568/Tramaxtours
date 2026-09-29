import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';
import { useLanguage } from '../../../context/LanguageContext';

export default function TourCard({ tour }) {
  const { t, language } = useLanguage();
  if (!tour) return null;

  const rawImage = tour.featured_image?.file_path || tour.featured_image?.url || tour.featured_image || tour.image;
  const imageUrl = typeof rawImage === 'string' && rawImage.startsWith('http')
    ? rawImage
    : getMediaUrl(
        rawImage,
        '/uploads/media/demo_tamilnadu_mahabalipuram.jpg'
      );

  const destinationName = tour.destination?.name || tour.destination_name || 'South India';
  const rating = Number(tour.average_rating ?? tour.rating ?? 0).toFixed(ratingValue(tour));
  const reviewsCount = tour.reviews_count ?? 0;

  function ratingValue(tVal) {
    const val = tVal.average_rating ?? tVal.rating ?? 0;
    return val > 0 ? 2 : 0;
  }

  // Categories & Tags list
  const rawCategories = Array.isArray(tour.categories) && tour.categories.length > 0
    ? tour.categories
    : getDerivedCategories(tour);

  // Normalize to category names
  const categoryNames = rawCategories.map((c) => (typeof c === 'string' ? c : (c.name || c.slug || '')));

  // Prioritize primary badge (e.g. One Day Tours) first
  const sortedCategories = [...categoryNames].sort((a, b) => {
    const aIsPrimary = isPrimaryBadge(a);
    const bIsPrimary = isPrimaryBadge(b);
    if (aIsPrimary && !bIsPrimary) return -1;
    if (!aIsPrimary && bIsPrimary) return 1;
    return 0;
  });

  const isFull = tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) === 0;
  const isLowSeats = tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) > 0 && Number(tour.available_seats) <= 5;
  const travelDays = tour.travel_days || 'Daily';
  const basePrice = tour.base_price ? Number(tour.base_price) : null;
  const currencySymbol = tour.currency === 'EUR' ? '€' : tour.currency === 'INR' ? '₹' : (tour.currency || '₹');

  return (
    <article className={`activity-tour-card ${isFull ? 'tour-card-full' : ''}`}>
      {/* Top Image Container */}
      <Link to={`/tours/${tour.slug}`} className="activity-card-media" aria-label={tour.title}>
        <img
          src={imageUrl}
          alt={tour.title}
          loading="lazy"
          className="activity-card-img"
        />

        {/* Capacity / Full / Low Seat Badges */}
        <div className="activity-card-top-badges">
          {isFull ? (
            <span className="card-status-badge badge-full">
              🔴 FULL / CLOSED
            </span>
          ) : isLowSeats ? (
            <span className="card-status-badge badge-low-seats">
              ⚡ Only {tour.available_seats} Seats Left
            </span>
          ) : null}
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="activity-card-body">
        {/* Location & Schedule Row */}
        <div className="activity-location-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg className="activity-location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="activity-location-text">{destinationName}</span>
          </div>

          {travelDays && (
            <span className="activity-schedule-tag" title="Operating Schedule">
              🗓️ {travelDays}
            </span>
          )}
        </div>

        {/* Tour Title */}
        <h3 className="activity-tour-title">
          <Link to={`/tours/${tour.slug}`}>{tour.title}</Link>
        </h3>

        {/* Star Rating & Reviews Count */}
        <div className="activity-rating-row">
          <span className="activity-star-icon">★</span>
          <span className="activity-rating-score">{rating}</span>
          <span className="activity-reviews-text">
            ({reviewsCount} {t('card_reviews', 'reviews')})
          </span>
        </div>

        {/* Category & Feature Badges */}
        <div className="activity-badges-grid">
          {sortedCategories.map((catName, idx) => {
            const isBlue = isPrimaryBadge(catName) || (idx === 0 && !sortedCategories.some(isPrimaryBadge));
            let displayCatName = catName;
            if (isPrimaryBadge(catName) && language === 'de') {
              displayCatName = 'Eintägige Tour';
            }

            return (
              <span
                key={`${catName}-${idx}`}
                className={`activity-badge ${isBlue ? 'badge-blue' : 'badge-green'}`}
              >
                {displayCatName}
              </span>
            );
          })}
        </div>

        {/* Price & Action Row */}
        {basePrice !== null && (
          <div className="activity-card-footer-row" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{t('card_starting_from', 'From')}</span>
              <strong style={{ fontSize: '16px', color: '#01aa90' }}>
                {currencySymbol}{basePrice.toLocaleString()}
              </strong>
            </div>

            <Link
              to={`/tours/${tour.slug}`}
              className={`btn ${isFull ? 'btn-secondary' : 'btn-primary'} btn-xs`}
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }}
            >
              {isFull ? 'Details / Closed' : t('card_view_details', 'View Tour')} &rarr;
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

function isPrimaryBadge(name) {
  const lower = (name || '').toLowerCase().trim();
  return lower.includes('one day') || lower === 'one day tours';
}

function getDerivedCategories(tour) {
  const derived = [];
  if (tour.duration_days === 1 || (tour.duration_text && tour.duration_text.toLowerCase().includes('day')) || (tour.title && tour.title.toLowerCase().includes('day tour'))) {
    derived.push('One Day Tours');
  }
  if (tour.tour_type) {
    derived.push(formatTourTypeName(tour.tour_type));
  }
  derived.push('City Sightseeing Tours');
  derived.push('Cultural & Heritage Tours');
  derived.push('Private Tours');
  return derived;
}

function formatTourTypeName(type) {
  if (!type) return 'Guided Tours';
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') + ' Tours';
}
