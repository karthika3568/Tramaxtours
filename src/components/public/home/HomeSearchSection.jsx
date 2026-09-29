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
    if (searchDestination) params.set('destination', searchDestination);
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
              <span className="widget-label-icon">📍</span> WHERE TO?
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
              <span className="widget-label-icon">🧭</span> TOUR TYPE
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
              </select>
            </div>
          </div>

          {/* Travel Date Field */}
          <div className="search-widget-col">
            <label htmlFor="search-date-picker" className="search-widget-label">
              <span className="widget-label-icon">📅</span> TRAVEL DATE
            </label>
            <input
              id="search-date-picker"
              type="date"
              className="search-widget-input"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>

          {/* Duration Field */}
          <div className="search-widget-col">
            <label htmlFor="search-dur-select" className="search-widget-label">
              <span className="widget-label-icon">⏱️</span> DURATION
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
            <button type="submit" className="btn-home-search-submit">
              <span className="search-icon-symbol">🔍</span> {t('search_btn', 'Find Tours')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
