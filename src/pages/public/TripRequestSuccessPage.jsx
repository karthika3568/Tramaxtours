import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import inquiryService from '../../services/inquiryService';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { formatWhatsAppUrl } from '../../utils/whatsapp';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';

export default function TripRequestSuccessPage() {
  const { referenceId } = useParams();
  const location = useLocation();
  const { getSetting } = useSiteSettings();

  const siteName = getSetting('site_name', 'Wanderer South India');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactEmail = getSetting('contact_email', 'contact@wonderersouthindia.in');

  const [tripSummary, setTripSummary] = useState(location.state?.tripSummary || null);
  const [loading, setLoading] = useState(!location.state?.tripSummary);
  const [error, setError] = useState('');

  useEffect(() => {
    updatePageMeta({
      title: `Trip Request Confirmation (${referenceId}) | ${siteName}`,
      description: `Your custom trip planning request ${referenceId} has been successfully received by ${siteName}.`,
    });
  }, [referenceId, siteName]);

  // Fetch summary from public API if not present in router state or on page refresh
  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      try {
        setLoading(true);
        setError('');
        const res = await inquiryService.getPublicTripSummary(referenceId);
        if (isMounted) {
          setTripSummary(res?.data || res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Trip request not found or reference ID is invalid.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!tripSummary) {
      fetchSummary();
    }
  }, [referenceId, tripSummary]);

  // Build WhatsApp prefilled click-to-chat message
  const whatsappMsg = tripSummary
    ? `Hello ${siteName}! My Trip Request Reference is ${tripSummary.reference_id || referenceId}. I submitted a custom tour request for ${tripSummary.destination_name || tripSummary.destination || 'South India'} (${tripSummary.duration_days || 'custom dates'}, ${tripSummary.travelers || 2} Travelers). Could you please share the itinerary and quote?`
    : `Hello ${siteName}! I submitted a trip request with reference ID ${referenceId}. Could you please check the quotation?`;

  const whatsappLink = formatWhatsAppUrl(contactWhatsApp, whatsappMsg);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading message="Loading trip confirmation details..." />
      </div>
    );
  }

  if (error || !tripSummary) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div className="glass-card-panel" style={{ maxWidth: '560px', margin: '0 auto', padding: '40px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 12px 36px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Trip Request Not Found
          </h2>
          <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
            {error || `We could not locate any active trip request with reference ID "${referenceId}".`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/request-my-trip" className="btn btn-primary">
              ✨ Plan a New Trip
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const destination = tripSummary.destination_name || tripSummary.destination || 'South India';
  const customerName = tripSummary.name || 'Traveler';
  const customerEmail = tripSummary.email || '';
  const customerWhatsApp = tripSummary.whatsapp_number || tripSummary.phone || '';
  const dates = tripSummary.arrival_date ? `${tripSummary.arrival_date} → ${tripSummary.departure_date || 'Flexible'}` : 'Flexible Dates';
  const travelers = `${tripSummary.adults_count || 1} Adult(s)${tripSummary.children_count ? `, ${tripSummary.children_count} Child(ren)` : ''}${tripSummary.infants_count ? `, ${tripSummary.infants_count} Infant(s)` : ''}`;
  const vehicle = tripSummary.vehicle_preference || tripSummary.vehicle || 'Private AC Vehicle';
  const hotel = tripSummary.hotel_category || 'Standard Hotel';
  const budget = tripSummary.approximate_budget ? `${tripSummary.budget_currency || 'EUR'} ${Number(tripSummary.approximate_budget).toLocaleString()}` : 'Custom / Not specified';

  return (
    <div className="trip-success-page-root" style={{ background: '#f8fafc', padding: '50px 20px 80px', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Success Banner Card */}
        <div
          className="glass-card-panel"
          style={{
            background: 'linear-gradient(135deg, #01AA90 0%, #01806C 100%)',
            color: '#ffffff',
            padding: '36px 30px',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(1, 170, 144, 0.25)',
            marginBottom: '28px',
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px' }}>
            ✓
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
            Trip Request Successfully Received!
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.95, margin: '0 0 20px', lineHeight: 1.5 }}>
            Thank you, <strong>{customerName}</strong>! Our South India destination team is preparing your personalized itinerary and pricing.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.25)', padding: '8px 18px', borderRadius: '9999px', fontSize: '14px', fontWeight: 700 }}>
            <span>Reference ID:</span>
            <span style={{ letterSpacing: '0.05em', color: '#ffd166' }}>{tripSummary.reference_id || referenceId}</span>
          </div>
        </div>

        {/* Action Callout: WhatsApp & Email Status */}
        <div
          className="glass-card-panel"
          style={{
            background: '#ffffff',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            marginBottom: '28px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Next Steps &amp; Direct WhatsApp Connect
          </h3>

          {/* WhatsApp Click-to-Chat Button */}
          <div style={{ marginBottom: '18px' }}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: '#25D366',
                color: '#ffffff',
                padding: '16px 24px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '16px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
                transition: 'transform 0.15s ease',
              }}
            >
              <span style={{ fontSize: '22px' }}>💬</span>
              <span>Open WhatsApp with Reference #{tripSummary.reference_id || referenceId}</span>
            </a>
            <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '8px', margin: '8px 0 0' }}>
              💡 <em>Note: This is a direct click-to-chat link with our verified WhatsApp travel desk ({contactWhatsApp}), NOT an automated delivery bot.</em>
            </p>
          </div>

          {/* Email Notification Status - 3 Honest States */}
          {(() => {
            const rawStatus = (tripSummary.email_status || 'not_configured').replace(/\s+/g, '_');
            let badgeBg = '#f8fafc';
            let badgeColor = '#334155';
            let borderColor = '#e2e8f0';
            let icon = 'ℹ️';
            let title = 'Email Notification: Not Enabled';
            let message = 'Automated email is not enabled. Your request is saved; use the WhatsApp button to reach us.';

            if (rawStatus === 'sent') {
              badgeBg = '#ecfdf5';
              badgeColor = '#065f46';
              borderColor = '#a7f3d0';
              icon = '✅';
              title = 'Email Confirmation Sent';
              message = `Confirmation email sent to ${tripSummary.masked_email || 'your registered email'}.`;
            } else if (rawStatus === 'failed') {
              badgeBg = '#fef2f2';
              badgeColor = '#991b1b';
              borderColor = '#fecaca';
              icon = '⚠️';
              title = 'Email Delivery Unavailable';
              message = 'We could not send the confirmation email. Your request is saved; our team will contact you via WhatsApp or email.';
            }

            return (
              <div style={{ background: badgeBg, color: badgeColor, padding: '14px 18px', borderRadius: '12px', border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
                <div>
                  <strong style={{ fontSize: '13.5px', display: 'block', marginBottom: '2px' }}>
                    {title}
                  </strong>
                  <span style={{ fontSize: '12.5px', lineHeight: 1.4, display: 'block' }}>
                    {message}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Trip Summary Card */}
        <div
          className="glass-card-panel"
          style={{
            background: '#ffffff',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            marginBottom: '32px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            Trip Request Overview
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div>
              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Destination(s)</span>
              <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{destination}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Travel Dates &amp; Duration</span>
              <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{dates} ({tripSummary.duration_days || 'Flexible'})</strong>
            </div>

            <div>
              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Travelers</span>
              <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{travelers}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Vehicle &amp; Guide</span>
              <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{vehicle} {tripSummary.tour_guide_required ? '• Guide Included' : ''}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Accommodation</span>
              <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{hotel} ({tripSummary.room_type || 'Double'})</strong>
            </div>

            <div>
              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Target Budget</span>
              <strong style={{ fontSize: '14.5px', color: '#01806C' }}>{budget}</strong>
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: '12px' }}>
            &larr; Back to Home
          </Link>
          <Link to="/tours" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>
            Explore Curated Tours &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
