import { CalendarIcon, ClockIcon, CompassIcon, MapPinIcon, SearchIcon } from '../../common/Icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';

export default function HomeSearchSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchDestination, setSearchDestination] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDuration, setSearchDuration] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination) {
      params.set('destination', searchDestination);
      // If it's a specific city / location under Tamil Nadu, also add search keyword so ToursPage filters properly
      const cityKeywords = {
        'chennai': 'chennai',
        'mahabalipuram': 'mahabalipuram',
        'kanchipuram': 'kanchipuram',
        'pondicherry': 'pondicherry',
      };
      if (cityKeywords[searchDestination]) {
        params.set('search', cityKeywords[searchDestination]);
      }
    }
    if (searchCategory) params.set('category', searchCategory);
    if (searchDuration) params.set('duration', searchDuration);
    if (searchDate) params.set('date', searchDate);

    navigate(`/tours?${params.toString()}`);
  };

  return (
    <section className="home-search-standalone-section" aria-label="Find Your Tour">
      <div className="container">
        <form onSubmit={handleSearchSubmit} className="home-search-widget-bar">
          {/* Destination Field */}
          <div className="search-widget-col">
            <label htmlFor="search-dest-select" className="search-widget-label">
              <MapPinIcon size={14} color="#01aa90" />
              <span>{t('search_where_to', 'WHERE TO?')}</span>
            </label>
            <div className="search-select-wrapper">
              <select
                id="search-dest-select"
                className="search-widget-select"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
              >
                <option value="">{t('search_category_all', 'All Destinations')}</option>
                <option value="tamil-nadu">Tamil Nadu</option>
                <option value="chennai">Chennai</option>
                <option value="mahabalipuram">Mahabalipuram</option>
                <option value="kanchipuram">Kanchipuram</option>
                <option value="pondicherry">Pondicherry</option>
                <option value="kerala">Kerala</option>
                <option value="karnataka">Karnataka</option>
                <option value="goa">Goa</option>
              </select>
            </div>
          </div>

          {/* Tour Category Field */}
          <div className="search-widget-col">
            <label htmlFor="search-cat-select" className="search-widget-label">
              <CompassIcon size={14} color="#01aa90" />
              <span>{t('search_tour_type', 'TOUR TYPE')}</span>
            </label>
            <div className="search-select-wrapper">
              <select
                id="search-cat-select"
                className="search-widget-select"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">{t('search_category_all', 'All Tour Types')}</option>
                <option value="one-day-tours">{t('cat_one_day_tours', 'One Day Tours')}</option>
                <option value="city-sightseeing-tours">{t('cat_city_sightseeing', 'City Sightseeing Tours')}</option>
                <option value="cultural-heritage-tours">{t('cat_cultural_heritage', 'Cultural & Heritage Tours')}</option>
                <option value="guided-tours">{t('cat_guided_tours', 'Guided Tours')}</option>
                <option value="private-tours">{t('cat_private_tours', 'Private Tours')}</option>
                <option value="family-tours">{t('cat_family_tours', 'Family Tours')}</option>
                <option value="historical-tours">{t('cat_historical_tours', 'Historical Tours')}</option>
                <option value="pilgrimage-temple-tours">{t('cat_pilgrimage_temple', 'Pilgrimage / Temple Tours')}</option>
                <option value="medical-tourism">{t('cat_medical_tourism', 'Medical & Wellness Tours')}</option>
              </select>
            </div>
          </div>

          {/* Travel Date Field */}
          <div className="search-widget-col">
            <label htmlFor="search-date-picker" className="search-widget-label">
              <CalendarIcon size={14} color="#01aa90" />
              <span>{t('search_travel_date', 'TRAVEL DATE')}</span>
            </label>
            <div className="search-select-wrapper">
              <input
                id="search-date-picker"
                type="date"
                className="search-widget-input"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>

          {/* Duration Field */}
          <div className="search-widget-col">
            <label htmlFor="search-dur-select" className="search-widget-label">
              <ClockIcon size={14} color="#01aa90" />
              <span>{t('search_duration', 'DURATION')}</span>
            </label>
            <div className="search-select-wrapper">
              <select
                id="search-dur-select"
                className="search-widget-select"
                value={searchDuration}
                onChange={(e) => setSearchDuration(e.target.value)}
              >
                <option value="">{t('search_category_all', 'Any Duration')}</option>
                <option value="1">1 {t('card_day', 'Day')}</option>
                <option value="2-3">2 - 3 {t('card_days', 'Days')}</option>
                <option value="4-6">4 - 6 {t('card_days', 'Days')}</option>
                <option value="7+">7+ {t('card_days', 'Days')}</option>
              </select>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="search-widget-btn-col">
            <div className="search-widget-btn-spacer" aria-hidden="true" />
            <button
              type="submit"
              className="btn-home-search-submit"
              aria-label="Find Tours"
            >
              <SearchIcon size={16} color="#ffffff" />
              <span>{t('search_btn', 'Find Tours')}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
