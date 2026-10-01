import { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaUrl } from '../../../utils/media';

const THINGS_TO_DO_ITEMS = [
  {
    id: 'city-tour',
    title: 'City Tour',
    subtitle: 'Guided Sightseeing & Urban Discoveries',
    image: getMediaUrl('/uploads/media/demo_thingstodo_citytour.jpg'),
    summary: 'Guided tours are a great way to experience South India with ease and comfort.',
    paragraphs: [
      'Guided tours are a great way to experience South India. Sit back in comfort or take the reins yourself — there is an excursion for every taste: get close to nature with birdwatching, wildlife, or cultural walking tours.',
      'Let someone else drive and relax while you enjoy hand-picked sightseeing, historical monuments, dynamic local markets, and scenic day tours tailored to your schedule.',
    ],
  },
  {
    id: 'art-culture',
    title: 'Art & Culture',
    subtitle: 'Timeless Heritage, Music & Architecture',
    image: getMediaUrl('/uploads/media/demo_thingstodo_art.jpg'),
    summary: 'The diversity of religious beliefs and royal dynasties has shaped a breathtaking cultural legacy.',
    paragraphs: [
      'The diversity of religious beliefs has had a profound impact on the arts of Southern India. Indian art can be traced back through millennia, showcasing rich architectural marvels and world-renowned UNESCO World Heritage Sites.',
      'Dravidian-style stone-carved temples reflect ancient mastery of sculpturing, classical Bharatanatyam dance, Carnatic music, and living folk traditions that captivate travelers worldwide.',
    ],
  },
  {
    id: 'wild-life',
    title: 'Wild Life',
    subtitle: 'Exotic Sanctuaries, Tigers & Natural Reserves',
    image: getMediaUrl('/uploads/media/demo_thingstodo_wildlife.jpg'),
    summary: 'South India is rich in flora and fauna with some of the most exotic wild species in Asia.',
    paragraphs: [
      'South India is home to pristine Western Ghats, rainforests, and national parks harboring over 500 species of mammals, 1,200 varieties of birds, and rich biodiversity.',
      'Experience thrilling elephant corridors in Wayanad and Periyar, spot royal Bengal tigers in Nagarhole and Bandipur, and explore lush wildlife reserves surrounded by mist-clad mountains.',
    ],
  },
  {
    id: 'restaurants',
    title: 'Restaurants',
    subtitle: 'Authentic Flavors, Spices & Regional Cuisines',
    image: getMediaUrl('/uploads/media/demo_thingstodo_restaurants.jpg'),
    summary: 'South Indian cuisine is globally celebrated for its rich spices, coconut aromas, and delicious varieties.',
    paragraphs: [
      'The traditional food of South India is widely appreciated for its exquisite blend of aromatic spices, curry leaves, and traditional culinary craftsmanship across states.',
      'Savor iconic crispy Dosas, fluffy Idlis, and aromatic filter coffee in Tamil Nadu, Malabar parottas and Karimeen in Kerala, delectable Bisi Bele Bath in Karnataka, and fresh coastal delicacies in Goa.',
    ],
  },
  {
    id: 'drinks',
    title: 'Bars & Drinks',
    subtitle: 'Vibrant Nightlife, Beach Lounges & Cafes',
    image: getMediaUrl('/uploads/media/demo_thingstodo_drinks.jpg'),
    summary: 'Experience the electric evening atmosphere, scenic sunset cafes, and lively beachside lounges.',
    paragraphs: [
      'South India offers a diverse and burgeoning nightlife scene ranging from trendy rooftop cocktail lounges in metropolitan hubs to relaxing beach shacks in Goa and Pondicherry.',
      'Enjoy live musical performances, craft breweries, beachside jazz evenings, and sunset retreats after an exhilarating day of exploration.',
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping',
    subtitle: 'Silk Sarees, Spices, Handicrafts & Modern Malls',
    image: getMediaUrl('/uploads/media/demo_thingstodo_shopping.jpg'),
    summary: 'South India is a true shopper’s paradise with traditional bazaars and artisan workshops.',
    paragraphs: [
      'Discover an astonishing variety of treasures to take home: authentic Kanchipuram pure silk sarees, sandalwood carvings, hand-painted bronze deities, Tanjore paintings, and world-class Nilgiri tea and spices.',
      'Stroll through vibrant heritage bazaars, government silk emporiums, and modern shopping complexes offering both traditional crafts and contemporary luxury.',
    ],
  },
];

export default function ThingsToDoSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const timerRef = useRef(null);

  const activeItem = THINGS_TO_DO_ITEMS[activeIndex];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % THINGS_TO_DO_ITEMS.length);
  }, []);

  // Auto-slide every 4.5 seconds when not paused or modal open
  useEffect(() => {
    if (isPaused || activeModalItem) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeModalItem, handleNext]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      className="things-to-do-section page-section"
      id="ThingsToDo"
      aria-label="Things To Do in South India"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header-wrap text-center">
          <div className="ttd-badge-pill">
            <span>Experiences & Activities</span>
          </div>
          <h2 className="ttd-main-heading">
            Things <span className="ttd-highlight-word">To Do</span>
          </h2>
          <div className="ttd-intro-box">
            <p className="ttd-intro-text">
              Whether planning a <strong>family vacation, religious and cultural trip, wildlife explore, or a romantic getaway</strong>, you&apos;ll find that <strong>South India</strong> is home to an amazing variety of attractions and activities. Browse through our curated experiences to <strong>discover fascinating new destinations</strong> and memorable things to do.
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Interactive Sliding Showcase */}
        <div className="ttd-showcase-container desk-view">
          {/* Left Column: Interactive Navigation Tabs */}
          <div className="ttd-nav-column">
            <div className="ttd-tabs-list" role="tablist" aria-label="Activity Categories">
              {THINGS_TO_DO_ITEMS.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`ttd-tab-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="ttd-tab-indicator" />
                    <span className="ttd-tab-label">{item.title}</span>
                    <svg className="ttd-tab-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Column: Dynamic Featured Zoom Preview Image with Modal Trigger */}
          <div className="ttd-feature-column">
            <div
              className="ttd-feature-card"
              onClick={() => setActiveModalItem(activeItem)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveModalItem(activeItem);
                }
              }}
              aria-label={`View full details for ${activeItem.title}`}
            >
              <div className="ttd-feature-img-wrapper">
                <img
                  key={activeItem.id}
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="ttd-feature-img"
                  loading="lazy"
                />
                <div className="ttd-feature-overlay" />
                <div className="ttd-feature-badge-wrap">
                  <span className="ttd-active-tag">Active Experience</span>
                </div>
                <div className="ttd-feature-caption">
                  <h3 className="ttd-feature-title">{activeItem.title}</h3>
                  <p className="ttd-feature-sub">{activeItem.subtitle}</p>
                  <span className="ttd-btn-view-modal">
                    Click to View Details &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Slider Thumbnails */}
          <div className="ttd-thumbs-column">
            <div className="ttd-thumbs-track">
              {THINGS_TO_DO_ITEMS.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <div
                    key={item.id}
                    className={`ttd-thumb-card ${isActive ? 'is-active-thumb' : ''}`}
                    onClick={() => setActiveIndex(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveIndex(index);
                      }
                    }}
                  >
                    <div className="ttd-thumb-img-box">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="ttd-thumb-img"
                        loading="lazy"
                      />
                      <div className="ttd-thumb-overlay" />
                    </div>
                    <div className="ttd-thumb-meta">
                      <span className="ttd-thumb-title">{item.title}</span>
                      <button
                        type="button"
                        className="ttd-thumb-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalItem(item);
                        }}
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile View: Horizontal Carousel Slider Cards */}
        <div className="ttd-mobile-carousel mob-view">
          <div className="ttd-mobile-track">
            {THINGS_TO_DO_ITEMS.map((item) => (
              <div
                key={item.id}
                className="ttd-mob-card"
                onClick={() => setActiveModalItem(item)}
              >
                <div className="ttd-mob-img-box">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="ttd-mob-img"
                    loading="lazy"
                  />
                  <div className="ttd-mob-overlay" />
                </div>
                <div className="ttd-mob-content">
                  <h4 className="ttd-mob-title">{item.title}</h4>
                  <p className="ttd-mob-sub">{item.subtitle}</p>
                  <button
                    type="button"
                    className="ttd-mob-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalItem(item);
                    }}
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rich Interactive Modal Popup */}
      {activeModalItem && (
        <div
          className="ttd-modal-backdrop"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ttd-modal-title"
        >
          <div
            className="ttd-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="ttd-modal-header">
              <h3 id="ttd-modal-title" className="ttd-modal-heading">
                {activeModalItem.title}
              </h3>
              <button
                type="button"
                className="ttd-modal-close-btn"
                onClick={() => setActiveModalItem(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="ttd-modal-body">
              <div className="ttd-modal-img-col">
                <img
                  src={activeModalItem.image}
                  alt={activeModalItem.title}
                  className="ttd-modal-img"
                />
              </div>
              <div className="ttd-modal-text-col">
                <h4 className="ttd-modal-sub">{activeModalItem.subtitle}</h4>
                {activeModalItem.paragraphs.map((p, idx) => (
                  <p key={idx} className="ttd-modal-paragraph">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="ttd-modal-footer">
              <button
                type="button"
                className="ttd-modal-btn-close"
                onClick={() => setActiveModalItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
