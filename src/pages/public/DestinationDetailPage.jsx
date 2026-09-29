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

const ALL_DESTINATIONS_NAV = [
  {
    slug: 'tamil-nadu',
    name: 'Tamil Nadu',
    image: '/uploads/media/demo_home_tamilnadu.jpg',
    description: 'Discover Tamil Nadu with our tours.',
  },
  {
    slug: 'kerala',
    name: 'Kerala',
    image: '/uploads/media/demo_home_kerala.jpg',
    description: 'Discover Kerala with our tours.',
  },
  {
    slug: 'karnataka',
    name: 'Karnataka',
    image: '/uploads/media/demo_home_karnataka.jpg',
    description: 'Discover Karnataka with our tours.',
  },
  {
    slug: 'goa',
    name: 'Goa',
    image: '/uploads/media/demo_home_goa.jpg',
    description: 'Discover Goa with our tours.',
  },
];

const DESTINATION_DETAILS_MAP = {
  'tamil-nadu': {
    name: 'Tamil Nadu',
    tagline: 'Discover Tamil Nadu with our tours.',
    language: 'English & Tamil',
    currency: 'Rupee (INR) / € Euro',
    religion: 'Hinduism & Ancient Living Heritage',
    timezone: 'GMT+5:30',
    historySubheading: 'Tamil Nadu is ancient, Tamil Nadu is eternal',
    historyTitle: 'History of the Land of Temples & Timeless Culture',
    historyParagraphs: [
      'Tamil Nadu is one of the world’s oldest living civilizations, with a history that stretches back over 5,000 years. Renowned for its classical heritage, the region flourished under powerful dynasties such as the Cholas, Cheras, Pandyas, Pallavas, and Vijayanagara rulers, who shaped South India through monumental architecture, literature, trade, and spiritual traditions.',
      'The state is celebrated as the Land of Temples, home to magnificent Dravidian marvels like Brihadeeswarar Temple, Meenakshi Amman Temple, Shore Temple, and Ekambareswarar Temple. Beyond architecture, Tamil Nadu is the birthplace of Tamil language, one of the oldest classical languages in the world, and a vibrant center for Bharatanatyam, Carnatic music, silk weaving, bronze sculptures, and spiritual philosophy. Today, Tamil Nadu seamlessly blends ancient traditions with modern life, offering travelers a deeply enriching cultural journey.',
    ],
    historyImage: '/uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    seasonalImage: '/uploads/media/demo_tamilnadu_chennai.jpg',
    seasonalFaqs: [
      {
        title: 'Best Time to Visit',
        content:
          'Tamil Nadu can be explored throughout the year, but the most pleasant season is from October to March, when the climate is ideal for temple visits, heritage walks, hill stations, and coastal sightseeing.',
      },
      {
        title: 'Comfortable Private Sightseeing',
        content:
          'Discover Tamil Nadu in comfort with private, air-conditioned transportation and a dedicated chauffeur guide, allowing flexible itineraries across cities, temples, hill stations, and coastal destinations at your own pace.',
      },
      {
        title: 'Cultural & Heritage Experiences',
        content:
          'Experience the soul of South India through ancient temples, UNESCO heritage sites, classical arts, traditional villages, spiritual centers, and vibrant local festivals that reflect Tamil Nadu’s timeless identity.',
      },
      {
        title: 'Flexible Tour Across All Seasons',
        content:
          'Tamil Nadu tours are available year-round, with itineraries customized to suit seasonal conditions, festival calendars, and traveler preferences—perfect for families, pilgrims, culture lovers, and explorers alike.',
      },
    ],
  },
  kerala: {
    name: 'Kerala',
    tagline: 'Discover Kerala with our tours.',
    language: 'English & Malayalam',
    currency: 'Rupee (INR) / € Euro',
    religion: 'Cosmopolitan Heritage & Wellness',
    timezone: 'GMT+5:30',
    historySubheading: 'God’s Own Country — Nature, Backwaters & Wellness',
    historyTitle: 'Enchanting Palm Groves, Spice Hills & Serene Waters',
    historyParagraphs: [
      'Kerala is a tropical paradise acclaimed worldwide for its tranquil emerald backwaters, misty Western Ghat hill stations, pristine Arabian Sea coastlines, and ancient Ayurvedic healing traditions.',
      'Flourishing through centuries of spice trade with Arab, Roman, and European mariners, Kerala offers an exquisite tapestry of Kathakali dance, temple festivals, tea plantations, and backwater houseboats. From the rolling hills of Munnar to the palm-fringed canals of Alleppey and the vibrant spice markets of Fort Kochi, Kerala offers a serene rejuvenation of mind, body, and soul.',
    ],
    historyImage: '/uploads/media/demo_home_kerala.jpg',
    seasonalImage: '/uploads/media/demo_carousel_kerala.jpg',
    seasonalFaqs: [
      {
        title: 'Best Time to Visit',
        content:
          'The ideal season to explore Kerala is between September and March for cool pleasant backwater cruises, and June to August for authentic monsoon Ayurvedic wellness therapies.',
      },
      {
        title: 'Private Houseboat & Chauffeur Safaris',
        content:
          'Sail along serene backwaters in luxury air-conditioned houseboats with private chef and dedicated guide, complemented by private transfers across tea estates and coastal sanctuaries.',
      },
      {
        title: 'Spice Trails & Wildlife Safaris',
        content:
          'Walk through fragrant cardamom, pepper, and vanilla plantations in Thekkady, and cruise Lake Periyar to view wild elephants, exotic birds, and tropical flora in their natural habitat.',
      },
      {
        title: 'Holistic Ayurveda & Classical Arts',
        content:
          'Experience time-honored Ayurvedic rejuvenation treatments, witness dramatic Kathakali dance performances, and discover Kalaripayattu martial art demonstrations.',
      },
    ],
  },
  karnataka: {
    name: 'Karnataka',
    tagline: 'Discover Karnataka with our tours.',
    language: 'English & Kannada',
    currency: 'Rupee (INR) / € Euro',
    religion: 'Ancient Living Traditions',
    timezone: 'GMT+5:30',
    historySubheading: 'One State, Many Worlds',
    historyTitle: 'Royal Palaces, Ancient Hampi & Coffee Mist Hills',
    historyParagraphs: [
      'Karnataka is a mesmerizing land of royal opulence and UNESCO architectural treasures. Home to the legendary Vijayanagara Empire capital of Hampi, the stone-carved temples of Belur and Halebidu, the regal Mysore Palace, and aromatic coffee hills of Coorg and Chikmagalur.',
      'Karnataka seamlessly bridges historic grandeur with lush wildlife national parks and vibrant cultural life. Experience royal heritage, wildlife safaris in Bandipur and Nagarhole, and breathtaking waterfalls cascading down the Western Ghats.',
    ],
    historyImage: '/uploads/media/demo_home_karnataka.jpg',
    seasonalImage: '/uploads/media/demo_carousel_karnataka.jpg',
    seasonalFaqs: [
      {
        title: 'Best Time to Visit',
        content:
          'October to April provides cool, sunny weather perfect for exploring the rock-cut monuments of Hampi, Mysore Palace festivities, and wildlife safaris.',
      },
      {
        title: 'Royal Heritage & Architectural Wonders',
        content:
          'Marvel at the illuminated Mysore Palace, explore the boulder-strewn ruins of the UNESCO Vijayanagara Empire in Hampi, and study the intricate Hoysala temple carvings.',
      },
      {
        title: 'Coffee Plantations & Nature Escapes',
        content:
          'Immerse yourself in lush coffee and spice estates in Coorg and Chikmagalur, staying in luxury plantation bungalows with private nature walks.',
      },
      {
        title: 'Wildlife Safaris & Nature Sanctuaries',
        content:
          'Embark on private guided Jeep safaris in Kabini and Bandipur Tiger Reserve to encounter wild Bengal tigers, leopards, and herds of Asian elephants.',
      },
    ],
  },
  goa: {
    name: 'Goa',
    tagline: 'Discover Goa with our tours.',
    language: 'English & Konkani',
    currency: 'Rupee (INR) / € Euro',
    religion: 'Coastal Heritage & Christianity',
    timezone: 'GMT+5:30',
    historySubheading: 'Sun, Sand, Spice & Portuguese Heritage',
    historyTitle: 'Golden Beaches, Baroque Cathedrals & Vibrant Coastlines',
    historyParagraphs: [
      'Goa is India’s most celebrated coastal haven, blessed with sun-drenched Arabian Sea beaches, UNESCO World Heritage Baroque churches of Old Goa, spice plantations, and historic Portuguese mansions.',
      'Offering a unique fusion of Indian hospitality and European charm, Goa provides unforgettable beachside relaxation, heritage walks, river cruises, and flavorful coastal dining.',
    ],
    historyImage: '/uploads/media/demo_home_goa.jpg',
    seasonalImage: '/uploads/media/demo_carousel_goa.jpg',
    seasonalFaqs: [
      {
        title: 'Best Time to Visit',
        content:
          'November to March is the peak season with sunny skies, warm tropical waters, and vibrant seaside cafe culture.',
      },
      {
        title: 'Old Goa & UNESCO Baroque Churches',
        content:
          'Visit the Basilica of Bom Jesus and Se Cathedral, showcasing magnificent 16th-century Portuguese architecture and sacred art.',
      },
      {
        title: 'Spice Plantations & Mandovi River Cruises',
        content:
          'Take an aromatic walking tour through organic spice plantations followed by private sunset cruises along the Mandovi River.',
      },
      {
        title: 'Private Chauffeur Coastal Explorations',
        content:
          'Travel in sanitized luxury private vehicles to explore hidden beaches in South Goa, historic forts like Fort Aguada and Chapora, and traditional Latin Quarter villas.',
      },
    ],
  },
};

