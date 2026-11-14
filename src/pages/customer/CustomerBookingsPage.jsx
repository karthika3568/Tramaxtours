import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  MapPinIcon,
  SearchIcon,
  TicketIcon,
  UserIcon,
  XCircleIcon,
  AlertCircleIcon,
} from '../../components/common/Icons';
import customerService from '../../services/customerService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Button from '../../components/ui/Button';
import { getMediaUrl } from '../../utils/media';

export default function CustomerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const currentStatusParam = searchParams.get('status') || 'all';
  const currentPageParam = parseInt(searchParams.get('page') || '1', 10);

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [stats, setStats] = useState({
    total_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    updatePageMeta({
      title: 'My Tour Bookings — Wonderer South India',
      description: 'View all your tour bookings, track approval and payment discussion status, and download confirmed tickets.',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      try {
        setIsLoading(true);
        const res = await customerService.getMyBookings({
          status: currentStatusParam,
          page: currentPageParam,
          per_page: 10,
        });

        if (isMounted && res) {
          setBookings(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
          if (res.stats) {
            setStats(res.stats);
          }
        }
      } catch (err) {
        toast.error(err.message || 'Unable to load tour bookings.', 'Load Error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBookings();
    return () => {
      isMounted = false;
    };
  }, [currentStatusParam, currentPageParam]);

  const handleTabChange = (status) => {
    const next = new URLSearchParams(searchParams);
    if (status === 'all') {
      next.delete('status');
    } else {
      next.set('status', status);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleDownloadTicket = async (e, booking) => {
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = booking.booking_status?.toLowerCase() === 'confirmed';
    if (!isConfirmed) {
      toast.warning('Confirmed ticket is only available once your booking has been officially confirmed.', 'Not Confirmed');
      return;
    }

    try {
      setDownloadingId(booking.id);
      await customerService.downloadTicketPdf(booking.id, booking.ticket_number || booking.order_number);
      toast.success('Confirmed tour ticket downloaded successfully.', 'Downloaded');
    } catch (err) {
      toast.error(err.message || 'Failed to download ticket PDF. Please try again or contact support.', 'Download Error');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'confirmed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
            <CheckCircleIcon size={14} /> Confirmed
          </span>
        );
      case 'completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, background: '#ede9fe', color: '#6d28d9' }}>
            <TicketIcon size={14} /> Completed
          </span>
        );
      case 'contacted':
      case 'payment_discussion':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, background: '#dbeafe', color: '#1d4ed8' }}>
            <ClockIcon size={14} /> Payment Discussion
          </span>
        );
      case 'awaiting_confirmation':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, background: '#fef3c7', color: '#b45309' }}>
            <ClockIcon size={14} /> Awaiting Confirmation
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, background: '#fee2e2', color: '#b91c1c' }}>
            <XCircleIcon size={14} /> Cancelled
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, background: '#fef3c7', color: '#b45309' }}>
            <ClockIcon size={14} /> In Review
          </span>
        );
    }
  };

  return (
    <div className="customer-bookings-container" style={{ minHeight: '80vh', padding: '2.5rem 1rem', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Breadcrumb / Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
              <Link to="/customer/profile" style={{ color: '#0d9488', textDecoration: 'none' }}>Dashboard</Link> / Bookings
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              My Tour Bookings
            </h1>
          </div>
          <Link to="/tours" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <SearchIcon size={16} /> Explore More Tours
          </Link>
        </div>

        {/* Dynamic Status Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {[
            { key: 'all', label: 'All Bookings', count: stats.total_bookings },
            { key: 'pending', label: 'Pending / In Review', count: stats.pending_bookings },
            { key: 'confirmed', label: 'Confirmed', count: stats.confirmed_bookings },
            { key: 'completed', label: 'Completed', count: stats.completed_bookings },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled_bookings },
          ].map((tab) => {
            const isActive = currentStatusParam === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: isActive ? '3px solid #0d9488' : '3px solid transparent',
                  color: isActive ? '#0d9488' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    background: isActive ? '#ccfbf1' : '#f1f5f9',
                    color: isActive ? '#0f766e' : '#64748b',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings List Area */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#64748b' }}>Loading your tour bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <CalendarIcon size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              No {currentStatusParam !== 'all' ? currentStatusParam : ''} bookings found
            </h3>
            <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
              You do not have any tour bookings in this status right now. Browse our curated South India tours and plan your next journey!
            </p>
            <Link to="/tours" className="btn btn-primary">
              Browse Handcrafted Tours
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((booking) => {
              const isConfirmed = booking.booking_status?.toLowerCase() === 'confirmed';
              const isDownloadingThis = downloadingId === booking.id;
              const currencySymbol = booking.currency === 'EUR' ? '€' : booking.currency === 'INR' ? '₹' : (booking.currency || '₹');
              const displayPrice = booking.agreed_price ? Number(booking.agreed_price) : Number(booking.total_price || 0);

              return (
                <div
                  key={booking.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1.5rem',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    {/* Top Row: Reference, Date, Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.02em' }}>
                        Ref #{booking.order_number || booking.id}
                      </span>
                      {booking.ticket_number && (
                        <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          Ticket #{booking.ticket_number}
                        </span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>•</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Booked on {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                      {getStatusBadge(booking.booking_status)}
                    </div>

                    {/* Middle: Tour Name and Destination */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                      {booking.tour_title || booking.destination_name || 'South India Tour Package'}
                    </h3>

                    {/* Meta row: Travel Date, Guests, Destination */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <CalendarIcon size={15} color="#0d9488" />
                        Travel Date: <strong>{booking.arrival_date || booking.booking_date}</strong>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <UserIcon size={15} color="#0d9488" />
                        Travelers: <strong>{booking.tickets_count || 1} guest(s)</strong>
                      </span>
                      {booking.destination_name && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <MapPinIcon size={15} color="#0d9488" />
                          Destination: <strong>{booking.destination_name}</strong>
                        </span>
                      )}
                    </div>

                    {/* Payment / Status Notes */}
                    {booking.payment_discussion_notes && (
                      <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.825rem', color: '#334155', borderLeft: '3px solid #0d9488', marginTop: '0.5rem' }}>
                        <strong>Coordinator Note:</strong> {booking.payment_discussion_notes}
                      </div>
                    )}
                  </div>

                  {/* Right side: Price and Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '0.75rem', minWidth: '180px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Total Package</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e' }}>
                        {currencySymbol}{displayPrice.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/customer/bookings/${booking.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <EyeIcon size={14} /> View Details
                      </Link>

                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={(e) => handleDownloadTicket(e, booking)}
                          disabled={isDownloadingThis}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#059669', borderColor: '#059669' }}
                          title="Download Official Confirmed Ticket"
                        >
                          <DownloadIcon size={14} />
                          {isDownloadingThis ? 'Downloading...' : 'Ticket PDF'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page <= 1}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(pagination.current_page - 1));
                    setSearchParams(next);
                  }}
                >
                  Previous
                </Button>
                <span style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page >= pagination.total_pages}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(pagination.current_page + 1));
                    setSearchParams(next);
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

