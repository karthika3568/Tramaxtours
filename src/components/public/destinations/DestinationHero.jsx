import Breadcrumbs from '../common/Breadcrumbs';
import { getMediaUrl } from '../../../utils/media';

export default function DestinationHero({ destination }) {
  if (!destination) return null;

  const heroImage = getMediaUrl(
    destination.hero_image || destination.featured_image
  );

  return (
    <section className="detail-hero-section" aria-label={`${destination.name} Overview`}>
      <div className="detail-hero-bg-wrapper">
        <img
          src={heroImage}
          alt={destination.name}
          className="detail-hero-bg-img"
          loading="eager"
        />
        <div className="detail-hero-overlay" />
      </div>

      <div className="container detail-hero-container">
        <Breadcrumbs
          items={[{ label: 'Destinations', to: '/destinations' }, { label: destination.name }]}
        />

        <div className="detail-hero-card">
          <span className="section-badge">Destination Guide</span>
          <h1 className="detail-hero-title">
            {destination.hero_title || destination.name}
          </h1>
          {destination.hero_subtitle && (
            <p className="detail-hero-subtitle">{destination.hero_subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}
