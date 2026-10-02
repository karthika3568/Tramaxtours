import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../../components/public/common/PageHero';
import { updatePageMeta } from '../../utils/metadata';
import { useToast } from '../../context/ToastContext';
import tripRequestService from '../../services/tripRequestService';

const TRANSPORT_OPTIONS = [
  { value: 'not_sure', label: 'Not sure yet' },
  { value: 'private_car', label: 'Private Car' },
  { value: 'coach', label: 'Coach / Group Vehicle' },
  { value: 'self_drive', label: 'Self Drive' },
];

const ACCOMMODATION_OPTIONS = [
  { value: 'not_sure', label: 'Not sure yet' },
  { value: 'budget', label: 'Budget' },
  { value: 'standard', label: 'Standard' },
  { value: 'luxury', label: 'Luxury' },
];

const ARRIVAL_OPTIONS = [
  { value: 'none', label: 'Not applicable' },
  { value: 'flight', label: 'Flight' },
  { value: 'train', label: 'Train' },
  { value: 'not_sure', label: 'Not sure yet' },
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const initialFormState = {
  full_name: '',
  email: '',
  phone: '',
  whatsapp_number: '',
  preferred_contact_method: 'email',
  trip_start_date: '',
  trip_end_date: '',
  adults_count: 2,
  children_count: 0,
  infants_count: 0,
  special_interests: '',
  transportation_mode: 'not_sure',
  needs_airport_pickup: false,
  accommodation_type: 'not_sure',
  accommodation_notes: '',
  arrival_mode: 'none',
  arrival_details: '',
  departure_mode: 'none',
  departure_details: '',
  budget_amount: '',
  budget_currency: 'EUR',
  budget_notes: '',
  website: '', // honeypot — real visitors never see or fill this
};

export default function RequestTripPage() {
  const [searchParams] = useSearchParams();
  const tourSlug = searchParams.get('tour') || '';
  const destinationSlug = searchParams.get('destination') || '';
  const toast = useToast();

  const [formData, setFormData] = useState(initialFormState);
  const [passportFile, setPassportFile] = useState(null);
  const [ticketFile, setTicketFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    updatePageMeta({
      title: 'Request My Trip | Wanderer South India',
      description: 'Tell us about your dream South India trip and our travel specialists will reach out with a tailored itinerary.',
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.warning('Please provide your name, email, and phone number.', 'Details Required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          payload.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
        }
      });
      if (tourSlug) payload.append('tour_slug', tourSlug);
      if (destinationSlug) payload.append('destination_slug', destinationSlug);
      if (passportFile) payload.append('passport', passportFile);
      if (ticketFile) payload.append('flight_ticket', ticketFile);

      const data = await tripRequestService.submitTripRequest(payload);
      setResult(data);
      toast.success('Your trip request has been submitted! We will be in touch shortly.', 'Request Submitted');
    } catch (err) {
      toast.error(err.message || 'Failed to submit your trip request. Please try again.', 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '70vh' }}>
        <PageHero
          title="Trip Request Received"
          subtitle="Thank you for reaching out — our travel team will contact you shortly."
          breadcrumbs={[{ label: 'Request My Trip' }]}
        />
        <div className="container" style={{ padding: '60px 20px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ marginTop: 0 }}>Reference ID: {result.reference_id}</h2>
            <p style={{ color: '#64748b' }}>Please keep this reference ID for any follow-up communication.</p>
            {result.email_status === 'sent' && <p>A confirmation email has been sent to your inbox.</p>}
            {result.email_status === 'failed' && <p style={{ color: '#b45309' }}>We couldn't send a confirmation email, but your request was recorded successfully.</p>}
            {result.whatsapp_link && (
              <p style={{ marginTop: '24px' }}>
                <a
                  href={result.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Chat with us on WhatsApp
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', color: '#0B1329', minHeight: '80vh' }}>
      <PageHero
        title="Request My Trip"
        subtitle="Tell us about your dream South India journey and our specialists will design a tailored itinerary for you."
        breadcrumbs={[{ label: 'Request My Trip' }]}
      />

      <div className="container" style={{ padding: '60px 20px 80px', maxWidth: '820px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', display: 'grid', gap: '20px' }}>
          {/* Honeypot field — hidden from real visitors via CSS, bots fill it */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex="-1"
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
            aria-hidden="true"
          />

          <h3>Contact Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <input className="form-input" name="full_name" placeholder="Full Name *" value={formData.full_name} onChange={handleChange} required />
            <input className="form-input" type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
            <input className="form-input" name="phone" placeholder="Phone *" value={formData.phone} onChange={handleChange} required />
            <input className="form-input" name="whatsapp_number" placeholder="WhatsApp Number (optional)" value={formData.whatsapp_number} onChange={handleChange} />
            <select className="form-input" name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange}>
              {CONTACT_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <h3>Trip Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <label>Start Date<input className="form-input" type="date" name="trip_start_date" value={formData.trip_start_date} onChange={handleChange} /></label>
            <label>End Date<input className="form-input" type="date" name="trip_end_date" value={formData.trip_end_date} onChange={handleChange} /></label>
          </div>
          <textarea className="form-input" name="special_interests" placeholder="Special interests (e.g. heritage, backwaters, wildlife)" value={formData.special_interests} onChange={handleChange} rows={2} />

          <h3>Travelers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <label>Adults<input className="form-input" type="number" min="1" name="adults_count" value={formData.adults_count} onChange={handleChange} /></label>
            <label>Children<input className="form-input" type="number" min="0" name="children_count" value={formData.children_count} onChange={handleChange} /></label>
            <label>Infants<input className="form-input" type="number" min="0" name="infants_count" value={formData.infants_count} onChange={handleChange} /></label>
          </div>

          <h3>Transportation & Accommodation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <select className="form-input" name="transportation_mode" value={formData.transportation_mode} onChange={handleChange}>
              {TRANSPORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" name="needs_airport_pickup" checked={formData.needs_airport_pickup} onChange={handleChange} />
              Need airport pickup
            </label>
            <select className="form-input" name="accommodation_type" value={formData.accommodation_type} onChange={handleChange}>
              {ACCOMMODATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <h3>Flight / Train (optional)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <select className="form-input" name="arrival_mode" value={formData.arrival_mode} onChange={handleChange}>
              {ARRIVAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>Arrival: {o.label}</option>)}
            </select>
            <input className="form-input" name="arrival_details" placeholder="Flight/Train number & time" value={formData.arrival_details} onChange={handleChange} />
            <select className="form-input" name="departure_mode" value={formData.departure_mode} onChange={handleChange}>
              {ARRIVAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>Departure: {o.label}</option>)}
            </select>
            <input className="form-input" name="departure_details" placeholder="Flight/Train number & time" value={formData.departure_details} onChange={handleChange} />
          </div>

          <h3>Budget</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <input className="form-input" type="number" step="0.01" name="budget_amount" placeholder="Budget amount" value={formData.budget_amount} onChange={handleChange} />
            <select className="form-input" name="budget_currency" value={formData.budget_currency} onChange={handleChange}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <textarea className="form-input" name="budget_notes" placeholder="Budget notes (optional)" value={formData.budget_notes} onChange={handleChange} rows={2} />

          <h3>Documents (optional)</h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Stored privately and only accessible to our team — never made public.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <label>Passport Scan<input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPassportFile(e.target.files?.[0] || null)} /></label>
            <label>Flight Ticket<input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setTicketFile(e.target.files?.[0] || null)} /></label>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ background: '#01AA90', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Trip Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
