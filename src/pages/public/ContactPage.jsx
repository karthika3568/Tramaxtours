import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../../components/public/common/PageHero';
import { updatePageMeta } from '../../utils/metadata';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const prefilledTour = searchParams.get('tour') || '';
  const prefilledDate = searchParams.get('date') || '';
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tour: prefilledTour,
    travelers: '2',
    travelDate: prefilledDate,
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'Contact Us — Plan Your Journey | Tramax Tours',
      description:
        'Connect with Tramax Tours specialists for custom itineraries, chauffeur guide inquiries, hotel bookings, and South India tour packages.',
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.warning('Please provide your name, email, and contact number.', 'Details Required');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(
        'Thank you! Your travel inquiry has been received. Our coordinator will contact you shortly.',
        'Inquiry Submitted'
      );
    }, 500);
  };

  const whatsappInquiryMsg = encodeURIComponent(
    `Hello Tramax Tours! I would like to inquire about planning a trip.\n\nName: ${formData.name || 'Traveler'}\nEmail: ${formData.email || 'N/A'}\nPhone: ${formData.phone || 'N/A'}\nTour: ${formData.tour || 'Custom Journey'}\nTravelers: ${formData.travelers} Guests\nDate: ${formData.travelDate || 'Flexible'}\nMessage: ${formData.message || 'Please provide itinerary options and pricing.'}`
  );

  return (
    <div className="contact-page-luxury-root" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '80vh' }}>
      {/* 1. HERO BANNER */}
      <PageHero
        title="Get in Touch with Our Specialists"
        subtitle="Speak directly with our local tour coordinators to design your bespoke South Indian itinerary."
        badge="24/7 Dedicated Support"
        breadcrumbs={[{ label: 'Contact Us' }]}
        heroMedia={{ url: '/uploads/media/demo_carousel_pondicherry.jpg' }}
      />

      {/* 2. MAIN CONTACT WORKSPACE */}
      <div className="container" style={{ padding: '60px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          {/* Left Column: Direct Contact Info & WhatsApp */}
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#01AA90',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#e6f7f4',
                padding: '4px 12px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '12px',
              }}
            >
              We're Here for You
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#0B1329', marginBottom: '16px' }}>
              Let's Plan Your Next Unforgettable Journey
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '30px' }}>
              Have questions regarding tour pricing, route customization, vehicle options, or hotel stays? Our team is available 7 days a week.
            </p>

            {/* Quick Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
              {/* WhatsApp Action Card */}
              <a
                href={`https://wa.me/919840000000?text=${whatsappInquiryMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: '32px' }}>💬</span>
                <div>
                  <strong style={{ fontSize: '16px', display: 'block' }}>Chat Instantly on WhatsApp</strong>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>+91 98400 00000 • Quick Response</span>
                </div>
              </a>

              {/* Phone Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span style={{ fontSize: '26px' }}>📞</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Helpline Hotline</small>
                  <strong style={{ fontSize: '15px', color: '#0B1329' }}>+91 98400 00000</strong>
                </div>
              </div>

              {/* Email Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span style={{ fontSize: '26px' }}>✉️</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Email Support</small>
                  <strong style={{ fontSize: '15px', color: '#0B1329' }}>contact@tramaxtours.in</strong>
                </div>
              </div>

              {/* Address Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span style={{ fontSize: '26px' }}>📍</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Registered Headquarters</small>
                  <strong style={{ fontSize: '15px', color: '#0B1329' }}>Chennai, Tamil Nadu, India</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 8px 30px rgba(11, 19, 41, 0.06)',
              border: '1px solid #e2e8f0',
            }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0B1329', marginBottom: '8px' }}>
              Send Us a Travel Inquiry
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px' }}>
              Fill out the details below and we will prepare a personalized quote within 2 hours.
            </p>

            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#01AA90', margin: '0 0 8px' }}>
                  Inquiry Received!
                </h4>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Thank you, <strong>{formData.name}</strong>. Our tour coordinator has received your travel inquiry and will contact you at <strong>{formData.phone || formData.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', tour: '', travelers: '2', travelDate: '', message: '' });
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. anand@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. +91 98400 00000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Preferred Travel Date</label>
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Number of Guests</label>
                    <select
                      name="travelers"
                      value={formData.travelers}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="1">1 Solo Traveler</option>
                      <option value="2">2 Travelers (Couple)</option>
                      <option value="3-4">3 - 4 Travelers (Family)</option>
                      <option value="5-8">5 - 8 Travelers (Small Group)</option>
                      <option value="9+">9+ Group Expedition</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Interested Tour / Destination</label>
                  <input
                    type="text"
                    name="tour"
                    placeholder="e.g. Mahabalipuram Day Tour, Kerala Houseboat, Ooty Hills..."
                    value={formData.tour}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px' }}>Special Requests / Notes</label>
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="Tell us about your flight timings, vehicle preferences, or custom stops..."
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-block btn-lg"
                  style={{ marginTop: '8px' }}
                >
                  {isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry & Get Free Quote &rarr;'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
