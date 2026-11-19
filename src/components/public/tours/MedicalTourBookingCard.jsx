import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  PhoneIcon,
  PrintIcon,
  SparklesIcon,
  UserIcon,
  WhatsAppIcon,
  XIcon,
} from '../../common/Icons';
import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { medicalTripService } from '../../../services/medicalTripService';
import { useToast } from '../../../context/ToastContext';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import useAuth from '../../../hooks/useAuth';
import { getCleanWhatsAppNumber } from '../../../utils/whatsapp';

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

export const HOSPITAL_PARTNERS = [
  'Apollo Hospitals (Greams Road, Chennai)',
  'MIOT International (Manapakkam, Chennai)',
  'Kauvery Hospital (Alwarpet, Chennai)',
  'MGM Healthcare (Nelson Manickam Road, Chennai)',
  'Gleneagles HealthCity (Perumbakkam, Chennai)',
  'Fortis Malar Hospital (Adyar, Chennai)',
  'Any Top Accredited Multi-Specialty Hospital',
];

export const DIAGNOSTIC_SLOTS = [
  'Morning Slot (07:30 AM - 10:30 AM) • 10-12 hr Overnight Fasting Required',
  'Mid-Day Slot (11:00 AM - 02:00 PM) • Post-Prandial & General Consultation',
  'Full-Day Comprehensive Screening (08:00 AM - 04:00 PM)',
  'Pre-Arrival Doctor Tele-Consultation + Scheduled Hospital Visit',
];

export const PRE_EXISTING_CONDITIONS_LIST = [
  'Routine / Preventive Health Screening',
  'Diabetes / High Blood Sugar',
  'Hypertension / Blood Pressure',
  'Cardiac / Heart Health Concern',
  'Orthopedic / Joint or Spine Issue',
  'Gastrointestinal / Liver Concern',
  'Thyroid / Endocrine Disorder',
  'None / Healthy Individual',
];

export const MOBILITY_OPTIONS = [
  'Normal Walking / Independent',
  'Wheelchair Assistance Required at Hospital',
  'Elderly Care & Nurse Escort Assistance',
  'Stretcher / Patient Transport Needed',
];

export const INTERPRETER_LANGUAGES = [
  'None Required (English / Tamil Fluent)',
  'Hindi',
  'French (Français)',
  'Arabic (العربية)',
  'German (Deutsch)',
  'Spanish (Español)',
  'Russian (Русский)',
  'Other Regional / International Language',
];

export const TRANSFER_VEHICLES = [
  'Air-Conditioned Sedan (Swift Dzire / Etios)',
  'Premium SUV (Innova Crysta / Ertiga)',
  'Wheelchair-Accessible Transport Van',
  'Specialized Medical Transit / Ambulance',
];

