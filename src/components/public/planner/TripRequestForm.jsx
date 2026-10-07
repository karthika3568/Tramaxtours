import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import inquiryService from '../../../services/inquiryService';
import bookingService from '../../../services/bookingService';
import { useToast } from '../../../context/ToastContext';

export const REQUIRE_GMAIL = true;

export const COUNTRY_OPTIONS = [
  { name: 'India', dialCode: '+91' },
  { name: 'United Kingdom', dialCode: '+44' },
  { name: 'United States', dialCode: '+1' },
  { name: 'Germany', dialCode: '+49' },
  { name: 'France', dialCode: '+33' },
  { name: 'Netherlands', dialCode: '+31' },
  { name: 'Australia', dialCode: '+61' },
  { name: 'Malaysia', dialCode: '+60' },
  { name: 'Singapore', dialCode: '+65' },
  { name: 'United Arab Emirates', dialCode: '+971' },
  { name: 'Canada', dialCode: '+1' },
  { name: 'Switzerland', dialCode: '+41' },
  { name: 'Italy', dialCode: '+39' },
  { name: 'Spain', dialCode: '+34' },
  { name: 'Sri Lanka', dialCode: '+94' },
  { name: 'Other', dialCode: '+1' },
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

export default function TripRequestForm({
  initialDestination = '',
  initialTour = '',
  prefilledData = {},
  isBookingMode = false,
  tour = null,
  onBookingSuccess = null,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const formRef = useRef(null);

  // Today's date for date picker min constraint
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Parse legacy prefilled name if passed
  const initialFirstName = prefilledData.first_name || (prefilledData.name ? prefilledData.name.split(' ')[0] : '');
  const initialLastName = prefilledData.last_name || (prefilledData.name ? prefilledData.name.split(' ').slice(1).join(' ') : '');

  const tourDestination = tour?.destination?.name || tour?.destination_name || (typeof tour?.destination === 'string' ? tour.destination : '') || '';
  const tourTitle = tour?.title || initialTour || '';

  // Form Field State — ALL start completely empty (NO PREDEFINED/HARDCODED DEFAULTS)
  const [formData, setFormData] = useState({
    first_name: initialFirstName || '',
    middle_name: prefilledData.middle_name || '',
    last_name: initialLastName || '',
    country: prefilledData.country || '',
    dial_code: prefilledData.dial_code || '',
    phone: (prefilledData.phone || prefilledData.whatsapp_number || '').replace(/\D/g, ''),
    email: prefilledData.email || '',
    destination: initialDestination || prefilledData.destination || tourDestination || tourTitle || '',
    pickup_location: prefilledData.pickup_location || '',
    arrival_date: prefilledData.arrival_date || (tour?.selectedDate || ''),
    departure_date: prefilledData.departure_date || '',
    adults_count: prefilledData.adults_count !== undefined && prefilledData.adults_count !== '' ? prefilledData.adults_count : '',
    children_count: prefilledData.children_count !== undefined && prefilledData.children_count !== '' ? prefilledData.children_count : '',
    infants_count: prefilledData.infants_count !== undefined && prefilledData.infants_count !== '' ? prefilledData.infants_count : '',
    tour_types: Array.isArray(prefilledData.tour_types) ? prefilledData.tour_types : [],
    tour_guide_required: prefilledData.tour_guide_required || '',
    preferred_language: prefilledData.preferred_language || '',
    vehicle_preference: prefilledData.vehicle_preference || '',
    airport_pickup: prefilledData.airport_pickup || '',
    airport_drop: prefilledData.airport_drop || '',
    hotel_category: prefilledData.hotel_category || '',
    room_type: prefilledData.room_type || '',
    rooms_count: prefilledData.rooms_count !== undefined && prefilledData.rooms_count !== '' ? prefilledData.rooms_count : '',
    arrival_flight_train_number: prefilledData.arrival_flight_train_number || '',
    arrival_time: prefilledData.arrival_time || '',
    departure_flight_train_number: prefilledData.departure_flight_train_number || '',
    departure_time: prefilledData.departure_time || '',
    approximate_budget: prefilledData.approximate_budget || '',
    budget_currency: prefilledData.budget_currency || (tour?.currency || ''),
    preferred_contact_methods: Array.isArray(prefilledData.preferred_contact_methods) ? prefilledData.preferred_contact_methods : [],
    special_requests: prefilledData.special_requests || '',
  });

  // Pre-fill destination or tour if changed via props
  useEffect(() => {
    if (initialDestination) {
      setFormData((prev) => ({ ...prev, destination: initialDestination }));
    } else if (tourDestination) {
      setFormData((prev) => ({ ...prev, destination: tourDestination }));
    }
  }, [initialDestination, tourDestination]);

  useEffect(() => {
    if (tour?.selectedDate) {
      setFormData((prev) => ({ ...prev, arrival_date: tour.selectedDate }));
    }
  }, [tour?.selectedDate]);

  // Document attachments
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
    if (isBookingMode && tour?.duration_days) {
      return tour.duration_text || `${tour.duration_days} Days`;
    }
    if (!formData.arrival_date || !formData.departure_date) return '';
    const arr = new Date(formData.arrival_date);
    const dep = new Date(formData.departure_date);
    if (isNaN(arr.getTime()) || isNaN(dep.getTime())) return '';
    const diffTime = dep.getTime() - arr.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) return 'Invalid dates (Departure before arrival)';
    const nights = Math.max(0, diffDays - 1);
    return `${diffDays} Days / ${nights} Nights`;
  }, [formData.arrival_date, formData.departure_date, isBookingMode, tour]);

  // Live Price Calculation in Booking Mode
  const bookingPricing = useMemo(() => {
    if (!isBookingMode || !tour) return null;
    const basePrice = Number(tour.base_price || 0);
    const childPrice = Math.round(basePrice * 0.5);
    const adults = Number(formData.adults_count) || 0;
    const children = Number(formData.children_count) || 0;
    const subtotal = (adults * basePrice) + (children * childPrice);
    const currency = tour.currency || 'INR';
    const symbol = currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : currency;
    return {
      basePrice,
      childPrice,
      adults,
      children,
      subtotal,
      total: subtotal,
      currency,
      symbol,
    };
  }, [isBookingMode, tour, formData.adults_count, formData.children_count]);

  // Validation Logic
  const validateField = (field, value, allData = formData) => {
    let err = '';
    const nameRegex = /^[a-zA-Z\s'-]+$/;

    switch (field) {
      case 'first_name': {
        const val = (value || '').trim();
        if (!val) {
          err = 'First Name is required.';
        } else if (val.length < 2) {
          err = 'First Name must contain at least 2 characters.';
        } else if (!nameRegex.test(val)) {
          err = 'First Name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        break;
      }
      case 'middle_name': {
        const val = (value || '').trim();
        if (val && !nameRegex.test(val)) {
          err = 'Middle Name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        break;
      }
      case 'last_name': {
        const val = (value || '').trim();
        if (!val) {
          err = 'Last Name is required.';
        } else if (val.length < 2) {
          err = 'Last Name must contain at least 2 characters.';
        } else if (!nameRegex.test(val)) {
          err = 'Last Name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        break;
      }
      case 'email': {
        const val = (value || '').trim();
        if (!val) {
          err = 'Email Address is required.';
        } else if (REQUIRE_GMAIL) {
          if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val)) {
            err = 'Please enter a valid Gmail address (example@gmail.com)';
          }
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          err = 'Please enter a valid email address.';
        }
        break;
      }
      case 'phone': {
        const digits = (value || '').replace(/\D/g, '');
        if (!digits) {
          err = 'Phone / WhatsApp number is required.';
        } else if (digits.length < 7 || digits.length > 15) {
          err = 'Please enter a valid phone number (7 to 15 digits).';
        }
        break;
      }
      case 'destination': {
        if (!value || !value.trim()) {
          err = 'Please specify your destination(s).';
        }
        break;
      }
      case 'pickup_location': {
        if (!value || !value.trim()) {
          err = 'Pickup location (City, Airport, or Hotel) is required.';
        }
        break;
      }
      case 'arrival_date': {
        if (!value) {
          err = isBookingMode ? 'Travel / Booking Date is required.' : 'Arrival Date is required.';
        } else if (value < todayStr) {
          err = 'Date cannot be in the past.';
        }
        break;
      }
      case 'departure_date': {
        if (!isBookingMode) {
          if (!value) {
            err = 'Departure Date is required.';
          } else if (allData.arrival_date && value < allData.arrival_date) {
            err = 'Departure date cannot be before arrival date.';
          }
        }
        break;
      }
      case 'adults_count': {
        if (!value || Number(value) < 1) {
          err = 'Please select at least 1 adult.';
        }
        break;
      }
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
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        const err = validateField(field, value, next);
        setErrors((prevErr) => ({ ...prevErr, [field]: err }));
      }
      // Re-validate departure date if arrival date changes
      if (field === 'arrival_date' && touched.departure_date && next.departure_date) {
        const depErr = validateField('departure_date', next.departure_date, next);
        setErrors((prevErr) => ({ ...prevErr, departure_date: depErr }));
      }
      return next;
    });
  };

  // Country Change: Auto-fills dial code
  const handleCountryChange = (countryName) => {
    const matched = COUNTRY_OPTIONS.find((c) => c.name === countryName);
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      dial_code: matched ? matched.dialCode : prev.dial_code,
    }));
    if (touched.country) {
      setErrors((prev) => ({ ...prev, country: '' }));
    }
  };

  // Phone input: Filter digits only while typing / pasting
  const handlePhoneChange = (rawInput) => {
    const digitsOnly = rawInput.replace(/\D/g, '');
    handleChange('phone', digitsOnly);
  };

  // Checkbox / pill toggles
  const handleToggleTourType = (type) => {
    setFormData((prev) => {
      const current = prev.tour_types || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, tour_types: updated };
    });
  };

  const handleToggleContactMethod = (method) => {
    setFormData((prev) => {
      const current = prev.preferred_contact_methods || [];
      const updated = current.includes(method)
        ? current.filter((m) => m !== method)
        : [...current, method];
      return { ...prev, preferred_contact_methods: updated };
    });
  };

  // File Upload Handlers (Allowed: PDF, JPEG, PNG, WEBP, Max 10MB)
  const handleFileUpload = (e, setFile, setFileError) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file format. Please upload PDF, JPEG, PNG, or WEBP.');
      setFile(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller file.');
      setFile(null);
      return;
    }

    setFileError('');
    setFile(file);
  };

  // Focus helper for the first invalid input element
  const focusFirstError = (validationErrors) => {
    const fieldOrder = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'phone',
      'destination',
      'pickup_location',
      'arrival_date',
      'departure_date',
      'adults_count',
    ];

    for (const f of fieldOrder) {
      if (validationErrors[f]) {
        const el = formRef.current?.querySelector(`[name="${f}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          break;
        }
      }
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const fieldsToValidate = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'phone',
      'destination',
      'pickup_location',
      'arrival_date',
      ...(!isBookingMode ? ['departure_date'] : []),
      'adults_count',
    ];

    const newErrors = {};
    const newTouched = {};

    fieldsToValidate.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, formData[f], formData);
      if (err) newErrors[f] = err;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the required fields marked in red.', 'Incomplete Details');
      setTimeout(() => focusFirstError(newErrors), 50);
      return;
    }

    setIsSubmitting(true);

    try {
      const computedFullName = `${formData.first_name.trim()} ${formData.middle_name.trim() ? formData.middle_name.trim() + ' ' : ''}${formData.last_name.trim()}`.trim();
      const dialCodeVal = formData.dial_code.trim() || '+91';
      const combinedPhone = `${dialCodeVal} ${formData.phone.trim()}`.trim();
      const adultsNum = Number(formData.adults_count) || 1;
      const childrenNum = formData.children_count !== '' ? Number(formData.children_count) : 0;
      const infantsNum = formData.infants_count !== '' ? Number(formData.infants_count) : 0;
      const totalGuests = adultsNum + childrenNum;

      if (isBookingMode && tour) {
        // BOOKING MODE: Dispatch to bookingService.createBooking
        const basePrice = Number(tour.base_price || 0);
        const childPrice = Math.round(basePrice * 0.5);
        const subtotal = (adultsNum * basePrice) + (childrenNum * childPrice);
        const totalPrice = subtotal;

        const bookingPayload = {
          tour_id: tour.id,
          first_name: formData.first_name.trim(),
          middle_name: formData.middle_name.trim() || null,
          last_name: formData.last_name.trim(),
          name: computedFullName,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          dial_code: dialCodeVal,
          country: formData.country || 'India',
          address_line1: formData.pickup_location.trim() || 'Hotel / Airport Pickup',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postal_code: '600001',
          destination_name: formData.destination.trim() || tour.title,
          pickup_location: formData.pickup_location.trim(),
          booking_date: formData.arrival_date,
          arrival_date: formData.arrival_date,
          departure_date: formData.departure_date || null,
          duration_days: calculatedDays || (tour.duration_days ? `${tour.duration_days} Days` : null),
          tickets_count: totalGuests,
          adults_count: adultsNum,
          children_count: childrenNum,
          infants_count: infantsNum,
          tour_types: formData.tour_types.length > 0 ? formData.tour_types : null,
          tour_guide_required: formData.tour_guide_required === 'Yes',
          preferred_language: formData.preferred_language || null,
          vehicle_preference: formData.vehicle_preference || null,
          airport_pickup: formData.airport_pickup === 'Yes',
          airport_drop: formData.airport_drop === 'Yes',
          hotel_category: formData.hotel_category || null,
          room_type: formData.room_type || null,
          rooms_count: formData.rooms_count !== '' ? Number(formData.rooms_count) : null,
          arrival_flight_train_number: formData.arrival_flight_train_number.trim() || null,
          arrival_time: formData.arrival_time.trim() || null,
          departure_flight_train_number: formData.departure_flight_train_number.trim() || null,
          departure_time: formData.departure_time.trim() || null,
          approximate_budget: formData.approximate_budget.trim() || null,
          budget_currency: formData.budget_currency || (tour.currency || 'INR'),
          preferred_contact_methods: formData.preferred_contact_methods.length > 0 ? formData.preferred_contact_methods : null,
          special_requests: formData.special_requests.trim() || null,
          unit_price: basePrice,
          subtotal: subtotal,
          total_price: totalPrice,
          currency: tour.currency || 'INR',
          payment_method: 'pay_on_arrival',
          payment_status: 'pending',
          booking_status: 'pending',
        };

        if (passportFile) {
          bookingPayload.passport_file_url = `[Attached Document] ${passportFile.name} (${Math.round(passportFile.size / 1024)} KB)`;
        }
        if (ticketFile) {
          bookingPayload.flight_ticket_url = `[Attached Document] ${ticketFile.name} (${Math.round(ticketFile.size / 1024)} KB)`;
        }

        const response = await bookingService.createBooking(bookingPayload);
        const createdData = response?.data || response;
        toast.success('Your tour booking reservation has been placed successfully!', 'Booking Confirmed');

        if (onBookingSuccess) {
          onBookingSuccess(createdData);
        }
      } else {
        // TRIP REQUEST MODE: Dispatch to inquiryService.createTripRequest
        const payload = {
          first_name: formData.first_name.trim(),
          middle_name: formData.middle_name.trim() || null,
          last_name: formData.last_name.trim(),
          name: computedFullName,
          dial_code: dialCodeVal,
          phone: formData.phone.trim(),
          whatsapp_number: combinedPhone,
          email: formData.email.trim().toLowerCase(),
          country: formData.country || null,
          nationality: formData.country || null,
          destination: formData.destination.trim(),
          destination_name: formData.destination.trim(),
          pickup_location: formData.pickup_location.trim(),
          arrival_date: formData.arrival_date,
          departure_date: formData.departure_date,
          travel_date: formData.arrival_date,
          duration_days: calculatedDays || null,
          number_of_days: calculatedDays || null,
          adults_count: adultsNum,
          children_count: childrenNum,
          infants_count: infantsNum,
          travelers: adultsNum + childrenNum + infantsNum,
          tour_types: formData.tour_types.length > 0 ? formData.tour_types : null,
          tour_preferences: formData.tour_types.length > 0 ? formData.tour_types : null,
          tour_guide_required: formData.tour_guide_required ? (formData.tour_guide_required === 'Yes') : null,
          preferred_language: formData.preferred_language || null,
          vehicle_preference: formData.vehicle_preference || null,
          vehicle: formData.vehicle_preference || null,
          airport_pickup: formData.airport_pickup ? (formData.airport_pickup === 'Yes') : null,
          airport_drop: formData.airport_drop ? (formData.airport_drop === 'Yes') : null,
          hotel_category: formData.hotel_category || null,
          room_type: formData.room_type || null,
          rooms_count: formData.rooms_count !== '' ? Number(formData.rooms_count) : null,
          arrival_flight_train_number: formData.arrival_flight_train_number.trim() || null,
          arrival_time: formData.arrival_time.trim() || null,
          departure_flight_train_number: formData.departure_flight_train_number.trim() || null,
          departure_time: formData.departure_time.trim() || null,
          approximate_budget: formData.approximate_budget.trim() || null,
          budget_currency: formData.budget_currency || null,
          preferred_contact_methods: formData.preferred_contact_methods.length > 0 ? formData.preferred_contact_methods : null,
          special_requests: formData.special_requests.trim() || null,
          message: formData.special_requests.trim() || `Custom itinerary request for ${formData.destination} (${calculatedDays}).`,
          subject: `Trip Request: ${formData.destination} (${calculatedDays})`,
          tour_title: tourTitle || (formData.destination ? `Custom Trip: ${formData.destination}` : null),
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
      }
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
        const firstKey = Object.keys(serverErrors)[0];
        const el = formRef.current?.querySelector(`[name="${firstKey}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg, 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="trip-request-single-card" noValidate>
      {/* Global Server Error Banner */}
      {serverError && (
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '24px', fontSize: '14px' }}>
          <strong>⚠️ Submission Error:</strong> {serverError}
        </div>
      )}

      {/* Booking Mode Tour Summary Header */}
      {isBookingMode && tour && (
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d' }}>
                Selected Tour Package
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#14532d' }}>
                {tour.title}
              </h3>
            </div>
            {bookingPricing && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#166534' }}>Estimated Total</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>
                  {bookingPricing.symbol}{bookingPricing.total.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. First Name */}
      <div className="trip-form-row">
        <label htmlFor="req-first-name" className="trip-form-label">
          <span>First Name <span className="req-star">*</span></span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-first-name"
            name="first_name"
            type="text"
            className={`trip-form-input ${errors.first_name && touched.first_name ? 'is-invalid' : ''}`}
            placeholder="e.g. John"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            onBlur={() => handleBlur('first_name')}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.first_name && touched.first_name)}
          />
          {errors.first_name && touched.first_name && <span className="field-error-text" role="alert">{errors.first_name}</span>}
        </div>
      </div>

      {/* 2. Middle Name */}
      <div className="trip-form-row">
        <label htmlFor="req-middle-name" className="trip-form-label">
          <span>Middle Name</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-middle-name"
            name="middle_name"
            type="text"
            className={`trip-form-input ${errors.middle_name && touched.middle_name ? 'is-invalid' : ''}`}
            placeholder="e.g. Robert"
            value={formData.middle_name}
            onChange={(e) => handleChange('middle_name', e.target.value)}
            onBlur={() => handleBlur('middle_name')}
            aria-invalid={Boolean(errors.middle_name && touched.middle_name)}
          />
          {errors.middle_name && touched.middle_name && <span className="field-error-text" role="alert">{errors.middle_name}</span>}
        </div>
      </div>

      {/* 3. Last Name */}
      <div className="trip-form-row">
        <label htmlFor="req-last-name" className="trip-form-label">
          <span>Last Name <span className="req-star">*</span></span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-last-name"
            name="last_name"
            type="text"
            className={`trip-form-input ${errors.last_name && touched.last_name ? 'is-invalid' : ''}`}
            placeholder="e.g. Smith"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            onBlur={() => handleBlur('last_name')}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.last_name && touched.last_name)}
          />
          {errors.last_name && touched.last_name && <span className="field-error-text" role="alert">{errors.last_name}</span>}
        </div>
      </div>

      {/* 4. Country / Nationality */}
      <div className="trip-form-row">
        <label htmlFor="req-country" className="trip-form-label">
          <span>Country / Nationality <span className="req-star">*</span></span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-country"
            name="country"
            className="trip-form-select"
            value={formData.country}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select country...</option>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Phone / WhatsApp Number */}
      <div className="trip-form-row">
        <label htmlFor="req-phone" className="trip-form-label">
          <span>Phone / WhatsApp <span className="req-star">*</span></span>
          <span className="label-subtitle">Digits only, country code stored separately</span>
        </label>
        <div className="trip-form-control">
          <div className="trip-phone-group">
            <input
              id="req-dial-code"
              name="dial_code"
              type="text"
              className="trip-form-input"
              value={formData.dial_code}
              onChange={(e) => handleChange('dial_code', e.target.value)}
              placeholder="+91"
              title="Country dial code"
              style={{ fontWeight: 700, textAlign: 'center' }}
            />
            <input
              id="req-phone"
              name="phone"
              type="tel"
              className={`trip-form-input ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => handleBlur('phone')}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.phone && touched.phone)}
            />
          </div>
          {errors.phone && touched.phone && <span className="field-error-text" role="alert">{errors.phone}</span>}
        </div>
      </div>

      {/* 6. Email Address */}
      <div className="trip-form-row">
        <label htmlFor="req-email" className="trip-form-label">
          <span>Email Address <span className="req-star">*</span></span>
          {REQUIRE_GMAIL && <span className="label-subtitle">@gmail.com required</span>}
        </label>
        <div className="trip-form-control">
          <input
            id="req-email"
            name="email"
            type="email"
            className={`trip-form-input ${errors.email && touched.email ? 'is-invalid' : ''}`}
            placeholder="e.g. yourname@gmail.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email && touched.email)}
          />
          {errors.email && touched.email && <span className="field-error-text" role="alert">{errors.email}</span>}
        </div>
      </div>

      {/* 7. Destination(s) to Visit */}
      <div className="trip-form-row">
        <label htmlFor="req-destination" className="trip-form-label">
          <span>Destination(s) <span className="req-star">*</span></span>
          {isBookingMode && <span className="label-subtitle">(From Selected Tour)</span>}
        </label>
        <div className="trip-form-control">
          <input
            id="req-destination"
            name="destination"
            type="text"
            className={`trip-form-input ${errors.destination && touched.destination ? 'is-invalid' : ''}`}
            placeholder="e.g. Kerala, Tamil Nadu Temples, Ooty & Mysore"
            value={formData.destination}
            onChange={(e) => handleChange('destination', e.target.value)}
            onBlur={() => handleBlur('destination')}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.destination && touched.destination)}
          />
          {errors.destination && touched.destination && <span className="field-error-text" role="alert">{errors.destination}</span>}
        </div>
      </div>

      {/* 8. Pickup Location */}
      <div className="trip-form-row">
        <label htmlFor="req-pickup" className="trip-form-label">
          <span>Pickup Location <span className="req-star">*</span></span>
          <span className="label-subtitle">Airport, City, or Hotel</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-pickup"
            name="pickup_location"
            type="text"
            className={`trip-form-input ${errors.pickup_location && touched.pickup_location ? 'is-invalid' : ''}`}
            placeholder="e.g. Chennai (MAA), Cochin (COK), Bangalore (BLR)"
            value={formData.pickup_location}
            onChange={(e) => handleChange('pickup_location', e.target.value)}
            onBlur={() => handleBlur('pickup_location')}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.pickup_location && touched.pickup_location)}
          />
          {errors.pickup_location && touched.pickup_location && <span className="field-error-text" role="alert">{errors.pickup_location}</span>}
        </div>
      </div>

      {/* 9. Arrival Date / Travel Date */}
      <div className="trip-form-row">
        <label htmlFor="req-arrival-date" className="trip-form-label">
          <span>{isBookingMode ? 'Travel / Booking Date' : 'Arrival Date'} <span className="req-star">*</span></span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-arrival-date"
            name="arrival_date"
            type="date"
            min={todayStr}
            className={`trip-form-input ${errors.arrival_date && touched.arrival_date ? 'is-invalid' : ''}`}
            value={formData.arrival_date}
            onChange={(e) => handleChange('arrival_date', e.target.value)}
            onBlur={() => handleBlur('arrival_date')}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.arrival_date && touched.arrival_date)}
          />
          {errors.arrival_date && touched.arrival_date && <span className="field-error-text" role="alert">{errors.arrival_date}</span>}
        </div>
      </div>

      {/* 10. Departure Date (Optional in single-day booking mode, Required in Trip Request) */}
      {!isBookingMode && (
        <div className="trip-form-row">
          <label htmlFor="req-departure-date" className="trip-form-label">
            <span>Departure Date <span className="req-star">*</span></span>
          </label>
          <div className="trip-form-control">
            <input
              id="req-departure-date"
              name="departure_date"
              type="date"
              min={formData.arrival_date || todayStr}
              className={`trip-form-input ${errors.departure_date && touched.departure_date ? 'is-invalid' : ''}`}
              value={formData.departure_date}
              onChange={(e) => handleChange('departure_date', e.target.value)}
              onBlur={() => handleBlur('departure_date')}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.departure_date && touched.departure_date)}
            />
            {errors.departure_date && touched.departure_date && <span className="field-error-text" role="alert">{errors.departure_date}</span>}
          </div>
        </div>
      )}

      {/* 11. Number of Days */}
      <div className="trip-form-row">
        <label htmlFor="req-calculated-days" className="trip-form-label">
          <span>Tour Duration</span>
          <span className="label-subtitle">{isBookingMode ? '(Package Duration)' : '(Auto-calculated)'}</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-calculated-days"
            type="text"
            readOnly
            className="trip-form-input"
            value={calculatedDays || (isBookingMode ? 'Standard Package Duration' : 'Select Arrival and Departure dates to calculate duration')}
            style={{ background: '#f1f5f9', fontWeight: 700, color: '#1226de' }}
          />
        </div>
      </div>

      {/* 12. Adults */}
      <div className="trip-form-row">
        <label htmlFor="req-adults" className="trip-form-label">
          <span>Adults (12+ yrs) <span className="req-star">*</span></span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-adults"
            name="adults_count"
            className={`trip-form-select ${errors.adults_count && touched.adults_count ? 'is-invalid' : ''}`}
            value={formData.adults_count}
            onChange={(e) => handleChange('adults_count', e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={() => handleBlur('adults_count')}
            required
          >
            <option value="">Select adults...</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '12+'].map((num) => (
              <option key={num} value={typeof num === 'number' ? num : 12}>
                {num} Adult{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          {errors.adults_count && touched.adults_count && <span className="field-error-text" role="alert">{errors.adults_count}</span>}
        </div>
      </div>

      {/* 13. Children */}
      <div className="trip-form-row">
        <label htmlFor="req-children" className="trip-form-label">
          <span>Children (2-11 yrs)</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-children"
            name="children_count"
            className="trip-form-select"
            value={formData.children_count}
            onChange={(e) => handleChange('children_count', e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Select children...</option>
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Child{num !== 1 ? 'ren' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 14. Infants */}
      <div className="trip-form-row">
        <label htmlFor="req-infants" className="trip-form-label">
          <span>Infants (&lt;2 yrs)</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-infants"
            name="infants_count"
            className="trip-form-select"
            value={formData.infants_count}
            onChange={(e) => handleChange('infants_count', e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Select infants...</option>
            {[0, 1, 2, 3].map((num) => (
              <option key={num} value={num}>
                {num} Infant{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 15. Tour Types */}
      <div className="trip-form-row">
        <label className="trip-form-label">
          <span>Tour Preferences</span>
          <span className="label-subtitle">Select all that apply</span>
        </label>
        <div className="trip-form-control">
          <div className="trip-pills-container">
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
      </div>

      {/* 16. Tour Guide Required */}
      <div className="trip-form-row">
        <label htmlFor="req-guide" className="trip-form-label">
          <span>Tour Guide Required?</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-guide"
            name="tour_guide_required"
            className="trip-form-select"
            value={formData.tour_guide_required}
            onChange={(e) => handleChange('tour_guide_required', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Yes">Yes (Accredited Guide at monuments)</option>
            <option value="No">No (Private Chauffeur Only)</option>
          </select>
        </div>
      </div>

      {/* 17. Preferred Guide Language */}
      <div className="trip-form-row">
        <label htmlFor="req-lang" className="trip-form-label">
          <span>Guide Language</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-lang"
            name="preferred_language"
            className="trip-form-select"
            value={formData.preferred_language}
            onChange={(e) => handleChange('preferred_language', e.target.value)}
          >
            <option value="">Select language...</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 18. Vehicle Preference */}
      <div className="trip-form-row">
        <label htmlFor="req-vehicle" className="trip-form-label">
          <span>Vehicle Type</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-vehicle"
            name="vehicle_preference"
            className="trip-form-select"
            value={formData.vehicle_preference}
            onChange={(e) => handleChange('vehicle_preference', e.target.value)}
          >
            <option value="">Select vehicle...</option>
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 19. Airport Pickup */}
      <div className="trip-form-row">
        <label htmlFor="req-pickup-yn" className="trip-form-label">
          <span>Airport Pickup?</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-pickup-yn"
            name="airport_pickup"
            className="trip-form-select"
            value={formData.airport_pickup}
            onChange={(e) => handleChange('airport_pickup', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Yes">Yes (Driver with paging board at arrivals)</option>
            <option value="No">No (I will reach hotel directly)</option>
          </select>
        </div>
      </div>

      {/* 20. Airport Drop */}
      <div className="trip-form-row">
        <label htmlFor="req-drop-yn" className="trip-form-label">
          <span>Airport Drop?</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-drop-yn"
            name="airport_drop"
            className="trip-form-select"
            value={formData.airport_drop}
            onChange={(e) => handleChange('airport_drop', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Yes">Yes (Drop-off for outbound flight)</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* 21. Hotel Category */}
      <div className="trip-form-row">
        <label htmlFor="req-hotel-cat" className="trip-form-label">
          <span>Hotel Category</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-hotel-cat"
            name="hotel_category"
            className="trip-form-select"
            value={formData.hotel_category}
            onChange={(e) => handleChange('hotel_category', e.target.value)}
          >
            <option value="">Select hotel category...</option>
            {HOTEL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 22. Room Type */}
      <div className="trip-form-row">
        <label htmlFor="req-room-type" className="trip-form-label">
          <span>Room Type</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-room-type"
            name="room_type"
            className="trip-form-select"
            value={formData.room_type}
            onChange={(e) => handleChange('room_type', e.target.value)}
          >
            <option value="">Select room type...</option>
            {ROOM_TYPES.map((rt) => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 23. Number of Rooms */}
      <div className="trip-form-row">
        <label htmlFor="req-rooms-count" className="trip-form-label">
          <span>Number of Rooms</span>
        </label>
        <div className="trip-form-control">
          <select
            id="req-rooms-count"
            name="rooms_count"
            className="trip-form-select"
            value={formData.rooms_count}
            onChange={(e) => handleChange('rooms_count', e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Select rooms...</option>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 24. Arrival Flight/Train Number */}
      <div className="trip-form-row">
        <label htmlFor="req-arr-flight" className="trip-form-label">
          <span>Arrival Flight / Train #</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-arr-flight"
            name="arrival_flight_train_number"
            type="text"
            className="trip-form-input"
            placeholder="e.g. BA 035 or AI 570"
            value={formData.arrival_flight_train_number}
            onChange={(e) => handleChange('arrival_flight_train_number', e.target.value)}
          />
        </div>
      </div>

      {/* 25. Arrival Time */}
      <div className="trip-form-row">
        <label htmlFor="req-arr-time" className="trip-form-label">
          <span>Arrival Time</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-arr-time"
            name="arrival_time"
            type="time"
            className="trip-form-input"
            value={formData.arrival_time}
            onChange={(e) => handleChange('arrival_time', e.target.value)}
          />
        </div>
      </div>

      {/* 26. Departure Flight/Train Number */}
      <div className="trip-form-row">
        <label htmlFor="req-dep-flight" className="trip-form-label">
          <span>Departure Flight / Train #</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-dep-flight"
            name="departure_flight_train_number"
            type="text"
            className="trip-form-input"
            placeholder="e.g. LH 759 or 6E 412"
            value={formData.departure_flight_train_number}
            onChange={(e) => handleChange('departure_flight_train_number', e.target.value)}
          />
        </div>
      </div>

      {/* 27. Departure Time */}
      <div className="trip-form-row">
        <label htmlFor="req-dep-time" className="trip-form-label">
          <span>Departure Time</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <input
            id="req-dep-time"
            name="departure_time"
            type="time"
            className="trip-form-input"
            value={formData.departure_time}
            onChange={(e) => handleChange('departure_time', e.target.value)}
          />
        </div>
      </div>

      {/* 28. Budget Amount & Currency */}
      <div className="trip-form-row">
        <label htmlFor="req-budget" className="trip-form-label">
          <span>Approximate Budget</span>
          <span className="label-subtitle">(Optional)</span>
        </label>
        <div className="trip-form-control">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
            <input
              id="req-budget"
              name="approximate_budget"
              type="number"
              min="0"
              className="trip-form-input"
              placeholder="e.g. 2500"
              value={formData.approximate_budget}
              onChange={(e) => handleChange('approximate_budget', e.target.value)}
            />
            <select
              id="req-currency"
              name="budget_currency"
              className="trip-form-select"
              value={formData.budget_currency}
              onChange={(e) => handleChange('budget_currency', e.target.value)}
            >
              <option value="">Currency...</option>
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 29. Passport Copy */}
      <div className="trip-form-row">
        <label className="trip-form-label">
          <span>Passport Copy</span>
          <span className="label-subtitle">PDF / Image, max 10MB (Optional)</span>
        </label>
        <div className="trip-form-control">
          {passportFile ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1d4ed8' }}>📄 {passportFile.name}</span>
              <button type="button" onClick={() => setPassportFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileUpload(e, setPassportFile, setPassportError)}
              className="trip-form-input"
            />
          )}
          {passportError && <span className="field-error-text" role="alert">{passportError}</span>}
        </div>
      </div>

      {/* 30. Flight Ticket */}
      <div className="trip-form-row">
        <label className="trip-form-label">
          <span>Flight Ticket</span>
          <span className="label-subtitle">PDF / Image, max 10MB (Optional)</span>
        </label>
        <div className="trip-form-control">
          {ticketFile ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1d4ed8' }}>📄 {ticketFile.name}</span>
              <button type="button" onClick={() => setTicketFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileUpload(e, setTicketFile, setTicketError)}
              className="trip-form-input"
            />
          )}
          {ticketError && <span className="field-error-text" role="alert">{ticketError}</span>}
        </div>
      </div>

      {/* 31. Preferred Contact Channel(s) */}
      <div className="trip-form-row">
        <label className="trip-form-label">
          <span>Preferred Contact</span>
          <span className="label-subtitle">Select all that apply</span>
        </label>
        <div className="trip-form-control">
          <div className="trip-pills-container">
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
      </div>

      {/* 32. Special Requests */}
      <div className="trip-form-row">
        <label htmlFor="req-special-requests" className="trip-form-label">
          <span>Special Requests</span>
          <span className="label-subtitle">Dietary, monument notes (Optional)</span>
        </label>
        <div className="trip-form-control">
          <textarea
            id="req-special-requests"
            name="special_requests"
            rows="3"
            className="trip-form-textarea"
            placeholder="Tell us about specific monuments you wish to visit, dietary needs (e.g. Vegetarian, Halal, Gluten-free), child seats, or special occasions..."
            value={formData.special_requests}
            onChange={(e) => handleChange('special_requests', e.target.value)}
          />
        </div>
      </div>

      {/* 33. Submit Button */}
      <div style={{ marginTop: '36px', textAlign: 'center' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-lg"
          style={{
            padding: '16px 44px',
            fontSize: '17px',
            fontWeight: 800,
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #1226de 0%, #0a178c 100%)',
            border: 'none',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(18, 38, 222, 0.35)',
            minWidth: '280px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.75 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {isSubmitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span className="spinner-dot" /> Submitting...
            </span>
          ) : isBookingMode ? (
            '🔒 Confirm & Complete Booking Reservation →'
          ) : (
            '✨ Request My Trip & Quotation →'
          )}
        </button>

        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '14px', marginBottom: 0 }}>
          {isBookingMode ? (
            '✓ Official Receipt Generated Instantly • No Upfront Fee • Free Cancellation'
          ) : (
            '✓ 100% Free & No Obligation • Custom Quote within 4 Hours • Direct WhatsApp Delivery'
          )}
        </p>
      </div>
    </form>
  );
}
