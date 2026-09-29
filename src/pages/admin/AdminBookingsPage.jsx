import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import bookingService from '../../services/bookingService';
import tourService from '../../services/tourService';
import { updatePageMeta } from '../../utils/metadata';
import BookingStats from '../../components/admin/bookings/BookingStats';
import BookingFilters from '../../components/admin/bookings/BookingFilters';
import BookingTable from '../../components/admin/bookings/BookingTable';
import BookingDetailModal from '../../components/admin/bookings/BookingDetailModal';
import BookingStatusModal from '../../components/admin/bookings/BookingStatusModal';
import BookingDeleteModal from '../../components/admin/bookings/BookingDeleteModal';
import BookingPrintModal from '../../components/admin/bookings/BookingPrintModal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminBookingsPage() {
  const toast = useToast();

  // Page Title
  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Booking & Order Management | Tramax Tours',
      description: 'Manage customer tour bookings, reservations, status lifecycle, and Pay on Arrival transactions.',
    });
  }, []);

  // Stats State
  const [stats, setStats] = useState({
    total_bookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    total_value: 0,
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

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [tourId, setTourId] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

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
        // Ignore fallback
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

  // Load Bookings Data
  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      try {
        setLoadingBookings(true);
        setError(null);

        const params = {
          page,
          limit: 15,
          search: debouncedSearch.trim() || undefined,
          status: status !== 'all' ? status : undefined,
          payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
          tour_id: tourId !== 'all' ? tourId : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          sort_by: sortBy,
          order,
        };

        const res = await bookingService.getBookings(params);

        if (isMounted) {
          if (res?.items) {
            setBookings(res.items);
            setPagination(
              res.pagination || {
                page: 1,
                limit: 15,
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
          setError(err.message || 'Failed to load bookings. Please check your connection and try again.');
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
  }, [page, debouncedSearch, status, paymentStatus, tourId, dateFrom, dateTo, sortBy, order, reloadTrigger]);

  // Filter Reset Handlers
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setPaymentStatus('all');
    setTourId('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('created_at');
    setOrder('DESC');
    setPage(1);
  };

  const handleFilterChange = (partial) => {
    if ('search' in partial) setSearch(partial.search);
    if ('status' in partial) setStatus(partial.status);
    if ('payment_status' in partial) setPaymentStatus(partial.payment_status);
    if ('tour_id' in partial) setTourId(partial.tour_id || 'all');
    if ('date_from' in partial) setDateFrom(partial.date_from);
    if ('date_to' in partial) setDateTo(partial.date_to);
    if ('sort_by' in partial) setSortBy(partial.sort_by);
    if ('order' in partial) setOrder(partial.order);
    if ('page' in partial) setPage(partial.page);
    else setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal Open Handlers
  const handleViewDetails = async (booking) => {
    try {
      // Fetch full details if needed
      const full = await bookingService.getBooking(booking.id);
      setSelectedBooking(full?.data || booking);
    } catch {
      setSelectedBooking(booking);
    }
    setIsDetailOpen(true);
  };

  const handleOpenStatusModal = (booking) => {
    setSelectedBooking(booking);
    setIsStatusOpen(true);
  };

  const handleOpenDeleteModal = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteOpen(true);
  };

  const handlePrintBooking = (booking) => {
    setSelectedBooking(booking);
    setIsPrintOpen(true);
  };

  // Submit Status Update
  const handleSubmitStatus = async ({ bookingId, booking_status, payment_status, notes }) => {
    try {
      setIsSubmittingStatus(true);
      await bookingService.updateBookingStatus(bookingId, {
        booking_status,
        payment_status,
        notes,
      });

      toast.success(`Booking #${selectedBooking?.order_number} status updated to ${booking_status}.`);
      setIsStatusOpen(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to update booking status.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Save Admin Notes
  const handleSaveAdminNotes = async (bookingId, adminNotes) => {
    try {
      setIsSavingNotes(true);
      await bookingService.updateBooking(bookingId, {
        admin_notes: adminNotes,
      });
      toast.success('Internal admin notes updated.');
      // Update state in modal
      setSelectedBooking((prev) => ({ ...prev, admin_notes: adminNotes }));
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to update admin notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async (bookingId) => {
    try {
      setIsDeleting(true);
      await bookingService.deleteBooking(bookingId);
      toast.success(`Booking #${selectedBooking?.order_number} successfully deleted.`);
      setIsDeleteOpen(false);
      setSelectedBooking(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to delete booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Booking & Order Management</h1>
          <p className="admin-page-subtitle">
            Track customer reservations, update booking lifecycles, inspect guest & billing details, and manage Pay on Arrival transactions.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setReloadTrigger((prev) => prev + 1)}
            title="Reload data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <BookingStats stats={stats} loading={loadingStats} />

      {/* Search & Filter Bar */}
      <BookingFilters
        search={search}
        status={status}
        paymentStatus={paymentStatus}
        tourId={tourId === 'all' ? '' : tourId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sortBy={sortBy}
        order={order}
        toursList={toursList}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area */}
      {loadingBookings && bookings.length === 0 ? (
        <Loading message="Loading booking records..." />
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
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
          onOpenStatusModal={handleOpenStatusModal}
          onOpenDeleteModal={handleOpenDeleteModal}
          onPrintBooking={handlePrintBooking}
        />
      )}

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBooking(null);
        }}
        onOpenStatusModal={handleOpenStatusModal}
        onPrintBooking={handlePrintBooking}
        onSaveAdminNotes={handleSaveAdminNotes}
        isSavingNotes={isSavingNotes}
      />

      <BookingStatusModal
        booking={selectedBooking}
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
        }}
        onSubmitStatus={handleSubmitStatus}
        isSubmitting={isSubmittingStatus}
      />

      <BookingDeleteModal
        booking={selectedBooking}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
        }}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <BookingPrintModal
        booking={selectedBooking}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
        }}
      />
    </div>
  );
}