export default function DestinationDetailPage() {
  const { slug } = useParams();
  const [destination, setDestination] = useState(null);
  const [relatedTours, setRelatedTours] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cleanSlug = (slug || '').toLowerCase().trim();
  const staticDetails = DESTINATION_DETAILS_MAP[cleanSlug] || {
    name: destination?.name || formatSlugName(cleanSlug),
    tagline: `Discover ${destination?.name || formatSlugName(cleanSlug)} with our tours.`,
    language: 'English & Regional',
    currency: 'Rupee (INR) / € Euro',
    religion: 'Ancient Living Traditions',
    timezone: 'GMT+5:30',
    historySubheading: 'Timeless Heritage & Living Culture',
    historyTitle: `History & Culture of ${destination?.name || formatSlugName(cleanSlug)}`,
    historyParagraphs: [
      destination?.intro_content ||
        `Explore the breathtaking landscapes, ancient monuments, and vibrant cultural traditions of ${destination?.name || formatSlugName(cleanSlug)}.`,
    ],
    historyImage: destination?.featured_image?.file_path || '/uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    seasonalImage: '/uploads/media/demo_landingpage.jpg',
    seasonalFaqs: [
      {
        title: 'Best Time to Visit',
        content: 'October to March offers ideal weather for comfortable sightseeing, heritage tours, and cultural exploration.',
      },
      {
        title: 'Comfortable Private Sightseeing',
        content: 'Discover this destination in comfort with private, air-conditioned transportation and a dedicated local chauffeur guide.',
      },
      {
        title: 'Cultural & Heritage Experiences',
        content: 'Experience ancient monuments, classical arts, vibrant local festivals, and delicious regional culinary delicacies.',
      },
      {
        title: 'Flexible Tour Across All Seasons',
        content: 'Tours are available year-round, customized to match your preferred travel pace and comfort requirements.',
      },
    ],
  };

  useEffect(() => {
    let mounted = true;

    async function loadDestinationData() {
      try {
        setLoading(true);
        setError(null);

        let destData = null;
        try {
          destData = await destinationService.getDestination(slug);
        } catch {
          // Soft fallback to static detail if API is empty
          destData = {
            id: null,
            slug: cleanSlug,
            name: staticDetails.name,
            short_description: staticDetails.tagline,
          };
        }

        if (mounted && destData) {
          setDestination(destData);

          updatePageMeta({
            title: `${destData.name || staticDetails.name} — Tramax Tours`,
            description:
              destData.short_description ||
              staticDetails.tagline ||
              `Discover travel itineraries and tour experiences in ${destData.name}.`,
          });
        }

        // Fetch related tours for this destination
        try {
          const toursRes = await tourService.getTours({
            limit: 48,
            status: 'published',
          });
          const allItems = toursRes.items || (Array.isArray(toursRes) ? toursRes : []);

          // Filter matching tours
          const matched = allItems.filter((t) => {
            const dSlug = (t.destination?.slug || t.dest_slug || '').toLowerCase();
            const dName = (t.destination?.name || t.destination_name || '').toLowerCase();
            const tTitle = (t.title || '').toLowerCase();
            const target = cleanSlug.replace(/-/g, ' ');

            return (
              dSlug.includes(cleanSlug) ||
              cleanSlug.includes(dSlug) ||
              dName.includes(target) ||
              tTitle.includes(target) ||
              (cleanSlug === 'tamil-nadu' &&
                (dSlug.includes('chennai') ||
                  dSlug.includes('mahabalipuram') ||
                  dSlug.includes('kanchipuram') ||
                  tTitle.includes('chennai') ||
                  tTitle.includes('mahabalipuram') ||
                  tTitle.includes('kanchipuram'))) ||
              (cleanSlug === 'pondicherry' && (dSlug.includes('pondicherry') || tTitle.includes('pondicherry')))
            );
          });

          if (mounted) {
            setRelatedTours(matched.length > 0 ? matched : allItems.slice(0, 4));
          }
        } catch {
          if (mounted) {
            setRelatedTours([]);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load destination details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDestinationData();

    return () => {
      mounted = false;
    };
  }, [slug, cleanSlug, staticDetails.name, staticDetails.tagline]);

  if (loading) {
    return (
      <div className="detail-loading-page container py-16">
        <Loading message="Loading destination details..." />
      </div>
    );
  }

  if (error && !destination) {
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

  const displayName = destination?.name || staticDetails.name;
  const historyImgUrl = getMediaUrl(
    destination?.featured_image?.file_path || destination?.featured_image || staticDetails.historyImage
  );
  const seasonalImgUrl = getMediaUrl(staticDetails.seasonalImage);

  const otherDestinations = ALL_DESTINATIONS_NAV.filter((d) => d.slug !== cleanSlug);

  return (
    <div className="destination-detail-page-v2">
      {/* 1. Breadcrumbs & Top Header */}
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
        <p className="dest-main-tagline">{destination?.short_description || staticDetails.tagline}</p>
      </div>

      {/* 2. Quick Info Green Bar */}
      <div className="container dest-quick-info-container">
        <div className="dest-quick-facts-bar">
          <div className="dest-fact-item">
            <span className="dest-fact-icon">🌐</span>
            <div className="dest-fact-text">
              <span className="dest-fact-label">Language</span>
              <span className="dest-fact-value">{staticDetails.language}</span>
            </div>
          </div>

          <div className="dest-fact-item">
            <span className="dest-fact-icon">💰</span>
            <div className="dest-fact-text">
              <span className="dest-fact-label">Currency</span>
              <span className="dest-fact-value">{staticDetails.currency}</span>
            </div>
          </div>

          <div className="dest-fact-item">
            <span className="dest-fact-icon">🛕</span>
            <div className="dest-fact-text">
              <span className="dest-fact-label">Heritage</span>
              <span className="dest-fact-value">{staticDetails.religion}</span>
            </div>
          </div>

          <div className="dest-fact-item">
            <span className="dest-fact-icon">⏰</span>
            <div className="dest-fact-text">
              <span className="dest-fact-label">Timezone</span>
              <span className="dest-fact-value">{staticDetails.timezone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. History & Culture 2-Column Section */}
      <section className="container dest-history-section" aria-label="History and Heritage">
        <div className="dest-history-grid">
          <div className="dest-history-content">
            <span className="dest-section-pill">{staticDetails.historySubheading}</span>
            <h2 className="dest-section-heading">{staticDetails.historyTitle}</h2>
            <div className="dest-paragraphs-body">
              {staticDetails.historyParagraphs.map((para, i) => (
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

      {/* 4. Seasonal Activities & Accordion 2-Column Section */}
      <section className="container dest-seasonal-section" aria-label="Seasonal Activities">
        <div className="dest-seasonal-grid">
          <div className="dest-seasonal-media-wrap">
            <div className="dest-media-card-3d">
              <img
                src={seasonalImgUrl}
                alt={`${displayName} Experiences`}
                className="dest-media-img"
                loading="lazy"
              />
            </div>
          </div>

          <div className="dest-seasonal-content">
            <h2 className="dest-section-heading">Seasonal Activities & Travel Insights</h2>
            <div className="dest-accordion-group">
              {staticDetails.seasonalFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className={`dest-accordion-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="dest-accordion-header"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="dest-accordion-title">{faq.title}</span>
                      <span className="dest-accordion-toggle">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="dest-accordion-body">
                        <p>{faq.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tours & Experiences Section */}
      <section className="container dest-tours-section" aria-label="Tours and Experiences">
        <div className="dest-tours-header-row">
          <div>
            <h2 className="dest-section-heading">Tours &amp; Experiences in {displayName}</h2>
            <p className="dest-section-sub">Handcrafted private departures and day excursions</p>
          </div>
          <Link to={`/tours?destination=${encodeURIComponent(cleanSlug)}`} className="dest-view-all-btn">
            View All Tours &rarr;
          </Link>
        </div>

        {relatedTours.length > 0 ? (
          <div className="tours-two-column-grid dest-tours-grid">
            {relatedTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No Tours Listed for ${displayName}`}
            message="We are currently curating new bespoke itineraries for this destination. Please contact our tour desk for a custom safari."
          />
        )}
      </section>

      {/* 6. Top Destination for Your Next Vacation Slider/Grid */}
      <section className="container dest-top-destinations-section" aria-label="Top Destinations">
        <div className="dest-tours-header-row">
          <div>
            <h2 className="dest-section-heading">Top Destinations for your next vacation</h2>
            <p className="dest-section-sub">Explore South India’s most celebrated states &amp; coastal getaways</p>
          </div>
          <Link to="/destinations" className="dest-view-all-btn">
            All Destinations &rarr;
          </Link>
        </div>

        <div className="dest-top-cards-grid">
          {otherDestinations.map((d) => (
            <article key={d.slug} className="dest-thumb-card">
              <Link to={`/destinations/${d.slug}`} className="dest-thumb-media">
                <img src={d.image} alt={d.name} loading="lazy" className="dest-thumb-img" />
                <div className="dest-thumb-overlay" />
                <div className="dest-thumb-content">
                  <h3 className="dest-thumb-name">{d.name}</h3>
                  <p className="dest-thumb-desc">{d.description}</p>
                  <span className="dest-thumb-btn">See all tours &rarr;</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Quick Inquiry Card / Chauffeur Banner */}
      <div className="container dest-inquiry-banner-container">
        <div className="dest-inquiry-banner">
          <div className="dest-inquiry-left">
            <span className="dest-inquiry-badge">Bespoke Foreign Tourism</span>
            <h3 className="dest-inquiry-title">Ready to Experience {displayName}?</h3>
            <p className="dest-inquiry-desc">
              Speak directly with our senior tour coordinator P. Kishore to arrange tailored AC vehicle transfers, licensed guides, and luxury stays.
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

function formatSlugName(slug) {
  if (!slug) return 'Destination';
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

