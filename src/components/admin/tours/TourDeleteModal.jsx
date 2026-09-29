import { useState } from 'react';
import Modal from '../../ui/Modal';
import { getMediaUrl } from '../../../utils/media';

export default function TourDeleteModal({
  tour,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) {
  const [forceDelete, setForceDelete] = useState(false);

  if (!tour) return null;

  const bookingsCount = tour.usage_references?.bookings || 0;
  const hasDependencies = bookingsCount > 0;
  const thumbUrl = getMediaUrl(tour.featured_image);

  const handleConfirm = () => {
    onConfirmDelete(tour.id, forceDelete);
  };

  const handleModalClose = () => {
    setForceDelete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Delete Tour Package"
      size="sm"
    >
      <div className="tour-delete-modal-content">
        <div className="tour-delete-warning-icon" aria-hidden="true">⚠️</div>

        <div className="tour-delete-target-card">
          <div className="tour-delete-mini-thumb">
            {thumbUrl ? (
              <img src={thumbUrl} alt={tour.title} />
            ) : (
              <span>🧭</span>
            )}
          </div>
          <div className="tour-delete-target-info">
            <strong className="tour-target-title">{tour.title}</strong>
            <span className="tour-target-dest">Destination: {tour.destination?.name || 'Unassigned'}</span>
            <span className="tour-target-slug">Slug: /{tour.slug}</span>
          </div>
        </div>

        <p className="tour-delete-prompt">
          Are you sure you want to delete this tour package? This will remove it from public tour listings.
        </p>

        {hasDependencies && (
          <div className="tour-dependency-warning-box">
            <h4 className="dependency-warning-title">⚠️ Booking Dependency Warning</h4>
            <p className="dependency-warning-desc">
              This tour currently has <strong>{bookingsCount} active booking(s)</strong> attached to it.
            </p>
            <p className="dependency-warning-sub">
              Standard deletion will be rejected by the backend unless force deletion is confirmed.
            </p>

            <label className="force-delete-checkbox-label">
              <input
                type="checkbox"
                checked={forceDelete}
                onChange={(e) => setForceDelete(e.target.checked)}
              />
              <span>Force delete tour and override booking dependency check</span>
            </label>
          </div>
        )}

        <div className="tour-delete-actions">
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
            disabled={isDeleting || (hasDependencies && !forceDelete)}
          >
            {isDeleting ? 'Deleting...' : forceDelete ? 'Force Delete Tour' : 'Delete Tour'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
