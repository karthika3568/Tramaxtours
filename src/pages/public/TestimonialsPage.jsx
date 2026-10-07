import { useEffect } from 'react';
import PageHero from '../../components/public/common/PageHero';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import TestimonialsSection from '../../components/public/home/TestimonialsSection';
import { formatWhatsAppUrl } from '../../utils/whatsapp';

export default function TestimonialsPage() {
  const { getSetting } = useSiteSettings();
  const siteName = getSetting('site_name', 'Wonderer South India');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');

  useEffect(() => {
    updatePageMeta({
      title: `Traveler Testimonials & Reviews | ${siteName}`,
      description:
        `Read authentic guest reviews and experiences from global travelers who toured South India with ${siteName}. 5-star rated custom itineraries & chauffeur journeys.`,
    });
  }, [siteName]);

  const feedbackMsg = `Hello ${siteName}! I would like to share my feedback and travel experience with your team.`;
  const whatsappUrl = formatWhatsAppUrl(contactWhatsApp, feedbackMsg);

  return (
    <div className="testimonials-page-root" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '80vh' }}>
      {/* 1. HERO BANNER */}
      <PageHero
        title="Guest Testimonials &amp; Stories"
        subtitle="Discover authentic memories and experiences shared by international and domestic travelers who explored South India with us."
        badge="⭐ 4.9 / 5 Rated Experience"
        breadcrumbs={[{ label: 'Testimonials' }]}
        heroMedia={{ url: '/uploads/media/demo_carousel_munnar.jpg' }}
      />

      {/* 2. REPUTATION STATS BAR */}
      <div className="container" style={{ paddingTop: '40px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0B1329 0%, #172554 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '30px 40px',
            boxShadow: '0 20px 40px -15px rgba(11, 19, 41, 0.3)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#34d399' }}>4.9 / 5.0</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Average Traveler Rating</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#38bdf8' }}>1,850+</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Custom Tours Executed</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fbbf24' }}>99.4%</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Recommendation Rate</div>
          </div>
        </div>
      </div>

      {/* 3. TESTIMONIALS SLIDER SECTION */}
      <div style={{ padding: '40px 0 20px' }}>
        <TestimonialsSection />
      </div>

      {/* 4. SHARE YOUR EXPERIENCE CALL-TO-ACTION */}
      <div className="container" style={{ paddingBottom: '70px' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px 30px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              color: '#1226de',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'rgba(18, 38, 222, 0.08)',
              padding: '4px 14px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            We Value Your Feedback
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0B1329', marginBottom: '10px' }}>
            Traveled with {siteName} recently?
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '600px', margin: '0 auto 24px' }}>
            Share your South India vacation photos and experience directly with our guest relations team on WhatsApp.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-planning-pill"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '14px' }}
          >
            <span>💬</span> Share Your Experience on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
