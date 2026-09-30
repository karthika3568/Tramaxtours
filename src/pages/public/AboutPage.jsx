import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/public/common/PageHero';
import BenefitsSection from '../../components/public/home/BenefitsSection';
import pageService from '../../services/pageService';
import { updatePageMeta } from '../../utils/metadata';
import { getMediaUrl } from '../../utils/media';

const DEFAULT_ABOUT = {
  title: 'About Wonderer South India',
  subtitle: 'Dedicated to fulfilling your personal travel dreams and making each journey simple, memorable, and safe.',
  hero_media_url: '/uploads/media/demo_carousel_kerala.jpg',
  content:
    '<p>We believe that your personal trip requires your own personal travel guide. We know that plans can evolve as you explore, and your chauffeur guide should be easily adjustable to help you modify your itinerary on the go.</p>' +
    '<p>Whether you are an explorer on an epic journey, looking for a refreshing short weekend getaway, or dreaming of a life-changing adventure, our tour offerings are crafted to fulfill your unique personal travel dreams and ensure each moment is unforgettable.</p>' +
    '<p>The integrity of our team and the quality of services provided by Wonderer South India is guided in principle by professionalism and an uncompromising commitment to engage every traveler in authentic cultural immersion.</p>',
};

export default function AboutPage() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    updatePageMeta({
      title: 'About Us — Wonderer South India | Travel Made Simple & Memorable',
      description:
        'Discover Wonderer South India. Specialized in private chauffeur sightseeing, sacred temple expeditions, cultural immersions, hill station safaris, and bespoke South Indian holidays.',
    });

    async function loadAboutPage() {
      try {
        const data = await pageService.getPage('about-us');
        if (data && data.status === 'published') {
          setAbout({
            title: data.title || DEFAULT_ABOUT.title,
            subtitle: data.subtitle || DEFAULT_ABOUT.subtitle,
            hero_media_url: data.hero_media ? getMediaUrl(data.hero_media) : DEFAULT_ABOUT.hero_media_url,
            content: data.content?.trim() || DEFAULT_ABOUT.content,
          });
          if (data.seo_title || data.seo_description) {
            updatePageMeta({
              title: data.seo_title || 'About Us — Wonderer South India',
              description: data.seo_description || undefined,
            });
          }
        }
      } catch {
        // Keep default content if the CMS page isn't published yet
      }
    }

    loadAboutPage();
  }, []);

  return (
    <div className="about-page-luxury-root" style={{ background: '#f8fafc', color: '#0B1329' }}>
      {/* 1. HERO BANNER */}
      <PageHero
        title={about.title}
        subtitle={about.subtitle}
        badge="Our Heritage & Philosophy"
        breadcrumbs={[{ label: 'About Us' }]}
        heroMedia={{ url: about.hero_media_url }}
      />

      {/* 2. WHO WE ARE SECTION */}
      <section className="about-who-we-are container" style={{ padding: '70px 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
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
              Who We Are
            </span>
            <h2 style={{ fontSize: '34px', fontWeight: '800', lineHeight: 1.25, color: '#0B1329', marginBottom: '18px' }}>
              We Believe Planning Your Journey Should Be as Enjoyable as the Trip Itself.
            </h2>
            <div
              className="about-story-content"
              style={{ fontSize: '15.5px', lineHeight: 1.7, color: '#475569' }}
              dangerouslySetInnerHTML={{ __html: about.content }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(11, 19, 41, 0.12)',
                border: '4px solid #ffffff',
              }}
            >
              <img
                src={about.hero_media_url}
                alt="Wonderer South India Travel Experience"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-20px',
                background: '#0B1329',
                color: '#ffffff',
                padding: '20px 24px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                maxWidth: '240px',
              }}
            >
              <strong style={{ fontSize: '24px', color: '#01AA90', display: 'block', lineHeight: 1 }}>100%</strong>
              <span style={{ fontSize: '12.5px', opacity: 0.9 }}>Private Escorted Vehicles & Tailored Hospitality</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY BOOK WITH US — 3 CORE PILLARS */}
      <section className="about-why-book-section" style={{ background: '#ffffff', padding: '80px 0', margin: '40px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
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
                marginBottom: '10px',
              }}
            >
              Why Book With Us?
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0B1329', margin: 0 }}>
              Travel You Can Truly Trust
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>
              Backed by experienced local drivers, seamless coordination, and transparent pricing.
            </p>
          </div>

          {/* Admin-managed benefit cards (Website Management → Homepage Sections → Why Us) */}
          <div style={{ marginBottom: '40px' }}>
            <BenefitsSection />
          </div>

          {/* Key Advantages Checklist Grid */}
          <div
            style={{
              background: '#0B1329',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '36px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#01AA90', fontSize: '20px' }}>✓</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Planning your trip is simple and fun</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#01AA90', fontSize: '20px' }}>✓</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Local expert tour guides & chauffeurs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#01AA90', fontSize: '20px' }}>✓</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Sensational value & Pay on Arrival option</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#01AA90', fontSize: '20px' }}>✓</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Private tours operated solely for your group</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT WE DO */}
      <section className="about-what-we-do container" style={{ padding: '30px 20px 70px' }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px' }}>
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
              marginBottom: '10px',
            }}
          >
            What We Do
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0B1329', margin: 0 }}>
            Curating India's Most Fascinating Destinations
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>
            From majestic mist-clad mountains and serene backwater rivers to world-heritage temple architecture and tropical coastlines.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(11, 19, 41, 0.04)' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🏔️</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329', marginBottom: '8px' }}>Hill Station Expeditions</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Munnar, Ooty, Kodaikanal, and Wayanad misty heights with tea estates and panoramic viewpoints.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(11, 19, 41, 0.04)' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🏛️</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329', marginBottom: '8px' }}>Sacred Temple Circuits</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Mahabalipuram shore carvings, Madurai Meenakshi, Rameshwaram, and Tanjore Chola architectural wonders.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(11, 19, 41, 0.04)' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🛶</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329', marginBottom: '8px' }}>Backwaters & Beaches</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Alleppey houseboat cruises, Pondicherry French quarters, and serene palm-lined Goa coastlines.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(11, 19, 41, 0.04)' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>✨</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1329', marginBottom: '8px' }}>Custom Itineraries</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              100% tailor-made schedules designed around your flight timings, family preferences, and budget.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ART, CULTURE & WILDLIFE NARRATIVE BLOCKS */}
      <section className="about-heritage-narrative container" style={{ padding: '0 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Art & Culture Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '36px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(11, 19, 41, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>🎨</span>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0B1329', margin: 0 }}>Art & Cultural Heritage</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '14px' }}>
              The diversity of philosophical and spiritual beliefs has had a profound impact on the arts of Southern India. Indian art can be traced to prehistoric settlements in the 3rd millennium BC.
            </p>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              The region has witnessed the architectural mastery of dynasties such as the Cholas, Pallavas, Pandyas, as well as Portuguese, French, and British historic influences. Dravidian stone-carved shrines reflect ancient craftsmanship that continues to captivate global travelers.
            </p>
          </div>

          {/* Wildlife Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '36px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(11, 19, 41, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>🐅</span>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0B1329', margin: 0 }}>Wildlife & Nature Sanctuaries</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '14px' }}>
              South India is exceptionally rich in biodiversity across the Western Ghats UNESCO heritage corridor. The region is home to more than <strong>500 species of mammals</strong>, <strong>1,225 varieties of birds</strong>, and <strong>1,600 types of reptiles and amphibians</strong>.
            </p>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              India harbours approximately 60% of the world's wild tiger population. Our escorted wildlife safaris through Bandipur, Nagarhole, Mudumalai, and Periyar provide unparalleled opportunities for ethical jungle sightings.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B1329 0%, #01806C 100%)',
          color: '#ffffff',
          padding: '70px 20px',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '800', marginBottom: '14px', color: '#ffffff' }}>
            Ready to Begin Your South India Adventure?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '28px' }}>
            Let our specialists tailor an exclusive journey crafted entirely around your dreams.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tours" className="btn btn-primary btn-lg">
              Explore Tour Packages &rarr;
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Contact Our Specialists
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
