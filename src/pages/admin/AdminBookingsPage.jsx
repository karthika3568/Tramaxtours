import { CheckCircleIcon, FilterIcon, RefreshIcon, XCircleIcon } from '../../components/common/Icons';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import bookingService from '../../services/bookingService';
import tourService from '../../services/tourService';
import { updatePageMeta } from '../../utils/metadata';
import BookingFilters from '../../components/admin/bookings/BookingFilters';
import BookingTable from '../../components/admin/bookings/BookingTable';
import BookingDetailModal from '../../components/admin/bookings/BookingDetailModal';
import BookingEditModal from '../../components/admin/bookings/BookingEditModal';
import BookingCancelModal from '../../components/admin/bookings/BookingCancelModal';
import BookingStatusModal from '../../components/admin/bookings/BookingStatusModal';
import BookingDeleteModal from '../../components/admin/bookings/BookingDeleteModal';
import BookingPrintModal from '../../components/admin/bookings/BookingPrintModal';
import BookingResendTicketModal from '../../components/admin/bookings/BookingResendTicketModal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminBookingsPage() {
  const toast = useToast();

  // Page Title & Meta
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Booking & Order Management | Tramax Tours',
      description: 'Manage customer tour reservations, tickets, status lifecycles, and payments.',
    });
  }, []);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    total_bookings: 0,
    pending: 0,
    contacted: 0,
    payment_discussion: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    total_revenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Bookings List State
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 1,
  });
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState(null);

  // Tours for filter dropdown
  const [toursList, setToursList] = useState([]);

  // Unified Filter & Search State (Requirement 6: filters work together without resetting)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    payment_status: 'all',
    tour_id: 'all',
    tour_type: 'all',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    order: 'DESC',
    limit: 15,
    page: 1,
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modal States (Requirement 7)
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);

  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 350);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Load tours list for dropdown filter
  useEffect(() => {
    let isMounted = true;
    async function loadTours() {
      try {
        const res = await tourService.getTours({ limit: 100 });
        if (isMounted) {
          setToursList(res?.data || res?.items || []);
        }
      } catch {
        // Fallback silently
      }
    }
    loadTours();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load stats
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setLoadingStats(true);
        const res = await bookingService.getBookingStats();
        if (isMounted && res) {
          setStats(res);
        }
      } catch {
        // Non-fatal error fallback
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  // Load Bookings Data (Requirement 8 & 10: server-side dynamic filtering & optimized queries)
  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      try {
        setLoadingBookings(true);
        setError(null);

        const params = {
          page: filters.page,
          limit: filters.limit,
          search: debouncedSearch.trim() || undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          payment_status: filters.payment_status !== 'all' ? filters.payment_status : undefined,
          tour_id: filters.tour_id !== 'all' && filters.tour_id ? filters.tour_id : undefined,
          tour_type: filters.tour_type !== 'all' && filters.tour_type ? filters.tour_type : undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          sort_by: filters.sort_by,
          order: filters.order,
        };

        const res = await bookingService.getBookings(params);

        if (isMounted) {
          if (res?.items) {
            setBookings(res.items);
            setPagination(
              res.pagination || {
                page: filters.page,
                limit: filters.limit,
                total: res.items.length,
                total_pages: 1,
              }
            );
          } else {
            setBookings([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load booking records. Please check your connection and try again.');
        }
      } finally {
        if (isMounted) {
          setLoadingBookings(false);
        }
      }
    }
    loadBookings();
    return () => {
      isMounted = false;
    };
  }, [
    filters.page,
    filters.limit,
    debouncedSearch,
    filters.status,
    filters.payment_status,
    filters.tour_id,
    filters.tour_type,
    filters.date_from,
    filters.date_to,
    filters.sort_by,
    filters.order,
    reloadTrigger,
  ]);

  // Unified Filter Handler (Requirement 6)
  const handleFilterChange = useCallback((partial) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
      page: partial.page !== undefined ? partial.page : 1,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      payment_status: 'all',
      tour_id: 'all',
      tour_type: 'all',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      order: 'DESC',
      limit: 15,
      page: 1,
    });
    setDebouncedSearch('');
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSortChange = useCallback((colKey, newOrder) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: colKey,
      order: newOrder,
      page: 1,
    }));
  }, []);

  // -------------------------------------------------------------
  // Action Handlers (Requirement 7)
  // -------------------------------------------------------------

  // 1. View Action
  const handleViewDetails = async (booking) => {
    try {
      const full = await bookingService.getBooking(booking.id);
      setSelectedBooking(full || booking);
    } catch {
      setSelectedBooking(booking);
    }
    setIsDetailOpen(true);
  };

  // 2. Edit Action
  const handleOpenEditModal = async (booking) => {
    try {
      const full = await bookingService.getBooking(booking.id);
      setSelectedBooking(full || booking);
    } catch {
      setSelectedBooking(booking);
    }
    setIsEditOpen(true);
  };

  const handleSaveEditBooking = async (bookingId, editPayload) => {
    try {
      setIsSavingEdit(true);
      await bookingService.updateBooking(bookingId, editPayload);
      toast.success(`Booking #${selectedBooking?.order_number || bookingId} updated successfully.`);
      setIsEditOpen(false);
      setSelectedBooking(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to update booking.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 3. Confirm Action (Approve & Issue Official Ticket)
  const handleDirectConfirm = async (booking) => {
    try {
      setIsSubmittingStatus(true);
      const updated = await bookingService.approveBooking(booking.id, 'Booking approved and confirmed by administrator.');
      toast.success(`Booking #${updated?.order_number || booking.order_number} confirmed! Official ticket ${updated?.ticket_number ? '#' + updated.ticket_number : ''} issued and emailed.`);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to confirm booking.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // 4. Cancel Action
  const handleOpenCancelModal = (booking) => {
    setSelectedBooking(booking);
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async (bookingId, reasonNotes) => {
    try {
      setIsCancelling(true);
      await bookingService.cancelBooking(bookingId, reasonNotes);
      toast.success(`Booking #${selectedBooking?.order_number || bookingId} has been cancelled.`);
      setIsCancelOpen(false);
      setSelectedBooking(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  // 5. Delete Action
  const handleOpenDeleteModal = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (bookingId) => {
    try {
      setIsDeleting(true);
      await bookingService.deleteBooking(bookingId);
      toast.success(`Booking #${selectedBooking?.order_number || bookingId} safely archived.`);
      setIsDeleteOpen(false);
      setSelectedBooking(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to delete booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. Print Action
  const handlePrintBooking = (booking) => {
    setSelectedBooking(booking);
    setIsPrintOpen(true);
  };

  // 7. Resend Email Action (Opens Modal)
  const handleResendEmail = (booking) => {
    setSelectedBooking(booking);
    setIsResendOpen(true);
  };

  const handleConfirmResendTicket = async (bookingId, options = {}) => {
    try {
      setIsResending(true);
      const recipient = selectedBooking?.customer?.email || selectedBooking?.customer_email || 'customer';
      await bookingService.resendConfirmation(bookingId);
      toast.success(`Ticket email successfully sent to ${recipient}!`, 'Email Dispatched');

      // Refresh booking details
      try {
        const updated = await bookingService.getBooking(bookingId);
        if (updated) {
          setSelectedBooking(updated);
        }
      } catch {
        // Fallback
      }

      setIsResendOpen(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to resend ticket email.', 'Dispatch Error');
    } finally {
      setIsResending(false);
    }
  };

  // Status Modal Handlers (from detail modal or quick status)
  const handleOpenStatusModal = (booking) => {
    setSelectedBooking(booking);
    setIsStatusOpen(true);
  };

  const handleSubmitStatus = async ({ bookingId, booking_status, payment_status, payment_method, notes }) => {
    try {
      setIsSubmittingStatus(true);
      if (booking_status === 'confirmed') {
        await bookingService.approveBooking(bookingId, notes);
      } else if (booking_status === 'rejected') {
        await bookingService.rejectBooking(bookingId, notes);
      } else if (booking_status === 'cancelled') {
        await bookingService.cancelBooking(bookingId, notes);
      } else {
        await bookingService.updateBookingStatus(bookingId, booking_status, notes);
      }

      const payUpdates = {};
      if (payment_status && payment_status !== selectedBooking?.payment_status) {
        payUpdates.payment_status = payment_status;
      }
      if (payment_method && payment_method !== selectedBooking?.payment_method) {
        payUpdates.payment_method = payment_method;
      }
      if (Object.keys(payUpdates).length > 0) {
        await bookingService.updateBooking(bookingId, payUpdates);
      }

      toast.success(`Booking #${selectedBooking?.order_number} status updated to ${booking_status}.`);
      setIsStatusOpen(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to update booking status.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  return (
    <div className="admin-page-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Page Header (Requirement 1 & 2: proper alignment & typography) */}
      <div
        className="admin-page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '24px', fontWeight: '800', color: '#0B1329', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Booking &amp; Order Management
          </h1>
          <p className="admin-page-subtitle" style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Real-time customer reservations, payment terms, lifecycle status, official tickets, and customer email dispatch.
          </p>
        </div>

        <div className="admin-page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setReloadTrigger((prev) => prev + 1)}
            title="Reload booking records and statistics from server"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshIcon size={14} /> Refresh Records
          </button>
        </div>
      </div>

      {/* Search & Filter Bar (Requirement 3, 4, 6) */}
      <BookingFilters
        search={filters.search}
        status={filters.status}
        paymentStatus={filters.payment_status}
        tourId={filters.tour_id}
        tourType={filters.tour_type}
        dateFrom={filters.date_from}
        dateTo={filters.date_to}
        sortBy={filters.sort_by}
        order={filters.order}
        limit={filters.limit}
        toursList={toursList}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area (Requirement 8 & 9: empty states, loading, and error states) */}
      {loadingBookings && bookings.length === 0 ? (
        <Loading message="Loading booking records from database..." />
      ) : error ? (
        <ErrorState
          title="Error Loading Bookings"
          message={error}
          onRetry={() => setReloadTrigger((prev) => prev + 1)}
        />
      ) : (
        <BookingTable
          bookings={bookings}
          pagination={pagination}
          loading={loadingBookings}
          sortBy={filters.sort_by}
          order={filters.order}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
          onEditBooking={handleOpenEditModal}
          onConfirmBooking={handleDirectConfirm}
          onCancelBooking={handleOpenCancelModal}
          onOpenStatusModal={handleOpenStatusModal}
          onOpenDeleteModal={handleOpenDeleteModal}
          onPrintBooking={handlePrintBooking}
          onResendEmail={handleResendEmail}
        />
      )}

      {/* Modals */}
      {/* 1. View Details Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBooking(null);
        }}
        onOpenStatusModal={handleOpenStatusModal}
        onPrintBooking={handlePrintBooking}
        onSaveAdminNotes={async (bookingId, adminNotes) => {
          try {
            setIsSavingNotes(true);
            await bookingService.updateBooking(bookingId, { admin_notes: adminNotes });
            toast.success('Admin notes updated.');
            setSelectedBooking((prev) => ({ ...prev, admin_notes: adminNotes }));
            setReloadTrigger((prev) => prev + 1);
          } catch (err) {
            toast.error(err.message || 'Failed to update admin notes.');
          } finally {
            setIsSavingNotes(false);
          }
        }}
        onApproveBooking={async (bookingId, confirmPayload = '') => {
          try {
            setIsSubmittingStatus(true);
            const updated = await bookingService.approveBooking(bookingId, confirmPayload);
            toast.success(`Booking #${updated?.order_number || selectedBooking?.order_number} confirmed and ticket #${updated?.ticket_number || ''} issued!`);
            const full = await bookingService.getBooking(bookingId);
            setSelectedBooking(full);
            setReloadTrigger((prev) => prev + 1);
          } catch (err) {
            toast.error(err.message || 'Failed to confirm booking.');
          } finally {
            setIsSubmittingStatus(false);
          }
        }}
        onRejectBooking={async (bookingId) => {
          try {
            setIsSubmittingStatus(true);
            const updated = await bookingService.rejectBooking(bookingId);
            toast.success(`Booking #${updated?.order_number || selectedBooking?.order_number} has been rejected.`);
            const full = await bookingService.getBooking(bookingId);
            setSelectedBooking(full);
            setReloadTrigger((prev) => prev + 1);
          } catch (err) {
            toast.error(err.message || 'Failed to reject booking.');
          } finally {
            setIsSubmittingStatus(false);
          }
        }}
        onRecordPayment={async (bookingId, paymentData) => {
          try {
            await bookingService.recordPayment(bookingId, paymentData);
            toast.success(`Payment recorded successfully.`);
            const full = await bookingService.getBooking(bookingId);
            setSelectedBooking(full);
            setReloadTrigger((prev) => prev + 1);
          } catch (err) {
            toast.error(err.message || 'Failed to record payment.');
            throw err;
          }
        }}
        onRecordPaymentDiscussion={async (bookingId, discussionData) => {
          try {
            setIsSubmittingStatus(true);
            const updated = await bookingService.recordPaymentDiscussion(bookingId, discussionData);
            toast.success(`Payment terms for #${updated?.order_number || selectedBooking?.order_number} saved.`);
            const full = await bookingService.getBooking(bookingId);
            setSelectedBooking(full);
            setReloadTrigger((prev) => prev + 1);
          } catch (err) {
            toast.error(err.message || 'Failed to save payment discussion.');
          } finally {
            setIsSubmittingStatus(false);
          }
        }}
        onAddContactLog={async (bookingId, logData) => {
          try {
            await bookingService.addContactLog(bookingId, logData);
            if (selectedBooking?.booking_status === 'pending') {
              await bookingService.updateBookingStatus(bookingId, 'contacted', `Customer contacted via ${logData.contact_type}`);
            }
            toast.success('Customer contact log saved.');
            const full = await bookingService.getBooking(bookingId);
            setSelectedBooking(full);
            setReloadTrigger((prev) => prev + 1);
          } catch (err) {
            toast.error(err.message || 'Failed to save contact log.');
            throw err;
          }
        }}
        onResendConfirmation={() => {
          setIsResendOpen(true);
        }}
        isSavingNotes={isSavingNotes}
        isProcessing={isSubmittingStatus}
      />

      {/* 2. Edit Modal (Requirement 7) */}
      <BookingEditModal
        booking={selectedBooking}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedBooking(null);
        }}
        onSave={handleSaveEditBooking}
        isSaving={isSavingEdit}
      />

      {/* 3. Cancel Modal (Requirement 7) */}
      <BookingCancelModal
        booking={selectedBooking}
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedBooking(null);
        }}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={isCancelling}
      />

      {/* 4. Quick Status Update Modal */}
      <BookingStatusModal
        booking={selectedBooking}
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
        }}
        onSubmitStatus={handleSubmitStatus}
        isSubmitting={isSubmittingStatus}
      />

      {/* 5. Delete Modal */}
      <BookingDeleteModal
        booking={selectedBooking}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
        }}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* 6. Printable Order & Voucher Modal */}
      <BookingPrintModal
        booking={selectedBooking}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
        }}
      />

      {/* 7. Resend Ticket Modal (Task 7) */}
      <BookingResendTicketModal
        booking={selectedBooking}
        isOpen={isResendOpen}
        onClose={() => {
          setIsResendOpen(false);
        }}
        onConfirmResend={handleConfirmResendTicket}
        isSending={isResending}
      />
    </div>
  );
}