export default function MedicalTourBookingCard({ trip }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { getSetting } = useSiteSettings();
  const formRef = useRef(null);

  const businessWhatsApp = getSetting('contact_whatsapp', '+91 9840291110');

  // Tomorrow date as default minimum date
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Quick Sidebar Controls
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [patientsCount, setPatientsCount] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState(HOSPITAL_PARTNERS[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Patient, 2: Medical, 3: Travel, 4: Review

  // Multi-step form state
  const [formData, setFormData] = useState({
    first_name: user?.name ? user.name.split(' ')[0] : '',
    middle_name: '',
    last_name: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    country: 'India',
    dial_code: '+91',
    phone: (user?.phone || '').replace(/\D/g, ''),
    email: user?.email || '',
    pickup_location: '',
    appointment_date: tomorrowStr,
    hospital_preference: HOSPITAL_PARTNERS[0],
    number_of_patients: 1,
    pre_existing_conditions: ['Routine / Preventive Health Screening'],
    diagnostic_preferences: DIAGNOSTIC_SLOTS[0],
    mobility_assistance: MOBILITY_OPTIONS[0],
    medical_interpreter: INTERPRETER_LANGUAGES[0],
    vehicle_preference: TRANSFER_VEHICLES[0],
    arrival_flight_train_number: '',
    arrival_time: '',
    departure_flight_train_number: '',
    departure_time: '',
    preferred_contact_methods: ['WhatsApp', 'Phone Call'],
    clinical_notes: '',
    agreed_terms: true,
  });

  // Attached files
  const [passportFile, setPassportFile] = useState(null);
  const [passportError, setPassportError] = useState('');
  const [medicalReportFile, setMedicalReportFile] = useState(null);
  const [medicalReportError, setMedicalReportError] = useState('');

  // Validation state
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Sync sidebar quick state into formData
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, appointment_date: selectedDate }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (patientsCount) {
      setFormData((prev) => ({ ...prev, number_of_patients: patientsCount }));
    }
  }, [patientsCount]);

  useEffect(() => {
    if (selectedHospital) {
      setFormData((prev) => ({ ...prev, hospital_preference: selectedHospital }));
    }
  }, [selectedHospital]);

  // Restore and auto-open booking modal if redirected back after login/registration
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('openBooking') === 'true' && isAuthenticated) {
      const paramDate = searchParams.get('date');
      const paramPatients = searchParams.get('patients');
      if (paramDate) {
        setSelectedDate(paramDate);
        setFormData((prev) => ({ ...prev, appointment_date: paramDate }));
      }
      if (paramPatients) {
        const count = Math.max(1, Number(paramPatients) || 1);
        setPatientsCount(count);
        setFormData((prev) => ({ ...prev, number_of_patients: count }));
      }
      setShowBookingModal(true);
    }
  }, [location.search, isAuthenticated]);

  if (!trip) return null;

  const basePrice = Number(trip.price || trip.discount_price || 0);
  const currencySymbol = trip.currency === 'EUR' ? '€' : trip.currency === 'USD' ? '$' : '₹';
  const totalPrice = (Number(formData.number_of_patients) || 1) * basePrice;

  // Validation function
  const validateField = (field, value, allData = formData) => {
    let err = '';
    const nameRegex = /^[a-zA-Z\s'-]+$/;

    switch (field) {
      case 'first_name': {
        const val = (value || '').trim();
        if (!val) {
          err = 'Patient First Name is required.';
        } else if (val.length < 2) {
          err = 'First Name must contain at least 2 characters.';
        } else if (!nameRegex.test(val)) {
          err = 'First Name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        break;
      }
      case 'last_name': {
        const val = (value || '').trim();
        if (!val) {
          err = 'Patient Last Name is required.';
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
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          err = 'Please enter a valid email address.';
        }
        break;
      }
      case 'phone': {
        const digits = (value || '').replace(/\D/g, '');
        if (!digits) {
          err = 'Phone / WhatsApp contact number is required.';
        } else if (digits.length < 7 || digits.length > 15) {
          err = 'Please enter a valid phone number (7 to 15 digits).';
        }
        break;
      }
      case 'pickup_location': {
        if (!value || !value.trim()) {
          err = 'Pickup Location (Airport, Hotel, or Home Address) is required.';
        }
        break;
      }
      case 'appointment_date': {
        if (!value) {
          err = 'Preferred appointment date is required.';
        } else if (value < tomorrowStr) {
          err = 'Appointment date must be today or in the future.';
        }
        break;
      }
      case 'hospital_preference': {
        if (!value || !value.trim()) {
          err = 'Please select a preferred hospital partner.';
        }
        break;
      }
      case 'number_of_patients': {
        if (!value || Number(value) < 1) {
          err = 'Please select at least 1 patient / traveler.';
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
      return next;
    });
  };

  const handleCountryChange = (countryName) => {
    const matched = COUNTRY_OPTIONS.find((c) => c.name === countryName);
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      dial_code: matched ? matched.dialCode : prev.dial_code,
    }));
  };

  const handlePhoneChange = (rawInput) => {
    const digitsOnly = rawInput.replace(/\D/g, '');
    handleChange('phone', digitsOnly);
  };

  const handleToggleCondition = (condition) => {
    setFormData((prev) => {
      const current = prev.pre_existing_conditions || [];
      const updated = current.includes(condition)
        ? current.filter((c) => c !== condition)
        : [...current, condition];
      return { ...prev, pre_existing_conditions: updated };
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

  const handleFileUpload = (e, setFile, setFileError) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

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

  // Step 1 Validation before moving to Step 2
  const validateStep1 = () => {
    const fields = ['first_name', 'last_name', 'email', 'phone', 'pickup_location', 'appointment_date'];
    const newErrors = {};
    const newTouched = {};

    fields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, formData[f], formData);
      if (err) newErrors[f] = err;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please complete all required patient contact fields marked in red.', 'Required Fields');
      return false;
    }
    return true;
  };

  // Step 2 Validation before moving to Step 3
  const validateStep2 = () => {
    const fields = ['hospital_preference', 'number_of_patients'];
    const newErrors = {};
    const newTouched = {};

    fields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, formData[f], formData);
      if (err) newErrors[f] = err;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please select your hospital partner and patient count.', 'Required Fields');
      return false;
    }
    return true;
  };

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with your medical booking.', 'Sign In Required');
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('openBooking', 'true');
      if (selectedDate) searchParams.set('date', selectedDate);
      if (patientsCount) searchParams.set('patients', patientsCount);
      const redirectUrl = `${location.pathname}?${searchParams.toString()}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setShowBookingModal(true);
  };

  // Final Form Submission
  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault();
    setServerError('');

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    if (!formData.agreed_terms) {
      toast.error('Please confirm the clinical coordination agreement.', 'Agreement Required');
      return;
    }

    try {
      setIsSubmitting(true);

      const computedFullName = `${formData.first_name.trim()} ${formData.middle_name.trim() ? formData.middle_name.trim() + ' ' : ''}${formData.last_name.trim()}`.trim();
      const dialCodeVal = formData.dial_code.trim() || '+91';
      const numPatients = Number(formData.number_of_patients) || 1;

      const payload = {
        medical_trip_id: trip.id,
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        last_name: formData.last_name.trim(),
        name: computedFullName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dial_code: dialCodeVal,
        country: formData.country || 'India',
        address_line1: formData.pickup_location.trim(),
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
        destination_name: trip.title,
        pickup_location: formData.pickup_location.trim(),
        booking_date: formData.appointment_date,
        arrival_date: formData.appointment_date,
        departure_date: formData.departure_time ? formData.appointment_date : null,
        duration_days: trip.duration || '1 Day',
        tickets_count: numPatients,
        adults_count: numPatients,
        tour_types: ['Medical Tourism', 'Health Check', trip.category || 'Clinical Health Check'],
        vehicle_preference: formData.vehicle_preference || null,
        preferred_language: formData.medical_interpreter || null,
        arrival_flight_train_number: formData.arrival_flight_train_number.trim() || null,
        arrival_time: formData.arrival_time.trim() || null,
        departure_flight_train_number: formData.departure_flight_train_number.trim() || null,
        departure_time: formData.departure_time.trim() || null,
        preferred_contact_methods: formData.preferred_contact_methods.length > 0 ? formData.preferred_contact_methods : null,
        special_requests: formData.clinical_notes.trim() || `Medical Booking Request for ${trip.title} at ${formData.hospital_preference}.`,
        customer_notes: formData.clinical_notes.trim() || null,
        unit_price: basePrice,
        subtotal: totalPrice,
        total_price: totalPrice,
        currency: trip.currency || 'INR',
        payment_method: 'pay_on_arrival',
        payment_status: 'pending',
        booking_status: 'pending',
        hospital_preference: formData.hospital_preference,
        pre_existing_conditions: formData.pre_existing_conditions,
        diagnostic_preferences: formData.diagnostic_preferences,
        mobility_assistance: formData.mobility_assistance,
        medical_interpreter: formData.medical_interpreter,
        additional_details: {
          package_title: trip.title,
          package_duration: trip.duration,
          package_category: trip.category,
          hospital_preference: formData.hospital_preference,
          pre_existing_conditions: formData.pre_existing_conditions,
          diagnostic_preferences: formData.diagnostic_preferences,
          mobility_assistance: formData.mobility_assistance,
          medical_interpreter: formData.medical_interpreter,
          clinical_notes: formData.clinical_notes.trim() || null,
          medical_reports_file_url: medicalReportFile ? `[Attached Document] ${medicalReportFile.name} (${Math.round(medicalReportFile.size / 1024)} KB)` : null,
        },
      };

      if (passportFile) {
        payload.passport_file_url = `[Attached Document] ${passportFile.name} (${Math.round(passportFile.size / 1024)} KB)`;
      }
      if (medicalReportFile) {
        payload.flight_ticket_url = `[Attached Medical Report] ${medicalReportFile.name} (${Math.round(medicalReportFile.size / 1024)} KB)`;
      }

      const res = await medicalTripService.submitBooking(trip.id, payload);
      const createdData = res?.data || res;
      setBookingSuccess(createdData);
      toast.success(
        'Your medical tour booking request has been received! Our medical concierge will contact you shortly.',
        'Appointment Request Received'
      );
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit medical booking. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg, 'Booking Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleShareWhatsAppReceipt = () => {
    try {
      const orderRef = bookingSuccess?.order_number || `#${bookingSuccess?.id || 'MED-CONFIRMED'}`;
      const cleanNum = getCleanWhatsAppNumber(businessWhatsApp);
      const custName = bookingSuccess?.customer?.name || bookingSuccess?.first_name || (user?.name || 'Valued Patient');
      const packageName = trip.title;
      const bDate = bookingSuccess?.arrival_date || bookingSuccess?.booking_date || formData.appointment_date;
      const patients = bookingSuccess?.tickets_count || formData.number_of_patients;
      const totPrice = bookingSuccess?.total_price || totalPrice;
      const hosp = formData.hospital_preference;

      const msg = encodeURIComponent(
        `🏥 *WANDERER SOUTH INDIA — MEDICAL TOUR BOOKING SUMMARY*\n\n• Order Reference: ${orderRef}\n• Patient: ${custName}\n• Package: ${packageName}\n• Hospital Partner: ${hosp}\n• Appointment Date: ${bDate}\n• Patients: ${patients}\n• Estimated Total: ${currencySymbol}${totPrice.toLocaleString()}\n• Payment: Pay on Arrival / Hospital Consultation\n\nThank you for choosing Wanderer South India! Please reply to confirm hospital appointment and doctor consultation schedule.`
      );
      toast.info('Opening WhatsApp chat with medical booking summary...', 'WhatsApp');
      window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
    } catch (e) {
      console.error('WhatsApp error:', e);
      toast.error('Unable to open WhatsApp chat. Please check your browser popup settings.');
    }
  };

  return (
    <div className="tour-booking-card-widget">
      {/* Price Header */}
      <div className="booking-widget-header" style={{ background: 'linear-gradient(135deg, #01aa90 0%, #0d9488 100%)' }}>
        <span className="widget-price-label">Starting From</span>
        <div className="widget-price-amount">
          <span className="widget-currency">{currencySymbol}</span>
          <span className="widget-price-num">{basePrice.toLocaleString()}</span>
          <span className="widget-unit">/ person</span>
        </div>
      </div>

      {/* Booking Form Controls */}
      <div className="booking-widget-body">
        {/* Preferred Date */}
        <div className="booking-field-group">
          <label htmlFor="med-booking-date" className="booking-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarIcon size={14} color="#01aa90" /> Appointment Date:
          </label>
          <input
            id="med-booking-date"
            type="date"
            className="booking-field-input"
            value={selectedDate}
            min={tomorrowStr}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <span className="booking-field-hint">Duration: {trip.duration || '1 Day'}</span>
        </div>

        {/* Hospital Partner Selector */}
        <div className="booking-field-group">
          <label htmlFor="med-hospital-select" className="booking-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SparklesIcon size={14} color="#01aa90" /> Preferred Hospital Partner:
          </label>
          <select
            id="med-hospital-select"
            className="booking-field-select"
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            {HOSPITAL_PARTNERS.map((hosp) => (
              <option key={hosp} value={hosp}>
                {hosp}
              </option>
            ))}
          </select>
        </div>

        {/* Patients Counter */}
        <div className="booking-field-group">
          <label className="booking-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserIcon size={14} color="#01aa90" /> Number of Patients / Travelers:
          </label>
          <div className="booking-guests-counter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              {patientsCount} Patient{patientsCount > 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                onClick={() => setPatientsCount((prev) => Math.max(1, prev - 1))}
                disabled={patientsCount <= 1}
              >
                -
              </button>
              <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: '700' }}>{patientsCount}</span>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                onClick={() => setPatientsCount((prev) => Math.min(10, prev + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="booking-price-breakdown" style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b', marginBottom: '6px' }}>
            <span>Package Rate × {patientsCount} Person{patientsCount > 1 ? 's' : ''}</span>
            <span>{currencySymbol}{totalPrice.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#0f766e', marginTop: '6px' }}>
            <span>Estimated Total:</span>
            <span>{currencySymbol}{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Submit / Open Modal Action Button */}
        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          onClick={handleOpenBookingModal}
          style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, #01aa90 0%, #0d9488 100%)',
            borderColor: '#01aa90',
            fontWeight: '800',
            fontSize: '14px',
            boxShadow: '0 4px 14px rgba(1, 170, 144, 0.35)',
          }}
        >
          {isAuthenticated ? 'REQUEST MEDICAL BOOKING' : 'SIGN IN & BOOK PACKAGE'}
        </button>

        {/* Trust Badges */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircleIcon size={14} color="#059669" />
            <span>NABH / JCI Accredited Hospital Partners</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircleIcon size={14} color="#059669" />
            <span>Dedicated Medical Concierge &amp; Doctor Scheduling</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircleIcon size={14} color="#059669" />
            <span>Zero Advance Required • Pay at Hospital / Consultation</span>
          </div>
        </div>
      </div>

      {/* Multi-Step Modal Container */}
      {showBookingModal && createPortal(
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            if (!isSubmitting) {
              setShowBookingModal(false);
              setBookingSuccess(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 19, 41, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <div
            className="admin-modal-container booking-checkout-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 100000,
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              maxWidth: '920px',
              maxHeight: '92vh',
              overflowY: 'auto',
              width: '95%',
              padding: '28px',
            }}
          >
            {/* Modal Header */}
            <div className="admin-modal-header" style={{ marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="modal-header-info">
                <span className="modal-eyebrow" style={{ color: '#0d9488', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Wanderer South India • Medical Tour &amp; Clinical Reservation
                </span>
                <h3 className="admin-modal-title" style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0', color: '#0f172a' }}>
                  {trip.title}
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  if (!isSubmitting) {
                    setShowBookingModal(false);
                    setBookingSuccess(null);
                  }
                }}
                aria-label="Close dialog"
                style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {bookingSuccess ? (
                /* Success View */
                <div className="booking-success-box text-center" style={{ padding: '24px 12px' }}>
                  <div className="success-icon-big" style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                    <CheckCircleIcon size={56} color="#0d9488" />
                  </div>
                  <h4 className="success-title" style={{ fontSize: '22px', fontWeight: '800', color: '#0f766e', margin: '0 0 8px' }}>
                    Medical Booking Request Received!
                  </h4>
                  <p className="success-desc" style={{ fontSize: '15px', color: '#475569', marginBottom: '16px' }}>
                    Thank you, <strong>{bookingSuccess?.customer?.name || bookingSuccess?.first_name || (user?.name || 'Valued Patient')}</strong>! Your reservation reference is{' '}
                    <strong style={{ color: '#0f766e', fontSize: '17px' }}>#{bookingSuccess?.order_number || bookingSuccess?.id}</strong>.
                  </p>

                  <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderLeft: '4px solid #0d9488', borderRadius: '8px', padding: '14px 18px', textAlign: 'left', marginBottom: '20px', fontSize: '13px', color: '#134e4a' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                      <ClockIcon size={15} color="#0d9488" /> Next Step: Medical Concierge Review &amp; Confirmation
                    </strong>
                    <p style={{ margin: '6px 0 0', lineHeight: 1.55 }}>
                      Our clinical care coordinator will contact you shortly on <strong>{bookingSuccess?.customer?.phone || bookingSuccess?.phone || user?.phone}</strong> to review your medical history, confirm doctor consultation slots at <strong>{formData.hospital_preference}</strong>, and coordinate your hospital transport. Your official confirmed PDF ticket will be emailed once approved.
                    </p>
                  </div>

                  <div
                    className="success-summary-box"
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'left',
                      fontSize: '13.5px',
                      color: '#0B1329',
                      border: '1px solid #e2e8f0',
                      marginBottom: '20px',
                    }}
                  >
                    <p style={{ margin: '0 0 8px' }}><strong>Medical Package:</strong> {trip.title}</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Hospital Partner:</strong> {formData.hospital_preference}</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Appointment Date:</strong> {bookingSuccess?.arrival_date || bookingSuccess?.booking_date || formData.appointment_date}</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Diagnostic Slot:</strong> {formData.diagnostic_preferences}</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Patients / Travelers:</strong> {bookingSuccess?.tickets_count || formData.number_of_patients} Person(s)</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Estimated Amount:</strong> {currencySymbol}{(bookingSuccess?.total_price || totalPrice).toLocaleString()}</p>
                    <p style={{ margin: '0 0 8px' }}><strong>Booking Status:</strong> <span className="badge badge-warning" style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px' }}>PENDING CONFIRMATION</span></p>
                    <p style={{ margin: '0 0 8px' }}><strong>Pickup Location:</strong> {bookingSuccess?.pickup_location || formData.pickup_location}</p>
                    <p style={{ margin: 0 }}><strong>Patient Contact:</strong> {bookingSuccess?.customer?.email || user?.email} • {bookingSuccess?.customer?.phone || user?.phone}</p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-md"
                      onClick={handlePrintSummary}
                      title="Print or Save Summary via browser"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PrintIcon size={14} /> Print Request Summary
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-md"
                      onClick={handleShareWhatsAppReceipt}
                      style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      title="Message us on WhatsApp"
                    >
                      <WhatsAppIcon size={14} /> Chat on WhatsApp
                    </button>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
                    An acknowledgement email has been dispatched to <strong>{bookingSuccess?.customer?.email || bookingSuccess?.email || user?.email}</strong>.
                  </p>

                  {isAuthenticated && (
                    <Link
                      to="/my-bookings"
                      className="btn btn-outline btn-sm btn-block"
                      onClick={() => setShowBookingModal(false)}
                      style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <UserIcon size={14} /> View in My Bookings &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                /* Multi-Step Form */
                <form ref={formRef} onSubmit={handleSubmitBooking} noValidate>
                  {/* Step Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '10%',
                        width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '80%',
                        height: '2px',
                        background: '#0d9488',
                        zIndex: 0,
                        transition: 'width 0.3s ease',
                      }}
                    ></div>

                    {[
                      { step: 1, title: 'Patient Contact' },
                      { step: 2, title: 'Medical Needs' },
                      { step: 3, title: 'Schedule & Docs' },
                      { step: 4, title: 'Review & Submit' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        onClick={() => {
                          if (s.step < currentStep) {
                            setCurrentStep(s.step);
                          } else if (s.step === 2 && currentStep === 1) {
                            if (validateStep1()) setCurrentStep(2);
                          } else if (s.step === 3 && currentStep === 2) {
                            if (validateStep2()) setCurrentStep(3);
                          } else if (s.step === 4 && (currentStep === 2 || currentStep === 3)) {
                            if (validateStep1() && validateStep2()) setCurrentStep(4);
                          }
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 1,
                          cursor: s.step <= currentStep ? 'pointer' : 'default',
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: currentStep >= s.step ? '#0d9488' : '#ffffff',
                            color: currentStep >= s.step ? '#ffffff' : '#64748b',
                            border: `2px solid ${currentStep >= s.step ? '#0d9488' : '#cbd5e1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700',
                            marginBottom: '4px',
                          }}
                        >
                          {currentStep > s.step ? <CheckIcon size={12} /> : s.step}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: currentStep === s.step ? '700' : '500',
                            color: currentStep === s.step ? '#0f766e' : '#64748b',
                            textAlign: 'center',
                          }}
                        >
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Server Error Alert */}
                  {serverError && (
                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangleIcon size={16} color="#991b1b" />
                      <span><strong>Error:</strong> {serverError}</span>
                    </div>
                  )}

                  {/* STEP 1: PATIENT CONTACT */}
                  {currentStep === 1 && (
                    <div className="trip-form-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: '8px', borderLeft: '3px solid #0d9488', fontSize: '13px', color: '#134e4a' }}>
                        <strong>Step 1: Patient Details &amp; Contact Information</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '12px' }}>Please provide the primary patient's full name, contact information, and pickup location for hospital transfers.</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* First Name */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Patient First Name <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            className={`form-control ${errors.first_name && touched.first_name ? 'is-invalid' : ''}`}
                            placeholder="e.g. David"
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            onBlur={() => handleBlur('first_name')}
                            required
                          />
                          {errors.first_name && touched.first_name && <span className="field-error-text" style={{ color: '#ef4444', fontSize: '11px' }}>{errors.first_name}</span>}
                        </div>

                        {/* Middle Name */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Middle Name <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                          </label>
                          <input
                            type="text"
                            name="middle_name"
                            className="form-control"
                            placeholder="e.g. William"
                            value={formData.middle_name}
                            onChange={(e) => handleChange('middle_name', e.target.value)}
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Patient Last Name <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            className={`form-control ${errors.last_name && touched.last_name ? 'is-invalid' : ''}`}
                            placeholder="e.g. Miller"
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            onBlur={() => handleBlur('last_name')}
                            required
                          />
                          {errors.last_name && touched.last_name && <span className="field-error-text" style={{ color: '#ef4444', fontSize: '11px' }}>{errors.last_name}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* Country */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Country of Residence <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            name="country"
                            className="form-control form-select"
                            value={formData.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                          >
                            {COUNTRY_OPTIONS.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name} ({c.dialCode})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Phone / WhatsApp Number <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              readOnly
                              value={formData.dial_code}
                              style={{ width: '65px', textAlign: 'center', background: '#f1f5f9', fontWeight: 'bold' }}
                              className="form-control"
                            />
                            <input
                              type="tel"
                              name="phone"
                              className={`form-control ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
                              placeholder="e.g. 9840291110"
                              value={formData.phone}
                              onChange={(e) => handlePhoneChange(e.target.value)}
                              onBlur={() => handleBlur('phone')}
                              required
                            />
                          </div>
                          {errors.phone && touched.phone && <span className="field-error-text" style={{ color: '#ef4444', fontSize: '11px' }}>{errors.phone}</span>}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Email Address <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                            placeholder="e.g. david.miller@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            required
                          />
                          {errors.email && touched.email && <span className="field-error-text" style={{ color: '#ef4444', fontSize: '11px' }}>{errors.email}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* Pickup Location */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Pickup Location <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="pickup_location"
                            className={`form-control ${errors.pickup_location && touched.pickup_location ? 'is-invalid' : ''}`}
                            placeholder="e.g. Chennai Airport (MAA) / Hotel Grand Chola"
                            value={formData.pickup_location}
                            onChange={(e) => handleChange('pickup_location', e.target.value)}
                            onBlur={() => handleBlur('pickup_location')}
                            required
                          />
                          {errors.pickup_location && touched.pickup_location && <span className="field-error-text" style={{ color: '#ef4444', fontSize: '11px' }}>{errors.pickup_location}</span>}
                        </div>

                        {/* Preferred Appointment Date */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Preferred Appointment Date <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="date"
                            name="appointment_date"
                            min={tomorrowStr}
                            className={`form-control ${errors.appointment_date && touched.appointment_date ? 'is-invalid' : ''}`}
                            value={formData.appointment_date}
                            onChange={(e) => {
                              handleChange('appointment_date', e.target.value);
                              setSelectedDate(e.target.value);
                            }}
                            onBlur={() => handleBlur('appointment_date')}
                            required
                          />
                          {errors.appointment_date && touched.appointment_date && <span className="field-error-text" style={{ color: '#ef4444', fontSize: '11px' }}>{errors.appointment_date}</span>}
                        </div>
                      </div>

                      {/* Step 1 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            if (validateStep1()) setCurrentStep(2);
                          }}
                          style={{ background: '#0d9488', borderColor: '#0d9488', padding: '10px 24px', fontWeight: '700' }}
                        >
                          Next: Medical &amp; Clinical Needs &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MEDICAL & CLINICAL REQUIREMENTS */}
                  {currentStep === 2 && (
                    <div className="trip-form-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: '8px', borderLeft: '3px solid #0d9488', fontSize: '13px', color: '#134e4a' }}>
                        <strong>Step 2: Medical &amp; Clinical Requirements</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '12px' }}>Choose your hospital partner, diagnostic slot, and let us know about any pre-existing health concerns or assistance needs.</p>
                      </div>

                      {/* Selected Package Banner */}
                      <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0d9488', fontWeight: '700' }}>Selected Package</span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#0f172a' }}>{trip.title}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Rate per Patient</span>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f766e' }}>{currencySymbol}{basePrice.toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                        {/* Hospital Preference */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Hospital Partner <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            name="hospital_preference"
                            className="form-control form-select"
                            value={formData.hospital_preference}
                            onChange={(e) => {
                              handleChange('hospital_preference', e.target.value);
                              setSelectedHospital(e.target.value);
                            }}
                          >
                            {HOSPITAL_PARTNERS.map((hosp) => (
                              <option key={hosp} value={hosp}>
                                {hosp}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Number of Patients */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Number of Patients / Guests <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            name="number_of_patients"
                            className="form-control form-select"
                            value={formData.number_of_patients}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              handleChange('number_of_patients', val);
                              setPatientsCount(val);
                            }}
                          >
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Patient' : 'Patients'} ({currencySymbol}{(num * basePrice).toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Diagnostic Slot / Fasting Preferences */}
                      <div>
                        <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                          Preferred Diagnostic &amp; Fasting Slot <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          name="diagnostic_preferences"
                          className="form-control form-select"
                          value={formData.diagnostic_preferences}
                          onChange={(e) => handleChange('diagnostic_preferences', e.target.value)}
                        >
                          {DIAGNOSTIC_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pre-existing Health Conditions */}
                      <div>
                        <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700', marginBottom: '8px' }}>
                          Pre-existing Health Conditions / Focus Areas <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Select all that apply)</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          {PRE_EXISTING_CONDITIONS_LIST.map((cond) => {
                            const isChecked = formData.pre_existing_conditions.includes(cond);
                            return (
                              <label
                                key={cond}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: `1px solid ${isChecked ? '#0d9488' : '#e2e8f0'}`,
                                  background: isChecked ? '#f0fdfa' : '#ffffff',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  color: isChecked ? '#0f766e' : '#334155',
                                  fontWeight: isChecked ? '600' : '400',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCondition(cond)}
                                  style={{ accentColor: '#0d9488' }}
                                />
                                <span>{cond}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* Mobility Assistance */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Mobility &amp; Assistance Needs
                          </label>
                          <select
                            name="mobility_assistance"
                            className="form-control form-select"
                            value={formData.mobility_assistance}
                            onChange={(e) => handleChange('mobility_assistance', e.target.value)}
                          >
                            {MOBILITY_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Medical Interpreter */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Medical Interpreter Language
                          </label>
                          <select
                            name="medical_interpreter"
                            className="form-control form-select"
                            value={formData.medical_interpreter}
                            onChange={(e) => handleChange('medical_interpreter', e.target.value)}
                          >
                            {INTERPRETER_LANGUAGES.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Hospital Transfer Vehicle */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Hospital Transfer Vehicle
                          </label>
                          <select
                            name="vehicle_preference"
                            className="form-control form-select"
                            value={formData.vehicle_preference}
                            onChange={(e) => handleChange('vehicle_preference', e.target.value)}
                          >
                            {TRANSFER_VEHICLES.map((veh) => (
                              <option key={veh} value={veh}>
                                {veh}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setCurrentStep(1)}
                        >
                          &larr; Back to Patient Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            if (validateStep2()) setCurrentStep(3);
                          }}
                          style={{ background: '#0d9488', borderColor: '#0d9488', padding: '10px 24px', fontWeight: '700' }}
                        >
                          Next: Travel Schedule &amp; Documents &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: TRAVEL SCHEDULE & DOCUMENTS */}
                  {currentStep === 3 && (
                    <div className="trip-form-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: '8px', borderLeft: '3px solid #0d9488', fontSize: '13px', color: '#134e4a' }}>
                        <strong>Step 3: Travel Schedule, Medical Records &amp; Documents</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '12px' }}>Optionally provide arrival details and upload previous prescriptions or medical test reports for doctor pre-evaluation.</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* Arrival Flight / Train Number */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Arrival Flight / Train Number <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                          </label>
                          <input
                            type="text"
                            name="arrival_flight_train_number"
                            className="form-control"
                            placeholder="e.g. EK542 / 6E1204"
                            value={formData.arrival_flight_train_number}
                            onChange={(e) => handleChange('arrival_flight_train_number', e.target.value)}
                          />
                        </div>

                        {/* Arrival Time */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Arrival Time <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                          </label>
                          <input
                            type="time"
                            name="arrival_time"
                            className="form-control"
                            value={formData.arrival_time}
                            onChange={(e) => handleChange('arrival_time', e.target.value)}
                          />
                        </div>

                        {/* Departure Flight Number */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Departure Flight / Train Number <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                          </label>
                          <input
                            type="text"
                            name="departure_flight_train_number"
                            className="form-control"
                            placeholder="e.g. BA036 / AI560"
                            value={formData.departure_flight_train_number}
                            onChange={(e) => handleChange('departure_flight_train_number', e.target.value)}
                          />
                        </div>

                        {/* Departure Time */}
                        <div>
                          <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                            Departure Time <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                          </label>
                          <input
                            type="time"
                            name="departure_time"
                            className="form-control"
                            value={formData.departure_time}
                            onChange={(e) => handleChange('departure_time', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Document Uploads */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                        {/* Passport / ID Upload */}
                        <div style={{ padding: '14px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#f8fafc' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Passport / Identity Proof <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                          </label>
                          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#64748b' }}>For international travelers &amp; hospital registration (PDF/JPG/PNG, Max 10MB)</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleFileUpload(e, setPassportFile, setPassportError)}
                            style={{ fontSize: '12px' }}
                          />
                          {passportFile && (
                            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckIcon size={12} /> {passportFile.name} ({Math.round(passportFile.size / 1024)} KB)
                            </div>
                          )}
                          {passportError && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{passportError}</p>}
                        </div>

                        {/* Medical Reports / Prescription Upload */}
                        <div style={{ padding: '14px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#f8fafc' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Previous Medical Reports / Prescriptions <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Recommended)</span>
                          </label>
                          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#64748b' }}>Upload recent blood work, ECG, or doctor notes (PDF/JPG/PNG, Max 10MB)</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleFileUpload(e, setMedicalReportFile, setMedicalReportError)}
                            style={{ fontSize: '12px' }}
                          />
                          {medicalReportFile && (
                            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckIcon size={12} /> {medicalReportFile.name} ({Math.round(medicalReportFile.size / 1024)} KB)
                            </div>
                          )}
                          {medicalReportError && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{medicalReportError}</p>}
                        </div>
                      </div>

                      {/* Preferred Contact Methods */}
                      <div>
                        <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700', marginBottom: '6px' }}>
                          Preferred Contact Methods
                        </label>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          {['WhatsApp', 'Phone Call', 'Email'].map((method) => {
                            const isChecked = formData.preferred_contact_methods.includes(method);
                            return (
                              <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleContactMethod(method)}
                                  style={{ accentColor: '#0d9488' }}
                                />
                                <span>{method}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Clinical Notes / Special Requests */}
                      <div>
                        <label className="form-label" style={{ fontSize: '12.5px', fontWeight: '700' }}>
                          Clinical Notes &amp; Special Requests <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          className="form-control"
                          placeholder="Mention any specific doctor preferences, ongoing medications, allergies, or dietary requirements..."
                          value={formData.clinical_notes}
                          onChange={(e) => handleChange('clinical_notes', e.target.value)}
                        />
                      </div>

                      {/* Step 3 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setCurrentStep(2)}
                        >
                          &larr; Back to Medical Needs
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setCurrentStep(4)}
                          style={{ background: '#0d9488', borderColor: '#0d9488', padding: '10px 24px', fontWeight: '700' }}
                        >
                          Next: Review &amp; Confirm &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW & CONFIRM */}
                  {currentStep === 4 && (
                    <div className="trip-form-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: '8px', borderLeft: '3px solid #0d9488', fontSize: '13px', color: '#134e4a' }}>
                        <strong>Step 4: Review Your Medical Reservation Information</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '12px' }}>Please double-check your appointment schedule, patient information, and hospital partner before confirming.</p>
                      </div>

                      {/* Review Summary Grid */}
                      <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Package & Hospital */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                          <div>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0d9488', fontWeight: '700' }}>Medical Package</span>
                            <h4 style={{ margin: '2px 0 0', fontSize: '16px', color: '#0f172a' }}>{trip.title}</h4>
                            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                              Hospital: <strong>{formData.hospital_preference}</strong>
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Estimated Total ({formData.number_of_patients} Pax)</span>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f766e' }}>
                              {currencySymbol}{totalPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Patient & Contact Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12.5px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Patient Name:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {formData.first_name} {formData.middle_name ? formData.middle_name + ' ' : ''}{formData.last_name}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Contact Phone:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {formData.dial_code} {formData.phone}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Email:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {formData.email}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Country:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {formData.country}
                            </div>
                          </div>
                        </div>

                        {/* Appointment & Clinical Schedule */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12.5px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Appointment Date:</span>
                            <div style={{ fontWeight: '600', color: '#0f766e' }}>
                              📅 {formData.appointment_date}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Diagnostic Slot:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {formData.diagnostic_preferences}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Pickup Location:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              📍 {formData.pickup_location}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Hospital Transit:</span>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              🚗 {formData.vehicle_preference}
                            </div>
                          </div>
                        </div>

                        {/* Medical Records & Health Focus */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '12px', color: '#475569' }}>
                          <p style={{ margin: '0 0 4px' }}>
                            <strong>Health Focus:</strong> {formData.pre_existing_conditions.join(', ')}
                          </p>
                          <p style={{ margin: '0 0 4px' }}>
                            <strong>Mobility:</strong> {formData.mobility_assistance} • <strong>Interpreter:</strong> {formData.medical_interpreter}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Uploaded Documents:</strong>{' '}
                            {passportFile ? `Passport: ${passportFile.name}` : 'No passport attached'},{' '}
                            {medicalReportFile ? `Medical Report: ${medicalReportFile.name}` : 'No previous records attached'}
                          </p>
                        </div>
                      </div>

                      {/* Agreement Checkbox */}
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#334155', cursor: 'pointer', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <input
                          type="checkbox"
                          checked={formData.agreed_terms}
                          onChange={(e) => setFormData((prev) => ({ ...prev, agreed_terms: e.target.checked }))}
                          style={{ marginTop: '2px', accentColor: '#0d9488' }}
                        />
                        <span>
                          I confirm that the patient information and clinical preferences provided are accurate for hospital coordination. I understand that medical consultation is conducted directly with accredited hospital doctors.
                        </span>
                      </label>

                      {/* Step 4 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setCurrentStep(3)}
                          disabled={isSubmitting}
                        >
                          &larr; Back to Schedule &amp; Docs
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmitBooking}
                          disabled={isSubmitting || !formData.agreed_terms}
                          style={{
                            background: 'linear-gradient(135deg, #01aa90 0%, #0d9488 100%)',
                            borderColor: '#01aa90',
                            padding: '12px 28px',
                            fontWeight: '800',
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <span>Submitting Medical Request...</span>
                            </>
                          ) : (
                            <>
                              <CheckIcon size={16} />
                              <span>Confirm &amp; Submit Medical Booking</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
