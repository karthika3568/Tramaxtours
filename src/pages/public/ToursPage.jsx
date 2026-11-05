import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import tourService from '../../services/tourService';
import destinationService from '../../services/destinationService';
import TourCard from '../../components/public/tours/TourCard';
import MedicalTripCard from '../../components/public/tours/MedicalTripCard';
import medicalTripService from '../../services/medicalTripService';
import Pagination from '../../components/public/common/Pagination';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { updatePageMeta } from '../../utils/metadata';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'City Sightseeing Tours', slug: 'city-sightseeing-tours' },
  { id: 2, name: 'Cultural & Heritage Tours', slug: 'cultural-heritage-tours' },
  { id: 7, name: 'Family Tours', slug: 'family-tours' },
  { id: 3, name: 'Guided Tours', slug: 'guided-tours' },
  { id: 4, name: 'Historical Tours', slug: 'historical-tours' },
  { id: 5, name: 'One Day Tours', slug: 'one-day-tours' },
  { id: 9, name: 'Pilgrimage / Temple Tours', slug: 'pilgrimage-temple-tours' },
  { id: 6, name: 'Private Tours', slug: 'private-tours' },
  { id: 10, name: 'Medical Tourism & Health Checks', slug: 'medical-tourism' },
  { id: 8, name: 'Surfing Tour', slug: 'surfing-tour' },
  { id: 7, name: 'Palmleaf Horoscope Tour', slug: 'palmleaf-horoscope' },
];

const DEFAULT_FAQS = [
  {
    id: 1,
    question: 'How do I book a tour on our website?',
    answer:
      'You can easily book a tour by selecting your preferred destination, choosing a tour package, and submitting your booking request online. Our team will contact you shortly to confirm availability and assist with the booking process.',
  },
  {
    id: 2,
    question: 'Are the tours private or shared?',
    answer:
      'All our featured holiday tours are 100% private and customizable for your family, group, or solo journey. You will travel in a private, air-conditioned vehicle with a dedicated professional chauffeur and guide.',
  },
  {
    id: 3,
    question: 'What is included in the tour packages?',
    answer:
      'Standard packages include sanitized private air-conditioned vehicle transfers, dedicated chauffeur guide, fuel, toll gates, interstate taxes, and parking charges. Monument entrance tickets, meals, and luxury hotel accommodations are included depending on the selected package tier.',
  },
  {
    id: 4,
    question: 'Can I customize the tour itinerary according to my schedule?',
    answer:
      'Yes, absolutely! We specialize in bespoke foreign tourism and customized private departures. You can add extra days, change hotel categories, or add unique heritage sightseeing stops by contacting our tour coordinators.',
  },
  {
    id: 5,
    question: 'What is the cancellation and refund policy?',
    answer:
      'We offer transparent and flexible cancellation options. Free cancellations are available up to 48 hours before scheduled departure. Full details are provided during booking confirmation.',
  },
];

