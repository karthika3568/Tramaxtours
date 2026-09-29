export default function ReviewTable({
  reviews,
  onViewDetails,
  onApprove,
  onReject,
  onToggleFeature,
  onDeleteClick,
  canModerate = true,
  actionLoadingId = null,
}) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const renderStars = (rating) => {
    const num = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    return (
      <span className="review-stars-cell" title={`${num} out of 5 stars`}>
        <span className="stars-filled">{'★'.repeat(num)}</span>
        <span className="stars-empty">{'☆'.repeat(5 - num)}</span>
        <span className="rating-numeric"> {num}.0</span>
      </span>
    );
  };

  return (
    <div className="admin-table-container">
      {/* Desktop Table View */}
      <div className="admin-desktop-table-wrapper">
        <table className="admin-data-table" aria-label="Customer Reviews">
          <thead>
            <tr>
              <th scope="col" style={{ width: '220px' }}>
                Customer
              </th>
              <th scope="col" style={{ width: '130px' }}>
                Rating
              </th>
              <th scope="col">Review & Tour</th>
              <th scope="col" style={{ width: '120px' }}>
                Status
              </th>
              <th scope="col" style={{ width: '120px' }}>
                Date
              </th>
              <th scope="col" style={{ width: '200px', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => {
              const isApproved = review.status === 'approved';
              const isPending = review.status === 'pending';
              const isRejected = review.status === 'rejected';
              const isFeatured = Boolean(review.is_featured);
              const isLoading = actionLoadingId === review.id;
              const mediaCount = review.media?.length || 0;

              const initials = review.customer_name
                ? review.customer_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'U';

              return (
                <tr key={review.id} className="admin-table-row">
                  {/* Customer Info */}
                  <td className="dest-table-name-cell">
                    <div className="review-customer-cell-wrapper">
                      <div className="review-customer-avatar-mini">
                        <span>{initials}</span>
                      </div>
                      <div className="review-customer-info-col">
                        <strong className="review-customer-name">
                          {review.customer_name}
                        </strong>
                        <span className="review-customer-email text-muted">
                          {review.customer_email}
                        </span>
                        {review.customer_country && (
                          <span className="review-customer-country text-muted">
                            📍 {review.customer_country}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td>{renderStars(review.rating)}</td>

                  {/* Review Text & Tour */}
                  <td>
                    <div className="review-content-cell-wrapper">
                      {review.title && (
                        <strong className="review-table-headline">
                          {review.title}
                        </strong>
                      )}
                      <p className="review-table-excerpt text-muted">
                        &quot;
                        {review.content?.length > 120
                          ? `${review.content.substring(0, 120)}...`
                          : review.content}
                        &quot;
                      </p>

                      <div className="review-table-meta-tags">
                        {review.tour && (
                          <span className="review-tour-tag">
                            🗺️ {review.tour.title}
                          </span>
                        )}
                        {mediaCount > 0 && (
                          <span className="review-photo-count-badge">
                            📷 {mediaCount} photo{mediaCount === 1 ? '' : 's'}
                          </span>
                        )}
                        {isFeatured && (
                          <span className="admin-badge admin-badge-gold">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`admin-badge ${
                        isApproved
                          ? 'admin-badge-success'
                          : isPending
                          ? 'admin-badge-draft'
                          : 'admin-badge-neutral'
                      }`}
                    >
                      {isApproved
                        ? 'Approved'
                        : isPending
                        ? 'Pending'
                        : 'Rejected'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="text-muted" style={{ fontSize: '0.8125rem' }}>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>

                  {/* Action Controls */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-row-actions">
                      {/* Inspect Detail */}
                      <button
                        type="button"
                        className="btn-action-icon"
                        title="View Full Details & Photos"
                        aria-label={`View review details from ${review.customer_name}`}
                        onClick={() => onViewDetails(review)}
                      >
                        👁️
                      </button>

                      {/* Quick Approve */}
                      {canModerate && !isApproved && (
                        <button
                          type="button"
                          className="btn-action-icon action-publish"
                          title="Approve Review"
                          aria-label="Approve review"
                          onClick={() => onApprove(review)}
                          disabled={isLoading}
                        >
                          {isLoading ? '⏳' : '✓'}
                        </button>
                      )}

                      {/* Quick Reject */}
                      {canModerate && !isRejected && (
                        <button
                          type="button"
                          className="btn-action-icon action-unpublish"
                          title="Reject Review"
                          aria-label="Reject review"
                          onClick={() => onReject(review)}
                          disabled={isLoading}
                        >
                          {isLoading ? '⏳' : '✕'}
                        </button>
                      )}

                      {/* Feature / Unfeature */}
                      {canModerate && (
                        <button
                          type="button"
                          className={`btn-action-icon ${
                            isFeatured ? 'action-featured-active' : ''
                          }`}
                          title={isFeatured ? 'Unfeature Review' : 'Set as Featured Review'}
                          aria-label={isFeatured ? 'Unfeature review' : 'Feature review'}
                          onClick={() => onToggleFeature(review)}
                          disabled={isLoading}
                        >
                          {isFeatured ? '★' : '☆'}
                        </button>
                      )}

                      {/* Delete */}
                      {canModerate && (
                        <button
                          type="button"
                          className="btn-action-icon action-delete"
                          title="Delete Review"
                          aria-label="Delete review"
                          onClick={() => onDeleteClick(review)}
                          disabled={isLoading}
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

      {/* Mobile Card List View */}
      <div className="admin-mobile-card-list">
        {reviews.map((review) => {
          const isApproved = review.status === 'approved';
          const isPending = review.status === 'pending';
          const isFeatured = Boolean(review.is_featured);
          const isLoading = actionLoadingId === review.id;
          const mediaCount = review.media?.length || 0;

          const initials = review.customer_name
            ? review.customer_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'U';

          return (
            <div key={review.id} className="admin-mobile-card">
              <div className="admin-mobile-card-header">
                <div className="review-customer-avatar-mini">
                  <span>{initials}</span>
                </div>

                <div className="admin-mobile-card-title-group">
                  <h3 className="admin-mobile-card-title">
                    {review.customer_name}
                  </h3>
                  <span className="dest-table-slug text-muted">
                    {review.customer_email}
                  </span>
                </div>

                <span
                  className={`admin-badge ${
                    isApproved
                      ? 'admin-badge-success'
                      : isPending
                      ? 'admin-badge-draft'
                      : 'admin-badge-neutral'
                  }`}
                >
                  {isApproved
                    ? 'Approved'
                    : isPending
                    ? 'Pending'
                    : 'Rejected'}
                </span>
              </div>

              <div className="review-mobile-card-rating">
                {renderStars(review.rating)}
                {isFeatured && (
                  <span className="admin-badge admin-badge-gold">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {review.title && (
                <strong className="review-table-headline">
                  {review.title}
                </strong>
              )}

              <p className="admin-mobile-card-subtitle">&quot;{review.content}&quot;</p>

              <div className="admin-mobile-card-meta">
                {review.tour && (
                  <span className="review-tour-tag">
                    🗺️ {review.tour.title}
                  </span>
                )}
                {mediaCount > 0 && (
                  <span className="review-photo-count-badge">
                    📷 {mediaCount} photo{mediaCount === 1 ? '' : 's'}
                  </span>
                )}
                <span className="text-muted">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="admin-mobile-card-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => onViewDetails(review)}
                >
                  👁️ Inspect Details
                </button>

                {canModerate && !isApproved && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onApprove(review)}
                    disabled={isLoading}
                  >
                    ✓ Approve
                  </button>
                )}

                {canModerate && !isPending && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-reject"
                    onClick={() => onReject(review)}
                    disabled={isLoading}
                  >
                    ✕ Reject
                  </button>
                )}

                {canModerate && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-delete-danger"
                    onClick={() => onDeleteClick(review)}
                    disabled={isLoading}
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
