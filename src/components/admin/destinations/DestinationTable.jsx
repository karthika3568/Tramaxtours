import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';

export default function DestinationTable({
  destinations = [],
  onPublishToggle,
  onDeleteClick,
  canEdit = false,
  canDelete = false,
  canPublish = false,
  actionLoadingId = null,
}) {
  if (!destinations || destinations.length === 0) {
    return null;
  }

  return (
    <div className="dest-table-responsive-container">
      {/* Desktop Table View */}
      <table className="dest-admin-table" aria-label="Destinations List">
        <thead>
          <tr>
            <th scope="col" className="col-thumb">Media</th>
            <th scope="col" className="col-name">Destination</th>
            <th scope="col" className="col-slug">Slug</th>
            <th scope="col" className="col-status">Status</th>
            <th scope="col" className="col-tours">Tours</th>
            <th scope="col" className="col-order">Order</th>
            <th scope="col" className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {destinations.map((dest) => {
            const isProcessing = actionLoadingId === dest.id;
            const thumbUrl = getMediaUrl(dest.featured_image);
            const isPublished = dest.status === 'published';

            return (
              <tr key={dest.id} className="dest-table-row">
                {/* Media Thumbnail */}
                <td className="col-thumb">
                  <div className="dest-row-thumb-box">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={dest.name}
                        className="dest-row-thumb-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="dest-row-thumb-placeholder" aria-label="No image">
                        🗺️
                      </div>
                    )}
                  </div>
                </td>

                {/* Destination Name & Metadata */}
                <td className="col-name">
                  <div className="dest-row-info">
                    <div className="dest-row-title-bar">
                      <strong className="dest-row-name">{dest.name}</strong>
                      {dest.is_featured && (
                        <span className="dest-badge-featured" title="Featured on Homepage">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    {dest.hero_title && (
                      <span className="dest-row-sub">{dest.hero_title}</span>
                    )}
                  </div>
                </td>

                {/* Slug */}
                <td className="col-slug">
                  <code className="dest-slug-code">/{dest.slug}</code>
                </td>

                {/* Status */}
                <td className="col-status">
                  <span className={`dest-status-badge status-${dest.status}`}>
                    {dest.status}
                  </span>
                </td>

                {/* Tours Count */}
                <td className="col-tours">
                  <span className="dest-tours-count-badge">
                    {dest.tours_count || 0} tour{dest.tours_count === 1 ? '' : 's'}
                  </span>
                </td>

                {/* Display Order */}
                <td className="col-order">
                  <span className="dest-order-val">#{dest.display_order ?? 0}</span>
                </td>

                {/* Actions */}
                <td className="col-actions">
                  <div className="dest-row-actions">
                    {/* View Public Page */}
                    <a
                      href={`/destinations/${dest.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action-icon view-action"
                      title="View public destination page"
                      aria-label={`View public page for ${dest.name}`}
                    >
                      ↗ View
                    </a>

                    {/* Edit */}
                    {canEdit && (
                      <Link
                        to={`/admin/destinations/${dest.id}/edit`}
                        className="btn-action-icon edit-action"
                        title="Edit destination details"
                        aria-label={`Edit ${dest.name}`}
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
                        onClick={() => onPublishToggle(dest)}
                        title={isPublished ? 'Revert to draft status' : 'Publish destination'}
                        aria-label={isPublished ? `Unpublish ${dest.name}` : `Publish ${dest.name}`}
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
                        onClick={() => onDeleteClick(dest)}
                        title="Delete destination"
                        aria-label={`Delete ${dest.name}`}
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

      {/* Mobile Cards View */}
      <div className="dest-mobile-cards-grid">
        {destinations.map((dest) => {
          const isProcessing = actionLoadingId === dest.id;
          const thumbUrl = getMediaUrl(dest.featured_image);
          const isPublished = dest.status === 'published';

          return (
            <div key={dest.id} className="dest-mobile-card">
              <div className="mobile-card-top">
                <div className="mobile-card-thumb">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt={dest.name} loading="lazy" />
                  ) : (
                    <span>🗺️</span>
                  )}
                </div>
                <div className="mobile-card-meta">
                  <div className="mobile-card-title-row">
                    <h3 className="mobile-card-title">{dest.name}</h3>
                    {dest.is_featured && (
                      <span className="dest-badge-featured">⭐ Featured</span>
                    )}
                  </div>
                  <code className="dest-slug-code">/{dest.slug}</code>
                  <div className="mobile-card-pills">
                    <span className={`dest-status-badge status-${dest.status}`}>
                      {dest.status}
                    </span>
                    <span className="dest-tours-count-badge">
                      {dest.tours_count || 0} tour{dest.tours_count === 1 ? '' : 's'}
                    </span>
                    <span className="dest-order-val">Order #{dest.display_order ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="mobile-card-actions">
                <a
                  href={`/destinations/${dest.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-xs"
                >
                  ↗ View Public
                </a>

                {canEdit && (
                  <Link
                    to={`/admin/destinations/${dest.id}/edit`}
                    className="btn btn-outline btn-xs"
                  >
                    ✏️ Edit
                  </Link>
                )}

                {canPublish && (
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    disabled={isProcessing}
                    onClick={() => onPublishToggle(dest)}
                  >
                    {isProcessing ? 'Saving...' : isPublished ? 'Revert to Draft' : 'Publish'}
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    className="btn btn-outline btn-xs btn-delete-danger"
                    disabled={isProcessing}
                    onClick={() => onDeleteClick(dest)}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
