import { useState } from 'react';
import Modal from '../../ui/Modal';

export default function ReviewDeleteModal({
  review,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) {
  const [forceDelete, setForceDelete] = useState(false);

  if (!review) return null;

  const handleConfirm = () => {
    onConfirmDelete(review.id, forceDelete);
  };

  const handleModalClose = () => {
    setForceDelete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Delete Customer Review"
      size="sm"
    >
      <div className="dest-delete-modal-content">
        <div className="dest-delete-warning-icon" aria-hidden="true">
          ⚠️
        </div>

        <div className="dest-delete-target-card">
          <div className="dest-delete-mini-thumb">
            <span style={{ fontSize: '1.5rem' }}>💬</span>
          </div>
          <div className="dest-delete-target-info">
            <strong className="dest-target-name">{review.customer_name}</strong>
            <span className="dest-target-slug">
              Tour: {review.tour?.title || `Tour #${review.tour_id}`}
            </span>
          </div>
        </div>

        <p className="dest-delete-prompt">
          Are you sure you want to delete this review from <strong>{review.customer_name}</strong>?
          By default, this will perform a reversible soft-delete.
        </p>

        <div className="review-delete-snippet-box">
          <div className="review-delete-rating">
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} ({review.rating}.0)
          </div>
          <p className="review-delete-text">&quot;{review.content?.substring(0, 120)}...&quot;</p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label className="force-delete-checkbox-label">
            <input
              type="checkbox"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
            />
            <span>Permanently delete record from database (bypasses soft-delete)</span>
          </label>
        </div>

        <div className="dest-delete-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleModalClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm btn-delete-danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? 'Deleting...'
              : forceDelete
              ? 'Permanently Delete'
              : 'Delete Review'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
