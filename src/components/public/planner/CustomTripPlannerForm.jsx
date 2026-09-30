import { useState, useId } from 'react';
import { inquiryService } from '../../../services/inquiryService';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import { useToast } from '../../../context/ToastContext';
import { formatWhatsAppUrl } from '../../../utils/whatsapp';

export default function CustomTripPlannerForm({ initialDestination = '', initialTour = '', onSubmitted = null }) {
  const toast = useToast();
  const { getSetting } = useSiteSettings();
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const siteName = getSetting('site_name', 'Wonderer South India');

  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const countryId = useId();
  const destId = useId();
  const pickupId = useId();
  const arrDateId = useId();
  const depDateId = useId();
  const daysId = useId();
  const vehicleId = useId();
  const hotelId = useId();
  const roomsId = useId();
  const roomTypeId = useId();
  const langId = useId();
  const arrFlightId = useId();
  const arrTimeId = useId();
  const depFlightId = useId();
  const depTimeId = useId();
  const budgetId = useId();
  const currencyId = useId();
  const passportId = useId();
  const ticketId = useId();
  const notesId = useId();

  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    email: '',
    country: 'India',
    destination: initialDestination,
    pickup_location: '',
    arrival_date: '',
    departure_date: '',
    duration_days: '5 Days / 4 Nights',
    adults_count: 2,
    children_count: 0,
    infants_count: 0,
    vehicle_preference: 'Innova Crysta',
    airport_pickup: 'Yes',
    airport_drop: 'Yes',
    hotel_category: '3 Star',
    rooms_count: 1,
    room_type: 'Double',
    tour_types: ['Sightseeing', 'Cultural Tour'],
    tour_guide_required: 'No',
    preferred_language: 'English',
    arrival_flight_train_number: '',
    arrival_time: '',
    departure_flight_train_number: '',
    departure_time: '',
    approximate_budget: '',
    budget_currency: 'INR',
    preferred_contact_methods: ['WhatsApp', 'Phone Call'],
    special_requests: '',
  });

  const [passportFileName, setPassportFileName] = useState('');
  const [ticketFileName, setTicketFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const countries = [
    'India',
    'Malaysia',
    'Singapore',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Australia',
    'Sri Lanka',
    'Canada',
    'Germany',
    'France',
    'Italy',
    'Switzerland',
    'Other',
  ];

  const vehicleOptions = [
    'Sedan (Swift Dzire / Etios)',
    'SUV (Ertiga / Kia Carens)',
    'Innova Crysta (Luxury 6/7 Seater)',
    'Tempo Traveller (12 / 14 / 17 Seater)',
    'Mini Bus (21 / 25 Seater)',
    'Luxury Coach (35 / 45 Seater)',
    'No Vehicle (Hotel & Sightseeing Only)',
  ];

  const hotelCategories = [
    'Budget',
    '3 Star',
    '4 Star',
    '5 Star',
    'Luxury Resort',
    'Homestay / Heritage Villa',
    'Not Required (Self-Booked)',
  ];

  const roomTypes = ['Single', 'Double', 'Triple', 'Family Suite'];

  const durationOptions = [
    '1 Day Excursion',
    '2 Days / 1 Night',
    '3 Days / 2 Nights',
    '4 Days / 3 Nights',
    '5 Days / 4 Nights',
    '6 Days / 5 Nights',
    '7 Days / 6 Nights',
    '8 to 10 Days',
    '11 to 14 Days',
    '15+ Days Grand South India Tour',
  ];

  const tourPreferenceOptions = [
    'Sightseeing',
    'Cultural Tour',
    'Pilgrimage',
    'Beach Holiday',
    'Adventure Tour',
    'Wildlife Tour',
    'Shopping Tour',
    'Honeymoon / Couple Retreat',
    'Hill Station & Tea Gardens',
  ];

  const languageOptions = [
    'English',
    'Tamil',
    'Hindi',
    'German',
    'French',
    'Italian',
    'Spanish',
    'Russian',
    'Arabic',
    'Japanese',
    'Other',
  ];

  const currencies = ['INR', 'EUR', 'USD', 'GBP', 'SGD', 'MYR', 'AED'];

  const contactMethodOptions = ['WhatsApp', 'Phone Call', 'Email'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdultSelect = (count) => {
    setFormData((prev) => ({ ...prev, adults_count: count }));
  };

  const handleTourTypeToggle = (type) => {
    setFormData((prev) => {
      const exists = prev.tour_types.includes(type);
      if (exists) {
        return { ...prev, tour_types: prev.tour_types.filter((t) => t !== type) };
      }
      return { ...prev, tour_types: [...prev.tour_types, type] };
    });
  };

  const handleContactMethodToggle = (method) => {
    setFormData((prev) => {
      const exists = prev.preferred_contact_methods.includes(method);
      if (exists) {
        return { ...prev, preferred_contact_methods: prev.preferred_contact_methods.filter((m) => m !== method) };
      }
      return { ...prev, preferred_contact_methods: [...prev.preferred_contact_methods, method] };
    });
  };

  const handlePassportUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassportFileName(file.name);
    }
  };

  const handleTicketUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTicketFileName(file.name);
    }
  };

  const generateWhatsAppMessage = () => {
    return (
      `*New Custom Trip Planning Request — ${siteName}*\n\n` +
      `👤 *Contact Information*\n` +
      `• Name: ${formData.name || 'Valued Guest'}\n` +
      `• WhatsApp: ${formData.whatsapp_number || 'N/A'}\n` +
      `• Email: ${formData.email || 'N/A'}\n` +
      `• Country: ${formData.country}\n` +
      `• Preferred Contact: ${formData.preferred_contact_methods.join(', ') || 'WhatsApp'}\n\n` +
      `📍 *Trip Information*\n` +
      `• Destination(s): ${formData.destination || 'South India Tour'}\n` +
      `• Pickup Point: ${formData.pickup_location || 'Airport / Railway Stn'}\n` +
      `• Travel Dates: ${formData.arrival_date || 'Flexible'} to ${formData.departure_date || 'Flexible'} (${formData.duration_days})\n\n` +
      `👥 *Travelers*\n` +
      `• Adults: ${formData.adults_count} | Children: ${formData.children_count} | Infants: ${formData.infants_count}\n\n` +
      `🚗 *Transportation & Flight Details*\n` +
      `• Vehicle: ${formData.vehicle_preference}\n` +
      `• Airport Pickup: ${formData.airport_pickup} | Drop: ${formData.airport_drop}\n` +
      (formData.arrival_flight_train_number ? `• Arrival Flight/Train: ${formData.arrival_flight_train_number} (${formData.arrival_time || 'N/A'})\n` : '') +
      (formData.departure_flight_train_number ? `• Departure Flight/Train: ${formData.departure_flight_train_number} (${formData.departure_time || 'N/A'})\n` : '') +
      `\n🏨 *Accommodation*\n` +
      `• Category: ${formData.hotel_category}\n` +
      `• Rooms: ${formData.rooms_count} (${formData.room_type})\n\n` +
      `🎯 *Tour Preferences*\n` +
      `• Tour Types: ${formData.tour_types.join(', ') || 'Custom Highlights'}\n` +
      `• Tour Guide: ${formData.tour_guide_required === 'Yes' ? `Yes (${formData.preferred_language})` : 'No'}\n` +
      (formData.approximate_budget ? `• Budget: ${formData.budget_currency} ${formData.approximate_budget}\n` : '') +
      (formData.special_requests ? `• Notes: ${formData.special_requests}\n\n` : '\n') +
      `_Please send my customized day-by-day itinerary & best quotation!_`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning('Please enter your full name.', 'Name Required');
      return;
    }
    if (!formData.whatsapp_number.trim()) {
      toast.warning('Please enter your WhatsApp contact number.', 'WhatsApp Number Required');
      return;
    }
    if (!formData.destination.trim()) {
      toast.warning('Please enter your destination(s).', 'Destination Required');
      return;
    }
    if (!formData.pickup_location.trim()) {
      toast.warning('Please enter your pickup location / airport.', 'Pickup Location Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        whatsapp_number: formData.whatsapp_number.trim(),
        phone: formData.whatsapp_number.trim(),
        email: formData.email.trim() || undefined,
        country: formData.country,
        destination_name: formData.destination.trim(),
        pickup_location: formData.pickup_location.trim(),
        arrival_date: formData.arrival_date || null,
        departure_date: formData.departure_date || null,
        duration_days: formData.duration_days,
        adults_count: Number(formData.adults_count) || 1,
        children_count: Number(formData.children_count) || 0,
        infants_count: Number(formData.infants_count) || 0,
        travelers: (Number(formData.adults_count) || 1) + (Number(formData.children_count) || 0) + (Number(formData.infants_count) || 0),
        vehicle_preference: formData.vehicle_preference,
        airport_pickup: formData.airport_pickup === 'Yes',
        airport_drop: formData.airport_drop === 'Yes',
        hotel_category: formData.hotel_category,
        rooms_count: Number(formData.rooms_count) || 1,
        room_type: formData.room_type,
        tour_types: formData.tour_types,
        tour_guide_required: formData.tour_guide_required === 'Yes',
        preferred_language: formData.preferred_language,
        arrival_flight_train_number: formData.arrival_flight_train_number.trim() || null,
        arrival_time: formData.arrival_time || null,
        departure_flight_train_number: formData.departure_flight_train_number.trim() || null,
        departure_time: formData.departure_time || null,
        approximate_budget: formData.approximate_budget.trim() || null,
        budget_currency: formData.budget_currency,
        passport_file_url: passportFileName ? `Attached: ${passportFileName}` : null,
        flight_ticket_url: ticketFileName ? `Attached: ${ticketFileName}` : null,
        preferred_contact_methods: formData.preferred_contact_methods,
        subject: `Custom Trip Request: ${formData.destination}`,
        message: formData.special_requests.trim() || `Custom itinerary requested for ${formData.destination} (${formData.duration_days}).`,
      };

      const res = await inquiryService.createInquiry(payload);
      setSubmissionSuccess(res?.data || res || { id: 'New' });
      toast.success(
        'Your custom trip request has been submitted! Our travel designer will prepare your tailored quotation promptly.',
        'Trip Request Received'
      );
      if (onSubmitted) {
        onSubmitted(res?.data || res);
      }
    } catch (err) {
      toast.error(
        err?.message || 'Failed to submit itinerary request. You can also chat directly on WhatsApp below.',
        'Submission Notice'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappDirectUrl = formatWhatsAppUrl(contactWhatsApp, generateWhatsAppMessage());

  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-teal-100 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
          ✨
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">
            Trip Reference #{submissionSuccess.id || 'Confirmed'}
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            Thank You, {formData.name || 'Traveler'}!
          </h3>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
            We have received your custom tour requirements for <strong>{formData.destination}</strong>. Our travel specialist is crafting your personalized day-by-day itinerary and transparent price quotation.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto text-left space-y-1">
          <div><strong>📅 Dates:</strong> {formData.arrival_date || 'Flexible'} to {formData.departure_date || 'Flexible'} ({formData.duration_days})</div>
          <div><strong>👥 Guests:</strong> {formData.adults_count} Adults, {formData.children_count} Children</div>
          <div><strong>🚗 Transport:</strong> {formData.vehicle_preference} (Airport: {formData.airport_pickup === 'Yes' ? 'Pickup' : ''} {formData.airport_drop === 'Yes' ? '& Drop' : ''})</div>
          <div><strong>🏨 Stay:</strong> {formData.hotel_category} • {formData.rooms_count} Room ({formData.room_type})</div>
          {formData.approximate_budget && (
            <div><strong>💰 Budget:</strong> {formData.budget_currency} {formData.approximate_budget}</div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
          >
            <span>💬</span> Message Specialist on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setSubmissionSuccess(null)}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
          >
            Plan Another Tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-200/80 text-slate-800 space-y-8"
      id="custom-trip-planner-form"
    >
      {/* SECTION 1: CONTACT INFORMATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            1
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Contact Information</h3>
            <p className="text-xs text-slate-500">Where we should deliver your customized itinerary &amp; quotation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={nameId} className="block text-xs font-bold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              name="name"
              required
              placeholder="e.g. Anand Kumar"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={phoneId} className="block text-xs font-bold text-slate-700 mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              id={phoneId}
              type="tel"
              name="whatsapp_number"
              required
              placeholder="e.g. +91 98765 43210"
              value={formData.whatsapp_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label htmlFor={emailId} className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id={emailId}
              type="email"
              name="email"
              placeholder="e.g. anand@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={countryId} className="block text-xs font-bold text-slate-700 mb-1">
              Country / Nationality
            </label>
            <select
              id={countryId}
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRIP INFORMATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            2
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Trip Information</h3>
            <p className="text-xs text-slate-500">Destinations, pickup points, and travel dates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={destId} className="block text-xs font-bold text-slate-700 mb-1">
              Destination(s) <span className="text-red-500">*</span>
            </label>
            <input
              id={destId}
              type="text"
              name="destination"
              required
              placeholder="e.g. Kerala, Ooty, Kodaikanal, Rameshwaram"
              value={formData.destination}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={pickupId} className="block text-xs font-bold text-slate-700 mb-1">
              Pickup Location <span className="text-red-500">*</span>
            </label>
            <input
              id={pickupId}
              type="text"
              name="pickup_location"
              required
              placeholder="e.g. Chennai Airport, Madurai Stn, Bangalore"
              value={formData.pickup_location}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={arrDateId} className="block text-xs font-bold text-slate-700 mb-1">
              Arrival Date <span className="text-red-500">*</span>
            </label>
            <input
              id={arrDateId}
              type="date"
              name="arrival_date"
              required
              value={formData.arrival_date}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label htmlFor={depDateId} className="block text-xs font-bold text-slate-700 mb-1">
              Departure Date
            </label>
            <input
              id={depDateId}
              type="date"
              name="departure_date"
              value={formData.departure_date}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor={daysId} className="block text-xs font-bold text-slate-700 mb-1">
              Number of Days / Duration
            </label>
            <select
              id={daysId}
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
            >
              {durationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: TRAVELERS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            3
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Travelers</h3>
            <p className="text-xs text-slate-500">Adults, children, and infants in your party</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Adults (Ages 12+)
            </label>
            <div className="grid grid-cols-5 gap-2 max-w-md">
              {[1, 2, 3, 4, '5+'].map((opt) => {
                const isSelected =
                  opt === '5+'
                    ? Number(formData.adults_count) >= 5
                    : Number(formData.adults_count) === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAdultSelect(opt === '5+' ? 5 : opt)}
                    className={`py-2 px-3 text-sm font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Children (2–12 Years)
              </label>
              <select
                name="children_count"
                value={formData.children_count}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Child' : 'Children'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Infants (Below 2 Years)
              </label>
              <select
                name="infants_count"
                value={formData.infants_count}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Infant' : 'Infants'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: TRANSPORTATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            4
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Transportation &amp; Transfers</h3>
            <p className="text-xs text-slate-500">Chauffeur-driven private vehicles and airport assistance</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor={vehicleId} className="block text-xs font-bold text-slate-700 mb-1">
              Vehicle Preference
            </label>
            <select
              id={vehicleId}
              name="vehicle_preference"
              value={formData.vehicle_preference}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-medium"
            >
              {vehicleOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="block text-xs font-bold text-slate-800 mb-2">
                Airport Pickup Required?
              </span>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="airport_pickup"
                    value="Yes"
                    checked={formData.airport_pickup === 'Yes'}
                    onChange={handleInputChange}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="airport_pickup"
                    value="No"
                    checked={formData.airport_pickup === 'No'}
                    onChange={handleInputChange}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-800 mb-2">
                Airport Drop Required?
              </span>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="airport_drop"
                    value="Yes"
                    checked={formData.airport_drop === 'Yes'}
                    onChange={handleInputChange}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="airport_drop"
                    value="No"
                    checked={formData.airport_drop === 'No'}
                    onChange={handleInputChange}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  No
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: ACCOMMODATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            5
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Accommodation</h3>
            <p className="text-xs text-slate-500">Preferred hotel star tiers, rooms, and bed configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor={hotelId} className="block text-xs font-bold text-slate-700 mb-1">
              Hotel Category
            </label>
            <select
              id={hotelId}
              name="hotel_category"
              value={formData.hotel_category}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-medium"
            >
              {hotelCategories.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={roomsId} className="block text-xs font-bold text-slate-700 mb-1">
              Number of Rooms
            </label>
            <select
              id={roomsId}
              name="rooms_count"
              value={formData.rooms_count}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Room' : 'Rooms'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={roomTypeId} className="block text-xs font-bold text-slate-700 mb-1">
              Room Type
            </label>
            <select
              id={roomTypeId}
              name="room_type"
              value={formData.room_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
            >
              {roomTypes.map((r) => (
                <option key={r} value={r}>
                  {r} Room
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 6: TOUR PREFERENCES & GUIDE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            6
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Tour Preferences &amp; Guide Requirements</h3>
            <p className="text-xs text-slate-500">Select what you love to explore and preferred guide language</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tourPreferenceOptions.map((opt) => {
            const isChecked = formData.tour_types.includes(opt);
            return (
              <label
                key={opt}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 text-xs font-bold ${
                  isChecked
                    ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTourTypeToggle(opt)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-3">
          <div>
            <span className="block text-xs font-bold text-slate-800 mb-2">
              Tour Guide Required?
            </span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="tour_guide_required"
                  value="Yes"
                  checked={formData.tour_guide_required === 'Yes'}
                  onChange={handleInputChange}
                  className="text-teal-600 focus:ring-teal-500"
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="tour_guide_required"
                  value="No"
                  checked={formData.tour_guide_required === 'No'}
                  onChange={handleInputChange}
                  className="text-teal-600 focus:ring-teal-500"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label htmlFor={langId} className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Language
            </label>
            <select
              id={langId}
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all"
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 7: FLIGHT / TRAIN DETAILS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            7
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Flight / Train Details</h3>
            <p className="text-xs text-slate-500">For accurate airport transfers and timely driver coordination</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={arrFlightId} className="block text-xs font-bold text-slate-700 mb-1">
              Arrival Flight / Train Number
            </label>
            <input
              id={arrFlightId}
              type="text"
              name="arrival_flight_train_number"
              placeholder="e.g. 6E 2134 / Train 12638"
              value={formData.arrival_flight_train_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={arrTimeId} className="block text-xs font-bold text-slate-700 mb-1">
              Arrival Time 🕒
            </label>
            <input
              id={arrTimeId}
              type="time"
              name="arrival_time"
              value={formData.arrival_time}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label htmlFor={depFlightId} className="block text-xs font-bold text-slate-700 mb-1">
              Departure Flight / Train Number
            </label>
            <input
              id={depFlightId}
              type="text"
              name="departure_flight_train_number"
              placeholder="e.g. AI 542 / Train 12637"
              value={formData.departure_flight_train_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={depTimeId} className="block text-xs font-bold text-slate-700 mb-1">
              Departure Time 🕒
            </label>
            <input
              id={depTimeId}
              type="time"
              name="departure_time"
              value={formData.departure_time}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: BUDGET */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            8
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Budget Range</h3>
            <p className="text-xs text-slate-500">Helps us curate the best package matching your expectations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor={budgetId} className="block text-xs font-bold text-slate-700 mb-1">
              Approximate Budget
            </label>
            <input
              id={budgetId}
              type="text"
              name="approximate_budget"
              placeholder="e.g. 45,000 to 60,000"
              value={formData.approximate_budget}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor={currencyId} className="block text-xs font-bold text-slate-700 mb-1">
              Currency
            </label>
            <select
              id={currencyId}
              name="budget_currency"
              value={formData.budget_currency}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white transition-all font-bold"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 9: UPLOAD SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            9
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Upload Section <span className="text-slate-400 font-normal text-xs">(Optional)</span></h3>
            <p className="text-xs text-slate-500">Attach passport or flight tickets for rapid verification &amp; fast-track quote</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 hover:border-teal-400 transition-colors">
            <span className="text-2xl block mb-1">🛂</span>
            <label htmlFor={passportId} className="block text-xs font-bold text-slate-800 mb-1 cursor-pointer">
              Passport Copy (Optional)
            </label>
            <input
              id={passportId}
              type="file"
              accept=".pdf,image/*"
              onChange={handlePassportUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
            {passportFileName && <span className="block text-[11px] text-teal-700 font-medium mt-1">✓ {passportFileName}</span>}
          </div>

          <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 hover:border-teal-400 transition-colors">
            <span className="text-2xl block mb-1">✈️</span>
            <label htmlFor={ticketId} className="block text-xs font-bold text-slate-800 mb-1 cursor-pointer">
              Flight Ticket (Optional)
            </label>
            <input
              id={ticketId}
              type="file"
              accept=".pdf,image/*"
              onChange={handleTicketUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
            {ticketFileName && <span className="block text-[11px] text-teal-700 font-medium mt-1">✓ {ticketFileName}</span>}
          </div>
        </div>
      </div>

      {/* SECTION 10: PREFERRED CONTACT METHOD */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
            10
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Preferred Contact Method</h3>
            <p className="text-xs text-slate-500">How would you like our tour coordinator to reach out?</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {contactMethodOptions.map((method) => {
            const isChecked = formData.preferred_contact_methods.includes(method);
            return (
              <label
                key={method}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold text-center ${
                  isChecked
                    ? 'bg-teal-50/90 border-teal-500 text-teal-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleContactMethodToggle(method)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>{method}</span>
              </label>
            );
          })}
        </div>

        <div>
          <label htmlFor={notesId} className="block text-xs font-bold text-slate-700 mb-1">
            Special Requests / Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id={notesId}
            name="special_requests"
            rows={3}
            placeholder="Tell us about specific temples, houseboat requests, spice plantation visits, wheelchair assistance, or dietary preferences..."
            value={formData.special_requests}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* SUBMISSION & ACTIONS */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-teal-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            id="btn-request-my-trip"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Your Request...
              </>
            ) : (
              <>
                <span>🚀</span> [ REQUEST MY TRIP ]
              </>
            )}
          </button>

          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded-2xl border border-emerald-200 transition-colors flex items-center justify-center gap-2"
            id="btn-whatsapp-direct-plan"
          >
            <span>💬</span> Message Specialist on WhatsApp
          </a>
        </div>

        <div className="text-center pt-2">
          <span className="text-xs font-bold text-slate-800 block">
            {siteName}
          </span>
          <span className="text-[11.5px] text-slate-500">
            Customized Tours • Airport Transfers • Hotel Bookings
          </span>
        </div>
      </div>
    </form>
  );
}
