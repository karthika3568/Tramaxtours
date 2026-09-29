import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';

export default function DestinationCard({ destination }) {
  if (!destination) return null;

  const imageUrl = getMediaUrl(destination.featured_image || destination.hero_image);

  return (
    <article className="destination-card destination-catalog-card">
      <Link
        to={`/destinations/${destination.slug}`}
        className="destination-card-media"
        aria-label={`Explore ${destination.name}`}
      >
        <img
          src={imageUrl}
          alt={destination.name}
          loading="lazy"
          className="destination-card-img"
        />
        <div className="destination-media-overlay" />
        {destination.tours_count !== undefined && destination.tours_count > 0 && (
          <div className="destination-badge-overlay">
            <span>{destination.tours_count} {destination.tours_count === 1 ? 'Tour' : 'Tours'}</span>
          </div>
        )}
      </Link>

      <div className="destination-card-content">
        <h3 className="destination-card-title">
          <Link to={`/destinations/${destination.slug}`}>{destination.name}</Link>
        </h3>

        {destination.short_description && (
          <p className="destination-card-desc">{destination.short_description}</p>
        )}

        <div className="destination-card-footer">
          <Link
            to={`/destinations/${destination.slug}`}
            className="destination-explore-link"
          >
            <span>Explore Tours & Guide</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
