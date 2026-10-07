import { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/public/common/Breadcrumbs';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { formatWhatsAppUrl, getCleanWhatsAppNumber } from '../../utils/whatsapp';
import client from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const { getSetting } = useSiteSettings();
  const toast = useToast();

  const contactPhone = getSetting('contact_phone', '+91 8072566010');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactEmail = getSetting('contact_email', 'contact@wanderersouthindia.com');
  const contactAddress = getSetting('contact_address', 'Chennai, Tamil Nadu, India');
  const siteName = getSetting('site_name', 'Wanderer South India');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    query: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: `Contact Us | ${siteName}`,
      description:
        `Get in touch with ${siteName} for custom South India tour packages, private chauffeur services, temple circuits, and instant WhatsApp support.`,
    });
  }, [siteName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please enter your Name';
    }
    if (!formData.email.trim()) {
      errs.email = 'Please enter your Email Id';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.query.trim()) {
      errs.query = 'Please enter your Query';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please complete all required fields.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send inquiry to backend API
      try {
        await client.post('/inquiries', {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.mobile.trim() || undefined,
          message: formData.query.trim(),
          source: 'contact_page_form',
        });
      } catch {
        // Fallback: If API returns error, still proceed to WhatsApp delivery
      }

      // 2. Build WhatsApp message for Admin
      const cleanPhone = getCleanWhatsAppNumber(contactWhatsApp);
      const text = `💬 *NEW CONTACT INQUIRY — ${siteName.toUpperCase()}*\n\n` +
        `👤 *Name:* ${formData.name.trim()}\n` +
        `📧 *Email Id:* ${formData.email.trim()}\n` +
        `📱 *Mobile:* ${formData.mobile.trim() || 'Not provided'}\n` +
        `📝 *Query:* ${formData.query.trim()}`;

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

      setSubmittedSuccess(true);
      toast.success('Your message has been prepared! Opening WhatsApp...', 'Inquiry Sent');

      // 3. Open WhatsApp link
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 400);

    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please reach us directly on WhatsApp.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', mobile: '', query: '' });
    setSubmittedSuccess(false);
  };

  const quickInquiryMsg = `Hello ${siteName}! I would like to inquire about your South India tour packages.`;
  const directWhatsAppLink = formatWhatsAppUrl(contactWhatsApp, quickInquiryMsg);

  return (
    <div className="contact-page-root" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '82vh' }}>
      {/* Page Header (No Giant Banner) */}
      <section className="catalog-header-section" style={{ padding: '36px 0 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />
          <div className="catalog-header-content" style={{ marginTop: '14px' }}>
            <span className="section-badge" style={{ fontSize: '12px', fontWeight: 800, color: '#1226de', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(18, 38, 222, 0.08)', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block', marginBottom: '8px' }}>
              Direct Support &amp; Inquiries
            </span>
            <h1 className="catalog-page-title" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              Contact Us
            </h1>
            <p className="catalog-page-subtitle" style={{ fontSize: '15px', color: '#64748b', maxWidth: '700px', lineHeight: 1.6, margin: 0 }}>
              Have questions or need assistance? Fill out the quick form below or reach out to our team directly via WhatsApp or Phone.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="container" style={{ padding: '48px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column: Contact Information */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#1226de',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(18, 38, 222, 0.08)',
                padding: '4px 12px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '12px',
              }}
            >
              Get In Touch
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0B1329', marginBottom: '14px', lineHeight: 1.25 }}>
              Contact Information
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.7, marginBottom: '28px' }}>
              Our tour coordinators in Chennai are available 24/7 to assist with your custom holiday plans, private transfers, and travel inquiries.
            </p>

            {/* Quick Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
              {/* WhatsApp Action Card */}
              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  padding: '18px 22px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: '30px' }}>💬</span>
                <div>
                  <strong style={{ fontSize: '15px', display: 'block' }}>Chat Instantly on WhatsApp</strong>
                  <span style={{ fontSize: '12.5px', opacity: 0.9 }}>{contactWhatsApp} • Quick Response</span>
                </div>
              </a>

              {/* Phone Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>📞</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Helpline / Call Us</small>
                  <strong style={{ fontSize: '14.5px', color: '#0B1329' }}>{contactPhone}</strong>
                </div>
              </div>

              {/* Email Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>✉️</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Email Id</small>
                  <strong style={{ fontSize: '14.5px', color: '#0B1329' }}>{contactEmail}</strong>
                </div>
              </div>

              {/* Address Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>📍</span>
                <div>
                  <small style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Address / Location</small>
                  <strong style={{ fontSize: '14.5px', color: '#0B1329' }}>{contactAddress}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean WhatsApp Send Inquiry Form */}
          <div>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '36px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#1226de',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(18, 38, 222, 0.08)',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}
                >
                  Send Inquiry
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                  Send Message to WhatsApp
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                  Fill in your details below. Your query will be delivered directly to our team on WhatsApp.
                </p>
              </div>

              {submittedSuccess ? (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: '0 0 6px' }}>
                    Inquiry Submitted!
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#15803d', marginBottom: '18px', lineHeight: 1.5 }}>
                    Your message has been sent to our team on WhatsApp ({contactWhatsApp}). We will get back to you shortly!
                  </p>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: '10px', fontWeight: 700 }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Name * */}
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label htmlFor="contact-name" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Name <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14.5px',
                        borderRadius: '10px',
                        border: errors.name ? '1.5px solid #e11d48' : '1.5px solid #cbd5e1',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.name && (
                      <span style={{ display: 'block', fontSize: '12px', color: '#e11d48', marginTop: '4px', fontWeight: 600 }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email Id * */}
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label htmlFor="contact-email" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Email Id <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="emailus@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14.5px',
                        borderRadius: '10px',
                        border: errors.email ? '1.5px solid #e11d48' : '1.5px solid #cbd5e1',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.email && (
                      <span style={{ display: 'block', fontSize: '12px', color: '#e11d48', marginTop: '4px', fontWeight: 600 }}>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Mobile */}
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label htmlFor="contact-mobile" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Mobile
                    </label>
                    <input
                      id="contact-mobile"
                      name="mobile"
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.mobile}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14.5px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Query * */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label htmlFor="contact-query" style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Query <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <textarea
                      id="contact-query"
                      name="query"
                      rows={4}
                      placeholder="Your message or query..."
                      value={formData.query}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14.5px',
                        borderRadius: '10px',
                        border: errors.query ? '1.5px solid #e11d48' : '1.5px solid #cbd5e1',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                    {errors.query && (
                      <span style={{ display: 'block', fontSize: '12px', color: '#e11d48', marginTop: '4px', fontWeight: 600 }}>
                        {errors.query}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #25D366 0%, #16a34a 100%)',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 6px 16px rgba(37, 211, 102, 0.3)',
                      transition: 'all 0.2s ease',
                      opacity: isSubmitting ? 0.75 : 1,
                    }}
                  >
                    <span>💬</span>
                    <span>{isSubmitting ? 'Preparing WhatsApp...' : 'Send to WhatsApp'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
