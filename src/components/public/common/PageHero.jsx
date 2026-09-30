import Breadcrumbs from './Breadcrumbs';
import { getMediaUrl } from '../../../utils/media';

export default function PageHero({
  title,
  subtitle,
  badge = 'Wonderer South India',
  breadcrumbs = [],
  heroMedia = null,
  className = '',
}) {
  const heroImageUrl = heroMedia ? getMediaUrl(heroMedia) : null;

  return (
    <section className={`page-hero-section ${className}`.trim()} aria-label={title}>
      {heroImageUrl && (
        <div className="page-hero-bg-wrapper">
          <img
            src={heroImageUrl}
            alt={title}
            className="page-hero-bg-img"
            loading="eager"
          />
          <div className="page-hero-overlay" />
        </div>
      )}

      <div className={`container page-hero-container ${heroImageUrl ? 'has-bg-img' : 'standard-header'}`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="page-hero-breadcrumbs" />
        )}

        <div className="page-hero-card">
          {badge && <span className="section-badge">{badge}</span>}
          <h1 className="page-hero-title">{title}</h1>
          {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
