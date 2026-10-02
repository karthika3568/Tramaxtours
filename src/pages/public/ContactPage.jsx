import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../components/public/common/Breadcrumbs';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { formatWhatsAppUrl } from '../../utils/whatsapp';
import CustomTripPlannerForm from '../../components/public/planner/CustomTripPlannerForm';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const prefilledTour = searchParams.get('tour') || '';
  const prefilledDest = searchParams.get('destination') || '';
  const { getSetting } = useSiteSettings();

  const contactPhone = getSetting('contact_phone', '+91 8072566010');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactEmail = getSetting('contact_email', 'contact@wonderersouthindia.in');
  const contactAddress = getSetting('contact_address', 'Chennai, Tamil Nadu, India');
  const siteName = getSetting('site_name', 'Wanderer South India');

  useEffect(() => {
    updatePageMeta({
      title: 'Contact Us & Custom Tour Inquiries | Wanderer South India',
      description:
        'Submit your trip requirements for custom South India tour packages, private chauffeur vehicles, hotel bookings, and instant WhatsApp quotations with Wanderer South India.',
    });
  }, []);

  const quickInquiryMsg = `Hello ${siteName}! I would like to plan a custom South India tour package and receive an itinerary & price quotation.`;
  const whatsappLink = formatWhatsAppUrl(contactWhatsApp, quickInquiryMsg);

  return (
    <div className="contact-page-luxury-root" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '80vh' }}>
      {/* 1. CLEAN PAGE HEADER (NO GIANT HOME BANNER) */}
      <section className="catalog-header-section" style={{ padding: '36px 0 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />
          <div className="catalog-header-content" style={{ marginTop: '14px' }}>
            <span className="section-badge" style={{ fontSize: '12px', fontWeight: 800, color: '#01AA90', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#e6f7f4', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block', marginBottom: '8px' }}>
              Direct Assistance &amp; Custom Quotes
            </span>
            <h1 className="catalog-page-title" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              Contact Our Travel Concierge
            </h1>
            <p className="catalog-page-subtitle" style={{ fontSize: '15px', color: '#64748b', maxWidth: '700px', lineHeight: 1.6, margin: 0 }}>
              Speak directly with our destination coordinators in Chennai or submit your trip preferences for a personalized South Indian itinerary.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTACT WORKSPACE */}
      <div className="container" style={{ padding: '50px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          {/* Left Column: Direct Contact Info & WhatsApp */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#01AA90',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#e6f7f4',
                padding: '4px 12px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '12px',
              }}
            >
              24/7 Concierge Support
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0B1329', marginBottom: '14px', lineHeight: 1.25 }}>
              Let&apos;s Design Your Dream South Indian Holiday
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.7, marginBottom: '28px' }}>
              Fill out the custom planning wizard with your room types, vehicle choice, and tour preferences. Our destination coordinators will craft your itinerary within hours.
            </p>

            {/* Quick Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
              {/* WhatsApp Action Card */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  padding: '18px 22px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: '30px' }}>💬</span>
                <div>
                  <strong style={{ fontSize: '15px', display: 'block' }}>Chat Instantly on WhatsApp</strong>
                  <span style={{ fontSize: '12.5px', opacity: 0.9 }}>{contactWhatsApp} • Fast Responses</span>
                </div>
              </a>

              {/* Phone Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>📞</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Helpline Hotline</small>
                  <strong style={{ fontSize: '14.5px', color: '#0B1329' }}>{contactPhone}</strong>
                </div>
              </div>

              {/* Email Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>✉️</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Email Support</small>
                  <strong style={{ fontSize: '14.5px', color: '#0B1329' }}>{contactEmail}</strong>
                </div>
              </div>

              {/* Address Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>📍</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Headquarters</small>
                  <strong style={{ fontSize: '14.5px', color: '#0B1329' }}>{contactAddress}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Custom Trip Planning Form (All 5 Screenshots) */}
          <div>
            <CustomTripPlannerForm initialDestination={prefilledDest} initialTour={prefilledTour} />
          </div>
        </div>
      </div>
    </div>
  );
}

