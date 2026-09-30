import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../../components/public/common/PageHero';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import CustomTripPlannerForm from '../../components/public/planner/CustomTripPlannerForm';
import { formatWhatsAppUrl } from '../../utils/whatsapp';

export default function PlanTripPage() {
  const [searchParams] = useSearchParams();
  const prefilledTour = searchParams.get('tour') || '';
  const prefilledDest = searchParams.get('destination') || '';
  const { getSetting } = useSiteSettings();

  const siteName = getSetting('site_name', 'Wonderer South India');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactPhone = getSetting('contact_phone', '+91 8072566010');
  const contactEmail = getSetting('contact_email', 'contact@wonderersouthindia.in');

  useEffect(() => {
    updatePageMeta({
      title: `Custom Trip Planning & Quotation Wizard | ${siteName}`,
      description:
        `Customize your dream South India vacation. Select destinations, vehicle preferences, hotel categories, guide language, and get a tailored itinerary from ${siteName}.`,
    });
  }, [siteName]);

  const quickInquiryMsg = `Hello ${siteName}! I would like to design a custom South India holiday package and get a quote.`;
  const whatsappLink = formatWhatsAppUrl(contactWhatsApp, quickInquiryMsg);

  return (
    <div className="plan-trip-page-root" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '80vh' }}>
      {/* 1. HERO BANNER */}
      <PageHero
        title="Custom Trip Planning &amp; Quotation"
        subtitle="Complete our 10-step travel wizard to receive a customized South India tour itinerary, verified chauffeur vehicle, and instant quotation."
        badge="Tailored Travel &amp; Instant WhatsApp Quotes"
        breadcrumbs={[{ label: 'Plan Your Trip' }]}
        heroMedia={{ url: '/uploads/media/demo_carousel_pondicherry.jpg' }}
      />

      {/* 2. MAIN PLANNER WORKSPACE */}
      <div className="container" style={{ padding: '50px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          {/* Left Column: Why Plan With Us + Direct Contacts */}
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
              Why Plan With Us?
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0B1329', marginBottom: '16px', lineHeight: 1.25 }}>
              100% Customized Holidays across South India
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
              From luxury Kerala houseboats and Mysore palace heritage tours to the mist-clad tea hills of Munnar and Ooty — our local destination specialists craft the perfect holiday tailored to your dates and budget.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🚗</span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Verified Private Vehicles</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Innova Crysta, Tempo Traveller &amp; AC Sedans</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🗣️</span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Multi-Language Guides</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>English, French, German, Spanish &amp; Regional</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚡</span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Instant WhatsApp Quotation</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Transparent pricing with zero hidden charges</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B1329', marginBottom: '10px' }}>Need urgent travel assistance?</div>
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
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  textDecoration: 'none',
                  marginBottom: '10px',
                }}
              >
                <span>💬</span> WhatsApp: {contactWhatsApp}
              </a>
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  📞 Direct Call: {contactPhone}
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Complete 10-Section Custom Trip Planner */}
          <div>
            <CustomTripPlannerForm initialDestination={prefilledDest} initialTour={prefilledTour} />
          </div>
        </div>
      </div>
    </div>
  );
}
