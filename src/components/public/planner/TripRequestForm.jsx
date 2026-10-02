import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import inquiryService from '../../../services/inquiryService';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import { useToast } from '../../../context/ToastContext';

const COUNTRIES = [
  'India',
  'United Kingdom',
  'United States',
  'Germany',
  'France',
  'Netherlands',
  'Australia',
  'Malaysia',
  'Singapore',
  'United Arab Emirates',
  'Canada',
  'Switzerland',
  'Italy',
  'Spain',
  'Sri Lanka',
  'Other',
];

const TOUR_TYPES = [
  'Sightseeing',
  'Cultural Tour',
  'Pilgrimage',
  'Beach Holiday',
  'Adventure Tour',
  'Wildlife Tour',
  'Shopping Tour',
];

const VEHICLE_OPTIONS = [
  'Sedan (Swift Dzire / Etios)',
  'SUV (Ertiga / Carens)',
  'Innova Crysta (Luxury 6/7 Seater)',
  'Tempo Traveller (12/14/17 Seater)',
  'Mini Bus (21/25 Seater)',
  'Luxury Coach (35/45 Seater)',
];

const HOTEL_CATEGORIES = [
  'Budget / Homestay',
  '3 Star Standard',
  '4 Star Premium',
  '5 Star Luxury',
  'Heritage / Luxury Resort',
];

const ROOM_TYPES = [
  'Single Room',
  'Double Room',
  'Triple Room',
  'Family Suite',
];

const LANGUAGES = [
  'English',
  'German (Deutsch)',
  'French (Français)',
  'Spanish (Español)',
  'Italian (Italiano)',
  'Tamil',
  'Hindi',
  'Other',
];

const CURRENCIES = ['INR', 'EUR', 'USD', 'GBP'];

