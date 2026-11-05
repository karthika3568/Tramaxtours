import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';

export default function MedicalTripCard({ trip }) {
  if (!trip) return null;

  const imageUrl = getMediaUrl(
    trip.featured_image || trip.banner_image,
    '/uploads/media/medical_package_banner.jpg'
  );

  const currencySymbol = trip.currency === 'INR' ? '₹' : trip.currency === 'USD' ? '$' : (trip.currency || '₹');
  const price = trip.price ? Number(trip.price) : 0;
  const discountPrice = trip.discount_price ? Number(trip.discount_price) : null;
  const assessmentsCount = trip.assessments_count ?? (Array.isArray(trip.assessments) ? trip.assessments.length : 6);

  return (
    <article
      className="activity-tour-card medical-trip-card"
      style={{
        borderRadius: '16px',
        border: '1px solid #ccfbf1',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(1, 170, 144, 0.08)',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top Image Container */}
      <Link
        to={`/tours/medical-trip/${trip.slug}`}
        className="activity-card-media"
        aria-label={trip.title}
        style={{ position: 'relative', height: '210px', display: 'block', overflow: 'hidden' }}
      >
        <img
          src={imageUrl}
          alt={trip.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Category Pill */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <span
            style={{
              backgroundColor: '#01aa90',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <span>🩺</span>
            <span>{trip.category || 'Medical Tourism'}</span>
          </span>
        </div>

        {/* Diagnostics Badge */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 2 }}>
          <span
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            {assessmentsCount} Assessments
          </span>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="activity-card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Location & Duration Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📍</span>
            <span>{trip.location || 'Chennai, India'}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🗓️</span>
            <span>{trip.duration || '1 Day'}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="activity-tour-title" style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', lineHeight: '1.3' }}>
          <Link
            to={`/tours/medical-trip/${trip.slug}`}
            style={{ color: '#0f172a', textDecoration: 'none' }}
          >
            {trip.title}
          </Link>
        </h3>

        {/* Short Description */}
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0', flex: 1 }}>
          {trip.short_description || trip.banner_description || 'Comprehensive clinical health check, advanced diagnostics & preventive screening.'}
        </p>

        {/* Price & Action Row */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
              All-Inclusive
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#01aa90' }}>
                {currencySymbol}{price.toLocaleString()}
              </span>
              {discountPrice && discountPrice > 0 && (
                <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#94a3b8' }}>
                  {currencySymbol}{discountPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/tours/medical-trip/${trip.slug}`}
            className="btn btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '8px',
              backgroundColor: '#01aa90',
              borderColor: '#01aa90',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Explore Tour</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
