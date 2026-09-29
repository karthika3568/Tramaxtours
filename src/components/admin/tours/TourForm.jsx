import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaPickerModal from '../media/MediaPickerModal';
import TourGalleryManager from './TourGalleryManager';
import TourHighlightsManager from './TourHighlightsManager';
import TourItineraryManager from './TourItineraryManager';
import TourPricingManager from './TourPricingManager';
import TourExtrasManager from './TourExtrasManager';
import TourAvailabilityManager from './TourAvailabilityManager';
import { getMediaUrl } from '../../../utils/media';
import destinationService from '../../../services/destinationService';
import tourService, { ALLOWED_TOUR_TYPES } from '../../../services/tourService';

export default function TourForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  mode = 'create', // 'create' | 'edit'
}) {
  const navigate = useNavigate();

  // Destination Options list
  const [destinationsList, setDestinationsList] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Tour Categories list
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    if (Array.isArray(initialData?.categories)) {
      return initialData.categories.map((c) => (typeof c === 'object' ? c.id : c));
    }
    return [];
  });

  // Form Field States initialized directly from initialData
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [destinationId, setDestinationId] = useState(
    initialData?.destination_id ? String(initialData.destination_id) : ''
  );
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.is_featured));
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);


  // Content
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [overview, setOverview] = useState(initialData?.overview || '');
  const [tourType, setTourType] = useState(initialData?.tour_type || ALLOWED_TOUR_TYPES[0]);

  // Pricing & Capacity
  const [basePrice, setBasePrice] = useState(
    initialData?.base_price !== null && initialData?.base_price !== undefined
      ? String(initialData.base_price)
      : '0'
  );
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
  const [durationDays, setDurationDays] = useState(
    initialData?.duration_days !== null && initialData?.duration_days !== undefined
      ? String(initialData.duration_days)
      : '1'
  );
  const [durationHours, setDurationHours] = useState(
    initialData?.duration_hours !== null && initialData?.duration_hours !== undefined
      ? String(initialData.duration_hours)
      : ''
  );
  const [durationText, setDurationText] = useState(initialData?.duration_text || '');
  const [minPersons, setMinPersons] = useState(
    initialData?.min_persons !== null && initialData?.min_persons !== undefined
      ? String(initialData.min_persons)
      : '1'
  );
  const [maxPersons, setMaxPersons] = useState(
    initialData?.max_persons !== null && initialData?.max_persons !== undefined
      ? String(initialData.max_persons)
      : ''
  );
  const [languages, setLanguages] = useState(initialData?.languages || 'English & Tamil');
  const [totalSeats, setTotalSeats] = useState(
    initialData?.total_seats !== null && initialData?.total_seats !== undefined
      ? String(initialData.total_seats)
      : '20'
  );
  const [availableSeats, setAvailableSeats] = useState(
    initialData?.available_seats !== null && initialData?.available_seats !== undefined
      ? String(initialData.available_seats)
      : '20'
  );
  const [bookingDeadlineDays, setBookingDeadlineDays] = useState(
    initialData?.booking_deadline_days !== null && initialData?.booking_deadline_days !== undefined
      ? String(initialData.booking_deadline_days)
      : '1'
  );
  const [travelDays, setTravelDays] = useState(initialData?.travel_days || 'Daily');

  // Media
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || null);
  const [ogImage, setOgImage] = useState(initialData?.og_image || null);

  // Child Modules State
  const [gallery, setGallery] = useState(initialData?.gallery || []);
  const [highlights, setHighlights] = useState(initialData?.highlights || []);
  const [itineraries, setItineraries] = useState(initialData?.itineraries || []);
  const [pricingTiers, setPricingTiers] = useState(initialData?.pricing_tiers || []);
  const [includes, setIncludes] = useState(initialData?.includes || []);
  const [excludes, setExcludes] = useState(initialData?.excludes || []);
  const [faqs, setFaqs] = useState(initialData?.faqs || []);

  // Map & Coordinates
  const [mapTitle, setMapTitle] = useState(initialData?.map_title || '');
  const [latitude, setLatitude] = useState(
    initialData?.latitude !== null && initialData?.latitude !== undefined
      ? String(initialData.latitude)
      : ''
  );
  const [longitude, setLongitude] = useState(
    initialData?.longitude !== null && initialData?.longitude !== undefined
      ? String(initialData.longitude)
      : ''
  );
  const [mapZoom, setMapZoom] = useState(initialData?.map_zoom ?? 13);

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url || '');

  // Media Picker state
  const [pickerTarget, setPickerTarget] = useState(null); // 'featured' | 'og' | null

  // Active Form Tab
  const [activeTab, setActiveTab] = useState('basic');

  // Client Validation Errors
  const [errors, setErrors] = useState({});

  // Helper to slugify string
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Fetch available destinations and categories
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingDestinations(true);
        const [destRes, catRes] = await Promise.all([
          destinationService.getDestinations({ limit: 100, status: 'all' }),
          tourService.getCategories(),
        ]);

        if (isMounted) {
          const destItems = destRes.items || destRes.data || [];
          setDestinationsList(destItems);
          if (mode === 'create' && !destinationId && destItems.length > 0) {
            setDestinationId(String(destItems[0].id));
          }

          const catItems = Array.isArray(catRes) ? catRes : (catRes.data || []);
          setCategoriesList(catItems);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) {
          setLoadingDestinations(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [mode, destinationId]);


  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (autoSlug && mode === 'create') {
      setSlug(slugify(newTitle));
    }
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setSlug(e.target.value);
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Tour title is required.';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Tour title cannot exceed 255 characters.';
    }

    if (!destinationId) {
      newErrors.destination_id = 'Destination selection is required.';
    }

    if (slug.trim()) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug.trim())) {
        newErrors.slug = 'Slug may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.';
      } else if (slug.trim().length > 191) {
        newErrors.slug = 'Slug cannot exceed 191 characters.';
      }
    }

    if (basePrice !== '' && (isNaN(parseFloat(basePrice)) || parseFloat(basePrice) < 0)) {
      newErrors.base_price = 'Base price must be a non-negative number.';
    }

    if (durationDays !== '' && (isNaN(parseInt(durationDays, 10)) || parseInt(durationDays, 10) < 1)) {
      newErrors.duration_days = 'Duration must be at least 1 day.';
    }

    if (latitude !== '' && latitude !== null) {
      const latNum = parseFloat(latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90.';
      }
    }

    if (longitude !== '' && longitude !== null) {
      const lngNum = parseFloat(longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const payload = {
      destination_id: parseInt(destinationId, 10),
      title: title.trim(),
      slug: slug.trim() || undefined,
      status,
      is_featured: isFeatured ? 1 : 0,
      display_order: parseInt(displayOrder, 10) || 0,
      short_description: shortDescription.trim() || null,
      overview: overview.trim() || null,
      tour_type: tourType || null,
      base_price: parseFloat(basePrice) || 0.0,
      currency: currency.trim() || 'EUR',
      duration_days: parseInt(durationDays, 10) || 1,
      duration_hours: durationHours !== '' ? parseFloat(durationHours) : null,
      duration_text: durationText.trim() || null,
      min_persons: parseInt(minPersons, 10) || 1,
      max_persons: maxPersons !== '' ? parseInt(maxPersons, 10) : null,
      total_seats: parseInt(totalSeats, 10) || 20,
      available_seats: parseInt(availableSeats, 10) >= 0 ? parseInt(availableSeats, 10) : 0,
      booking_deadline_days: parseInt(bookingDeadlineDays, 10) || 1,
      travel_days: travelDays.trim() || 'Daily',
      languages: languages.trim() || null,
      featured_image_id: featuredImage?.id || null,
      og_image_id: ogImage?.id || null,
      map_title: mapTitle.trim() || null,
      latitude: latitude !== '' ? parseFloat(latitude) : null,
      longitude: longitude !== '' ? parseFloat(longitude) : null,
      map_zoom: parseInt(mapZoom, 10) || 13,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      canonical_url: canonicalUrl.trim() || null,
      category_ids: selectedCategories,
      gallery,
      highlights,
      itineraries,
      pricing_tiers: pricingTiers,
      includes,
      excludes,
      faqs,
    };

    onSubmit(payload);
  };


  const handleMediaPicked = (asset) => {
    if (pickerTarget === 'featured') {
      setFeaturedImage(asset);
    } else if (pickerTarget === 'og') {
      setOgImage(asset);
    }
    setPickerTarget(null);
  };

  return (
    <form onSubmit={handleSubmit} className="tour-admin-form">
      {/* Form Navigation Tabs */}
      <div className="tour-form-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'basic'}
          className={`tour-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          1. Basic & Destination
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'activity'}
          className={`tour-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          2. Type, Pricing & Duration
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'content'}
          className={`tour-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          3. Summary & Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'media'}
          className={`tour-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          4. Key Visuals
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'gallery'}
          className={`tour-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          5. Gallery ({gallery.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'highlights'}
          className={`tour-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          6. Highlights ({highlights.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'itinerary'}
          className={`tour-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          7. Itinerary ({itineraries.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pricing'}
          className={`tour-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          8. Pricing Tiers ({pricingTiers.length})
        </button>
        {mode === 'edit' && initialData?.id && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'availability'}
            className={`tour-tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Seat Availability
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'extras'}
          className={`tour-tab-btn ${activeTab === 'extras' ? 'active' : ''}`}
          onClick={() => setActiveTab('extras')}
        >
          9. Includes / Excludes & FAQs
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'location'}
          className={`tour-tab-btn ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          10. Map & Coordinates
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'seo'}
          className={`tour-tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          11. SEO & Meta
        </button>
      </div>

      {/* TAB 1: Basic & Destination */}
      {activeTab === 'basic' && (
        <div className="tour-form-section-card">
          <h3 className="tour-section-title">Tour Identity & Publishing State</h3>

          <div className="form-grid-2col">
            {/* Tour Title */}
            <div className="form-group">
              <label htmlFor="tour-title" className="form-label required">
                Tour Package Title *
              </label>
              <input
                type="text"
                id="tour-title"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. 5-Day Masai Mara & Lake Nakuru Safari"
                maxLength={255}
                required
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Destination Selector */}
            <div className="form-group">
              <label htmlFor="tour-dest" className="form-label required">
                Destination *
              </label>
              <select
                id="tour-dest"
                className={`form-select ${errors.destination_id ? 'input-error' : ''}`}
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                disabled={loadingDestinations}
                required
              >
                <option value="">-- Select Destination --</option>
                {destinationsList.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}
                  </option>
                ))}
              </select>
              {errors.destination_id && (
                <span className="form-error">{errors.destination_id}</span>
              )}
            </div>
          </div>

          <div className="form-grid-2col">
            {/* Slug */}
            <div className="form-group">
              <label htmlFor="tour-slug" className="form-label">
                URL Slug
              </label>
              <div className="input-group-slug">
                <span className="input-prefix">/tours/</span>
                <input
                  type="text"
                  id="tour-slug"
                  className={`form-input ${errors.slug ? 'input-error' : ''}`}
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="auto-generated-from-title"
                  maxLength={191}
                />
              </div>
              <span className="form-hint">Unique URL path. Generated automatically from title if left blank.</span>
              {errors.slug && <span className="form-error">{errors.slug}</span>}
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="tour-status" className="form-label required">
                Status *
              </label>
              <select
                id="tour-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Live & Public)</option>
                <option value="archived">Archived (Deactivated)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2col">
            {/* Display Order */}
            <div className="form-group">
              <label htmlFor="tour-order" className="form-label">
                Display Order
              </label>
              <input
                type="number"
                id="tour-order"
                className="form-input"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min={0}
                step={1}
              />
              <span className="form-hint">Lower numbers appear first on listings.</span>
            </div>

            {/* Is Featured */}
            <div className="form-group tour-featured-toggle-group">
              <label className="form-label">Featured Spotlight</label>
              <label className="tour-checkbox-card">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span className="checkbox-text">
                  <strong>Featured Tour Package</strong>
                  <small>Spotlight in homepage tour highlights and top recommendations</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Type, Pricing & Duration */}
      {activeTab === 'activity' && (
        <div className="tour-form-section-card">
          <h3 className="tour-section-title">Tour Category, Pricing & Duration</h3>

          {/* Strict 8 Tour Type Selector */}
          <div className="form-group">
            <label htmlFor="tour-type" className="form-label required">
              Primary Tour Type *
            </label>
            <select
              id="tour-type"
              className="form-select tour-type-main-select"
              value={tourType}
              onChange={(e) => setTourType(e.target.value)}
              required
            >
              {ALLOWED_TOUR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="form-hint">
              Selected primary activity type shown on cards, detail headers, and catalog badges.
            </span>
          </div>

          {/* Tour Categories & Filter Tags Multi-Select */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Tour Categories & Badge Options (Catalog & Card Tags)
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', marginRight: '4px' }} />
                <strong>Blue:</strong> One Day Tour &nbsp;|&nbsp;
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#01AA90', marginRight: '4px', marginLeft: '6px' }} />
                <strong>Green:</strong> Sightseeing & Other Tours
              </span>
            </div>
            <span className="form-hint" style={{ marginBottom: '12px', display: 'block' }}>
              Select the tour types and categories. <strong>One Day Tour</strong> displays as a prominent <strong>Blue badge</strong>, while Sightseeing, Private, Cultural, and all other categories display in <strong>Green</strong>.
            </span>

            <div className="tour-categories-checklist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {categoriesList.length > 0 ? (
                categoriesList.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  const isOneDay = (cat.name || '').toLowerCase().includes('one day') || (cat.slug || '').includes('one-day');

                  return (
                    <label
                      key={cat.id}
                      className={`cat-checkbox-item ${isChecked ? 'selected' : ''}`}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                        border: isChecked
                          ? (isOneDay ? '2px solid #2563eb' : '2px solid #01AA90')
                          : '1px solid #e2e8f0',
                        background: isChecked
                          ? (isOneDay ? '#dbeafe' : '#e6f7f4')
                          : '#ffffff',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        style={{ accentColor: isOneDay ? '#2563eb' : '#01AA90', width: '17px', height: '17px' }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories((prev) => [...prev, cat.id]);
                          } else {
                            setSelectedCategories((prev) => prev.filter((id) => id !== cat.id));
                          }
                        }}
                      />
                      <span
                        className="cat-checkbox-label"
                        style={{
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? (isOneDay ? '#1d4ed8' : '#01806C') : '#334155',
                          fontSize: '13.5px',
                        }}
                      >
                        {cat.name}
                        {isOneDay && (
                          <span
                            style={{
                              marginLeft: '6px',
                              fontSize: '10.5px',
                              background: '#2563eb',
                              color: '#fff',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            BLUE
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })
              ) : (
                ALLOWED_TOUR_TYPES.map((type, idx) => {
                  const isChecked = selectedCategories.includes(idx + 1);
                  const isOneDay = type.toLowerCase().includes('one day') || type.toLowerCase().includes('day tour');

                  return (
                    <label
                      key={idx}
                      className="cat-checkbox-item"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: isChecked
                          ? (isOneDay ? '2px solid #2563eb' : '2px solid #01AA90')
                          : '1px solid #e2e8f0',
                        background: isChecked
                          ? (isOneDay ? '#dbeafe' : '#e6f7f4')
                          : '#ffffff',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        style={{ accentColor: isOneDay ? '#2563eb' : '#01AA90', width: '17px', height: '17px' }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories((prev) => [...prev, idx + 1]);
                          } else {
                            setSelectedCategories((prev) => prev.filter((id) => id !== (idx + 1)));
                          }
                        }}
                      />
                      <span
                        className="cat-checkbox-label"
                        style={{
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? (isOneDay ? '#1d4ed8' : '#01806C') : '#334155',
                          fontSize: '13.5px',
                        }}
                      >
                        {type}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            {/* Live Tour Card Badge Preview */}
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                🏷️ Live Tour Card Badges Preview:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedCategories.length === 0 ? (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No categories selected yet. Select options above to preview badges.
                  </span>
                ) : (
                  selectedCategories.map((catId) => {
                    const catObj = categoriesList.find((c) => c.id === catId);
                    const catName = catObj ? catObj.name : `Category ${catId}`;
                    const isOneDay = (catName || '').toLowerCase().includes('one day');

                    return (
                      <span
                        key={catId}
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '5px 12px',
                          borderRadius: '6px',
                          background: isOneDay ? '#2563eb' : '#01AA90',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        {isOneDay ? '☀️' : '✨'} {catName}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>


          <div className="form-grid-3col">
            {/* Base Price */}
            <div className="form-group">
              <label htmlFor="tour-price" className="form-label required">
                Starting Price *
              </label>
              <input
                type="number"
                id="tour-price"
                className={`form-input ${errors.base_price ? 'input-error' : ''}`}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
              {errors.base_price && <span className="form-error">{errors.base_price}</span>}
            </div>

            {/* Currency */}
            <div className="form-group">
              <label htmlFor="tour-currency" className="form-label">
                Currency Code
              </label>
              <input
                type="text"
                id="tour-currency"
                className="form-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="EUR, USD, KES"
                maxLength={10}
              />
            </div>

            {/* Duration Days */}
            <div className="form-group">
              <label htmlFor="tour-days" className="form-label required">
                Duration (Days) *
              </label>
              <input
                type="number"
                id="tour-days"
                className={`form-input ${errors.duration_days ? 'input-error' : ''}`}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                min="1"
                step="1"
                required
              />
              {errors.duration_days && <span className="form-error">{errors.duration_days}</span>}
            </div>
          </div>

          <div className="form-grid-3col">
            {/* Duration Text */}
            <div className="form-group">
              <label htmlFor="tour-dur-text" className="form-label">
                Duration Label / Subtitle
              </label>
              <input
                type="text"
                id="tour-dur-text"
                className="form-input"
                value={durationText}
                onChange={(e) => setDurationText(e.target.value)}
                placeholder="e.g. 5 Days / 4 Nights"
              />
            </div>

            {/* Duration Hours (Optional) */}
            <div className="form-group">
              <label htmlFor="tour-dur-hours" className="form-label">
                Duration Hours (Day tours)
              </label>
              <input
                type="number"
                id="tour-dur-hours"
                className="form-input"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                min="0"
                step="0.5"
                placeholder="e.g. 8.0"
              />
            </div>

            {/* Languages */}
            <div className="form-group">
              <label htmlFor="tour-languages" className="form-label">
                Guided Languages
              </label>
              <input
                type="text"
                id="tour-languages"
                className="form-input"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, French, Swahili"
              />
            </div>
          </div>

          <div className="form-grid-2col">
            {/* Min Persons */}
            <div className="form-group">
              <label htmlFor="tour-min-persons" className="form-label">
                Min Persons per Booking
              </label>
              <input
                type="number"
                id="tour-min-persons"
                className="form-input"
                value={minPersons}
                onChange={(e) => setMinPersons(e.target.value)}
                min="1"
              />
            </div>

            {/* Max Persons */}
            <div className="form-group">
              <label htmlFor="tour-max-persons" className="form-label">
                Max Group Limit
              </label>
              <input
                type="number"
                id="tour-max-persons"
                className="form-input"
                value={maxPersons}
                onChange={(e) => setMaxPersons(e.target.value)}
                min="1"
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          {/* Seat Capacity & Booking Deadline Controls */}
          <div className="form-grid-2col" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
            {/* Total Capacity Seats */}
            <div className="form-group">
              <label htmlFor="tour-total-seats" className="form-label">
                💺 Total Tour Capacity (Seats)
              </label>
              <input
                type="number"
                id="tour-total-seats"
                className="form-input"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                min="1"
                placeholder="e.g. 20"
              />
              <span className="form-hint">Maximum seats available per departure.</span>
            </div>

            {/* Available Remaining Seats */}
            <div className="form-group">
              <label htmlFor="tour-available-seats" className="form-label">
                🎟️ Remaining Available Seats
              </label>
              <input
                type="number"
                id="tour-available-seats"
                className="form-input"
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                min="0"
                placeholder="e.g. 15"
              />
              <span className="form-hint">Set to 0 to mark tour card as <strong>FULL</strong>.</span>
            </div>

            {/* Booking Cutoff Deadline (Days before) */}
            <div className="form-group">
              <label htmlFor="tour-deadline-days" className="form-label">
                ⏳ Booking Cutoff (Days Before Travel)
              </label>
              <input
                type="number"
                id="tour-deadline-days"
                className="form-input"
                value={bookingDeadlineDays}
                onChange={(e) => setBookingDeadlineDays(e.target.value)}
                min="0"
                placeholder="e.g. 1 (Book at least 1 day before)"
              />
              <span className="form-hint">E.g., 1 day before means bookings close at midnight before departure day.</span>
            </div>

            {/* Departure Days */}
            <div className="form-group">
              <label htmlFor="tour-travel-days" className="form-label">
                🗓️ Departure / Operating Schedule
              </label>
              <input
                type="text"
                id="tour-travel-days"
                className="form-input"
                value={travelDays}
                onChange={(e) => setTravelDays(e.target.value)}
                placeholder="e.g. Daily or Wednesday, Saturday"
              />
              <span className="form-hint">Shown to travelers on cards (e.g. "Departs: Wednesday, Saturday").</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Summary & Overview */}
      {activeTab === 'content' && (
        <div className="tour-form-section-card">
          <h3 className="tour-section-title">Tour Description & Itinerary Overview</h3>

          <div className="form-group">
            <label htmlFor="tour-short-desc" className="form-label">
              Short Description / Card Summary
            </label>
            <textarea
              id="tour-short-desc"
              rows={3}
              className="form-textarea"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A brief compelling summary shown on catalog cards and search previews..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="tour-overview" className="form-label">
              Detailed Experience Overview
            </label>
            <textarea
              id="tour-overview"
              rows={8}
              className="form-textarea"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="In-depth narrative describing the safari experience, itinerary flow, wildlife sightings, meals, and accommodations..."
            />
          </div>
        </div>
      )}

      {/* TAB 4: Media Library Visuals */}
      {activeTab === 'media' && (
        <div className="tour-form-section-card">
          <h3 className="tour-section-title">Media Library Visual Assets</h3>
          <p className="section-instruction">
            Select high-resolution images from the central Media Library. No external CDN or hardcoded images are permitted.
          </p>

          <div className="tour-media-pickers-grid">
            {/* Featured Image */}
            <div className="tour-media-picker-card">
              <span className="media-picker-card-title">1. Featured Tour Image</span>
              <span className="media-picker-card-desc">Main cover visual displayed on tour catalog cards and hero banner</span>

              <div className="tour-media-preview-box">
                {featuredImage ? (
                  <div className="picked-media-view">
                    <img
                      src={getMediaUrl(featuredImage)}
                      alt={featuredImage.alt_text || 'Featured Tour'}
                      className="picked-media-img"
                    />
                    <div className="picked-media-info">
                      <span className="picked-name">{featuredImage.original_name || featuredImage.filename}</span>
                      <span className="picked-meta">{featuredImage.mime_type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-media-box">
                    <span>🖼️ No Featured Image Selected</span>
                  </div>
                )}
              </div>

              <div className="media-picker-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPickerTarget('featured')}
                >
                  {featuredImage ? 'Change Image' : 'Select From Media Library'}
                </button>
                {featuredImage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-clear-media"
                    onClick={() => setFeaturedImage(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* OG Social Share Image */}
            <div className="tour-media-picker-card">
              <span className="media-picker-card-title">2. Social Share Image (OG)</span>
              <span className="media-picker-card-desc">Image displayed when this tour is shared on WhatsApp, Facebook, or Twitter</span>

              <div className="tour-media-preview-box">
                {ogImage ? (
                  <div className="picked-media-view">
                    <img
                      src={getMediaUrl(ogImage)}
                      alt={ogImage.alt_text || 'OG Tour Image'}
                      className="picked-media-img"
                    />
                    <div className="picked-media-info">
                      <span className="picked-name">{ogImage.original_name || ogImage.filename}</span>
                      <span className="picked-meta">{ogImage.mime_type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-media-box">
                    <span>🌐 No Social Image Selected</span>
                  </div>
                )}
              </div>

              <div className="media-picker-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPickerTarget('og')}
                >
                  {ogImage ? 'Change Image' : 'Select From Media Library'}
                </button>
                {ogImage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-clear-media"
                    onClick={() => setOgImage(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Tour Gallery */}
      {activeTab === 'gallery' && (
        <div className="tour-form-section-card">
          <TourGalleryManager gallery={gallery} onChange={setGallery} />
        </div>
      )}

      {/* TAB 6: Tour Highlights */}
      {activeTab === 'highlights' && (
        <div className="tour-form-section-card">
          <TourHighlightsManager highlights={highlights} onChange={setHighlights} />
        </div>
      )}

      {/* TAB 7: Tour Itinerary */}
      {activeTab === 'itinerary' && (
        <div className="tour-form-section-card">
          <TourItineraryManager itineraries={itineraries} onChange={setItineraries} />
        </div>
      )}

      {/* TAB 8: Pricing Tiers */}
      {activeTab === 'pricing' && (
        <div className="tour-form-section-card">
          <TourPricingManager
            pricingTiers={pricingTiers}
            basePrice={parseFloat(basePrice) || 0}
            currency={currency}
            onChange={setPricingTiers}
          />
        </div>
      )}

      {/* TAB: Date-based Seat Availability (edit mode only — needs a saved tour id) */}
      {activeTab === 'availability' && mode === 'edit' && initialData?.id && (
        <div className="tour-form-section-card">
          <TourAvailabilityManager tourId={initialData.id} defaultTotalSeats={parseInt(totalSeats, 10) || 20} />
        </div>
      )}

      {/* TAB 9: Includes / Excludes & FAQs */}
      {activeTab === 'extras' && (
        <div className="tour-form-section-card">
          <TourExtrasManager
            includes={includes}
            excludes={excludes}
            faqs={faqs}
            onIncludesChange={setIncludes}
            onExcludesChange={setExcludes}
            onFaqsChange={setFaqs}
          />
        </div>
      )}

      {/* TAB 10: Map & Coordinates */}
      {activeTab === 'location' && (
        <div className="tour-form-section-card">
          <h3 className="tour-section-title">Geographic Coordinates & Map Settings</h3>

          <div className="form-group">
            <label htmlFor="tour-map-title" className="form-label">
              Map Route Title
            </label>
            <input
              type="text"
              id="tour-map-title"
              className="form-input"
              value={mapTitle}
              onChange={(e) => setMapTitle(e.target.value)}
              placeholder="e.g. Masai Mara National Reserve Trailhead"
            />
          </div>

          <div className="form-grid-3col">
            <div className="form-group">
              <label htmlFor="tour-lat" className="form-label">
                Latitude (-90 to 90)
              </label>
              <input
                type="number"
                id="tour-lat"
                className={`form-input ${errors.latitude ? 'input-error' : ''}`}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="any"
                min="-90"
                max="90"
                placeholder="e.g. -1.483333"
              />
              {errors.latitude && <span className="form-error">{errors.latitude}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tour-lng" className="form-label">
                Longitude (-180 to 180)
              </label>
              <input
                type="number"
                id="tour-lng"
                className={`form-input ${errors.longitude ? 'input-error' : ''}`}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="any"
                min="-180"
                max="180"
                placeholder="e.g. 35.143889"
              />
              {errors.longitude && <span className="form-error">{errors.longitude}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tour-zoom" className="form-label">
                Default Map Zoom (1-20)
              </label>
              <input
                type="number"
                id="tour-zoom"
                className="form-input"
                value={mapZoom}
                onChange={(e) => setMapZoom(e.target.value)}
                min="1"
                max="20"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: SEO & Meta */}
      {activeTab === 'seo' && (
        <div className="tour-form-section-card">
          <h3 className="tour-section-title">Search Engine Optimization (SEO)</h3>

          <div className="form-group">
            <label htmlFor="tour-seo-title" className="form-label">
              Meta Title Tag
            </label>
            <input
              type="text"
              id="tour-seo-title"
              className="form-input"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. 5-Day Masai Mara Safari Package | Tramax Tours"
              maxLength={70}
            />
            <span className="form-hint">{seoTitle.length}/70 characters recommended</span>
          </div>

          <div className="form-group">
            <label htmlFor="tour-seo-desc" className="form-label">
              Meta Description Tag
            </label>
            <textarea
              id="tour-seo-desc"
              rows={3}
              className="form-textarea"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Compelling meta description shown in search engine snippet results..."
              maxLength={160}
            />
            <span className="form-hint">{seoDescription.length}/160 characters recommended</span>
          </div>

          <div className="form-group">
            <label htmlFor="tour-canonical" className="form-label">
              Canonical URL (Optional)
            </label>
            <input
              type="text"
              id="tour-canonical"
              className="form-input"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://tramax-tours.com/tours/masai-mara"
            />
          </div>
        </div>
      )}

      {/* Form Submission Footer Bar */}
      <div className="tour-form-footer-bar">
        <button
          type="button"
          className="btn btn-outline btn-md"
          onClick={() => navigate('/admin/tours')}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <div className="form-footer-actions">
          {mode === 'edit' && initialData?.slug && (
            <a
              href={`/tours/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-md"
            >
              ↗ View Public Page
            </a>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-md btn-save-tour"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving Tour Package...'
              : mode === 'edit'
              ? 'Update Tour Package'
              : 'Create Tour Package'}
          </button>
        </div>
      </div>

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          isOpen={Boolean(pickerTarget)}
          onClose={() => setPickerTarget(null)}
          onSelect={handleMediaPicked}
          selectedMediaId={
            pickerTarget === 'featured' ? featuredImage?.id : ogImage?.id
          }
          title={
            pickerTarget === 'featured'
              ? 'Select Featured Tour Image'
              : 'Select OpenGraph Social Image'
          }
        />
      )}
    </form>
  );
}