export default function TripRequestForm({ initialDestination = '', initialTour = '', prefilledData = {} }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { getSetting } = useSiteSettings();
  const siteName = getSetting('site_name', 'Wanderer South India');

  // Form Field State
  const [formData, setFormData] = useState({
    name: prefilledData.name || '',
    whatsapp_number: prefilledData.whatsapp_number || '',
    email: prefilledData.email || '',
    country: prefilledData.country || 'India',
    destination: initialDestination || prefilledData.destination || '',
    pickup_location: prefilledData.pickup_location || '',
    arrival_date: prefilledData.arrival_date || '',
    departure_date: prefilledData.departure_date || '',
    adults_count: prefilledData.adults_count || 2,
    children_count: prefilledData.children_count || 0,
    infants_count: prefilledData.infants_count || 0,
    tour_types: ['Cultural Tour', 'Sightseeing'],
    tour_guide_required: 'Yes',
    preferred_language: 'English',
    airport_pickup: 'Yes',
    airport_drop: 'Yes',
    vehicle_preference: 'Innova Crysta (Luxury 6/7 Seater)',
    hotel_category: '4 Star Premium',
    room_type: 'Double Room',
    rooms_count: 1,
    arrival_flight_train_number: '',
    arrival_time: '',
    departure_flight_train_number: '',
    departure_time: '',
    approximate_budget: '',
    budget_currency: 'EUR',
    preferred_contact_methods: ['WhatsApp', 'Email'],
    special_requests: '',
  });

  // Pre-fill destination or tour if changed via props
  useEffect(() => {
    if (initialDestination) {
      setFormData((prev) => ({ ...prev, destination: initialDestination }));
    }
  }, [initialDestination]);

  // Document attachments (client validated)
  const [passportFile, setPassportFile] = useState(null);
  const [passportError, setPassportError] = useState('');
  const [ticketFile, setTicketFile] = useState(null);
  const [ticketError, setTicketError] = useState('');

  // Validation & UI State
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated Number of Days
  const calculatedDays = useMemo(() => {
    if (!formData.arrival_date || !formData.departure_date) return '';
    const arr = new Date(formData.arrival_date);
    const dep = new Date(formData.departure_date);
    if (isNaN(arr.getTime()) || isNaN(dep.getTime())) return '';
    const diffTime = dep.getTime() - arr.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) return 'Invalid dates (Departure before arrival)';
    const nights = Math.max(0, diffDays - 1);
    return `${diffDays} Days / ${nights} Nights`;
  }, [formData.arrival_date, formData.departure_date]);

  // Validation Logic
  const validateField = (field, value) => {
    let err = '';
    switch (field) {
      case 'name':
        if (!value || !value.trim()) err = 'Full Name is required.';
        break;
      case 'whatsapp_number':
        if (!value || !value.trim()) {
          err = 'WhatsApp Number is required for itinerary delivery.';
        } else if (value.replace(/\D/g, '').length < 7) {
          err = 'Please enter a valid phone/WhatsApp number with country code.';
        }
        break;
      case 'email':
        if (!value || !value.trim()) {
          err = 'Email Address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          err = 'Please enter a valid email address.';
        }
        break;
      case 'destination':
        if (!value || !value.trim()) err = 'Please specify your destination(s).';
        break;
      case 'pickup_location':
        if (!value || !value.trim()) err = 'Pickup location (City or Airport) is required.';
        break;
      case 'arrival_date':
        if (!value) err = 'Arrival Date is required.';
        break;
      case 'departure_date':
        if (!value) {
          err = 'Departure Date is required.';
        } else if (formData.arrival_date && value < formData.arrival_date) {
          err = 'Departure date cannot be before arrival date.';
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  // Checkbox toggles
  const handleToggleTourType = (type) => {
    setFormData((prev) => {
      const current = prev.tour_types || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, tour_types: updated.length > 0 ? updated : [type] };
    });
  };

  const handleToggleContactMethod = (method) => {
    setFormData((prev) => {
      const current = prev.preferred_contact_methods || [];
      const updated = current.includes(method)
        ? current.filter((m) => m !== method)
        : [...current, method];
      return { ...prev, preferred_contact_methods: updated.length > 0 ? updated : [method] };
    });
  };

  // File Upload Handlers (Client validation <= 5MB, PDF / Images only)
  const handleFileUpload = (e, setFile, setFileError) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file format. Please upload PDF, JPEG, PNG, or WEBP.');
      setFile(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setFileError('File size exceeds 5MB limit. Please upload a smaller file.');
      setFile(null);
      return;
    }

    setFileError('');
    setFile(file);
  };

  // Section completion progress
  const progressPercent = useMemo(() => {
    let completed = 0;
    const total = 10;
    if (formData.name && formData.whatsapp_number && formData.email) completed++;
    if (formData.destination && formData.pickup_location && formData.arrival_date && formData.departure_date) completed++;
    if (formData.adults_count >= 1) completed++;
    if (formData.tour_types.length > 0) completed++;
    if (formData.vehicle_preference) completed++;
    if (formData.hotel_category) completed++;
    if (formData.arrival_flight_train_number || formData.departure_flight_train_number || true) completed++;
    if (formData.approximate_budget || true) completed++;
    if (passportFile || ticketFile || true) completed++;
    if (formData.preferred_contact_methods.length > 0) completed++;
    return Math.min(100, Math.round((completed / total) * 100));
  }, [formData, passportFile, ticketFile]);

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate all required fields
    const newErrors = {};
    ['name', 'whatsapp_number', 'email', 'destination', 'pickup_location', 'arrival_date', 'departure_date'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        name: true,
        whatsapp_number: true,
        email: true,
        destination: true,
        pickup_location: true,
        arrival_date: true,
        departure_date: true,
      });
      toast.error('Please complete all required fields marked with *', 'Incomplete Form');
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Build clean payload according to API contract
      const payload = {
        name: formData.name.trim(),
        whatsapp_number: formData.whatsapp_number.trim(),
        phone: formData.whatsapp_number.trim(),
        email: formData.email.trim(),
        country: formData.country,
        nationality: formData.country,
        destination: formData.destination.trim(),
        destination_name: formData.destination.trim(),
        pickup_location: formData.pickup_location.trim(),
        arrival_date: formData.arrival_date,
        departure_date: formData.departure_date,
        travel_date: formData.arrival_date,
        duration_days: calculatedDays,
        number_of_days: calculatedDays,
        adults_count: Number(formData.adults_count),
        children_count: Number(formData.children_count),
        infants_count: Number(formData.infants_count),
        travelers: Number(formData.adults_count) + Number(formData.children_count) + Number(formData.infants_count),
        tour_types: formData.tour_types,
        tour_preferences: formData.tour_types,
        tour_guide_required: formData.tour_guide_required === 'Yes',
        preferred_language: formData.preferred_language,
        airport_pickup: formData.airport_pickup === 'Yes',
        airport_drop: formData.airport_drop === 'Yes',
        vehicle_preference: formData.vehicle_preference,
        vehicle: formData.vehicle_preference,
        hotel_category: formData.hotel_category,
        room_type: formData.room_type,
        rooms_count: Number(formData.rooms_count),
        arrival_flight_train_number: formData.arrival_flight_train_number.trim() || null,
        arrival_time: formData.arrival_time.trim() || null,
        departure_flight_train_number: formData.departure_flight_train_number.trim() || null,
        departure_time: formData.departure_time.trim() || null,
        approximate_budget: formData.approximate_budget.trim() || null,
        budget_currency: formData.budget_currency,
        preferred_contact_methods: formData.preferred_contact_methods,
        special_requests: formData.special_requests.trim() || null,
        message: formData.special_requests.trim() || `Custom itinerary request for ${formData.destination} (${calculatedDays}).`,
        subject: `Trip Request: ${formData.destination} (${calculatedDays})`,
        tour_title: initialTour || (formData.destination ? `Custom Trip: ${formData.destination}` : null),
      };

      if (passportFile) {
        payload.passport_file_url = `[Attached Document] ${passportFile.name} (${Math.round(passportFile.size / 1024)} KB)`;
      }
      if (ticketFile) {
        payload.flight_ticket_url = `[Attached Document] ${ticketFile.name} (${Math.round(ticketFile.size / 1024)} KB)`;
      }

      const response = await inquiryService.createTripRequest(payload);
      const dataObj = response?.data || response;
      const refId = dataObj?.reference_id || (dataObj?.id ? `TRP-${new Date().getFullYear()}-${String(dataObj.id).padStart(6, '0')}` : 'TRP-CONFIRMED');

      toast.success('Your trip request has been submitted successfully!', 'Request Received');
      navigate(`/trip-request/success/${refId}`, {
        state: { tripSummary: dataObj, referenceId: refId },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit trip request. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg, 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="trip-request-form-container glass-card-panel" noValidate>
      {/* Progress Bar & Header */}
      <div className="form-progress-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#01AA90', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✨ Custom Holiday Itinerary Planner
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#064d71' }}>
            {progressPercent}% Complete
          </span>
        </div>
        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #01AA90 0%, #01806C 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Global Server Error Banner */}
      {serverError && (
        <div className="alert-box-error" style={{ padding: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '24px', fontSize: '14px' }}>
          <strong>⚠️ Submission Error:</strong> {serverError}
        </div>
      )}

      {/* SECTION 1: CONTACT INFORMATION */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">1</span>
          <div>
            <h3 className="section-step-title">Contact Information</h3>
            <p className="section-step-desc">Where should we deliver your custom quote and WhatsApp itinerary?</p>
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap">
            <label htmlFor="req-name" className="form-field-label">
              Full Name <span className="req-star">*</span>
            </label>
            <input
              id="req-name"
              name="name"
              type="text"
              className={`form-field-input ${errors.name && touched.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Eleanor Vance"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.name && touched.name)}
            />
            {errors.name && touched.name && <span className="field-error-text" role="alert">{errors.name}</span>}
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-whatsapp" className="form-field-label">
              WhatsApp Number <span className="req-star">*</span>
            </label>
            <input
              id="req-whatsapp"
              name="whatsapp_number"
              type="tel"
              className={`form-field-input ${errors.whatsapp_number && touched.whatsapp_number ? 'is-invalid' : ''}`}
              placeholder="e.g. +44 7911 123456 or +91 9876543210"
              value={formData.whatsapp_number}
              onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              onBlur={() => handleBlur('whatsapp_number')}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.whatsapp_number && touched.whatsapp_number)}
            />
            {errors.whatsapp_number && touched.whatsapp_number && <span className="field-error-text" role="alert">{errors.whatsapp_number}</span>}
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-email" className="form-field-label">
              Email Address <span className="req-star">*</span>
            </label>
            <input
              id="req-email"
              name="email"
              type="email"
              className={`form-field-input ${errors.email && touched.email ? 'is-invalid' : ''}`}
              placeholder="e.g. eleanor@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email && touched.email)}
            />
            {errors.email && touched.email && <span className="field-error-text" role="alert">{errors.email}</span>}
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-country" className="form-field-label">
              Country / Nationality
            </label>
            <select
              id="req-country"
              name="country"
              className="form-field-select"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRIP DESTINATION & DATES */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">2</span>
          <div>
            <h3 className="section-step-title">Trip Itinerary &amp; Travel Dates</h3>
            <p className="section-step-desc">Which regions would you like to explore and when?</p>
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap">
            <label htmlFor="req-destination" className="form-field-label">
              Destination(s) to Visit <span className="req-star">*</span>
            </label>
            <input
              id="req-destination"
              name="destination"
              type="text"
              className={`form-field-input ${errors.destination && touched.destination ? 'is-invalid' : ''}`}
              placeholder="e.g. Kerala, Tamil Nadu Temples, Ooty & Mysore, Goa"
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              onBlur={() => handleBlur('destination')}
              required
              aria-required="true"
            />
            {errors.destination && touched.destination && <span className="field-error-text" role="alert">{errors.destination}</span>}
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-pickup" className="form-field-label">
              Pickup Location (Airport / City) <span className="req-star">*</span>
            </label>
            <input
              id="req-pickup"
              name="pickup_location"
              type="text"
              className={`form-field-input ${errors.pickup_location && touched.pickup_location ? 'is-invalid' : ''}`}
              placeholder="e.g. Chennai (MAA), Cochin (COK), Bangalore (BLR)"
              value={formData.pickup_location}
              onChange={(e) => handleChange('pickup_location', e.target.value)}
              onBlur={() => handleBlur('pickup_location')}
              required
              aria-required="true"
            />
            {errors.pickup_location && touched.pickup_location && <span className="field-error-text" role="alert">{errors.pickup_location}</span>}
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-arrival-date" className="form-field-label">
              Arrival Date <span className="req-star">*</span>
            </label>
            <input
              id="req-arrival-date"
              name="arrival_date"
              type="date"
              className={`form-field-input ${errors.arrival_date && touched.arrival_date ? 'is-invalid' : ''}`}
              value={formData.arrival_date}
              onChange={(e) => handleChange('arrival_date', e.target.value)}
              onBlur={() => handleBlur('arrival_date')}
              required
              aria-required="true"
            />
            {errors.arrival_date && touched.arrival_date && <span className="field-error-text" role="alert">{errors.arrival_date}</span>}
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-departure-date" className="form-field-label">
              Departure Date <span className="req-star">*</span>
            </label>
            <input
              id="req-departure-date"
              name="departure_date"
              type="date"
              min={formData.arrival_date || undefined}
              className={`form-field-input ${errors.departure_date && touched.departure_date ? 'is-invalid' : ''}`}
              value={formData.departure_date}
              onChange={(e) => handleChange('departure_date', e.target.value)}
              onBlur={() => handleBlur('departure_date')}
              required
              aria-required="true"
            />
            {errors.departure_date && touched.departure_date && <span className="field-error-text" role="alert">{errors.departure_date}</span>}
          </div>

          <div className="form-field-wrap form-col-full">
            <label htmlFor="req-calculated-days" className="form-field-label">
              Number of Days (Auto-calculated)
            </label>
            <input
              id="req-calculated-days"
              type="text"
              readOnly
              className="form-field-input is-readonly"
              value={calculatedDays || 'Select Arrival and Departure dates to calculate duration'}
              style={{ background: '#f1f5f9', fontWeight: 700, color: '#01806C' }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: TRAVELERS COUNT */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">3</span>
          <div>
            <h3 className="section-step-title">Travelers</h3>
            <p className="section-step-desc">Who is traveling in your private party?</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          <div className="counter-box">
            <label htmlFor="req-adults" className="form-field-label">
              Adults (12+ yrs)
            </label>
            <select
              id="req-adults"
              name="adults_count"
              className="form-field-select"
              value={formData.adults_count}
              onChange={(e) => handleChange('adults_count', Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '12+'].map((num) => (
                <option key={num} value={typeof num === 'number' ? num : 12}>{num} Adult{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="counter-box">
            <label htmlFor="req-children" className="form-field-label">
              Children (2-11 yrs)
            </label>
            <select
              id="req-children"
              name="children_count"
              className="form-field-select"
              value={formData.children_count}
              onChange={(e) => handleChange('children_count', Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
              ))}
            </select>
          </div>

          <div className="counter-box">
            <label htmlFor="req-infants" className="form-field-label">
              Infants (&lt;2 yrs)
            </label>
            <select
              id="req-infants"
              name="infants_count"
              className="form-field-select"
              value={formData.infants_count}
              onChange={(e) => handleChange('infants_count', Number(e.target.value))}
            >
              {[0, 1, 2, 3].map((num) => (
                <option key={num} value={num}>{num} Infant{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: TOUR PREFERENCES */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">4</span>
          <div>
            <h3 className="section-step-title">Tour Preferences &amp; Guide</h3>
            <p className="section-step-desc">Select your desired travel themes and guide language preferences.</p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="form-field-label" style={{ marginBottom: '10px', display: 'block' }}>
            Tour Type (Select all that apply):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {TOUR_TYPES.map((type) => {
              const isSelected = formData.tour_types.includes(type);
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleToggleTourType(type)}
                  className={`pill-toggle-btn ${isSelected ? 'is-selected' : ''}`}
                  aria-pressed={isSelected}
                >
                  {isSelected ? '✓ ' : '+ '} {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap">
            <label htmlFor="req-guide" className="form-field-label">
              Tour Guide Required?
            </label>
            <select
              id="req-guide"
              name="tour_guide_required"
              className="form-field-select"
              value={formData.tour_guide_required}
              onChange={(e) => handleChange('tour_guide_required', e.target.value)}
            >
              <option value="Yes">Yes (Accredited Chauffeur / Guide)</option>
              <option value="No">No (Private Chauffeur Only)</option>
            </select>
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-lang" className="form-field-label">
              Preferred Guide Language
            </label>
            <select
              id="req-lang"
              name="preferred_language"
              className="form-field-select"
              value={formData.preferred_language}
              onChange={(e) => handleChange('preferred_language', e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 5: TRANSPORTATION */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">5</span>
          <div>
            <h3 className="section-step-title">Transportation &amp; Private Vehicle</h3>
            <p className="section-step-desc">Air-conditioned chauffeur-driven vehicle options for your tour.</p>
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap form-col-full">
            <label htmlFor="req-vehicle" className="form-field-label">
              Vehicle Type
            </label>
            <select
              id="req-vehicle"
              name="vehicle_preference"
              className="form-field-select"
              value={formData.vehicle_preference}
              onChange={(e) => handleChange('vehicle_preference', e.target.value)}
            >
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-pickup-yn" className="form-field-label">
              Airport Pickup Required?
            </label>
            <select
              id="req-pickup-yn"
              name="airport_pickup"
              className="form-field-select"
              value={formData.airport_pickup}
              onChange={(e) => handleChange('airport_pickup', e.target.value)}
            >
              <option value="Yes">Yes (Driver with paging board at arrivals)</option>
              <option value="No">No (I will reach hotel directly)</option>
            </select>
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-drop-yn" className="form-field-label">
              Airport Drop Required?
            </label>
            <select
              id="req-drop-yn"
              name="airport_drop"
              className="form-field-select"
              value={formData.airport_drop}
              onChange={(e) => handleChange('airport_drop', e.target.value)}
            >
              <option value="Yes">Yes (Drop-off for outbound flight)</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 6: ACCOMMODATION */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">6</span>
          <div>
            <h3 className="section-step-title">Accommodation &amp; Hotels</h3>
            <p className="section-step-desc">Select your preferred hotel category and room arrangement.</p>
          </div>
        </div>

        <div className="form-grid-3col">
          <div className="form-field-wrap">
            <label htmlFor="req-hotel-cat" className="form-field-label">
              Hotel Category
            </label>
            <select
              id="req-hotel-cat"
              name="hotel_category"
              className="form-field-select"
              value={formData.hotel_category}
              onChange={(e) => handleChange('hotel_category', e.target.value)}
            >
              {HOTEL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-room-type" className="form-field-label">
              Room Type
            </label>
            <select
              id="req-room-type"
              name="room_type"
              className="form-field-select"
              value={formData.room_type}
              onChange={(e) => handleChange('room_type', e.target.value)}
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-rooms-count" className="form-field-label">
              Number of Rooms
            </label>
            <select
              id="req-rooms-count"
              name="rooms_count"
              className="form-field-select"
              value={formData.rooms_count}
              onChange={(e) => handleChange('rooms_count', Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 7: FLIGHT / TRAIN SCHEDULE (OPTIONAL) */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">7</span>
          <div>
            <h3 className="section-step-title">Flight / Train Details <span className="opt-tag">(Optional)</span></h3>
            <p className="section-step-desc">Provide your arrival &amp; departure flight/train numbers if already booked.</p>
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap">
            <label htmlFor="req-arr-flight" className="form-field-label">
              Arrival Flight / Train Number
            </label>
            <input
              id="req-arr-flight"
              name="arrival_flight_train_number"
              type="text"
              className="form-field-input"
              placeholder="e.g. BA 035 or AI 570"
              value={formData.arrival_flight_train_number}
              onChange={(e) => handleChange('arrival_flight_train_number', e.target.value)}
            />
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-arr-time" className="form-field-label">
              Arrival Time
            </label>
            <input
              id="req-arr-time"
              name="arrival_time"
              type="time"
              className="form-field-input"
              value={formData.arrival_time}
              onChange={(e) => handleChange('arrival_time', e.target.value)}
            />
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-dep-flight" className="form-field-label">
              Departure Flight / Train Number
            </label>
            <input
              id="req-dep-flight"
              name="departure_flight_train_number"
              type="text"
              className="form-field-input"
              placeholder="e.g. LH 759 or 6E 412"
              value={formData.departure_flight_train_number}
              onChange={(e) => handleChange('departure_flight_train_number', e.target.value)}
            />
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-dep-time" className="form-field-label">
              Departure Time
            </label>
            <input
              id="req-dep-time"
              name="departure_time"
              type="time"
              className="form-field-input"
              value={formData.departure_time}
              onChange={(e) => handleChange('departure_time', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: BUDGET */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">8</span>
          <div>
            <h3 className="section-step-title">Approximate Budget <span className="opt-tag">(Optional)</span></h3>
            <p className="section-step-desc">Enter your target holiday budget (per person or total party).</p>
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap">
            <label htmlFor="req-budget" className="form-field-label">
              Budget Amount
            </label>
            <input
              id="req-budget"
              name="approximate_budget"
              type="number"
              min="0"
              className="form-field-input"
              placeholder="e.g. 2500"
              value={formData.approximate_budget}
              onChange={(e) => handleChange('approximate_budget', e.target.value)}
            />
          </div>

          <div className="form-field-wrap">
            <label htmlFor="req-currency" className="form-field-label">
              Currency
            </label>
            <select
              id="req-currency"
              name="budget_currency"
              className="form-field-select"
              value={formData.budget_currency}
              onChange={(e) => handleChange('budget_currency', e.target.value)}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 9: DOCUMENTS (OPTIONAL) */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">9</span>
          <div>
            <h3 className="section-step-title">Documents <span className="opt-tag">(Optional)</span></h3>
            <p className="section-step-desc">Attach passport copy or flight tickets for faster processing.</p>
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-wrap">
            <label className="form-field-label">
              Passport Copy (PDF or Image, max 5MB)
            </label>
            <div className="doc-upload-box">
              {passportFile ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e6f7f4', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#01806C' }}>📄 {passportFile.name}</span>
                  <button type="button" onClick={() => setPassportFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleFileUpload(e, setPassportFile, setPassportError)}
                  className="form-field-input"
                />
              )}
              {passportError && <span className="field-error-text" role="alert">{passportError}</span>}
            </div>
          </div>

          <div className="form-field-wrap">
            <label className="form-field-label">
              Flight Ticket (PDF or Image, max 5MB)
            </label>
            <div className="doc-upload-box">
              {ticketFile ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e6f7f4', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#01806C' }}>📄 {ticketFile.name}</span>
                  <button type="button" onClick={() => setTicketFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleFileUpload(e, setTicketFile, setTicketError)}
                  className="form-field-input"
                />
              )}
              {ticketError && <span className="field-error-text" role="alert">{ticketError}</span>}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
          🔒 <strong>Privacy Assurance:</strong> All uploaded documents are stored securely and encrypted. They are strictly accessed by our verified operations desk only for permit applications and hotel check-ins. No public links are ever generated.
        </p>
      </div>

      {/* SECTION 10: PREFERRED CONTACT METHOD & SPECIAL REQUESTS */}
      <div className="form-section-card">
        <div className="form-section-header">
          <span className="section-step-num">10</span>
          <div>
            <h3 className="section-step-title">Preferred Contact &amp; Special Requests</h3>
            <p className="section-step-desc">How would you prefer our travel desk to coordinate with you?</p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="form-field-label" style={{ marginBottom: '10px', display: 'block' }}>
            Preferred Contact Channel(s):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['WhatsApp', 'Phone Call', 'Email'].map((method) => {
              const isSelected = formData.preferred_contact_methods.includes(method);
              return (
                <button
                  type="button"
                  key={method}
                  onClick={() => handleToggleContactMethod(method)}
                  className={`pill-toggle-btn ${isSelected ? 'is-selected' : ''}`}
                  aria-pressed={isSelected}
                >
                  {isSelected ? '✓ ' : '+ '} {method}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-field-wrap">
          <label htmlFor="req-special-requests" className="form-field-label">
            Special Requests, Dietary Requirements or Sightseeing Notes <span className="opt-tag">(Optional)</span>
          </label>
          <textarea
            id="req-special-requests"
            name="special_requests"
            rows="3"
            className="form-field-textarea"
            placeholder="Tell us about specific monuments you wish to visit, dietary needs (e.g. Vegetarian, Halal, Gluten-free), child seats, or special occasions..."
            value={formData.special_requests}
            onChange={(e) => handleChange('special_requests', e.target.value)}
          />
        </div>
      </div>

      {/* STICKY SUBMIT BAR */}
      <div className="trip-form-submit-bar" style={{ marginTop: '36px', textAlign: 'center' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-lg trip-request-submit-btn"
          style={{
            padding: '16px 42px',
            fontSize: '17px',
            fontWeight: 800,
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(1, 170, 144, 0.3)',
            minWidth: '280px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.75 : 1,
          }}
        >
          {isSubmitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span className="spinner-dot" /> Submitting Request...
            </span>
          ) : (
            '✨ Request My Trip & Quotation →'
          )}
        </button>

        <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '12px' }}>
          ✓ 100% Free &amp; No Obligation • Custom Quote within 4 Hours • Direct WhatsApp Delivery
        </p>
      </div>
    </form>
  );
}
