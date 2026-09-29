import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';

export default function TourTable({
  tours = [],
  viewMode = 'cards', // 'cards' | 'table'
  onPublishToggle,
  onDeleteClick,
  canEdit = false,
  canDelete = false,
  canPublish = false,
  actionLoadingId = null,
}) {
  if (!tours || tours.length === 0) {
    return null;
  }

  // Format currency symbol
  const formatPrice = (price, currency) => {
    const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'KES' ? 'KES ' : (currency || '€');
    const num = parseFloat(price || 0);
    return `${symbol}${num.toLocaleString()}`;
  };

  return (
    <div className="tour-catalog-container">
      {/* 1. EDITORIAL CARDS VIEW (DEFAULT) */}
      {viewMode === 'cards' && (
        <div className="tour-cards-editorial-grid">
          {tours.map((tour) => {
            const isProcessing = actionLoadingId === tour.id;
            const thumbUrl = getMediaUrl(tour.featured_image);
            const isPublished = tour.status === 'published';
            const durationLabel = tour.duration_text
              ? tour.duration_text
              : `${tour.duration_days || 1} Day${tour.duration_days === 1 ? '' : 's'}`;

            return (
              <article key={tour.id} className="editorial-tour-card">
                {/* Media / Image Container */}
                <div className="tour-card-media-wrapper">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={tour.featured_image?.alt_text || tour.title}
                      className="tour-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="tour-card-img-placeholder" aria-label="No cover image">
                      <span className="placeholder-icon">🧭</span>
                      <span className="placeholder-text">Curated Journey</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="tour-card-overlay" />

                  {/* Top Badges */}
                  <div className="tour-card-top-badges">
                    <span className={`tour-status-pill status-${tour.status}`}>
                      <span className="status-dot" aria-hidden="true" />
                      {tour.status === 'published' ? 'Published' : tour.status === 'draft' ? 'Draft' : tour.status}
                    </span>

                    {Boolean(tour.is_featured) && (
                      <span className="tour-featured-pill">
                        ⭐ Spotlight
                      </span>
                    )}
                  </div>

                  {/* Rating Overlay if Available */}
                  {tour.average_rating ? (
                    <div className="tour-card-rating-badge">
                      <span className="star-icon">★</span>
                      <strong>{parseFloat(tour.average_rating).toFixed(1)}</strong>
                      {tour.reviews_count > 0 && (
                        <span className="rating-count">({tour.reviews_count})</span>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Card Content */}
                <div className="tour-card-body">
                  {/* Category / Tour Type */}
                  <div className="tour-card-category-row">
                    <span className="tour-card-category">
                      {tour.tour_type || 'Private Tour'}
                    </span>
                    <span className="tour-card-order-tag" title="Display Sort Order">
                      #{tour.display_order ?? 0}
                    </span>
                  </div>

                  {/* Tour Title */}
                  <h3 className="tour-card-title" title={tour.title}>
                    {canEdit ? (
                      <Link to={`/admin/tours/${tour.id}/edit`} className="tour-title-link">
                        {tour.title}
                      </Link>
                    ) : (
                      tour.title
                    )}
                  </h3>

                  {/* Metadata Row: Destination & Duration */}
                  <div className="tour-card-meta-row">
                    <span className="meta-destination">
                      <span className="meta-icon" aria-hidden="true">📍</span>
                      <span className="meta-label">{tour.destination?.name || 'Unassigned'}</span>
                    </span>

                    <span className="meta-duration">
                      <span className="meta-icon" aria-hidden="true">⏱</span>
                      <span className="meta-label">{durationLabel}</span>
                    </span>
                  </div>

                  {/* Short Summary if exists */}
                  {tour.short_description && (
                    <p className="tour-card-summary">
                      {tour.short_description}
                    </p>
                  )}

                  {/* Pricing & Publication Status Row */}
                  <div className="tour-card-pricing-bar">
                    <div className="pricing-stack">
                      <span className="price-lead-label">From</span>
                      <strong className="price-headline">
                        {formatPrice(tour.base_price, tour.currency)}
                      </strong>
                    </div>

                    <div className="tour-card-slug-box">
                      <code className="slug-code">/{tour.slug}</code>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="tour-card-footer">
                  <div className="footer-action-left">
                    <a
                      href={`/tours/${tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-action view-btn"
                      title="View public guest tour page"
                      aria-label={`View public page for ${tour.title}`}
                    >
                      <span>↗</span> View
                    </a>

                    {canEdit && (
                      <Link
                        to={`/admin/tours/${tour.id}/edit`}
                        className="btn-card-action edit-btn"
                        title="Edit tour package"
                        aria-label={`Edit ${tour.title}`}
                      >
                        <span>✏️</span> Edit
                      </Link>
                    )}
                  </div>

                  <div className="footer-action-right">
                    {canPublish && (
                      <button
                        type="button"
                        className={`btn-card-action toggle-status-btn ${isPublished ? 'is-published' : 'is-draft'}`}
                        disabled={isProcessing}
                        onClick={() => onPublishToggle(tour)}
                        title={isPublished ? 'Revert to draft status' : 'Publish tour live'}
                        aria-label={isPublished ? `Unpublish ${tour.title}` : `Publish ${tour.title}`}
                      >
                        {isProcessing ? 'Saving...' : isPublished ? 'Revert Draft' : 'Publish'}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        className="btn-card-action delete-btn"
                        disabled={isProcessing}
                        onClick={() => onDeleteClick(tour)}
                        title="Delete tour package"
                        aria-label={`Delete ${tour.title}`}
                      >
                        <span>🗑️</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 2. COMPACT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="tour-table-responsive-container hide-on-mobile">
          <table className="editorial-tour-table" aria-label="Tours Catalog">
            <thead>
              <tr>
                <th scope="col" className="col-thumb">Media</th>
                <th scope="col" className="col-title">Tour Package</th>
                <th scope="col" className="col-destination">Destination</th>
                <th scope="col" className="col-type">Type / Category</th>
                <th scope="col" className="col-duration">Duration</th>
                <th scope="col" className="col-price">Starting Price</th>
                <th scope="col" className="col-status">Status</th>
                <th scope="col" className="col-order">Order</th>
                <th scope="col" className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => {
                const isProcessing = actionLoadingId === tour.id;
                const thumbUrl = getMediaUrl(tour.featured_image);
                const isPublished = tour.status === 'published';

                return (
                  <tr key={tour.id} className="editorial-table-row">
                    {/* Media Thumbnail */}
                    <td className="col-thumb">
                      <div className="tour-table-thumb-box">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={tour.title}
                            className="tour-table-thumb-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="tour-table-thumb-placeholder" aria-label="No image">
                            🧭
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Tour Title & Slug */}
                    <td className="col-title">
                      <div className="tour-table-info">
                        <div className="tour-table-title-row">
                          {canEdit ? (
                            <Link to={`/admin/tours/${tour.id}/edit`} className="tour-table-name-link">
                              {tour.title}
                            </Link>
                          ) : (
                            <strong className="tour-table-name">{tour.title}</strong>
                          )}
                          {Boolean(tour.is_featured) && (
                            <span className="tour-badge-featured" title="Featured Tour Spotlight">
                              ⭐ Spotlight
                            </span>
                          )}
                        </div>
                        <code className="tour-slug-code">/{tour.slug}</code>
                        {tour.average_rating && (
                          <span className="tour-rating-snippet">
                            ★ {parseFloat(tour.average_rating).toFixed(1)} ({tour.reviews_count || 0})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="col-destination">
                      <span className="tour-destination-pill">
                        📍 {tour.destination?.name || 'Unassigned'}
                      </span>
                    </td>

                    {/* Tour Type */}
                    <td className="col-type">
                      {tour.tour_type ? (
                        <span className="tour-type-chip">{tour.tour_type}</span>
                      ) : (
                        <span className="tour-type-none">—</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="col-duration">
                      <span className="tour-duration-tag">
                        ⏱ {tour.duration_days} Day{tour.duration_days === 1 ? '' : 's'}
                        {tour.duration_text ? ` (${tour.duration_text})` : ''}
                      </span>
                    </td>

                    {/* Base Price */}
                    <td className="col-price">
                      <strong className="tour-price-val">
                        {formatPrice(tour.base_price, tour.currency)}
                      </strong>
                    </td>

                    {/* Status */}
                    <td className="col-status">
                      <span className={`tour-status-pill status-${tour.status}`}>
                        <span className="status-dot" aria-hidden="true" />
                        {tour.status === 'published' ? 'Published' : tour.status === 'draft' ? 'Draft' : tour.status}
                      </span>
                    </td>

                    {/* Display Order */}
                    <td className="col-order">
                      <span className="tour-order-val">#{tour.display_order ?? 0}</span>
                    </td>

                    {/* Actions */}
                    <td className="col-actions">
                      <div className="tour-row-actions">
                        {/* View Public Page */}
                        <a
                          href={`/tours/${tour.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action-icon view-action"
                          title="View public tour detail page"
                          aria-label={`View public page for ${tour.title}`}
                        >
                          ↗ View
                        </a>

                        {/* Edit */}
                        {canEdit && (
                          <Link
                            to={`/admin/tours/${tour.id}/edit`}
                            className="btn-action-icon edit-action"
                            title="Edit tour package"
                            aria-label={`Edit ${tour.title}`}
                          >
                            ✏️ Edit
                          </Link>
                        )}

                        {/* Publish / Unpublish Toggle */}
                        {canPublish && (
                          <button
                            type="button"
                            className={`btn-action-icon ${isPublished ? 'unpublish-action' : 'publish-action'}`}
                            disabled={isProcessing}
                            onClick={() => onPublishToggle(tour)}
                            title={isPublished ? 'Revert to draft status' : 'Publish tour live'}
                            aria-label={isPublished ? `Unpublish ${tour.title}` : `Publish ${tour.title}`}
                          >
                            {isProcessing ? '⏳...' : isPublished ? 'Draft' : 'Publish'}
                          </button>
                        )}

                        {/* Delete */}
                        {canDelete && (
                          <button
                            type="button"
                            className="btn-action-icon delete-action"
                            disabled={isProcessing}
                            onClick={() => onDeleteClick(tour)}
                            title="Delete tour package"
                            aria-label={`Delete ${tour.title}`}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'table' && (
        <div className="tour-mobile-cards-list hide-on-desktop">
          {tours.map((tour) => {
            const isProcessing = actionLoadingId === tour.id;
            const thumbUrl = getMediaUrl(tour.featured_image);
            const isPublished = tour.status === 'published';

            return (
              <div key={tour.id} className="tour-mobile-card">
                <div className="tour-mobile-card-media">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt={tour.title} className="tour-mobile-card-img" loading="lazy" />
                  ) : (
                    <div className="tour-table-thumb-placeholder" aria-label="No image">🧭</div>
                  )}
                </div>

                <div className="tour-mobile-card-body">
                  <div className="tour-table-title-row">
                    {canEdit ? (
                      <Link to={`/admin/tours/${tour.id}/edit`} className="tour-table-name-link">
                        {tour.title}
                      </Link>
                    ) : (
                      <strong className="tour-table-name">{tour.title}</strong>
                    )}
                    {Boolean(tour.is_featured) && (
                      <span className="tour-badge-featured" title="Featured Tour Spotlight">⭐</span>
                    )}
                  </div>

                  <div className="mobile-meta-row">
                    <span className="mobile-meta-label">Destination:</span>
                    <span className="mobile-meta-value">📍 {tour.destination?.name || 'Unassigned'}</span>
                  </div>
                  <div className="mobile-meta-row">
                    <span className="mobile-meta-label">Duration:</span>
                    <span className="mobile-meta-value">
                      ⏱ {tour.duration_days} Day{tour.duration_days === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mobile-meta-row">
                    <span className="mobile-meta-label">Price:</span>
                    <span className="mobile-meta-value">
                      <strong>{formatPrice(tour.base_price, tour.currency)}</strong>
                    </span>
                  </div>
                  <div className="mobile-meta-row">
                    <span className="mobile-meta-label">Status:</span>
                    <span className={`tour-status-pill status-${tour.status}`}>
                      <span className="status-dot" aria-hidden="true" />
                      {tour.status === 'published' ? 'Published' : tour.status === 'draft' ? 'Draft' : tour.status}
                    </span>
                  </div>

                  <div className="tour-row-actions mobile-card-actions">
                    <a
                      href={`/tours/${tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action-icon view-action"
                    >
                      ↗ View
                    </a>
                    {canEdit && (
                      <Link to={`/admin/tours/${tour.id}/edit`} className="btn-action-icon edit-action">
                        ✏️ Edit
                      </Link>
                    )}
                    {canPublish && (
                      <button
                        type="button"
                        className={`btn-action-icon ${isPublished ? 'unpublish-action' : 'publish-action'}`}
                        disabled={isProcessing}
                        onClick={() => onPublishToggle(tour)}
                      >
                        {isProcessing ? '⏳...' : isPublished ? 'Draft' : 'Publish'}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="btn-action-icon delete-action"
                        disabled={isProcessing}
                        onClick={() => onDeleteClick(tour)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

