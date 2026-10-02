import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../components/public/common/Breadcrumbs';
import TripRequestForm from '../../components/public/planner/TripRequestForm';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { formatWhatsAppUrl } from '../../utils/whatsapp';
import tourService from '../../services/tourService';
import destinationService from '../../services/destinationService';

export default function RequestMyTripPage() {
  const [searchParams] = useSearchParams();
  const tourSlug = searchParams.get('tour') || '';
  const destSlug = searchParams.get('destination') || '';
  const prefilledDate = searchParams.get('date') || '';
  const prefilledAdults = searchParams.get('adults') ? Number(searchParams.get('adults')) : 2;
  const prefilledChildren = searchParams.get('children') ? Number(searchParams.get('children')) : 0;

  const { getSetting } = useSiteSettings();
  const siteName = getSetting('site_name', 'Wanderer South India');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactPhone = getSetting('contact_phone', '+91 8072566010');

  const [prefilledTourTitle, setPrefilledTourTitle] = useState('');
  const [prefilledDestName, setPrefilledDestName] = useState(destSlug);

  useEffect(() => {
    updatePageMeta({
      title: `Request My Custom Trip | ${siteName}`,
      description:
        `Plan your personalized South India holiday package with ${siteName}. Choose your custom destinations, vehicle, hotel class, and get an instant quote.`,
    });
  }, [siteName]);

  // If tourSlug passed, resolve tour title & destination
  useEffect(() => {
    let isMounted = true;
    if (tourSlug) {
      const fetchTour = tourService.getTour || tourService.getTourBySlug;
      if (typeof fetchTour === 'function') {
        fetchTour(tourSlug)
          .then((res) => {
            if (!isMounted) return;
            const tourData = res?.data || res;
            if (tourData?.title) {
              setPrefilledTourTitle(tourData.title);
              if (!prefilledDestName && tourData.destination?.name) {
                setPrefilledDestName(tourData.destination.name);
              }
            }
          })
          .catch(() => {});
      }
    } else if (destSlug) {
      const fetchDest = destinationService.getDestination || destinationService.getDestinationBySlug;
      if (typeof fetchDest === 'function') {
        fetchDest(destSlug)
          .then((res) => {
            if (!isMounted) return;
            const destData = res?.data || res;
            if (destData?.name) {
              setPrefilledDestName(destData.name);
            }
          })
          .catch(() => {});
      }
    }
    return () => {
      isMounted = false;
    };
  }, [tourSlug, destSlug, prefilledDestName]);

  const quickInquiryMsg = `Hello ${siteName}! I would like to plan a custom South India tour package.`;
  const whatsappLink = formatWhatsAppUrl(contactWhatsApp, quickInquiryMsg);

  return (
    <div className="request-my-trip-page" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '85vh' }}>
      {/* Clean Page Header */}
      <section className="catalog-header-section" style={{ padding: '36px 0 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Request My Trip' }]} />
          <div className="catalog-header-content" style={{ marginTop: '14px' }}>
            <span className="section-badge" style={{ fontSize: '12px', fontWeight: 800, color: '#01AA90', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#e6f7f4', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block', marginBottom: '8px' }}>
              Bespoke Private Journeys
            </span>
            <h1 className="catalog-page-title" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              Request Your Custom South India Trip
            </h1>
            <p className="catalog-page-subtitle" style={{ fontSize: '15px', color: '#64748b', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
              Tell us your desired destinations, vehicle preference, and dates. Our destination specialists will craft your personalized day-by-day itinerary and quotation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="container" style={{ padding: '48px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          {/* Left Column: Why Plan With Us + WhatsApp Help Card */}
          <aside className="planner-sidebar" style={{ position: 'sticky', top: '100px' }}>
            <div className="glass-card-panel" style={{ padding: '30px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#01AA90', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#e6f7f4', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block', marginBottom: '14px' }}>
                Why Plan With Us?
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 }}>
                100% Tailor-Made Private Vacations
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                From sacred temples of Tamil Nadu and serene backwaters of Kerala to the majestic palaces of Mysore — our dedicated local team crafts the perfect journey for your family.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🚗</span>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Verified AC Chauffeurs</h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Innova Crysta, Tempo Traveller &amp; Sedans</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🗣️</span>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Multi-Language Guides</h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>English, German, French, Spanish &amp; Regional</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚡</span>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Instant WhatsApp Quotes</h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Transparent pricing with zero hidden fees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Concierge Card */}
            <div className="glass-card-panel" style={{ padding: '24px', borderRadius: '18px', background: 'linear-gradient(135deg, #f0fdf4 0%, #e6f7f4 100%)', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Need immediate booking assistance?</div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                <span>💬 Chat with Concierge</span>
              </a>
              <div style={{ fontSize: '11.5px', color: '#475569', textAlign: 'center', marginTop: '8px' }}>
                WhatsApp: {contactWhatsApp} • Call: {contactPhone}
              </div>
            </div>
          </aside>

          {/* Right Column: 10-Section Trip Request Form */}
          <main style={{ minWidth: 0 }}>
            <TripRequestForm
              initialDestination={prefilledDestName}
              initialTour={prefilledTourTitle}
              prefilledData={{
                arrival_date: prefilledDate,
                adults_count: prefilledAdults,
                children_count: prefilledChildren,
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
