import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  MapPinIcon,
  PhoneIcon,
  TicketIcon,
  UserIcon,
  WhatsAppIcon,
  XCircleIcon,
} from '../../components/common/Icons';
import customerService from '../../services/customerService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Button from '../../components/ui/Button';

export default function CustomerBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: `Booking Details #${id} — Wonderer South India`,
      description: 'Review complete booking details, travel dates, passenger information, and download confirmed tour tickets.',
    });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      try {
        setIsLoading(true);
        const data = await customerService.getMyBookingDetail(id);
        if (isMounted && data) {
          setBooking(data);
        }
      } catch (err) {
        toast.error(err.message || 'Unable to access booking details.', 'Unauthorized / Not Found');
        navigate('/customer/bookings');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleDownloadTicket = async () => {
    if (!booking) return;
    try {
      setIsDownloading(true);
      await customerService.downloadTicketPdf(booking.id, booking.ticket_number || booking.order_number);
      toast.success('Confirmed tour ticket downloaded successfully.', 'Downloaded');
    } catch (err) {
      toast.error(err.message || 'Failed to download ticket PDF.', 'Download Error');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#64748b' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isConfirmed = booking.booking_status?.toLowerCase() === 'confirmed';
  const currencySymbol = booking.currency === 'EUR' ? '€' : booking.currency === 'INR' ? '₹' : (booking.currency || '₹');
  const totalPrice = booking.agreed_price ? Number(booking.agreed_price) : Number(booking.total_price || 0);

  return (
    <div className="customer-booking-detail-page" style={{ minHeight: '80vh', padding: '2.5rem 1rem', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Navigation / Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <Link to="/customer/profile" style={{ color: '#0d9488', textDecoration: 'none' }}>Dashboard</Link> /{' '}
            <Link to="/customer/bookings" style={{ color: '#0d9488', textDecoration: 'none' }}>My Bookings</Link> /{' '}
            <span>Ref #{booking.order_number || booking.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {booking.tour_title || booking.destination_name || 'Tour Booking'}
            </h1>
            {isConfirmed && (
              <Button
                variant="primary"
                onClick={handleDownloadTicket}
                loading={isDownloading}
                disabled={isDownloading}
                style={{ background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <DownloadIcon size={16} /> Download Confirmed Ticket PDF
              </Button>
            )}
          </div>
        </div>

        {/* Status Callout Banner */}
        {isConfirmed ? (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#065f46', fontSize: '1rem', fontWeight: 700 }}>
                  Booking Officially Confirmed!
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', color: '#047857', fontSize: '0.85rem' }}>
                  Confirmed Ticket Number: <strong>{booking.ticket_number || booking.order_number}</strong>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fef08a', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ClockIcon size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#92400e', fontSize: '1rem', fontWeight: 700 }}>
                Status: {booking.booking_status?.toUpperCase() || 'IN REVIEW'}
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', color: '#78350f', fontSize: '0.85rem' }}>
                Our travel coordinator will contact you to finalize itinerary customisation and payment details. Your official ticket PDF will be generated upon confirmation.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Grid of Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Tour & Travel Details */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Travel & Itinerary Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Travel Date:</span>
                <strong style={{ color: '#1e293b' }}>{booking.arrival_date || booking.booking_date}</strong>
              </div>
              {booking.duration_days && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Duration:</span>
                  <strong style={{ color: '#1e293b' }}>{booking.duration_days} Day(s)</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Adults:</span>
                <strong style={{ color: '#1e293b' }}>{booking.adults_count || 1}</strong>
              </div>
              {booking.children_count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Children:</span>
                  <strong style={{ color: '#1e293b' }}>{booking.children_count}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Travelers:</span>
                <strong style={{ color: '#1e293b' }}>{booking.tickets_count || 1} Guest(s)</strong>
              </div>
              {booking.pickup_location && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Pickup Location:</span>
                  <strong style={{ color: '#1e293b' }}>{booking.pickup_location}</strong>
                </div>
              )}
              {booking.preferred_language && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Guide Language:</span>
                  <strong style={{ color: '#1e293b' }}>{booking.preferred_language}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Payment Summary */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Pricing & Payment Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Package Amount:</span>
                <strong style={{ color: '#1e293b' }}>{currencySymbol}{totalPrice.toLocaleString()}</strong>
              </div>
              {booking.advance_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Advance Paid:</span>
                  <strong style={{ color: '#059669' }}>{currencySymbol}{Number(booking.advance_amount).toLocaleString()}</strong>
                </div>
              )}
              {booking.balance_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Balance Due:</span>
                  <strong style={{ color: '#d97706' }}>{currencySymbol}{Number(booking.balance_amount).toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <strong style={{ color: '#1e293b', textTransform: 'capitalize' }}>
                  {booking.payment_method?.replace(/_/g, ' ') || 'Pay on Arrival / Transfer'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Status:</span>
                <strong style={{ color: '#1e293b', textTransform: 'capitalize' }}>
                  {booking.payment_status || 'Pending'}
                </strong>
              </div>
            </div>

            {booking.payment_discussion_notes && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #0d9488', fontSize: '0.825rem' }}>
                <strong style={{ color: '#0f766e', display: 'block', marginBottom: '0.25rem' }}>Payment & Confirmation Terms:</strong>
                <p style={{ margin: 0, color: '#334155' }}>{booking.payment_discussion_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/customer/bookings" className="btn btn-outline">
            ← Back to All Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
