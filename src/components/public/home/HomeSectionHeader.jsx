import { Link } from 'react-router-dom';

export default function HomeSectionHeader({
  badge,
  title,
  subtitle,
  viewAllLink,
  viewAllLabel = 'View All',
  centered = true,
  className = '',
}) {
  return (
    <div
      className={`home-section-header ${centered ? 'text-center' : ''} ${className}`.trim()}
    >
      <div className="section-header-top">
        {badge && <span className="section-badge">{badge}</span>}
        {title && <h2 className="section-heading">{title}</h2>}
        {subtitle && <p className="section-subheading">{subtitle}</p>}
      </div>

      {viewAllLink && (
        <div className="section-header-action">
          <Link to={viewAllLink} className="section-view-all-link">
            <span>{viewAllLabel}</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
