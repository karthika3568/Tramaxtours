import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import destinationService from '../../services/destinationService';
import tourService from '../../services/tourService';
import TourCard from '../../components/public/tours/TourCard';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { updatePageMeta } from '../../utils/metadata';
import { getMediaUrl } from '../../utils/media';

function formatSlugName(slug) {
  if (!slug) return 'Destination';
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function DestinationDetailPage() {
  const { slug } = useParams();
  const cleanSlug = (slug || '').toLowerCase().trim();

  const [destination, setDestination] = useState(null);
  const [destinationTours, setDestinationTours] = useState([]);
  const [otherDestinations, setOtherDestinations] = useState([]);
  const [openSeasonalIndex, setOpenSeasonalIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadDestinationData() {
      try {
        setLoading(true);
        setError(null);

        const destData = await destinationService.getDestination(slug);
        if (!mounted) return;

        setDestination(destData);
        updatePageMeta({
          title: destData.seo_title || destData.name,
          description:
            destData.seo_description ||
            destData.short_description ||
            `Discover travel itineraries and tour experiences in ${destData.name}.`,
          ogImage: destData.og_image?.file_path
            ? getMediaUrl(destData.og_image)
            : destData.featured_image?.file_path
              ? getMediaUrl(destData.featured_image)
              : undefined,
        });

        // Tours genuinely linked to this destination (existing tour -> destination_id relationship)
        try {
          const toursRes = await tourService.getTours({
            destination_id: destData.id,
            status: 'published',
            limit: 8,
          });
          if (mounted) {
            setDestinationTours(toursRes.items || []);
          }
        } catch {
          if (mounted) setDestinationTours([]);
        }

        // Other active destinations, reusing the same destination service/data as the homepage
        try {
          const destsRes = await destinationService.getDestinations({ limit: 12 });
          if (mounted) {
            setOtherDestinations((destsRes.items || []).filter((d) => d.slug !== cleanSlug));
          }
        } catch {
          if (mounted) setOtherDestinations([]);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || `We could not find destination "${slug}".`);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDestinationData();

    return () => {
      mounted = false;
    };
  }, [slug, cleanSlug]);

  if (loading) {
    return (
      <div className="detail-loading-page container py-16">
        <Loading message="Loading destination details..." />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="detail-error-page container py-16">
        <ErrorState
          title="Destination Not Found"
          message={error || `We could not find destination "${slug}".`}
          retryText="Back to Destinations"
          onRetry={() => {
            window.location.href = '/destinations';
          }}
        />
      </div>
    );
  }

  const displayName = destination.name || formatSlugName(cleanSlug);
  const heroImgUrl = getMediaUrl(destination.featured_image);
  const historyImgUrl = getMediaUrl(destination.intro_media || destination.featured_image);
  const historyParagraphs = (destination.intro_content || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const seasonalItems = (destination.sections || [])
    .filter((s) => s.section_type === 'seasonal_activities' && s.status === 'active')
    .sort((a, b) => a.display_order - b.display_order);

  const quickFacts = [
    { icon: '🌐', label: 'Language', value: destination.language },
    { icon: '💰', label: 'Currency', value: destination.currency },
    { icon: '🙏', label: 'Religion', value: destination.religion },
    { icon: '⏰', label: 'Timezone', value: destination.timezone },
    { icon: '🛕', label: 'Heritage', value: destination.heritage },
  ].filter((f) => f.value);

  return (
    <div className="destination-detail-page-v2">
      {/* 1-3. Breadcrumb, Title, Short Description */}
      <div className="dest-header-section container">
        <nav className="dest-breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/" className="dest-breadcrumb-link">
            Home
          </Link>
          <span className="dest-breadcrumb-separator">/</span>
          <Link to="/destinations" className="dest-breadcrumb-link">
            Destinations
          </Link>
          <span className="dest-breadcrumb-separator">/</span>
          <span className="dest-breadcrumb-current">{displayName}</span>
        </nav>

        <h1 className="dest-main-title">{displayName}</h1>
        {destination.short_description && (
          <p className="dest-main-tagline">{destination.short_description}</p>
        )}
      </div>

      {/* 4. Large Destination Hero Image */}
      {destination.featured_image && (
        <div className="container dest-hero-image-section">
          <div className="dest-media-card-3d">
            <img
              src={heroImgUrl}
              alt={displayName}
              className="dest-media-img dest-hero-media-img"
              loading="eager"
            />
          </div>
        </div>
      )}

      {/* 5. Quick Facts */}
      {quickFacts.length > 0 && (
        <div className="container dest-quick-info-container">
          <div className="dest-quick-facts-bar">
            {quickFacts.map((fact) => (
              <div className="dest-fact-item" key={fact.label}>
                <span className="dest-fact-icon">{fact.icon}</span>
                <div className="dest-fact-text">
                  <span className="dest-fact-label">{fact.label}</span>
                  <span className="dest-fact-value">{fact.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. History & Culture */}
      {(destination.intro_heading || historyParagraphs.length > 0) && (
        <section className="container dest-history-section" aria-label="History and Culture">
          <div className="dest-history-grid">
            <div className="dest-history-content">
              {destination.intro_label && (
                <span className="dest-section-pill">{destination.intro_label}</span>
              )}
              {destination.intro_heading && (
                <h2 className="dest-section-heading">{destination.intro_heading}</h2>
              )}
              <div className="dest-paragraphs-body">
                {historyParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            <div className="dest-history-media-wrap">
              <div className="dest-media-card-3d">
                <img
                  src={historyImgUrl}
                  alt={`${displayName} Heritage`}
                  className="dest-media-img"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Seasonal Activities */}
      {seasonalItems.length > 0 && (
        <section className="container dest-seasonal-section" aria-label="Seasonal Activities">
          <div className="dest-seasonal-grid">
            <div className="dest-seasonal-media-wrap">
              <div className="dest-media-card-3d">
                <img
                  src={getMediaUrl(seasonalItems[openSeasonalIndex ?? 0]?.media || destination.featured_image)}
                  alt={`${displayName} Experiences`}
                  className="dest-media-img"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="dest-seasonal-content">
              <h2 className="dest-section-heading">Seasonal Activities</h2>
              <div className="dest-accordion-group">
                {seasonalItems.map((item, idx) => {
                  const isOpen = openSeasonalIndex === idx;
                  return (
                    <div key={item.id} className={`dest-accordion-item ${isOpen ? 'is-open' : ''}`}>
                      <button
                        type="button"
                        className="dest-accordion-header"
                        onClick={() => setOpenSeasonalIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="dest-accordion-title">{item.title}</span>
                        <span className="dest-accordion-toggle">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="dest-accordion-body">
                          <p>{item.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Destination Tours */}
      <section className="container dest-tours-section" aria-label="Tours and Experiences">
        <div className="dest-tours-header-row">
          <div>
            <h2 className="dest-section-heading">Tours in {displayName}</h2>
            <p className="dest-section-sub">Handcrafted private departures and day excursions</p>
          </div>
          <Link to={`/tours?destination_id=${destination.id}`} className="dest-view-all-btn">
            View All Tours &rarr;
          </Link>
        </div>

        {destinationTours.length > 0 ? (
          <div className="tours-two-column-grid dest-tours-grid">
            {destinationTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No Tours Listed for ${displayName}`}
            message="We are currently curating new bespoke itineraries for this destination. Please contact our tour desk for a custom itinerary."
          />
        )}
      </section>

      {/* 9. Top Destinations for Your Next Vacation */}
      {otherDestinations.length > 0 && (
        <section className="container dest-top-destinations-section" aria-label="Top Destinations">
          <div className="dest-tours-header-row">
            <div>
              <h2 className="dest-section-heading">Top Destinations for your next vacation</h2>
              <p className="dest-section-sub">Explore South India&rsquo;s most celebrated states &amp; coastal getaways</p>
            </div>
            <Link to="/destinations" className="dest-view-all-btn">
              All Destinations &rarr;
            </Link>
          </div>

          <div className="dest-top-cards-grid">
            {otherDestinations.map((d) => (
              <article key={d.slug} className="dest-thumb-card">
                <Link to={`/destinations/${d.slug}`} className="dest-thumb-media">
                  <img src={getMediaUrl(d.featured_image)} alt={d.name} loading="lazy" className="dest-thumb-img" />
                  <div className="dest-thumb-overlay" />
                  <div className="dest-thumb-content">
                    <h3 className="dest-thumb-name">{d.name}</h3>
                    <p className="dest-thumb-desc">{d.short_description}</p>
                    <span className="dest-thumb-btn">See all tours &rarr;</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Quick Inquiry Card / Chauffeur Banner */}
      <div className="container dest-inquiry-banner-container">
        <div className="dest-inquiry-banner">
          <div className="dest-inquiry-left">
            <span className="dest-inquiry-badge">Bespoke Foreign Tourism</span>
            <h3 className="dest-inquiry-title">Ready to Experience {displayName}?</h3>
            <p className="dest-inquiry-desc">
              Speak directly with our senior tour coordinator to arrange tailored AC vehicle transfers, licensed
              guides, and luxury stays.
            </p>
            <div className="dest-inquiry-contacts">
              <a href="tel:+918072566010" className="dest-contact-pill">
                📞 +91 80725 66010
              </a>
              <a href="tel:+919840291110" className="dest-contact-pill">
                📞 +91 98402 91110
              </a>
              <a href="mailto:info@tramaxtours.com" className="dest-contact-pill">
                ✉️ info@tramaxtours.com
              </a>
            </div>
          </div>
          <div className="dest-inquiry-right">
            <Link to="/contact" className="btn btn-primary dest-inquiry-cta">
              Plan Custom Itinerary &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
