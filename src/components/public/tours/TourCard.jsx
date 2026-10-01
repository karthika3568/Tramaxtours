import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';
import { useLanguage } from '../../../context/LanguageContext';
import { useCurrency } from '../../../context/CurrencyContext';

export default function TourCard({ tour }) {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
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

  const nextAvailability = tour.uses_date_availability
    ? (tour.availability_dates || [])[0] || null
    : null;

  let isFull = false;
  let isLowSeats = false;
  let isBookingClosed = false;
  let seatsLeftLabel = null;

  if (tour.uses_date_availability) {
    if (!nextAvailability) {
      isBookingClosed = true;
    } else {
      isFull = nextAvailability.status === 'full';
      isLowSeats = nextAvailability.status === 'low';
      isBookingClosed = nextAvailability.status === 'closed' || nextAvailability.status === 'booking_closed';
      seatsLeftLabel = nextAvailability.available_seats;
    }
  } else {
    isFull = tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) === 0;
    isLowSeats = tour.available_seats !== undefined && tour.available_seats !== null && Number(tour.available_seats) > 0 && Number(tour.available_seats) <= 5;
    seatsLeftLabel = tour.available_seats;
  }

  const isUnavailable = isFull || isBookingClosed;
  const travelDays = tour.travel_days || 'Daily';
  const basePrice = tour.base_price ? Number(tour.base_price) : null;
  const formattedPrice = basePrice ? formatPrice(basePrice) : null;

  return (
    <article className={`activity-tour-card activity-card-floating ${isUnavailable ? 'tour-card-full' : ''}`}>
      {/* Top Image Container with Parallax Zoom */}
      <Link to={`/tours/${tour.slug}`} className="activity-card-media" aria-label={tour.title}>
        <div className="activity-media-zoom-box">
          <img
            src={imageUrl}
            alt={tour.title}
            loading="lazy"
            className="activity-card-img activity-parallax-img"
          />
          <div className="activity-card-overlay-gradient" />
        </div>

        {/* Capacity / Full / Closed / Low Seat Badges (Glassmorphism) */}
        <div className="activity-card-top-badges">
          {isFull ? (
            <span className="card-status-badge-glass badge-full-glass">🔴 Fully Booked</span>
          ) : isBookingClosed ? (
            <span className="card-status-badge-glass badge-full-glass">⛔ Booking Closed</span>
          ) : isLowSeats ? (
            <span className="card-status-badge-glass badge-low-seats-glass">
              ⚡ Only {seatsLeftLabel} Seats Left
            </span>
          ) : null}
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="activity-card-body">
        {/* Location & Schedule Row with Frosted Glass Badges */}
        <div className="activity-location-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div className="activity-location-pill-glass">
            <svg className="activity-location-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="activity-location-text">{destinationName}</span>
          </div>

          {travelDays && (
            <span className="activity-schedule-tag-glass" title="Operating Schedule">
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

        {/* Category & Feature Badges with Glassmorphism */}
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
                className={`activity-badge-glass ${isBlue ? 'badge-glass-blue' : 'badge-glass-teal'}`}
              >
                {displayCatName}
              </span>
            );
          })}
        </div>

        {/* Action Row with Glassmorphism Price & View Button */}
        <div className="activity-card-footer-row" style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          {formattedPrice ? (
            <div className="activity-price-box-glass">
              <span className="price-from-label">From</span>
              <span className="price-amount-text">{formattedPrice}</span>
            </div>
          ) : (
            <span className="activity-price-custom-tag">Custom</span>
          )}

          <Link
            to={`/tours/${tour.slug}`}
            className={`btn ${isUnavailable ? 'btn-secondary' : 'btn-primary'} btn-xs btn-card-explore-glass`}
            style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '700' }}
          >
            {isUnavailable ? 'View Details' : t('card_view_details', 'View Tour')} &rarr;
          </Link>
        </div>
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
