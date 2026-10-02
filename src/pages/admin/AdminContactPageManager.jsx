import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteSettingsService from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';

export default function AdminContactPageManager() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contactData, setContactData] = useState({
    contact_phone: '+91 80725 66010',
    contact_email: 'contact@wanderersouthindia.com',
    contact_address: 'Chennai, Tamil Nadu, India',
    contact_business_hours: 'Monday - Sunday: 08:00 AM - 09:00 PM IST',
    contact_person: 'P. Kishore',
    contact_hero_title: 'Contact Us & Plan Your Journey',
    contact_hero_subtitle: 'Get in touch with Wanderer South India specialists for tailor-made itineraries, tour inquiries, and private chauffeur guides.',
  });

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Contact Page Visual Management',
      description: 'Visually manage public contact channels, business address, and operational hours',
    });

    async function loadContactSettings() {
      try {
        setLoading(true);
        const res = await siteSettingsService.getSettings();
        const data = res?.data || {};
        const flat = Array.isArray(data)
          ? data.reduce((acc, item) => ({ ...acc, [item.setting_key]: item.setting_value }), {})
          : (data.settings || data);

        setContactData((prev) => ({
          ...prev,
          contact_phone: flat.contact_phone || prev.contact_phone,
          contact_email: flat.contact_email || prev.contact_email,
          contact_address: flat.contact_address || prev.contact_address,
          contact_business_hours: flat.contact_business_hours || prev.contact_business_hours,
          contact_person: flat.contact_person || prev.contact_person,
          contact_hero_title: flat.contact_hero_title || prev.contact_hero_title,
          contact_hero_subtitle: flat.contact_hero_subtitle || prev.contact_hero_subtitle,
        }));
      } catch (err) {
        toast.error(err.message || 'Failed to load contact settings');
      } finally {
        setLoading(false);
      }
    }

    loadContactSettings();
  }, [toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await siteSettingsService.updateBulkSettings(contactData);
      toast.success('Contact page details updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update contact settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading Contact Page Settings..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Visual Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin/website" className="breadcrumb-link">Website Management</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Contact Page Management</span>
          </div>
          <h1 className="admin-page-title">Contact Page Visual Editor</h1>
          <p className="admin-page-subtitle">
            Visually manage operational office coordinates, hotline numbers, email channels, and business hours on the public /contact page.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-luxury-outline"
          >
            Live Preview ↗
          </a>
          <button
            type="button"
            className="btn btn-luxury-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Contact Details'}
          </button>
        </div>
      </div>

      {/* Visual Live Representation Preview of Contact Cards */}
      <div className="visual-page-preview-container">
        <div className="visual-preview-top-banner">
          <span className="preview-label">PUBLIC CONTACT PAGE SIMULATION</span>
          <span className="status-badge-luxury status-active">● Live on Website</span>
        </div>

        <div className="visual-contact-mock-grid">
          {/* Card 1: Phone */}
          <div className="mock-contact-card">
            <div className="mock-contact-icon">📞</div>
            <div className="mock-contact-details">
              <span className="mock-contact-label">Direct Line / WhatsApp</span>
              <strong className="mock-contact-val text-teal">{contactData.contact_phone}</strong>
              <span className="mock-contact-sub">Available 7 days a week</span>
            </div>
          </div>

          {/* Card 2: Email */}
          <div className="mock-contact-card">
            <div className="mock-contact-icon">✉️</div>
            <div className="mock-contact-details">
              <span className="mock-contact-label">General & Tour Inquiries</span>
              <strong className="mock-contact-val text-gold">{contactData.contact_email}</strong>
              <span className="mock-contact-sub">Responses within 12 hours</span>
            </div>
          </div>

          {/* Card 3: Address */}
          <div className="mock-contact-card">
            <div className="mock-contact-icon">📍</div>
            <div className="mock-contact-details">
              <span className="mock-contact-label">Head Office</span>
              <strong className="mock-contact-val">{contactData.contact_address}</strong>
              <span className="mock-contact-sub">Lead: {contactData.contact_person}</span>
            </div>
          </div>

          {/* Card 4: Hours */}
          <div className="mock-contact-card">
            <div className="mock-contact-icon">⏱️</div>
            <div className="mock-contact-details">
              <span className="mock-contact-label">Business Hours</span>
              <strong className="mock-contact-val">{contactData.contact_business_hours}</strong>
              <span className="mock-contact-sub">24/7 On-Tour Emergency Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="admin-contact-editor-grid">
        {/* Left Column: Communications Channels */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">1. Communication Hotline & Email</h2>
          <p className="admin-card-subtitle">Direct guest reachability parameters.</p>

          <div className="form-group">
            <label htmlFor="contact-phone-input" className="form-label">
              Primary Phone / WhatsApp Hotline <span className="text-danger">*</span>
            </label>
            <input
              id="contact-phone-input"
              type="text"
              className="form-input"
              value={contactData.contact_phone}
              onChange={(e) => setContactData({ ...contactData, contact_phone: e.target.value })}
              required
            />
            <span className="form-help">Include country code for foreign travelers (e.g. +91 or +94).</span>
          </div>

          <div className="form-group">
            <label htmlFor="contact-email-input" className="form-label">
              Official Inquiries Email Address <span className="text-danger">*</span>
            </label>
            <input
              id="contact-email-input"
              type="email"
              className="form-input"
              value={contactData.contact_email}
              onChange={(e) => setContactData({ ...contactData, contact_email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-person-input" className="form-label">
              Operations Lead / Concierge Manager
            </label>
            <input
              id="contact-person-input"
              type="text"
              className="form-input"
              value={contactData.contact_person}
              onChange={(e) => setContactData({ ...contactData, contact_person: e.target.value })}
            />
          </div>
        </div>

        {/* Right Column: Physical Headquarters & Schedule */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">2. Physical Office & Working Hours</h2>
          <p className="admin-card-subtitle">Official registered address and concierge schedule.</p>

          <div className="form-group">
            <label htmlFor="contact-addr-input" className="form-label">
              Head Office Street Address & City <span className="text-danger">*</span>
            </label>
            <textarea
              id="contact-addr-input"
              className="form-textarea"
              rows="3"
              value={contactData.contact_address}
              onChange={(e) => setContactData({ ...contactData, contact_address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-hours-input" className="form-label">
              Desk Operating Hours <span className="text-danger">*</span>
            </label>
            <input
              id="contact-hours-input"
              type="text"
              className="form-input"
              value={contactData.contact_business_hours}
              onChange={(e) => setContactData({ ...contactData, contact_business_hours: e.target.value })}
              required
            />
          </div>

          <div className="contact-social-quicklink">
            <span className="social-icon-badge">🌐</span>
            <div className="social-info">
              <strong>Social Media Links</strong>
              <p>Configure Facebook, Instagram, YouTube, and WhatsApp channels.</p>
            </div>
            <Link to="/admin/social-links" className="btn btn-secondary-luxury btn-sm">
              Manage Social Channels →
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
