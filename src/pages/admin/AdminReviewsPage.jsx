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
import Modal from '../../components/ui/Modal';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

function StarRatingSelector({ value = 5, onChange }) {
  const [hoverVal, setHoverVal] = useState(0);
  const activeRating = hoverVal || value || 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }} onMouseLeave={() => setHoverVal(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverVal(star)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              fontSize: '24px',
              lineHeight: 1,
              cursor: 'pointer',
              color: star <= activeRating ? '#f59e0b' : '#cbd5e1',
              transition: 'transform 0.15s ease, color 0.15s ease',
              transform: star <= activeRating ? 'scale(1.15)' : 'scale(1)',
            }}
            title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
            aria-label={`${star} star rating`}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0B1329', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fde68a' }}>
        {activeRating}.0 ({activeRating === 5 ? 'Exceptional' : activeRating === 4 ? 'Very Good' : activeRating === 3 ? 'Average' : activeRating === 2 ? 'Poor' : 'Terrible'})
      </span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canModerate = hasPermission('reviews.moderate');

  // Page Title & Metadata
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Customer Reviews & Testimonials | Wonderer South India',
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

  // Edit Testimonial State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_country: '',
    title: '',
    content: '',
    rating: 5,
    image_url: '',
    is_active: true,
    is_featured: false,
    tour_id: '',
  });

  const [activeMediaTarget, setActiveMediaTarget] = useState('add'); // 'add' or 'edit'

  const handleOpenEdit = (review) => {
    setEditingReview(review);
    const existingImg = review.image || review.image_url || (review.media && review.media.length > 0 ? (review.media[0].file_path || review.media[0].url) : '');
    setEditFormData({
      customer_name: review.customer_name || '',
      customer_email: review.customer_email || '',
      customer_country: review.customer_country || '',
      title: review.title || '',
      content: review.content || '',
      rating: Number(review.rating) || 5,
      image_url: existingImg || '',
      is_active: review.status === 'approved',
      is_featured: Boolean(review.is_featured),
      tour_id: review.tour_id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTestimonial = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    if (!editFormData.customer_name.trim() || !editFormData.content.trim()) {
      toast.warning('Please provide client name and testimonial message.', 'Required Fields');
      return;
    }

    try {
      setIsSavingEdit(true);
      const payload = {
        customer_name: editFormData.customer_name.trim(),
        customer_email: editFormData.customer_email.trim() || editingReview.customer_email,
        customer_country: editFormData.customer_country.trim() || null,
        title: editFormData.title.trim() || 'Traveler Testimonial',
        content: editFormData.content.trim(),
        image: editFormData.image_url ? editFormData.image_url.trim() : null,
        image_url: editFormData.image_url ? editFormData.image_url.trim() : null,
        rating: Number(editFormData.rating) || 5,
        status: editFormData.is_active ? 'approved' : 'pending',
        is_featured: Boolean(editFormData.is_featured),
      };

      if (editFormData.tour_id) {
        payload.tour_id = Number(editFormData.tour_id);
      }

      await reviewService.updateReview(editingReview.id, payload);
      toast.success('Testimonial updated successfully!', 'Testimonial Updated');
      setIsEditModalOpen(false);
      setEditingReview(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to update testimonial.', 'Update Error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Add Testimonial State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [addFormData, setAddFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_country: '',
    title: 'Delighted Traveler',
    content: '',
    rating: 5,
    image_url: '',
    is_active: true,
    is_featured: false,
    tour_id: '',
  });

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    if (!addFormData.customer_name.trim() || !addFormData.content.trim()) {
      toast.warning('Please provide client name and testimonial message.', 'Required Fields');
      return;
    }

    try {
      setIsSavingNew(true);
      const payload = {
        customer_name: addFormData.customer_name.trim(),
        customer_email: addFormData.customer_email.trim() || `${addFormData.customer_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        customer_country: addFormData.customer_country.trim() || null,
        title: addFormData.title.trim() || 'Traveler Testimonial',
        content: addFormData.content.trim(),
        image: addFormData.image_url.trim() || null,
        image_url: addFormData.image_url.trim() || null,
        rating: Number(addFormData.rating) || 5,
        status: addFormData.is_active ? 'approved' : 'pending',
        is_featured: Boolean(addFormData.is_featured),
        tour_id: addFormData.tour_id ? Number(addFormData.tour_id) : null,
      };

      await reviewService.createReview(payload);
      toast.success('Testimonial added successfully and published!', 'Testimonial Created');
      setIsAddModalOpen(false);
      setAddFormData({
        customer_name: '',
        customer_email: '',
        customer_country: '',
        title: 'Delighted Traveler',
        content: '',
        rating: 5,
        image_url: '',
        is_active: true,
        is_featured: false,
        tour_id: '',
      });
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to create testimonial.', 'Creation Error');
    } finally {
      setIsSavingNew(false);
    }
  };

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

        <div className="admin-header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            title="Create a new client testimonial"
          >
            ➕ Add Testimonial
          </button>
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
            onEditClick={handleOpenEdit}
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

      {/* Add New Testimonial Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Customer Testimonial"
        size="md"
      >
        <form onSubmit={handleCreateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Customer / Traveler Name *
            </label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Marc Knulle"
              value={addFormData.customer_name}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Country / Origin
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Netherlands / United Kingdom"
                value={addFormData.customer_country}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, customer_country: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Rating (1–5 Stars) *
              </label>
              <StarRatingSelector
                value={addFormData.rating}
                onChange={(newRating) => setAddFormData((prev) => ({ ...prev, rating: newRating }))}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Client Photo / Avatar
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {addFormData.image_url ? (
                <img
                  src={addFormData.image_url}
                  alt="Client Preview"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #1226de',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#64748b',
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
              )}
              <input
                type="text"
                className="form-control"
                style={{ flex: 1 }}
                placeholder="Image URL or choose from Media Library..."
                value={addFormData.image_url}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, image_url: e.target.value }))}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setActiveMediaTarget('add');
                  setIsMediaPickerOpen(true);
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                🖼 Select Image
              </button>
              {addFormData.image_url && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAddFormData((prev) => ({ ...prev, image_url: '' }))}
                  title="Remove Image"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Testimonial Message / Feedback *
            </label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="Enter traveler review feedback..."
              value={addFormData.content}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={addFormData.is_active}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              <span>🟢 Active &amp; Approved (Visible on Live Site)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={addFormData.is_featured}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
              />
              <span>⭐ Featured on Homepage</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSavingNew}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSavingNew}
            >
              {isSavingNew ? 'Saving Testimonial...' : 'Publish Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Testimonial Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReview(null);
        }}
        title={`Edit Testimonial #${editingReview?.id || ''}`}
        size="md"
      >
        <form onSubmit={handleUpdateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Customer / Traveler Name *
            </label>
            <input
              type="text"
              className="form-control"
              required
              value={editFormData.customer_name}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Country / Origin
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. United Kingdom"
                value={editFormData.customer_country}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, customer_country: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Rating (1–5 Stars) *
              </label>
              <StarRatingSelector
                value={editFormData.rating}
                onChange={(newRating) => setEditFormData((prev) => ({ ...prev, rating: newRating }))}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Client Photo / Avatar
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {editFormData.image_url ? (
                <img
                  src={editFormData.image_url}
                  alt="Client Preview"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #1226de',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#64748b',
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
              )}
              <input
                type="text"
                className="form-control"
                style={{ flex: 1 }}
                placeholder="Image URL or choose from Media Library..."
                value={editFormData.image_url}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, image_url: e.target.value }))}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setActiveMediaTarget('edit');
                  setIsMediaPickerOpen(true);
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                🖼 Replace Image
              </button>
              {editFormData.image_url && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditFormData((prev) => ({ ...prev, image_url: '' }))}
                  title="Remove Image"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Testimonial Message / Feedback *
            </label>
            <textarea
              className="form-control"
              rows={4}
              required
              value={editFormData.content}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              <span>🟢 Active &amp; Approved (Visible on Live Site)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={editFormData.is_featured}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
              />
              <span>⭐ Featured on Homepage</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingReview(null);
              }}
              disabled={isSavingEdit}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSavingEdit}
            >
              {isSavingEdit ? 'Saving Changes...' : 'Update Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Media Picker Modal for selecting client photos */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(asset) => {
          const selectedUrl = asset.file_path || asset.url;
          if (activeMediaTarget === 'edit') {
            setEditFormData((prev) => ({
              ...prev,
              image_url: selectedUrl,
            }));
          } else {
            setAddFormData((prev) => ({
              ...prev,
              image_url: selectedUrl,
            }));
          }
          setIsMediaPickerOpen(false);
          toast.success('Testimonial client photo selected');
        }}
      />
    </div>
  );
}
