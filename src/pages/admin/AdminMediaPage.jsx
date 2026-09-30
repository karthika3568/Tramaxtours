import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import mediaService from '../../services/mediaService';
import MediaFilters from '../../components/admin/media/MediaFilters';
import MediaGrid from '../../components/admin/media/MediaGrid';
import MediaUploadModal from '../../components/admin/media/MediaUploadModal';
import MediaPreviewModal from '../../components/admin/media/MediaPreviewModal';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/public/common/Pagination';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';

export default function AdminMediaPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canUpload = hasPermission('media.upload');
  const canDelete = hasPermission('media.delete');

  const [mediaItems, setMediaItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [forceDelete, setForceDelete] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'Media Library — Wonderer South India Admin',
      description: 'Manage media files, photographs, banners, and documents for Wonderer South India.',
    });
  }, []);

  // Fetch paginated media from backend
  useEffect(() => {
    let isMounted = true;

    async function loadMedia() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit: 18,
          search: search.trim() || undefined,
          type: typeFilter || undefined,
          sort_by: sortBy,
          order: order,
        };

        const response = await mediaService.getMedia(params);

        if (isMounted) {
          const items = response.items || (Array.isArray(response) ? response : []);
          setMediaItems(items);
          setPagination(
            response.pagination || {
              page: currentPage,
              total_pages: 1,
              total: items.length,
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load media assets from server.');
          setMediaItems([]);
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
  }, [currentPage, search, typeFilter, sortBy, order, reloadTrigger]);

  const handleRefresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (val) => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort, newOrder) => {
    setSortBy(newSort);
    setOrder(newOrder);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSortBy('id');
    setOrder('DESC');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleUploadSuccess = (newMedia) => {
    toast.success(
      `File "${newMedia.original_name || newMedia.filename}" was uploaded successfully.`,
      'Upload Complete'
    );
    handleRefresh();
  };

  const handleUpdateSuccess = (updatedMedia) => {
    toast.success('Metadata updated successfully.', 'Media Saved');
    setMediaItems((prev) =>
      prev.map((item) => (item.id === updatedMedia.id ? { ...item, ...updatedMedia } : item))
    );
  };

  const handleDeleteRequest = (media) => {
    setDeleteTarget(media);
    setDeleteError(null);
    setForceDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await mediaService.deleteMedia(deleteTarget.id, forceDelete);
      toast.success(
        `Media asset "${deleteTarget.original_name || deleteTarget.filename}" deleted.`,
        'Media Deleted'
      );

      // Close modals
      setDeleteTarget(null);
      if (previewItem?.id === deleteTarget.id) {
        setPreviewItem(null);
      }

      handleRefresh();
    } catch (err) {
      setDeleteError(
        err?.message ||
          'Failed to delete media. If the asset is currently in use, select "Force Delete" to proceed.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(search || typeFilter || sortBy !== 'id' || order !== 'DESC');

  return (
    <div className="admin-media-page">
      {/* Page Header */}
      <div className="admin-page-header-bar">
        <div className="header-title-box">
          <span className="section-badge">Asset Management</span>
          <h2 className="admin-page-heading">Media Library</h2>
          <p className="admin-page-subheading">
            Central repository for all travel photography, hero banners, destination visuals, and documents.
          </p>
        </div>

        <div className="header-action-buttons">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleRefresh}
            disabled={loading}
            title="Reload media library from backend"
          >
            ↻ Refresh
          </button>

          {canUpload && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsUploadOpen(true)}
            >
              + Upload Media
            </button>
          )}
        </div>
      </div>

      {/* Toolbar & Filters */}
      <MediaFilters
        search={search}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content Area */}
      {loading && (
        <div className="media-loading-wrapper">
          <Loading message="Loading media assets from server..." />
        </div>
      )}

      {!loading && error && (
        <div className="media-error-wrapper">
          <ErrorState
            title="Failed to Load Media Assets"
            message={error}
            retryText="Retry Loading"
            onRetry={handleRefresh}
          />
        </div>
      )}

      {!loading && !error && (
        <>
          <MediaGrid
            mediaItems={mediaItems}
            onPreview={(item) => setPreviewItem(item)}
            onEdit={(item) => setPreviewItem(item)}
            onDelete={handleDeleteRequest}
            canManage={canUpload}
            canDelete={canDelete}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onOpenUpload={() => setIsUploadOpen(true)}
          />

          <Pagination
            currentPage={pagination.page || currentPage}
            totalPages={pagination.total_pages || 1}
            totalItems={pagination.total || mediaItems.length}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Preview & Metadata Details Modal */}
      {previewItem && (
        <MediaPreviewModal
          media={previewItem}
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          onUpdateSuccess={handleUpdateSuccess}
          onDeleteRequest={handleDeleteRequest}
          canManage={canUpload}
          canDelete={canDelete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => !isDeleting && setDeleteTarget(null)}
          title="Confirm Media Deletion"
          size="sm"
        >
          <div className="delete-confirm-box">
            <div className="delete-warning-icon" aria-hidden="true">⚠️</div>
            <h4 className="delete-confirm-title">Are you sure you want to delete this media asset?</h4>
            <p className="delete-confirm-desc">
              You are about to delete <strong>{deleteTarget.original_name || deleteTarget.filename}</strong> (ID: #{deleteTarget.id}). This will remove the file from storage and database.
            </p>

            {deleteError && (
              <div className="upload-error-alert" role="alert">
                <span>{deleteError}</span>
              </div>
            )}

            <div className="force-delete-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                  disabled={isDeleting}
                />
                <span>Force delete (unlink and delete even if referenced in content)</span>
              </label>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
