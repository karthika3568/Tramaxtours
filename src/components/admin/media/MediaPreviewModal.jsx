import { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import mediaService from '../../../services/mediaService';
import { getMediaUrl } from '../../../utils/media';
import Loading from '../../ui/Loading';

export default function MediaPreviewModal({
  media,
  isOpen,
  onClose,
  onUpdateSuccess,
  onDeleteRequest,
  canManage = false,
  canDelete = false,
}) {
  const [detailedMedia, setDetailedMedia] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !media?.id) {
      return;
    }

    let isMounted = true;
    async function loadFullDetails() {
      try {
        setLoadingDetails(true);
        const data = await mediaService.getMediaById(media.id);
        if (isMounted && data) {
          setDetailedMedia(data);
          setAltText(data.alt_text || '');
          setCaption(data.caption || '');
        }
      } catch {
        if (isMounted) {
          setDetailedMedia(media);
          setAltText(media.alt_text || '');
          setCaption(media.caption || '');
        }
      } finally {
        if (isMounted) {
          setLoadingDetails(false);
        }
      }
    }

    loadFullDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, media]);

  if (!media) return null;

  const activeData = detailedMedia || media;
  const imageUrl = getMediaUrl(activeData);
  const isImage = activeData.is_image || (activeData.mime_type && activeData.mime_type.startsWith('image/'));

  const handleCopy = () => {
    if (activeData.url) {
      navigator.clipboard.writeText(activeData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError(null);

    try {
      const updated = await mediaService.updateMedia(activeData.id, {
        alt_text: altText.trim() || null,
        caption: caption.trim() || null,
      });

      setDetailedMedia(updated);
      setIsEditing(false);
      if (onUpdateSuccess) {
        onUpdateSuccess(updated);
      }
    } catch (err) {
      setEditError(err?.message || 'Failed to update media metadata.');
    } finally {
      setIsSaving(false);
    }
  };

  const usageRefs = activeData.usage_references || {};
  const hasUsage = Object.keys(usageRefs).length > 0;

  const handleModalClose = () => {
    setIsEditing(false);
    setEditError(null);
    setDetailedMedia(null);
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={activeData.original_name || activeData.filename || 'Media Details'}
      size="lg"
    >
      <div className="media-preview-layout">
        {/* Left / Top: Visual Media Preview */}
        <div className="media-preview-visual-box">
          {isImage ? (
            <img
              src={imageUrl}
              alt={activeData.alt_text || activeData.original_name || 'Media Asset'}
              className="media-preview-img"
            />
          ) : (
            <div className="media-doc-preview">
              <span className="doc-icon-large" aria-hidden="true">📄</span>
              <span className="doc-filename-large">{activeData.original_name}</span>
              <span className="doc-mime-large">{activeData.mime_type}</span>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                Open File in New Tab ↗
              </a>
            </div>
          )}
        </div>

        {/* Right / Bottom: Metadata & Usage Details */}
        <div className="media-preview-meta-panel">
          {loadingDetails && (
            <div className="meta-loading-bar">
              <Loading message="Fetching usage details..." />
            </div>
          )}

          {/* Edit Metadata Form */}
          {isEditing ? (
            <form onSubmit={handleSaveMetadata} className="meta-edit-form">
              <h4 className="meta-panel-heading">Edit Metadata</h4>

              {editError && (
                <div className="upload-error-alert" role="alert">
                  <span>{editError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-alt-text" className="form-label">
                  Alt Text (Accessibility)
                </label>
                <input
                  type="text"
                  id="edit-alt-text"
                  className="form-input"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  maxLength={255}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-caption" className="form-label">
                  Caption
                </label>
                <input
                  type="text"
                  id="edit-caption"
                  className="form-input"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={255}
                />
              </div>

              <div className="meta-edit-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Metadata'}
                </button>
              </div>
            </form>
          ) : (
            <div className="meta-info-block">
              <div className="meta-header-row">
                <h4 className="meta-panel-heading">Media Information</h4>
                {canManage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm edit-meta-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit Text
                  </button>
                )}
              </div>

              <dl className="meta-definition-list">
                <div className="meta-def-row">
                  <dt>Media ID:</dt>
                  <dd><code>#{activeData.id}</code></dd>
                </div>

                <div className="meta-def-row">
                  <dt>Original Name:</dt>
                  <dd className="break-all">{activeData.original_name || '—'}</dd>
                </div>

                <div className="meta-def-row">
                  <dt>Stored Filename:</dt>
                  <dd className="break-all"><code>{activeData.filename || '—'}</code></dd>
                </div>

                <div className="meta-def-row">
                  <dt>File Size:</dt>
                  <dd>{activeData.file_size_human || `${Math.round((activeData.file_size || 0) / 1024)} KB`}</dd>
                </div>

                <div className="meta-def-row">
                  <dt>MIME Type:</dt>
                  <dd><code>{activeData.mime_type || '—'}</code></dd>
                </div>

                <div className="meta-def-row">
                  <dt>Alt Description:</dt>
                  <dd>{activeData.alt_text || <span className="text-muted">None specified</span>}</dd>
                </div>

                <div className="meta-def-row">
                  <dt>Caption:</dt>
                  <dd>{activeData.caption || <span className="text-muted">None specified</span>}</dd>
                </div>

                <div className="meta-def-row">
                  <dt>Upload Date:</dt>
                  <dd>{activeData.created_at ? new Date(activeData.created_at).toLocaleString() : '—'}</dd>
                </div>

                {activeData.uploader?.name && (
                  <div className="meta-def-row">
                    <dt>Uploaded By:</dt>
                    <dd>{activeData.uploader.name}</dd>
                  </div>
                )}
              </dl>

              {/* Public URL Box */}
              <div className="meta-url-box">
                <span className="meta-url-label">Direct Public URL:</span>
                <div className="meta-url-input-group">
                  <input
                    type="text"
                    readOnly
                    value={activeData.url || ''}
                    className="meta-url-input"
                    aria-label="Direct public URL"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCopy}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Usage References Box */}
              <div className="meta-usage-box">
                <span className="usage-title">Content Usage References:</span>
                {hasUsage ? (
                  <ul className="usage-list">
                    {Object.entries(usageRefs).map(([tableKey, count]) => (
                      <li key={tableKey} className="usage-item">
                        <span className="usage-badge" aria-hidden="true">✓ In Use</span>
                        <span>
                          {tableKey.replace(/_/g, ' ')}: <strong>{count} reference(s)</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="usage-none-text">
                    This media item has no active references in destinations, tours, or CMS pages.
                  </p>
                )}
              </div>

              {/* Delete Action Footer */}
              {canDelete && (
                <div className="meta-danger-zone">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-delete-asset"
                    onClick={() => onDeleteRequest(activeData)}
                  >
                    🗑️ Delete Media Asset...
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
