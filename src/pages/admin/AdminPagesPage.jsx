import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import pageService from '../../services/pageService';
import { updatePageMeta } from '../../utils/metadata';
import PageFilters from '../../components/admin/pages/PageFilters';
import PageTable from '../../components/admin/pages/PageTable';
import PageDeleteModal from '../../components/admin/pages/PageDeleteModal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminPagesPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canManage = hasPermission('pages.manage');

  // Page Title & Meta
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Pages & Policy CMS Management | Wanderer South India',
      description: 'Manage legal policies, corporate information pages, SEO metadata, and publishing states.',
    });
  }, []);

  // Data State
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Statistics Summary Counters
  const [totalCount, setTotalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  // Filter & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Action / Modal State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Pages Data
  useEffect(() => {
    let isMounted = true;

    async function loadPages() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit,
          sort_by: sortBy,
          sort_order: sortOrder,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (status && status !== 'all') {
          params.status = status;
        } else {
          params.status = 'all';
        }

        const res = await pageService.getPages(params);

        if (isMounted) {
          const items = res.items || res || [];
          setPages(items);

          const pagination = res.pagination || {};
          setTotalCount(pagination.total ?? items.length);
          setTotalPages(
            pagination.total_pages ?? (Math.ceil((pagination.total || items.length) / limit) || 1)
          );

          // Calculate counters if querying all pages or calculate from items
          if (status === 'all' && !debouncedSearch.trim()) {
            const pub = items.filter((p) => p.status === 'published').length;
            const dft = items.filter((p) => p.status === 'draft').length;
            setPublishedCount(pub);
            setDraftCount(dft);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load CMS pages from server.');
          setPages([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPages();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, status, sortBy, sortOrder, page, limit, reloadTrigger]);

  // Load Global Stats Counters once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const allRes = await pageService.getPages({ limit: 100, status: 'all' });
        const items = allRes.items || allRes || [];
        if (isMounted) {
          setTotalCount(items.length);
          setPublishedCount(items.filter((p) => p.status === 'published').length);
          setDraftCount(items.filter((p) => p.status === 'draft').length);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  }, []);

  // 1-Click Publish / Unpublish Toggle
  const handlePublishToggle = async (pageItem) => {
    if (!canManage) return;

    try {
      setActionLoadingId(pageItem.id);
      const isCurrentlyPublished = pageItem.status === 'published';

      if (isCurrentlyPublished) {
        await pageService.unpublishPage(pageItem.id);
        toast.info(
          `Page "${pageItem.title}" unpublished (set to draft).`,
          'Status Changed'
        );
      } else {
        await pageService.publishPage(pageItem.id);
        toast.success(
          `Page "${pageItem.title}" is now published and visible to visitors!`,
          'Page Published'
        );
      }

      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(
        err?.message || 'Failed to update page status.',
        'Update Failed'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Safe Delete Handler
  const handleConfirmDelete = async (id, force = false) => {
    try {
      setIsDeleting(true);
      await pageService.deletePage(id, force);

      toast.success(
        force
          ? 'Page permanently deleted from database.'
          : 'Page soft-deleted successfully.',
        'Page Deleted'
      );

      setPageToDelete(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(
        err?.message || 'Failed to delete page.',
        'Delete Failed'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-destinations-page-container admin-pages-management-view">
      {/* Header & Title */}
      <div className="admin-page-header">
        <div className="admin-header-title-group">
          <div className="admin-header-badge-row">
            <span className="placeholder-badge">CMS Management</span>
            <span className="admin-badge admin-badge-neutral">
              {totalCount} Total Pages
            </span>
          </div>
          <h1 className="admin-page-title">Pages & Policy CMS</h1>
          <p className="admin-page-subtitle">
            Author and publish custom CMS pages, legal terms, privacy policies, and corporate info.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setReloadTrigger((prev) => prev + 1)}
            disabled={loading}
            title="Refresh list from server"
          >
            🔄 Refresh
          </button>

          {canManage && (
            <Link to="/admin/pages/new" className="btn btn-primary btn-sm">
              + Create New Page
            </Link>
          )}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="dest-stats-grid">
        <div className="dest-stat-card">
          <div className="dest-stat-icon">📄</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Total CMS Pages</span>
            <strong className="dest-stat-value">{totalCount}</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon stat-icon-published">🟢</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Published</span>
            <strong className="dest-stat-value">{publishedCount}</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon stat-icon-draft">🟡</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Drafts</span>
            <strong className="dest-stat-value">{draftCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <PageFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(val) => {
          setSortOrder(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Content Area */}
      {loading ? (
        <div className="admin-table-loading-wrapper">
          <Loading message="Loading CMS pages..." />
        </div>
      ) : error ? (
        <div className="admin-table-error-wrapper">
          <ErrorState
            title="Error Loading Pages"
            message={error}
            retryText="Retry"
            onRetry={() => setReloadTrigger((prev) => prev + 1)}
          />
        </div>
      ) : pages.length === 0 ? (
        <div className="admin-empty-state-wrapper">
          <EmptyState
            title="No CMS Pages Found"
            message={
              debouncedSearch || status !== 'all'
                ? 'No pages match your active search or filter criteria.'
                : 'No CMS pages have been created yet. Click below to add your first page.'
            }
            actionText={
              debouncedSearch || status !== 'all'
                ? 'Clear Filters'
                : canManage
                ? '+ Create New Page'
                : undefined
            }
            onAction={
              debouncedSearch || status !== 'all'
                ? handleResetFilters
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <PageTable
            pages={pages}
            onPublishToggle={handlePublishToggle}
            onDeleteClick={setPageToDelete}
            canManage={canManage}
            actionLoadingId={actionLoadingId}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="admin-pagination-container">
              <span className="admin-pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total)
              </span>

              <div className="admin-pagination-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  &larr; Previous
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn btn-sm ${
                      pageNum === page ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <PageDeleteModal
        page={pageToDelete}
        isOpen={Boolean(pageToDelete)}
        onClose={() => setPageToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
