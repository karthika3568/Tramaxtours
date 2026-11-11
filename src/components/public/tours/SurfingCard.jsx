import { ClockIcon, MapPinIcon, SparklesIcon } from '../../common/Icons';
import { Link } from 'react-router-dom';

export default function SurfingCard() {
  return (
    <article
      className="activity-tour-card surfing-tour-card"
      style={{
        borderRadius: '16px',
        border: '1px solid #bae6fd',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(2, 132, 199, 0.08)',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top Image Container */}
      <Link
        to="/tours/surfing-your-best-day"
        className="activity-card-media"
        style={{ position: 'relative', height: '210px', display: 'block', overflow: 'hidden' }}
      >
        <img
          src="/uploads/media/surfing_tour_banner.jpg"
          alt="Surfing Lessons in South India"
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/uploads/media/surfing_action_waves.jpg';
          }}
        />

        {/* Category Pill */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <span
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <SparklesIcon size={12} color="#ffffff" />
            <span>Surfing Adventure</span>
          </span>
        </div>

        {/* Highlight Badge */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 2 }}>
          <span
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(4px)',
              color: '#38bdf8',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
            }}
          >
            1.5 Hours Lesson
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="activity-card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Location & Time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPinIcon size={13} color="#94a3b8" />
            <span>Covelong Point / Mahabalipuram</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ClockIcon size={13} color="#94a3b8" />
            <span>8:00 AM – 6:00 PM</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="activity-tour-title" style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', lineHeight: '1.3' }}>
          <Link
            to="/tours/surfing-your-best-day"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            SURFING (YOUR BEST DAY)
          </Link>
        </h3>

        {/* Description */}
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 12px 0', flex: 1 }}>
          &ldquo;Surfing is not a sport, it’s a lifestyle.&rdquo; Learn to ride ocean waves independently with certified surf guides. 30-min theory + 1-hour practical session. Swim or not, surf with no fear.
        </p>

        {/* Highlights Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
            ✓ Transport Included
          </span>
          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
            ✓ Surf Lessons &amp; Guide
          </span>
        </div>

        {/* Price & Action Row */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
              Starts From
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '19px', fontWeight: '800', color: '#0284c7' }}>
                ₹5,000
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>INR</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <a
              href="https://wa.me/919840291110?text=Hello%20Wonderer%20South%20India%2C%20I%20would%20like%20to%20inquire%20about%20Surfing%20Lessons."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '8px',
                color: '#16a34a',
                borderColor: '#86efac',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Chat on WhatsApp +91 9840291110"
            >
              <span>WhatsApp</span>
            </a>

            <Link
              to="/tours/surfing-your-best-day"
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                borderColor: '#0284c7',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Explore &amp; Book</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
