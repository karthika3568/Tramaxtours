import { Link } from 'react-router-dom';
import Breadcrumbs from '../common/Breadcrumbs';
import { getMediaUrl } from '../../../utils/media';

export default function TourHero({ tour }) {
  if (!tour) return null;

  const heroImage = getMediaUrl(tour.featured_image || tour.og_image);
  const currencySymbol = tour.currency === 'EUR' ? '€' : (tour.currency || '€');

  return (
    <section className="detail-hero-section tour-detail-hero" aria-label={`${tour.title} Hero`}>
      <div className="detail-hero-bg-wrapper">
        <img
          src={heroImage}
          alt={tour.title}
          className="detail-hero-bg-img"
          loading="eager"
        />
        <div className="detail-hero-overlay" />
      </div>

      <div className="container detail-hero-container">
        <Breadcrumbs
          items={[
            { label: 'Tours', to: '/tours' },
            ...(tour.destination?.name
              ? [{ label: tour.destination.name, to: `/destinations/${tour.destination.slug}` }]
              : []),
            { label: tour.title },
          ]}
        />

        <div className="detail-hero-card">
          <div className="tour-hero-badges">
            {tour.destination?.name && (
              <span className="section-badge">{tour.destination.name}</span>
            )}
            {tour.tour_type && (
              <span className="tour-type-badge">{tour.tour_type.replace(/_/g, ' ')}</span>
            )}
          </div>

          <h1 className="detail-hero-title">{tour.title}</h1>

          {tour.short_description && (
            <p className="detail-hero-subtitle">{tour.short_description}</p>
          )}

          <div className="tour-hero-meta-bar">
            {tour.duration_text && (
              <div className="tour-meta-item">
                <span className="meta-label">Duration</span>
                <span className="meta-val">{tour.duration_text}</span>
              </div>
            )}

            {tour.min_persons && (
              <div className="tour-meta-item">
                <span className="meta-label">Group Size</span>
                <span className="meta-val">
                  {tour.min_persons}
                  {tour.max_persons ? ` - ${tour.max_persons}` : '+'} Persons
                </span>
              </div>
            )}

            {tour.languages && (
              <div className="tour-meta-item hide-on-mobile">
                <span className="meta-label">Languages</span>
                <span className="meta-val">{tour.languages}</span>
              </div>
            )}

            <div className="tour-meta-item tour-meta-price">
              <span className="meta-label">Starting Price</span>
              <span className="meta-val price-highlight">
                {currencySymbol}{Number(tour.base_price || 0).toLocaleString()}
              </span>
            </div>

            <div className="tour-hero-cta">
              <Link to="/contact" className="btn btn-secondary btn-md">
                Inquire & Book &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
