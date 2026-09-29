import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';

const TOUR_CATEGORIES = [
  {
    id: 1,
    slug: 'one-day-tours',
    transKey: 'cat_one_day_tours',
    defaultName: 'One Day Tours',
    subtitleEn: 'Quick Day Trips & Escapes',
    subtitleDe: 'Tagesausflüge & Kurztrips',
    image: '/uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    count: '8+ Tours',
    icon: '☀️',
  },
  {
    id: 2,
    slug: 'city-sightseeing-tours',
    transKey: 'cat_city_sightseeing',
    defaultName: 'City Sightseeing Tours',
    subtitleEn: 'Urban Exploration & Landmarks',
    subtitleDe: 'Stadtrundfahrten & Denkmäler',
    image: '/uploads/media/demo_thingstodo_citytour.jpg',
    count: '6+ Tours',
    icon: '🏙️',
  },
  {
    id: 3,
    slug: 'cultural-heritage-tours',
    transKey: 'cat_cultural_heritage',
    defaultName: 'Cultural & Heritage Tours',
    subtitleEn: 'Ancient Traditions & Architecture',
    subtitleDe: 'Alte Traditionen & Architektur',
    image: '/uploads/media/demo_tamilnadu_culture.jpg',
    count: '12+ Tours',
    icon: '🏛️',
  },
  {
    id: 4,
    slug: 'family-tours',
    transKey: 'cat_family_tours',
    defaultName: 'Family Tours',
    subtitleEn: 'Fun & Relaxing Vacations',
    subtitleDe: 'Erlebnisreiche Familienreisen',
    image: '/uploads/media/demo_services_food.jpg',
    count: '10+ Tours',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 5,
    slug: 'guided-tours',
    transKey: 'cat_guided_tours',
    defaultName: 'Guided Tours',
    subtitleEn: 'Expert Local Escorted Journeys',
    subtitleDe: 'Geführte Erlebnisreisen',
    image: '/uploads/media/demo_services_guide.jpg',
    count: '14+ Tours',
    icon: '🧭',
  },
  {
    id: 6,
    slug: 'historical-tours',
    transKey: 'cat_historical_tours',
    defaultName: 'Historical Tours',
    subtitleEn: 'Forts, Palaces & Dynasties',
    subtitleDe: 'Festungen & Paläste',
    image: '/uploads/media/demo_tamilnadu_thanjavur.jpg',
    count: '9+ Tours',
    icon: '🏰',
  },
  {
    id: 7,
    slug: 'pilgrimage-temple-tours',
    transKey: 'cat_pilgrimage_temple',
    defaultName: 'Pilgrimage & Temple Tours',
    subtitleEn: 'Sacred Shrines & Divine Darshan',
    subtitleDe: 'Heilige Tempel & Spiritualität',
    image: '/uploads/media/demo_tamilnadu_thiruvannamalai.jpg',
    count: '15+ Tours',
    icon: '🛕',
  },
  {
    id: 8,
    slug: 'private-tours',
    transKey: 'cat_private_tours',
    defaultName: 'Private Tours',
    subtitleEn: 'Custom Luxury Chauffeur Drives',
    subtitleDe: 'Exklusive Chauffeurreisen',
    image: '/uploads/media/demo_services_transportation.jpg',
    count: '11+ Tours',
    icon: '✨',
  },
];

export default function TourCategoriesSection() {
  const { t, language } = useLanguage();

  return (
    <section className="tour-categories-section page-section" aria-label="Popular Tour Categories">
      <div className="container">
        <div className="section-header-wrap text-center">
          <span className="section-badge">{t('sec_popular_categories_title', 'Choose Your Experience')}</span>
          <h2 className="section-title">
            {language === 'de' ? 'Beliebte Reise- & Tourenkategorien' : 'Find Popular Tour Types'}
          </h2>
          <p className="section-subtitle">
            {t('sec_popular_categories_sub', 'From peaceful spiritual journeys to breathtaking coastal getaways, explore curated travel categories.')}
          </p>
        </div>

        <div className="categories-grid">
          {TOUR_CATEGORIES.map((cat) => {
            const catTitle = t(cat.transKey, cat.defaultName);
            const subtitle = language === 'de' ? cat.subtitleDe : cat.subtitleEn;

            return (
              <Link
                key={cat.id}
                to={`/tours?category=${encodeURIComponent(cat.slug)}`}
                className="category-card"
              >
                <div className="category-img-wrapper">
                  <img
                    src={cat.image}
                    alt={catTitle}
                    loading="lazy"
                    className="category-bg-img"
                  />
                  <div className="category-gradient-overlay" />
                  <span className="category-count-badge">{cat.count}</span>
                </div>

                <div className="category-content">
                  <div className="category-icon-circle">{cat.icon}</div>
                  <h3 className="category-title">{catTitle}</h3>
                  <p className="category-subtitle">{subtitle}</p>
                  <span className="category-explore-link">
                    {t('nav_explore_tours', 'Explore Tours')} &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