export default function ToursPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tours, setTours] = useState([]);
  const [medicalTrips, setMedicalTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });

  // Filter state
  const [destinationFilter, setDestinationFilter] = useState(searchParams.get('destination') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [selectedDurations, setSelectedDurations] = useState(() => {
    const dur = searchParams.get('duration');
    return dur ? dur.split(',') : [];
  });
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get('category');
    return cat ? cat.split(',') : [];
  });
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'default');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Destination Search dropdown toggle inside green card
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');

  // FAQs open state
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // First open by default

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Synchronize state when URL searchParams change (from Navbar dropdown, back/forward navigation, etc.)
  useEffect(() => {
    const dest = searchParams.get('destination') || '';
    const date = searchParams.get('date') || '';
    const dur = searchParams.get('duration');
    const cat = searchParams.get('category');
    const rating = searchParams.get('rating') || 'all';
    const sort = searchParams.get('sort_by') || 'default';
    const page = parseInt(searchParams.get('page') || '1', 10);

    setDestinationFilter(dest);
    setSelectedDate(date);
    setSelectedDurations(dur ? dur.split(',') : []);
    setSelectedCategories(cat ? cat.split(',') : []);
    setSelectedRating(rating);
    setSortBy(sort);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    updatePageMeta({
      title: 'Tours — Wonderer South India | Handcrafted Foreign Tourism & Day Safaris',
      description: 'Explore experiences, spas, tours and more. Book private heritage day tours, pilgrimage excursions, and tailor-made packages across South India.',
    });
  }, []);

  // Fetch destinations & categories from backend
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [destRes, catRes] = await Promise.all([
          destinationService.getDestinations({ limit: 100 }),
          tourService.getCategories(),
        ]);

        if (isMounted) {
          const destItems = destRes.items || (Array.isArray(destRes) ? destRes : []);
          setDestinations(destItems);

          const catItems = Array.isArray(catRes) ? catRes : (catRes.data || []);
          if (catItems.length > 0) {
            setCategories(catItems);
          }
        }
      } catch {
        // Soft fail
      }
    }
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch tours from backend
  useEffect(() => {
    let isMounted = true;
    async function loadTours() {
      try {
        setLoading(true);
        setError(null);

        // Map destination slug or ID
        let matchedDestId = undefined;
        if (destinationFilter && destinations.length > 0) {
          const found = destinations.find(
            (d) => String(d.id) === String(destinationFilter) || d.slug === destinationFilter
          );
          if (found) {
            matchedDestId = found.id;
          } else if (!isNaN(destinationFilter)) {
            matchedDestId = destinationFilter;
          }
        }

        const params = {
          page: currentPage,
          limit: 48,
          destination_id: matchedDestId || undefined,
          status: 'published',
        };

        // Determine sort parameters
        if (sortBy === 'price_asc') {
          params.sort_by = 'base_price';
          params.order = 'ASC';
        } else if (sortBy === 'price_desc') {
          params.sort_by = 'base_price';
          params.order = 'DESC';
        } else if (sortBy === 'popularity') {
          params.sort_by = 'is_featured';
          params.order = 'DESC';
        } else if (sortBy === 'rating') {
          params.sort_by = 'display_order';
          params.order = 'ASC';
        } else if (sortBy === 'latest') {
          params.sort_by = 'id';
          params.order = 'DESC';
        } else {
          params.sort_by = 'display_order';
          params.order = 'ASC';
        }

        const response = await tourService.getTours(params);
        try {
          const medRes = await medicalTripService.getMedicalTrips({ is_published: 1, is_active: 1 });
          if (isMounted) {
            setMedicalTrips(medRes.items || []);
          }
        } catch {
          // Ignore
        }
        if (isMounted) {
          const items = response.items || (Array.isArray(response) ? response : []);
          setTours(items);
          setPagination(
            response.pagination || {
              page: currentPage,
              total_pages: 1,
              total: items.length,
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load tours. Please try again.');
          setTours([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, [currentPage, destinationFilter, sortBy, destinations, reloadTrigger]);

  // Client-side filtering for Duration, Categories, Rating, and Price Range
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      // 1. Duration filter
      if (selectedDurations.length > 0) {
        const days = Number(tour.duration_days || 1);
        const hours = Number(tour.duration_hours || 0);

        const matchDuration = selectedDurations.some((dur) => {
          if (dur === 'less_than_1') {
            return days < 1 || (days === 1 && hours > 0 && hours <= 8) || days === 1;
          }
          if (dur === '1_to_3') {
            return days >= 1 && days <= 3;
          }
          if (dur === '3_plus') {
            return days > 3;
          }
          return true;
        });

        if (!matchDuration) return false;
      }

      // 2. Tour Types / Categories Filter
      if (selectedCategories.length > 0) {
        // If only medical is selected, standard tours will not match unless tagged medical
        const onlyMedical = selectedCategories.every(
          (c) => c.toLowerCase().includes('medical') || c.toLowerCase().includes('health')
        );
        if (onlyMedical) {
          const tourCats = Array.isArray(tour.categories) ? tour.categories : [];
          const tourCatNames = tourCats.map((c) => (typeof c === 'string' ? c : c.name || c.slug || ''));
          const tourType = tour.tour_type || '';
          const tourTitle = tour.title || '';
          const hasMedical =
            tourCatNames.some((c) => c.toLowerCase().includes('medical')) ||
            tourType.toLowerCase().includes('medical') ||
            tourTitle.toLowerCase().includes('medical');
          if (!hasMedical) return false;
        } else {
          const tourCats = Array.isArray(tour.categories) ? tour.categories : [];
          const tourCatNames = tourCats.map((c) => (typeof c === 'string' ? c : c.name || c.slug || ''));
          const tourType = tour.tour_type || '';
          const tourTitle = tour.title || '';
          const tourOverview = tour.overview || tour.short_description || '';

          const matchCat = selectedCategories.some((sel) => {
            const sLower = sel.toLowerCase().trim();
            const sNorm = sLower.replace(/-/g, ' ');
            return (
              tourCatNames.some((cName) => {
                const cLower = cName.toLowerCase().trim();
                const cNorm = cLower.replace(/-/g, ' ');
                return (
                  cLower.includes(sLower) ||
                  sLower.includes(cLower) ||
                  cNorm.includes(sNorm) ||
                  sNorm.includes(cNorm)
                );
              }) ||
              tourType.toLowerCase().includes(sLower) ||
              tourType.toLowerCase().includes(sNorm) ||
              (sLower.includes('one day') &&
                (tour.duration_days === 1 ||
                  tourTitle.toLowerCase().includes('day tour') ||
                  tour.duration_text?.toLowerCase().includes('day'))) ||
              (sLower.includes('sightseeing') &&
                (tourTitle.toLowerCase().includes('sightseeing') ||
                  tourOverview.toLowerCase().includes('sightseeing') ||
                  tourType.toLowerCase().includes('sightseeing'))) ||
              (sLower.includes('cultural') &&
                (tourTitle.toLowerCase().includes('heritage') ||
                  tourOverview.toLowerCase().includes('heritage') ||
                  tourOverview.toLowerCase().includes('cultural'))) ||
              (sLower.includes('historical') &&
                (tourTitle.toLowerCase().includes('history') ||
                  tourTitle.toLowerCase().includes('historical') ||
                  tourOverview.toLowerCase().includes('historic'))) ||
              (sLower.includes('pilgrimage') &&
                (tourTitle.toLowerCase().includes('temple') ||
                  tourTitle.toLowerCase().includes('pilgrimage') ||
                  tourOverview.toLowerCase().includes('temple'))) ||
              (sLower.includes('family') &&
                (tourTitle.toLowerCase().includes('family') ||
                  tourOverview.toLowerCase().includes('family'))) ||
              (sLower.includes('guided') &&
                (tourType.toLowerCase().includes('guided') ||
                  tourTitle.toLowerCase().includes('guided') ||
                  tourOverview.toLowerCase().includes('guided'))) ||
              (sLower.includes('private') &&
                (tourType.toLowerCase().includes('private') ||
                  tourTitle.toLowerCase().includes('private') ||
                  tourOverview.toLowerCase().includes('private')))
            );
          });

          if (!matchCat) return false;
        }
      }

      // 3. Rating Filter
      if (selectedRating !== 'all') {
        const ratingThreshold = parseInt(selectedRating, 10);
        const tourRating = Number(tour.average_rating || tour.rating || 0);
        if (ratingThreshold > 0 && tourRating < ratingThreshold && tourRating !== 0) {
          return false;
        }
      }

      return true;
    });
  }, [tours, selectedDurations, selectedCategories, selectedRating]);

  // Determine visibility of medical trips vs regular tours
  const isMedicalOnlySelected =
    selectedCategories.length > 0 &&
    selectedCategories.every(
      (c) => c.toLowerCase().includes('medical') || c.toLowerCase().includes('health')
    );

  const isMedicalIncluded = selectedCategories.some(
    (c) => c.toLowerCase().includes('medical') || c.toLowerCase().includes('health')
  );

  const isSpecificNonMedicalCategorySelected =
    selectedCategories.length > 0 && !isMedicalIncluded;

  const visibleMedicalTrips = isSpecificNonMedicalCategorySelected ? [] : medicalTrips;
  const visibleTours = isMedicalOnlySelected ? [] : filteredTours;
  const totalResultsCount = visibleMedicalTrips.length + visibleTours.length;

  const handleToggleDuration = (val) => {
    setSelectedDurations((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  };

  const handleToggleCategory = (catName) => {
    const next = selectedCategories.includes(catName)
      ? selectedCategories.filter((c) => c !== catName)
      : [...selectedCategories, catName];

    setSelectedCategories(next);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (next.length > 0) {
        nextParams.set('category', next.join(','));
      } else {
        nextParams.delete('category');
      }
      nextParams.set('page', '1');
      return nextParams;
    });
  };

  const handleClearFilters = () => {
    setDestinationFilter('');
    setSelectedDate('');
    setSelectedDurations([]);
    setSelectedCategories([]);
    setSelectedRating('all');
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleFindTours = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const selectedDestinationObj = destinations.find(
    (d) => d.slug === destinationFilter || String(d.id) === String(destinationFilter)
  );

  const filteredDestList = destinations.filter((d) =>
    d.name.toLowerCase().includes(destSearchQuery.toLowerCase())
  );

  const hasActiveFilters = Boolean(
    destinationFilter ||
      selectedDate ||
      selectedDurations.length > 0 ||
      selectedCategories.length > 0 ||
      selectedRating !== 'all'
  );

  return (
    <div className="tours-catalog-page-v2">
      {/* Page Header */}
      <div className="container tours-header-section">
        <h1 className="tours-page-heading">Tours</h1>
        <p className="tours-page-subheading">Explore experiences, spas, tours and more</p>
      </div>

      {/* Main 2-Column Catalog Container */}
      <div className="container tours-catalog-container">
        {/* Left Filter Sidebar */}
        <aside className="tours-filter-sidebar" aria-label="Filters Sidebar">
          {/* 1. Green Card: Where & When */}
          <div className="where-when-card">
            <h2 className="where-when-title">Where & When</h2>

            {/* Destination Selector Input */}
            <div className="where-when-input-wrapper">
              <div
                className="where-when-input"
                onClick={() => setIsDestDropdownOpen(!isDestDropdownOpen)}
                role="button"
                tabIndex={0}
              >
                <span className="input-icon">📍</span>
                <span className={`input-val ${!selectedDestinationObj ? 'placeholder' : ''}`}>
                  {selectedDestinationObj ? selectedDestinationObj.name : 'All destination'}
                </span>
                {selectedDestinationObj ? (
                  <button
                    type="button"
                    className="input-clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestinationFilter('');
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span className="input-clear-placeholder">✕</span>
                )}
              </div>

              {/* Destination Dropdown Popup */}
              {isDestDropdownOpen && (
                <div className="dest-dropdown-menu">
                  <input
                    type="text"
                    className="dest-search-input"
                    placeholder="Search destination..."
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <div className="dest-options-list">
                    <button
                      type="button"
                      className={`dest-option-item ${!destinationFilter ? 'active' : ''}`}
                      onClick={() => {
                        setDestinationFilter('');
                        setIsDestDropdownOpen(false);
                      }}
                    >
                      All Destinations
                    </button>
                    {filteredDestList.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        className={`dest-option-item ${
                          destinationFilter === dest.slug || String(destinationFilter) === String(dest.id)
                            ? 'active'
                            : ''
                        }`}
                        onClick={() => {
                          setDestinationFilter(dest.slug);
                          setIsDestDropdownOpen(false);
                        }}
                      >
                        {dest.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Selector Input */}
            <div className="where-when-input-wrapper">
              <div className="where-when-input">
                <span className="input-icon">📅</span>
                <input
                  type="text"
                  placeholder="Select dates"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  className="date-native-input"
                />
                {selectedDate && (
                  <button
                    type="button"
                    className="input-clear-btn"
                    onClick={() => setSelectedDate('')}
                  >
                    ✕
                  </button>
                )}
                {!selectedDate && <span className="input-clear-placeholder">✕</span>}
              </div>
            </div>
          </div>

          {/* 2. Selected / Clear Filter Section */}
          <div className="sidebar-filter-block">
            <div className="sidebar-selected-header">
              <h3 className="sidebar-section-title">Selected</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="sidebar-clear-link"
                  onClick={handleClearFilters}
                >
                  Clear Filter
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="sidebar-active-chips">
                {selectedDestinationObj && (
                  <span className="active-chip">
                    {selectedDestinationObj.name}
                    <button type="button" onClick={() => setDestinationFilter('')}>✕</button>
                  </span>
                )}
                {selectedDurations.map((d) => (
                  <span key={d} className="active-chip">
                    {d === 'less_than_1' ? '< 1 day' : d === '1_to_3' ? '1 to 3 days' : '3+ days'}
                    <button type="button" onClick={() => handleToggleDuration(d)}>✕</button>
                  </span>
                ))}
                {selectedCategories.map((c) => (
                  <span key={c} className="active-chip">
                    {c}
                    <button type="button" onClick={() => handleToggleCategory(c)}>✕</button>
                  </span>
                ))}
                {selectedRating !== 'all' && (
                  <span className="active-chip">
                    {selectedRating}★ & Up
                    <button type="button" onClick={() => setSelectedRating('all')}>✕</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 3. Duration Filter Checkboxes */}
          <div className="sidebar-filter-block">
            <h3 className="sidebar-section-title">Duration</h3>
            <div className="filter-checkbox-group">
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDurations.includes('less_than_1')}
                  onChange={() => handleToggleDuration('less_than_1')}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label-text">Less than 1 day</span>
              </label>

              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDurations.includes('1_to_3')}
                  onChange={() => handleToggleDuration('1_to_3')}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label-text">1 to 3 days</span>
              </label>

              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDurations.includes('3_plus')}
                  onChange={() => handleToggleDuration('3_plus')}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label-text">3+ days</span>
              </label>
            </div>
          </div>

          {/* 4. Tour Types Checkboxes */}
          <div className="sidebar-filter-block">
            <h3 className="sidebar-section-title">Tour Types</h3>
            <div className="filter-checkbox-group">
              {/* Medical Tour Checkbox */}
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.some((c) => c.toLowerCase().includes('medical'))}
                  onChange={() => handleToggleCategory('medical-tourism')}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label-text" style={{ fontWeight: 600 }}>
                  🩺 Medical Tourism &amp; Health Checks
                </span>
              </label>

              {categories
                .filter((c) => !c.slug?.includes('medical') && !c.name?.toLowerCase().includes('medical'))
                .map((cat) => {
                  const catName = cat.name || cat.slug;
                  const isChecked =
                    selectedCategories.includes(catName) ||
                    selectedCategories.includes(cat.slug);

                  return (
                    <label key={cat.id || cat.slug} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCategory(catName)}
                      />
                      <span className="checkbox-custom" />
                      <span className="checkbox-label-text">{catName}</span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* 5. Rating Radio Group */}
          <div className="sidebar-filter-block">
            <h3 className="sidebar-section-title">Rating</h3>
            <div className="filter-radio-group">
              <label className="filter-radio-item">
                <input
                  type="radio"
                  name="tour_rating"
                  value="all"
                  checked={selectedRating === 'all'}
                  onChange={(e) => setSelectedRating(e.target.value)}
                />
                <span className="radio-custom" />
                <span className="radio-label-text">All Rating</span>
              </label>

              <label className="filter-radio-item">
                <input
                  type="radio"
                  name="tour_rating"
                  value="5"
                  checked={selectedRating === '5'}
                  onChange={(e) => setSelectedRating(e.target.value)}
                />
                <span className="radio-custom" />
                <span className="radio-stars">★★★★★</span>
                <span className="radio-label-text">& Up</span>
              </label>

              <label className="filter-radio-item">
                <input
                  type="radio"
                  name="tour_rating"
                  value="4"
                  checked={selectedRating === '4'}
                  onChange={(e) => setSelectedRating(e.target.value)}
                />
                <span className="radio-custom" />
                <span className="radio-stars">★★★★☆</span>
                <span className="radio-label-text">& Up</span>
              </label>

              <label className="filter-radio-item">
                <input
                  type="radio"
                  name="tour_rating"
                  value="3"
                  checked={selectedRating === '3'}
                  onChange={(e) => setSelectedRating(e.target.value)}
                />
                <span className="radio-custom" />
                <span className="radio-stars">★★★☆☆</span>
                <span className="radio-label-text">& Up</span>
              </label>

              <label className="filter-radio-item">
                <input
                  type="radio"
                  name="tour_rating"
                  value="2"
                  checked={selectedRating === '2'}
                  onChange={(e) => setSelectedRating(e.target.value)}
                />
                <span className="radio-custom" />
                <span className="radio-stars">★★☆☆☆</span>
                <span className="radio-label-text">& Up</span>
              </label>
            </div>
          </div>

          {/* Find Tours Action Button */}
          <div className="sidebar-action-block" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="find-tours-btn"
              onClick={handleFindTours}
            >
              Find Tours
            </button>
          </div>
        </aside>

        {/* Right Main Tours Section */}
        <main className="tours-main-catalog">
          {/* Top Bar: Showing all X results & Tour Type / Sort Dropdowns */}
          <div className="tours-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div className="tours-count-label">
              Showing all {totalResultsCount} results
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Tour Type Dropdown Selector */}
              <div className="tours-sort-group">
                <label htmlFor="tours-type-select" className="tours-sort-label">Tour Type</label>
                <select
                  id="tours-type-select"
                  className="tours-sort-select"
                  value={
                    selectedCategories.length === 0
                      ? 'all'
                      : isMedicalOnlySelected
                      ? 'medical-tourism'
                      : selectedCategories[0]
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentPage(1);
                    if (val === 'all') {
                      setSelectedCategories([]);
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete('category');
                        next.set('page', '1');
                        return next;
                      });
                    } else {
                      setSelectedCategories([val]);
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set('category', val);
                        next.set('page', '1');
                        return next;
                      });
                    }
                  }}
                >
                  <option value="all">All Tour Types</option>
                  <option value="medical-tourism">🩺 Medical Tourism &amp; Health Checks</option>
                  {categories
                    .filter((c) => !c.slug?.includes('medical') && !c.name?.toLowerCase().includes('medical'))
                    .map((cat) => {
                      const val = cat.name || cat.slug;
                      return (
                        <option key={cat.id || cat.slug} value={val}>
                          {val}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="tours-sort-group">
                <label htmlFor="tours-sort-select" className="tours-sort-label">Sort By</label>
                <select
                  id="tours-sort-select"
                  className="tours-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set('sort_by', e.target.value);
                      next.set('page', '1');
                      return next;
                    });
                  }}
                >
                  <option value="default">Default sorting</option>
                  <option value="popularity">Sort by popularity</option>
                  <option value="rating">Sort by average rating</option>
                  <option value="latest">Sort by latest</option>
                  <option value="price_asc">Sort by price: low to high</option>
                  <option value="price_desc">Sort by price: high to low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tours Grid */}
          {loading ? (
            <div className="tours-loading-wrapper">
              <Loading message="Fetching tour packages..." />
            </div>
          ) : error ? (
            <ErrorState
              title="Unable to Load Tours"
              message={error}
              onRetry={() => setReloadTrigger((prev) => prev + 1)}
            />
          ) : totalResultsCount === 0 ? (
            <EmptyState
              title="No Tours Match Your Criteria"
              message={
                hasActiveFilters
                  ? 'Try clearing some filters or selecting a different destination or duration.'
                  : 'No tour packages are currently listed. Please check back shortly!'
              }
              actionText={hasActiveFilters ? 'Clear All Filters' : undefined}
              onAction={hasActiveFilters ? handleClearFilters : undefined}
            />
          ) : (
            <>
              {visibleMedicalTrips.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🩺</span>
                        <span>Medical Tourism &amp; Health Checks</span>
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        Executive clinical assessments, advanced MRI &amp; biomarkers screening packages.
                      </p>
                    </div>
                  </div>
                  <div className="tours-two-column-grid">
                    {visibleMedicalTrips.map((mTrip) => (
                      <MedicalTripCard key={`med-${mTrip.id}`} trip={mTrip} />
                    ))}
                  </div>
                </div>
              )}

              {visibleTours.length > 0 && (
                <div className="tours-two-column-grid">
                  {visibleTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              )}

              {pagination.total_pages > 1 && visibleTours.length > 0 && (
                <Pagination
                  currentPage={pagination.page || currentPage}
                  totalPages={pagination.total_pages || 1}
                  totalItems={pagination.total || visibleTours.length}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}

          {/* Frequently Asked Questions Section */}
          <section className="tours-faq-section" aria-labelledby="faq-section-title">
            <h2 id="faq-section-title" className="tours-faq-title">
              Frequently Asked Questions
            </h2>

            <div className="tours-faq-accordion">
              {DEFAULT_FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={faq.id}
                    className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-accordion-header"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-body-${faq.id}`}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <span className="faq-chevron-icon">
                        {isOpen ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div id={`faq-answer-body-${faq.id}`} className="faq-accordion-body">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
