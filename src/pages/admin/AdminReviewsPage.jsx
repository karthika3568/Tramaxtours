import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import reviewService from '../../services/reviewService';
import tourService from '../../services/tourService';
import { updatePageMeta } from '../../utils/metadata';
import ReviewFilters from '../../components/admin/reviews/ReviewFilters';
import ReviewTable from '../../components/admin/reviews/ReviewTable';
import ReviewDetailModal from '../../components/admin/reviews/ReviewDetailModal';
import ReviewDeleteModal from '../../components/admin/reviews/ReviewDeleteModal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminReviewsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canModerate = hasPermission('reviews.moderate');

  // Page Title & Metadata
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Customer Reviews & Testimonials | Wanderer South India',
      description: 'Moderate customer testimonials, verify ratings, approve traveler feedback, and manage featured reviews.',
    });
  }, []);

  // Data State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toursList, setToursList] = useState([]);

  // Stats Counters
  const [totalCount, setTotalCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [avgRating, setAvgRating] = useState('5.0');

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tourId, setTourId] = useState('all');
  const [status, setStatus] = useState('all');
  const [rating, setRating] = useState('all');
  const [isFeatured, setIsFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modal & Action State
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load tours list once for the filter dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadTours() {
      try {
        const res = await tourService.getTours({ limit: 100, status: 'all' });
        if (isMounted) {
          setToursList(res.items || res.data || []);
        }
      } catch {
        // Continue gracefully
      }
    }
    loadTours();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Reviews Data
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
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
        if (tourId && tourId !== 'all') {
          params.tour_id = tourId;
        }
        if (status && status !== 'all') {
          params.status = status;
        } else {
          params.status = 'all';
        }
        if (rating && rating !== 'all') {
          params.rating = rating;
        }
        if (isFeatured && isFeatured !== 'all') {
          params.is_featured = isFeatured;
        }

        const res = await reviewService.getReviews(params);

        if (isMounted) {
          const items = res.items || res || [];
          setReviews(items);

          const pagination = res.pagination || {};
          setTotalCount(pagination.total ?? items.length);
          setTotalPages(
            pagination.total_pages ?? (Math.ceil((pagination.total || items.length) / limit) || 1)
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load customer reviews from server.');
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, tourId, status, rating, isFeatured, sortBy, sortOrder, page, limit, reloadTrigger]);

  // Load Global Aggregate Stats once
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const allRes = await reviewService.getReviews({ limit: 200, status: 'all' });
        const items = allRes.items || allRes || [];
        if (isMounted && items.length > 0) {
          const app = items.filter((r) => r.status === 'approved').length;
          const pnd = items.filter((r) => r.status === 'pending').length;
          const rej = items.filter((r) => r.status === 'rejected').length;
          const feat = items.filter((r) => r.is_featured).length;

          const totalRatings = items.reduce((acc, curr) => acc + (parseFloat(curr.rating) || 0), 0);
          const avg = (totalRatings / items.length).toFixed(1);

          setApprovedCount(app);
          setPendingCount(pnd);
          setRejectedCount(rej);
          setFeaturedCount(feat);
          setAvgRating(avg);
        }
      } catch {
        // Continue gracefully
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
    setTourId('all');
    setStatus('all');
    setRating('all');
    setIsFeatured('all');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  }, []);

  // Moderation Actions: Approve
  const handleApprove = async (review) => {
    if (!canModerate) return;
    try {
      setActionLoadingId(review.id);
      await reviewService.approveReview(review.id);
      toast.success(
        `Review from ${review.customer_name} approved and published!`,
        'Review Approved'
      );
      if (selectedReview?.id === review.id) {
        setSelectedReview((prev) => ({ ...prev, status: 'approved' }));
      }
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to approve review.', 'Approval Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Moderation Actions: Reject
  const handleReject = async (review) => {
    if (!canModerate) return;
    try {
      setActionLoadingId(review.id);
      await reviewService.rejectReview(review.id);
      toast.info(
        `Review from ${review.customer_name} rejected.`,
        'Review Rejected'
      );
      if (selectedReview?.id === review.id) {
        setSelectedReview((prev) => ({ ...prev, status: 'rejected' }));
      }
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to reject review.', 'Rejection Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Moderation Actions: Toggle Feature
  const handleToggleFeature = async (review) => {
    if (!canModerate) return;
    try {
      setActionLoadingId(review.id);
      if (review.is_featured) {
        await reviewService.unfeatureReview(review.id);
        toast.info(
          `Review from ${review.customer_name} is no longer featured.`,
          'Feature Updated'
        );
        if (selectedReview?.id === review.id) {
          setSelectedReview((prev) => ({ ...prev, is_featured: false }));
        }
      } else {
        await reviewService.featureReview(review.id);
        toast.success(
          `Review from ${review.customer_name} set as Featured Testimonial!`,
          'Featured Testimonial'
        );
        if (selectedReview?.id === review.id) {
          setSelectedReview((prev) => ({ ...prev, is_featured: true }));
        }
      }
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle featured state.', 'Action Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Deletion Handler
  const handleConfirmDelete = async (id, force = false) => {
    try {
      setIsDeleting(true);
      await reviewService.deleteReview(id, force);

      toast.success(
        force
          ? 'Review permanently deleted from database.'
          : 'Review soft-deleted successfully.',
        'Review Deleted'
      );

      setReviewToDelete(null);
      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete review.', 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-destinations-page-container admin-reviews-management-view">
      {/* Header & Title */}
      <div className="admin-page-header">
        <div className="admin-header-title-group">
          <div className="admin-header-badge-row">
            <span className="placeholder-badge">Testimonials & Feedback</span>
            <span className="admin-badge admin-badge-neutral">
              {totalCount} Total Reviews
            </span>
          </div>
          <h1 className="admin-page-title">Customer Reviews</h1>
          <p className="admin-page-subtitle">
            Inspect customer ratings, review traveler photos, approve verified feedback, and curate featured homepage testimonials.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setReloadTrigger((prev) => prev + 1)}
            disabled={loading}
            title="Refresh review list from server"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Real-time Statistics Summary Cards */}
      <div className="dest-stats-grid review-stats-grid">
        <div className="dest-stat-card">
          <div className="dest-stat-icon">💬</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Total Reviews</span>
            <strong className="dest-stat-value">{totalCount}</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon stat-icon-published">🟢</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Approved</span>
            <strong className="dest-stat-value">{approvedCount}</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon stat-icon-draft">🟡</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Pending</span>
            <strong className="dest-stat-value">{pendingCount}</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon">🔴</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Rejected</span>
            <strong className="dest-stat-value">{rejectedCount}</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon">⭐</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Average Rating</span>
            <strong className="dest-stat-value">{avgRating} / 5.0</strong>
          </div>
        </div>

        <div className="dest-stat-card">
          <div className="dest-stat-icon">🏆</div>
          <div className="dest-stat-info">
            <span className="dest-stat-label">Featured</span>
            <strong className="dest-stat-value">{featuredCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ReviewFilters
        search={search}
        onSearchChange={setSearch}
        tourId={tourId}
        onTourIdChange={(val) => {
          setTourId(val);
          setPage(1);
        }}
        toursList={toursList}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        rating={rating}
        onRatingChange={(val) => {
          setRating(val);
          setPage(1);
        }}
        isFeatured={isFeatured}
        onIsFeaturedChange={(val) => {
          setIsFeatured(val);
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

      {/* Main Review Content List */}
      {loading ? (
        <div className="admin-table-loading-wrapper">
          <Loading message="Loading customer reviews..." />
        </div>
      ) : error ? (
        <div className="admin-table-error-wrapper">
          <ErrorState
            title="Error Loading Reviews"
            message={error}
            retryText="Retry"
            onRetry={() => setReloadTrigger((prev) => prev + 1)}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-empty-state-wrapper">
          <EmptyState
            title="No Customer Reviews Found"
            message={
              debouncedSearch || status !== 'all' || tourId !== 'all' || rating !== 'all' || isFeatured !== 'all'
                ? 'No reviews match your active filter criteria.'
                : 'No customer reviews have been submitted yet.'
            }
            actionText={
              debouncedSearch || status !== 'all' || tourId !== 'all' || rating !== 'all' || isFeatured !== 'all'
                ? 'Clear Filters'
                : undefined
            }
            onAction={
              debouncedSearch || status !== 'all' || tourId !== 'all' || rating !== 'all' || isFeatured !== 'all'
                ? handleResetFilters
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <ReviewTable
            reviews={reviews}
            onViewDetails={(review) => setSelectedReview(review)}
            onApprove={handleApprove}
            onReject={handleReject}
            onToggleFeature={handleToggleFeature}
            onDeleteClick={(review) => setReviewToDelete(review)}
            canModerate={canModerate}
            actionLoadingId={actionLoadingId}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="admin-pagination-container">
              <span className="admin-pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total reviews)
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

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        isOpen={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleFeature={handleToggleFeature}
        onDelete={(rev) => {
          setSelectedReview(null);
          setReviewToDelete(rev);
        }}
        canModerate={canModerate}
        actionLoading={Boolean(actionLoadingId)}
      />

      {/* Review Delete Modal */}
      <ReviewDeleteModal
        review={reviewToDelete}
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
