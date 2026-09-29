import { useState } from 'react';
import Modal from '../../ui/Modal';
import { getMediaUrl } from '../../../utils/media';

export default function ReviewDetailModal({
  review,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onToggleFeature,
  onDelete,
  canModerate = true,
  actionLoading = false,
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!review) return null;

  const isApproved = review.status === 'approved';
  const isPending = review.status === 'pending';
  const isRejected = review.status === 'rejected';
  const isFeatured = Boolean(review.is_featured);

  const initials = review.customer_name
    ? review.customer_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const mediaList = review.media || [];

  return (
    <>
      <Modal
        isOpen={isOpen && !selectedPhoto}
        onClose={onClose}
        title="Review & Testimonial Details"
        size="lg"
      >
        <div className="review-detail-modal-body">
          {/* Header Card with Customer & Tour Info */}
          <div className="review-detail-header-card">
            <div className="review-customer-avatar-large">
              <span>{initials}</span>
            </div>

            <div className="review-detail-customer-info">
              <div className="review-detail-name-row">
                <h3 className="review-customer-name-heading">
                  {review.customer_name}
                </h3>
                <div className="review-badges-row">
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
                      ? 'Pending Moderation'
                      : 'Rejected'}
                  </span>
                  {isFeatured && (
                    <span className="admin-badge admin-badge-gold">
                      ⭐ Featured Testimonial
                    </span>
                  )}
                </div>
              </div>

              <div className="review-detail-contact-meta">
                <span className="review-contact-item">
                  ✉️ {review.customer_email}
                </span>
                {review.customer_country && (
                  <span className="review-contact-item">
                    📍 {review.customer_country}
                  </span>
                )}
                <span className="review-contact-item text-muted">
                  🗓️ {new Date(review.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Tour Reference Banner */}
          <div className="review-tour-reference-box">
            <span className="review-tour-label">Associated Tour Package:</span>
            {review.tour ? (
              <a
                href={`/tours/${review.tour.slug}`}
                target="_blank"
                rel="noreferrer"
                className="review-tour-link"
                title="View Tour Package on public website"
              >
                🗺️ {review.tour.title} &rarr;
              </a>
            ) : (
              <span className="text-muted">Tour #{review.tour_id}</span>
            )}
          </div>

          {/* Review Star Rating & Title */}
          <div className="review-detail-content-section">
            <div className="review-detail-rating-banner">
              <div className="review-stars-visual">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <span className="review-rating-number">{review.rating}.0 / 5.0 Rating</span>
            </div>

            {review.title && (
              <h4 className="review-headline-title">{review.title}</h4>
            )}

            <div className="review-full-text-box">
              <p className="review-full-text">{review.content}</p>
            </div>
          </div>

          {/* Review Photos & Attached Media */}
          {mediaList.length > 0 && (
            <div className="review-photos-section">
              <h4 className="review-photos-title">
                Attached Traveler Photos ({mediaList.length})
              </h4>
              <div className="review-photos-grid">
                {mediaList.map((mediaItem) => {
                  const photoUrl = getMediaUrl(mediaItem);
                  return (
                    <button
                      key={mediaItem.id}
                      type="button"
                      className="review-photo-thumb-btn"
                      onClick={() => setSelectedPhoto(mediaItem)}
                      title="Click to view high-resolution photo"
                    >
                      <img
                        src={photoUrl}
                        alt={mediaItem.alt_text || 'Traveler review photo'}
                        loading="lazy"
                      />
                      <span className="photo-zoom-icon">🔍</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Moderation Audit Info */}
          {(review.moderated_at || review.moderated_by) && (
            <div className="review-moderation-audit-footer">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                Moderated by Administrator #{review.moderated_by || 'System'} on{' '}
                {new Date(review.moderated_at).toLocaleString()}
              </span>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="review-detail-modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={actionLoading}
            >
              Close
            </button>

            {canModerate && (
              <div className="review-moderation-btn-group">
                {/* Approve Button */}
                {!isApproved && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onApprove(review)}
                    disabled={actionLoading}
                  >
                    ✓ Approve Review
                  </button>
                )}

                {/* Reject Button */}
                {!isRejected && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-reject"
                    onClick={() => onReject(review)}
                    disabled={actionLoading}
                  >
                    ✕ Reject Review
                  </button>
                )}

                {/* Feature / Unfeature Button */}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => onToggleFeature(review)}
                  disabled={actionLoading}
                >
                  {isFeatured ? '★ Unfeature' : '⭐ Set as Featured'}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-delete-danger"
                  onClick={() => onDelete(review)}
                  disabled={actionLoading}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* High-Resolution Photo Lightbox Modal */}
      {selectedPhoto && (
        <Modal
          isOpen={Boolean(selectedPhoto)}
          onClose={() => setSelectedPhoto(null)}
          title={selectedPhoto.original_name || 'Traveler Review Photo'}
          size="md"
        >
          <div className="review-lightbox-container">
            <img
              src={getMediaUrl(selectedPhoto)}
              alt={selectedPhoto.alt_text || 'Review photo high-resolution'}
              className="review-lightbox-img"
            />
            <div className="review-lightbox-meta">
              <span>
                {selectedPhoto.width && selectedPhoto.height
                  ? `${selectedPhoto.width} × ${selectedPhoto.height} px`
                  : selectedPhoto.mime_type || 'Image'}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedPhoto(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
