import { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import mediaService from '../../../services/mediaService';
import { getMediaUrl } from '../../../utils/media';
import Loading from '../../ui/Loading';
import EmptyState from '../../ui/EmptyState';
import MediaUploadModal from './MediaUploadModal';
import useAuth from '../../../hooks/useAuth';

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedMediaId = null,
  title = 'Select Media Asset',
  typeFilter = 'image',
}) {
  const { hasPermission } = useAuth();
  const canUpload = hasPermission('media.upload');

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Load media whenever modal opens or params change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadMedia() {
      try {
        setLoading(true);
        setError(null);
        const params = {
          page,
          limit: 12,
          sort_by: 'created_at',
          order: 'DESC',
        };
        if (typeFilter && typeFilter !== 'all') {
          params.type = typeFilter;
        }
        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await mediaService.getMedia(params);
        if (isMounted) {
          const items = response.items || response.data || [];
          const pagination = response.pagination || {};

          setMediaList(items);
          setTotalPages(pagination.total_pages || 1);
          setTotalItems(pagination.total || items.length);

          if (selectedMediaId && !selectedAsset) {
            const found = items.find((m) => m.id === selectedMediaId || String(m.id) === String(selectedMediaId));
            if (found) {
              setSelectedAsset(found);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Unable to load media files.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMedia();

    return () => {
      isMounted = false;
    };
  }, [isOpen, page, typeFilter, search, reloadTrigger, selectedMediaId, selectedAsset]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
  };

  const handleSelectAsset = (asset) => {
    if (selectedAsset?.id === asset.id) {
      setSelectedAsset(null); // Toggle off
    } else {
      setSelectedAsset(asset);
    }
  };

  const handleConfirm = () => {
    if (selectedAsset && onSelect) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  const handleUploadSuccess = (newMedia) => {
    setShowUploadModal(false);
    setSelectedAsset(newMedia);
    setSearch('');
    setPage(1);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleModalClose = () => {
    setSelectedAsset(null);
    setSearch('');
    if (onClose) onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        title={title}
        size="lg"
      >
        <div className="media-picker-container">
          {/* Toolbar: Search and Upload Action */}
          <div className="media-picker-toolbar">
            <div className="picker-search-box">
              <input
                type="text"
                placeholder="Search media by filename, alt text, or caption..."
                value={search}
                onChange={handleSearchChange}
                className="picker-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="picker-search-clear"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {canUpload && (
              <button
                type="button"
                className="btn btn-outline btn-sm picker-upload-btn"
                onClick={() => setShowUploadModal(true)}
              >
                + Upload New
              </button>
            )}
          </div>

          {/* Asset Grid or Loading/Empty State */}
          <div className="media-picker-grid-container">
            {loading ? (
              <div className="picker-loading-box">
                <Loading message="Loading media assets..." />
              </div>
            ) : error ? (
              <div className="picker-error-box">
                <p className="picker-error-msg">{error}</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setReloadTrigger((prev) => prev + 1)}
                >
                  Retry
                </button>
              </div>
            ) : mediaList.length === 0 ? (
              <EmptyState
                title="No media assets found"
                message={search ? 'No assets match your search.' : 'Upload an image to get started.'}
                actionLabel={canUpload ? 'Upload Image' : undefined}
                onAction={canUpload ? () => setShowUploadModal(true) : undefined}
              />
            ) : (
              <div className="media-picker-grid">
                {mediaList.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  const isImage = asset.is_image || (asset.mime_type && asset.mime_type.startsWith('image/'));
                  const url = getMediaUrl(asset);

                  return (
                    <div
                      key={asset.id}
                      className={`media-picker-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleSelectAsset(asset)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectAsset(asset);
                        }
                      }}
                      aria-pressed={isSelected}
                    >
                      <div className="picker-thumb-box">
                        {isImage ? (
                          <img
                            src={url}
                            alt={asset.alt_text || asset.original_name || 'Asset'}
                            className="picker-thumb-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="picker-doc-icon">📄</div>
                        )}
                        {isSelected && (
                          <div className="picker-check-badge" aria-label="Selected">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="picker-card-info">
                        <span className="picker-file-name" title={asset.original_name || asset.filename}>
                          {asset.original_name || asset.filename}
                        </span>
                        {asset.width && asset.height && (
                          <span className="picker-file-dim">
                            {asset.width} × {asset.height}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="media-picker-pagination">
              <span className="picker-count-text">
                Showing {mediaList.length} of {totalItems} items
              </span>
              <div className="picker-page-buttons">
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="picker-page-indicator">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Selected Asset Banner & Actions */}
          <div className="media-picker-footer">
            <div className="picker-selected-summary">
              {selectedAsset ? (
                <div className="selected-summary-box">
                  <span className="summary-label">Selected:</span>
                  <strong className="summary-name">
                    {selectedAsset.original_name || selectedAsset.filename}
                  </strong>
                  <button
                    type="button"
                    className="btn-clear-selection"
                    onClick={() => setSelectedAsset(null)}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <span className="summary-none">No asset selected</span>
              )}
            </div>

            <div className="picker-action-buttons">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!selectedAsset}
                onClick={handleConfirm}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Embedded Upload Modal */}
      {showUploadModal && (
        <MediaUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
