import { useState } from 'react';
import Modal from '../../ui/Modal';
import { getMediaUrl } from '../../../utils/media';

const SYSTEM_PAGE_SLUGS = ['about-us', 'terms-conditions', 'refund-policy', 'privacy-policy'];

export default function PageDeleteModal({
  page,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) {
  const [forceDelete, setForceDelete] = useState(false);

  if (!page) return null;

  const isSystemPage = SYSTEM_PAGE_SLUGS.includes(page.slug);
  const heroThumb = getMediaUrl(page.hero_media);

  const handleConfirm = () => {
    onConfirmDelete(page.id, forceDelete);
  };

  const handleModalClose = () => {
    setForceDelete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Delete CMS Page"
      size="sm"
    >
      <div className="dest-delete-modal-content">
        <div className="dest-delete-warning-icon" aria-hidden="true">
          ⚠️
        </div>

        <div className="dest-delete-target-card">
          <div className="dest-delete-mini-thumb">
            {heroThumb ? (
              <img src={heroThumb} alt={page.title} />
            ) : (
              <span>📄</span>
            )}
          </div>
          <div className="dest-delete-target-info">
            <strong className="dest-target-name">{page.title}</strong>
            <span className="dest-target-slug">Slug: /{page.slug}</span>
          </div>
        </div>

        <p className="dest-delete-prompt">
          Are you sure you want to delete this page? By default, this will perform a reversible soft-delete and remove the page from the active website.
        </p>

        {isSystemPage && (
          <div className="dest-dependency-warning-box">
            <h4 className="dependency-warning-title">⚠️ Core System Page Warning</h4>
            <p className="dependency-warning-desc">
              <strong>{page.title}</strong> is a core system page (<code>/{page.slug}</code>) referenced by public navigation and footer menus.
            </p>
            <p className="dependency-warning-sub">
              Deleting this page may cause visitors accessing this URL to receive a 404 page until restored.
            </p>
          </div>
        )}

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
              : 'Delete Page'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
