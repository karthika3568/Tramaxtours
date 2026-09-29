import { useState } from 'react';
import Modal from '../../ui/Modal';
import { getMediaUrl } from '../../../utils/media';

export default function DestinationDeleteModal({
  destination,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) {
  const [forceDelete, setForceDelete] = useState(false);

  if (!destination) return null;

  const toursCount = destination.tours_count || 0;
  const hasDependencies = toursCount > 0;
  const thumbUrl = getMediaUrl(destination.featured_image);

  const handleConfirm = () => {
    onConfirmDelete(destination.id, forceDelete);
  };

  const handleModalClose = () => {
    setForceDelete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Delete Destination"
      size="sm"
    >
      <div className="dest-delete-modal-content">
        <div className="dest-delete-warning-icon" aria-hidden="true">⚠️</div>

        <div className="dest-delete-target-card">
          <div className="dest-delete-mini-thumb">
            {thumbUrl ? (
              <img src={thumbUrl} alt={destination.name} />
            ) : (
              <span>🗺️</span>
            )}
          </div>
          <div className="dest-delete-target-info">
            <strong className="dest-target-name">{destination.name}</strong>
            <span className="dest-target-slug">Slug: /{destination.slug}</span>
          </div>
        </div>

        <p className="dest-delete-prompt">
          Are you sure you want to delete this destination? This action will remove it from the active destination catalog.
        </p>

        {hasDependencies && (
          <div className="dest-dependency-warning-box">
            <h4 className="dependency-warning-title">⚠️ Dependency Warning</h4>
            <p className="dependency-warning-desc">
              This destination is currently linked to <strong>{toursCount} active tour package{toursCount === 1 ? '' : 's'}</strong>.
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
              <span>Force delete destination and bypass dependency check</span>
            </label>
          </div>
        )}

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
            disabled={isDeleting || (hasDependencies && !forceDelete)}
          >
            {isDeleting ? 'Deleting...' : forceDelete ? 'Force Delete Destination' : 'Delete Destination'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
