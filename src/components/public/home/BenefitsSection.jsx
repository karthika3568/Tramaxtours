import { useState, useEffect } from 'react';
import homeBenefitsService from '../../../services/homeBenefitsService';

/**
 * Custom High-Fidelity Outline Icons Matching the Screenshot
 */
function BenefitVectorIcon({ iconName = '' }) {
  const name = iconName?.toLowerCase().trim();

  if (name === 'globe' || name === 'world' || name === 'discover') {
    return (
      <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        {/* Globe Outline with stand and grid */}
        <circle cx="30" cy="28" r="18" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="30" cy="28" rx="8" ry="18" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 28h36" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 20c4 3 26 3 30 0" stroke="#06b6d4" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M15 36c4-3 26-3 30 0" stroke="#06b6d4" strokeWidth="1.75" strokeLinecap="round" />
        {/* Stand */}
        <path d="M48 28c0 10-8 18-18 18s-18-8-18-18" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 46v10" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 56h16" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'tag' || name === 'deals' || name === 'discount' || name === 'offer') {
    return (
      <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        {/* Discount Tag / Megaphone */}
        <path d="M34 14l16 16-20 20-16-16 10-20h10z" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="3" fill="#06b6d4" stroke="#4338ca" strokeWidth="1.5" />
        <path d="M36 28l-8 8" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="31" cy="30" r="1.5" fill="#06b6d4" />
        <circle cx="33" cy="34" r="1.5" fill="#06b6d4" />
        {/* Sparkles / Megaphone ring */}
        <path d="M48 18l4-4" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
        <path d="M52 24l5 1" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'umbrella' || name === 'beach' || name === 'exploring' || name === 'sun') {
    return (
      <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        {/* Sun */}
        <circle cx="46" cy="18" r="4" stroke="#4338ca" strokeWidth="2" />
        <path d="M46 10v3M46 23v3M38 18h3M51 18h3" stroke="#4338ca" strokeWidth="1.5" strokeLinecap="round" />
        {/* Umbrella */}
        <path d="M18 34c0-10 8-16 18-16s18 6 18 16H18z" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M27 34c0-8 4-16 9-16s9 8 9 16" stroke="#4338ca" strokeWidth="1.5" />
        <path d="M36 18v22c0 3 2 4 4 4" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Island ground */}
        <path d="M12 48c8-3 28-3 40 0" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Ribbon Award / Badge
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Rosette Medal */}
      <circle cx="32" cy="26" r="14" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="26" r="9" stroke="#06b6d4" strokeWidth="2" />
      <circle cx="32" cy="26" r="4" fill="#06b6d4" />
      {/* Ribbons */}
      <path d="M26 38l-4 16 10-4 10 4-4-16" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DEFAULT_BENEFITS = [
  {
    id: 1,
    title: 'Discover the possibilities',
    description: 'With nearly half a million attractions, hotels & more, you’re sure to find joy.',
    icon: 'globe',
  },
  {
    id: 2,
    title: 'Enjoy deals & delights',
    description: 'Quality activities. Great prices. Plus, earn credits to save more.',
    icon: 'tag',
  },
  {
    id: 3,
    title: 'Exploring made easy',
    description: 'Book last minute, skip lines & get free cancellation for easier exploring.',
    icon: 'umbrella',
  },
  {
    id: 4,
    title: 'Travel you can trust',
    description: "Read reviews & get reliable customer support. We're with you at every step.",
    icon: 'award',
  },
];

export default function BenefitsSection() {
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS);

  useEffect(() => {
    let isMounted = true;

    async function loadBenefits() {
      try {
        const data = await homeBenefitsService.getBenefits();
        const items = data.items || (Array.isArray(data) ? data : []);
        if (isMounted && items.length > 0) {
          setBenefits(items);
        }
      } catch {
        // Fallback
      }
    }

    loadBenefits();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="benefits-section-v2" aria-label="Why Travel With Us">
      <div className="container">
        {/* 4 Feature Columns */}
        <div className="benefits-four-grid">
          {benefits.slice(0, 4).map((item) => (
            <div key={item.id} className="benefit-v2-column">
              <div className="benefit-v2-icon-wrap">
                <BenefitVectorIcon iconName={item.icon} />
              </div>
              <h3 className="benefit-v2-title">{item.title}</h3>
              <p className="benefit-v2-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
