import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteSettingsService from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';
import Loading from '../../components/ui/Loading';
import { getMediaUrl } from '../../utils/media';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [settings, setSettings] = useState({
    site_name: 'Tramax Tours',
    site_tagline: 'Dream. Travel. Discover.',
    meta_description: 'Discover South India with Tramax Tours. Handcrafted tour packages, private cabs, spiritual pilgrimage & hill station getaways.',
    contact_phone: '+91 98400 00000',
    contact_whatsapp: '+91 98400 00000',
    contact_email: 'contact@tramaxtours.in',
    contact_address: 'Chennai, Tamil Nadu, India',
    contact_business_hours: 'Mon - Sun: 08:00 AM - 09:00 PM IST',
    header_cta_label: 'Book Now',
    header_cta_url: '/tours',
    default_currency: 'INR',
    footer_about: 'Tramax Tours provides premium guided excursions, private temple pilgrimages, and cultural day trips across South India.',
    footer_copyright: '',
    site_logo_url: '',
  });

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Site Settings & General Configuration',
      description: 'Configure brand identity, contact information, business hours, and global parameters.',
    });

    async function loadSettings() {
      try {
        setLoading(true);
        const res = await siteSettingsService.getSettings();
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          const mapped = {};
          data.forEach((item) => {
            if (item.setting_key) {
              mapped[item.setting_key] = item.setting_value;
            }
          });
          setSettings((prev) => ({ ...prev, ...mapped }));
        } else if (typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load site settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoSelected = (media) => {
    setSettings((prev) => ({ ...prev, site_logo_url: getMediaUrl(media) }));
    setIsMediaPickerOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = Object.entries(settings).map(([key, val]) => ({
        setting_key: key,
        setting_value: val,
        setting_group: key.startsWith('contact_') ? 'contact' : key.startsWith('footer_') ? 'footer' : 'general',
      }));

      // Update sequentially or in bulk
      for (const item of payload) {
        try {
          await siteSettingsService.updateSetting(item.setting_key, { setting_value: item.setting_value });
        } catch {
          // Fallback create if not exists
          await siteSettingsService.createSetting(item);
        }
      }

      toast.success('Site settings updated successfully!', 'Settings Saved');
    } catch (err) {
      toast.error(err?.message || 'Failed to update settings', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading site settings..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header-card">
        <div>
          <span className="admin-badge-category">GLOBAL SYSTEM CONFIGURATION</span>
          <h1 className="admin-page-main-title">Site Settings &amp; Branding</h1>
          <p className="admin-page-main-sub">
            Configure global website name, contact details, business hours, and SEO metadata.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/website/navigation" className="btn btn-outline btn-sm">
            🧭 Header &amp; Nav Manager
          </Link>
          <Link to="/admin/social-links" className="btn btn-outline btn-sm">
            📱 Social Channels
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="admin-settings-form">
        {/* Brand & Identity Box */}
        <div className="admin-box-card" style={{ marginBottom: '24px' }}>
          <div className="admin-box-header">
            <h3 className="admin-box-title">🏢 Brand &amp; Identity</h3>
          </div>
          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label required">Site Name</label>
              <input
                type="text"
                name="site_name"
                className="form-input"
                value={settings.site_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Slogan</label>
              <input
                type="text"
                name="site_tagline"
                className="form-input"
                value={settings.site_tagline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Global Meta Description (SEO)</label>
            <textarea
              name="meta_description"
              className="form-input"
              rows={2}
              value={settings.meta_description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Site Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {settings.site_logo_url && (
                <img
                  src={settings.site_logo_url}
                  alt="Site logo preview"
                  style={{ height: '48px', width: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', padding: '4px' }}
                />
              )}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsMediaPickerOpen(true)}
              >
                🖼️ {settings.site_logo_url ? 'Change Logo' : 'Select Logo'}
              </button>
            </div>
          </div>
        </div>

        {/* Contact & Support Information Box */}
        <div className="admin-box-card" style={{ marginBottom: '24px' }}>
          <div className="admin-box-header">
            <h3 className="admin-box-title">📞 Contact &amp; Support Details</h3>
          </div>
          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label required">Contact Phone Number</label>
              <input
                type="text"
                name="contact_phone"
                className="form-input"
                value={settings.contact_phone}
                onChange={handleChange}
                placeholder="+91 98400 00000"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Contact Email Address</label>
              <input
                type="email"
                name="contact_email"
                className="form-input"
                value={settings.contact_email}
                onChange={handleChange}
                placeholder="contact@tramaxtours.in"
                required
              />
            </div>
          </div>

          <div className="form-grid-2col" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input
                type="text"
                name="contact_whatsapp"
                className="form-input"
                value={settings.contact_whatsapp}
                onChange={handleChange}
                placeholder="+91 98400 00000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Address / Office Location</label>
              <input
                type="text"
                name="contact_address"
                className="form-input"
                value={settings.contact_address}
                onChange={handleChange}
                placeholder="Chennai, Tamil Nadu, India"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business / Tour Desk Operating Hours</label>
              <input
                type="text"
                name="contact_business_hours"
                className="form-input"
                value={settings.contact_business_hours}
                onChange={handleChange}
                placeholder="Mon - Sun: 08:00 AM - 09:00 PM IST"
              />
            </div>
          </div>
        </div>

        {/* Footer About & Header CTA Box */}
        <div className="admin-box-card" style={{ marginBottom: '24px' }}>
          <div className="admin-box-header">
            <h3 className="admin-box-title">📑 Footer &amp; Navigation Defaults</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Footer About Text</label>
            <textarea
              name="footer_about"
              className="form-input"
              rows={3}
              value={settings.footer_about}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Footer Copyright Line</label>
            <input
              type="text"
              name="footer_copyright"
              className="form-input"
              value={settings.footer_copyright}
              onChange={handleChange}
              placeholder={`© ${new Date().getFullYear()} Tramax Tours. All rights reserved.`}
            />
            <span className="form-hint">Leave blank to auto-generate from the site name and current year.</span>
          </div>

          <div className="form-grid-2col" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Header Call-to-Action Label</label>
              <input
                type="text"
                name="header_cta_label"
                className="form-input"
                value={settings.header_cta_label}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Header Call-to-Action Link</label>
              <input
                type="text"
                name="header_cta_url"
                className="form-input"
                value={settings.header_cta_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="admin-form-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving Settings...' : '💾 Save Global Settings'}
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleLogoSelected}
        title="Select Site Logo"
        typeFilter="image"
      />
    </div>
  );
}
