import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import destinationService from '../../services/destinationService';
import { updatePageMeta } from '../../utils/metadata';
import DestinationFilters from '../../components/admin/destinations/DestinationFilters';
import DestinationTable from '../../components/admin/destinations/DestinationTable';
import DestinationDeleteModal from '../../components/admin/destinations/DestinationDeleteModal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminDestinationsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canCreate = hasPermission('destinations.create');
  const canEdit = hasPermission('destinations.edit');
  const canDelete = hasPermission('destinations.delete');
  const canPublish = hasPermission('destinations.publish');

  // Page title
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Destinations Management | Wanderer South India',
      description: 'Manage travel destinations, tour itineraries, status, and media assets.',
    });
  }, []);

  // Data State
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats Counters
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isFeatured, setIsFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('display_order');
  const [order, setOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);

  // Action / Modal State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [destinationToDelete, setDestinationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Destinations
  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit,
          sort_by: sortBy,
          order,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (status && status !== 'all') {
          params.status = status;
        } else {
          params.status = 'all';
        }
        if (isFeatured && isFeatured !== 'all') {
          params.is_featured = isFeatured;
        }

        const response = await destinationService.getDestinations(params);
        if (isMounted) {
          const items = response.items || response.data || [];
          const pagination = response.pagination || {};

          setDestinations(items);
          setTotalPages(pagination.total_pages || 1);
          setTotalCount(pagination.total || items.length);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load destinations.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, [page, limit, sortBy, order, debouncedSearch, status, isFeatured, reloadTrigger]);

  // Manual refresh trigger
  const handleRefresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setIsFeatured('all');
    setSortBy('display_order');
    setOrder('ASC');
    setPage(1);
  };

  // Publish / Unpublish Toggle
  const handlePublishToggle = async (dest) => {
    try {
      setActionLoadingId(dest.id);
      const isCurrentlyPublished = dest.status === 'published';

      if (isCurrentlyPublished) {
        await destinationService.unpublishDestination(dest.id);
        toast.info(`Destination "${dest.name}" reverted to draft.`, 'Unpublished');
      } else {
        await destinationService.publishDestination(dest.id);
        toast.success(`Destination "${dest.name}" is now live and published!`, 'Published');
      }

      handleRefresh();
    } catch (err) {
      toast.error(err?.message || 'Failed to update publishing status.', 'Action Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async (id, force) => {
    try {
      setIsDeleting(true);
      await destinationService.deleteDestination(id, force);
      toast.success(
        force
          ? 'Destination permanently force-deleted.'
          : 'Destination soft-deleted successfully.',
        'Deleted'
      );
      setDestinationToDelete(null);
      handleRefresh();
    } catch (err) {
      toast.error(
        err?.message || 'Failed to delete destination.',
        'Delete Failed'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-destinations-page">
      {/* Page Header */}
      <div className="admin-page-header-bar">
        <div className="page-header-left">
          <h2 className="admin-page-title">Destinations Management</h2>
          <p className="admin-page-subtitle">
            Create, edit, publish, and organize destinations featured across Wanderer South India.
          </p>
        </div>

        <div className="header-actions-group">
          <button
            type="button"
            className="btn btn-outline btn-sm refresh-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh destinations list"
          >
            🔄 Refresh
          </button>

          {canCreate && (
            <Link
              to="/admin/destinations/new"
              className="btn btn-primary btn-sm add-dest-btn"
            >
              + Add Destination
            </Link>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="dest-stats-row">
        <div className="dest-stat-pill">
          <span className="stat-pill-label">Total Destinations:</span>
          <strong className="stat-pill-value">{totalCount}</strong>
        </div>
        <div className="dest-stat-pill">
          <span className="stat-pill-label">Current Page:</span>
          <span className="stat-pill-value">{page} of {totalPages}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <DestinationFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        isFeatured={isFeatured}
        onIsFeaturedChange={(newFeatured) => {
          setIsFeatured(newFeatured);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        order={order}
        onOrderChange={setOrder}
        onReset={handleResetFilters}
      />

      {/* Content Area */}
      {loading ? (
        <div className="dest-loading-card">
          <Loading message="Loading destination records..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load destinations"
          message={error}
          onRetry={handleRefresh}
        />
      ) : destinations.length === 0 ? (
        <EmptyState
          title="No destinations found"
          message={
            debouncedSearch || status !== 'all' || isFeatured !== 'all'
              ? 'No destinations match your search or filter parameters.'
              : 'Get started by creating your first travel destination.'
          }
          actionLabel={
            debouncedSearch || status !== 'all' || isFeatured !== 'all'
              ? 'Reset Filters'
              : canCreate
              ? '+ Add Destination'
              : undefined
          }
          onAction={
            debouncedSearch || status !== 'all' || isFeatured !== 'all'
              ? handleResetFilters
              : canCreate
              ? () => {}
              : undefined
          }
        />
      ) : (
        <>
          {/* Destinations Table & Responsive Cards */}
          <DestinationTable
            destinations={destinations}
            onPublishToggle={handlePublishToggle}
            onDeleteClick={setDestinationToDelete}
            canEdit={canEdit}
            canDelete={canDelete}
            canPublish={canPublish}
            actionLoadingId={actionLoadingId}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="dest-pagination-bar">
              <span className="pagination-summary">
                Page {page} of {totalPages} ({totalCount} total destinations)
              </span>

              <div className="pagination-nav-group">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>

                <div className="pagination-pages-list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} className="pagination-page-wrapper">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                          type="button"
                          className={`btn-page-number ${p === page ? 'is-active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {destinationToDelete && (
        <DestinationDeleteModal
          destination={destinationToDelete}
          isOpen={Boolean(destinationToDelete)}
          onClose={() => setDestinationToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
