import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteSettingsService from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';

export default function AdminFooterManagerPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Live Footer Settings State
  const [footerSettings, setFooterSettings] = useState({
    site_name: 'Wonderer South India',
    contact_phone: '+91 8072566010',
    contact_whatsapp: '+91 8072566010',
    contact_email: 'contact@wonderersouthindia.in',
    footer_planning_badge: 'Curated Itineraries & Luxury Transport',
    footer_planning_title: 'Travel Planning Services by Wonderer South India',
    footer_planning_lead: 'Let’s work with a family travel expert to book the vacation of your dreams, complete with all the best travel amenities for a seamless experience in vacation planning!',
    footer_planning_btn_text: 'Message us on WhatsApp',
    footer_planning_whatsapp_msg: 'Hello Wonderer South India! I would like to inquire about family travel amenities, vacation planning services, and custom tour packages.',
    footer_copyright: `© ${new Date().getFullYear()} Wonderer South India. All rights reserved.`,
  });

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Live Footer Visual Management',
      description: 'Visually manage global public website footer, planning CTA, WhatsApp direct contact, and brand copyright',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFooter() {
      try {
        setLoading(true);
        const settingsRes = await siteSettingsService.getSettings();

        if (isMounted && settingsRes) {
          const sData = settingsRes?.data || {};
          const flat = Array.isArray(sData)
            ? sData.reduce((acc, item) => ({ ...acc, [item.setting_key]: item.setting_value }), {})
            : (sData.settings || sData);

          setFooterSettings((prev) => ({
            ...prev,
            site_name: flat.site_name || prev.site_name,
            contact_phone: flat.contact_phone || prev.contact_phone,
            contact_whatsapp: flat.contact_whatsapp || flat.contact_phone || prev.contact_whatsapp,
            contact_email: flat.contact_email || prev.contact_email,
            footer_planning_badge: flat.footer_planning_badge || prev.footer_planning_badge,
            footer_planning_title: flat.footer_planning_title || `Travel Planning Services by ${flat.site_name || prev.site_name}`,
            footer_planning_lead: flat.footer_planning_lead || prev.footer_planning_lead,
            footer_planning_btn_text: flat.footer_planning_btn_text || prev.footer_planning_btn_text,
            footer_planning_whatsapp_msg: flat.footer_planning_whatsapp_msg || prev.footer_planning_whatsapp_msg,
            footer_copyright: flat.footer_copyright || prev.footer_copyright,
          }));
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load footer configuration');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFooter();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, toast]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const updates = {
        site_name: footerSettings.site_name,
        contact_phone: footerSettings.contact_phone,
        contact_whatsapp: footerSettings.contact_whatsapp,
        contact_email: footerSettings.contact_email,
        footer_planning_badge: footerSettings.footer_planning_badge,
        footer_planning_title: footerSettings.footer_planning_title,
        footer_planning_lead: footerSettings.footer_planning_lead,
        footer_planning_btn_text: footerSettings.footer_planning_btn_text,
        footer_planning_whatsapp_msg: footerSettings.footer_planning_whatsapp_msg,
        footer_copyright: footerSettings.footer_copyright,
      };

      await siteSettingsService.updateBulkSettings(updates);
      toast.success('Footer branding, planning CTA & copyright updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update footer settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <Loading message="Loading Footer Architecture..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Footer Management</span>
          </div>
          <h1 className="admin-page-title">Global Live Footer Manager</h1>
          <p className="admin-page-subtitle">
            Visually manage the public website footer showcase, WhatsApp concierge CTA, brand contacts, and copyright statement matching the live website.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/#site-footer"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-luxury-outline"
          >
            Live Preview ↗
          </a>
          <button
            type="button"
            className="btn btn-luxury-primary"
            onClick={handleSaveSettings}
            disabled={savingSettings}
          >
            {savingSettings ? 'Saving...' : '💾 Save Footer'}
          </button>
        </div>
      </div>

      {/* Visual Interactive Footer Preview Mockup (Matches live website Footer.jsx) */}
      <div className="visual-page-preview-container" style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', marginBottom: '32px' }}>
        <div className="visual-preview-top-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
          <span className="preview-label" style={{ color: '#1226de', fontWeight: 800, fontSize: '12px', letterSpacing: '0.05em' }}>LIVE FOOTER VISUAL SIMULATION</span>
          <span className="status-badge-luxury status-active" style={{ fontSize: '12px', color: '#10b981' }}>● Active on All Public Pages</span>
        </div>

        <div className="visual-footer-preview-box" style={{ padding: '48px 24px 32px', color: '#ffffff', textAlign: 'center' }}>
          {/* Main Planning Header */}
          <div style={{ maxWidth: '720px', margin: '0 auto 28px' }}>
            {footerSettings.footer_planning_badge && (
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(1, 170, 144, 0.15)',
                  color: '#1226de',
                  border: '1px solid rgba(1, 170, 144, 0.3)',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '14px',
                }}
              >
                {footerSettings.footer_planning_badge}
              </span>
            )}
            <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff', lineHeight: 1.3 }}>
              {footerSettings.footer_planning_title}
            </h2>
            {footerSettings.footer_planning_lead && (
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {footerSettings.footer_planning_lead}
              </p>
            )}
          </div>

          {/* Action Button & Direct Contact */}
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            {/* WhatsApp CTA Button */}
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.114-.06-.402-.132-.931-.309-1.603-.604-1.391-.61-2.29-2.023-2.361-2.115-.069-.092-.569-.757-.569-1.444 0-.687.359-1.026.487-1.168.128-.142.279-.177.373-.177.093 0 .186 0 .267.005.087.004.204-.033.319.243.118.283.402.98.437 1.052.035.071.059.155.012.248-.047.094-.07.153-.14.234-.07.082-.146.182-.209.245-.07.069-.143.144-.061.285.082.141.365.602.784.975.54.481.996.63 1.137.7.141.07.224.06.307-.035.083-.095.356-.413.45-.555.095-.141.189-.118.318-.07.129.047.818.386.959.456.141.071.236.106.271.165.035.06.035.344-.109.749z" />
                </svg>
                <span>{footerSettings.footer_planning_btn_text}</span>
              </span>
            </div>

            {/* Direct Brand & Email Contact Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
                {footerSettings.site_name}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                ✉️ {footerSettings.contact_email} &nbsp;•&nbsp; 📞 {footerSettings.contact_phone}
              </p>
            </div>

            {/* Social Links Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
              <span>Follow Us:</span>
              <span style={{ color: '#1226de' }}>Instagram • Facebook • YouTube • TripAdvisor</span>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#94a3b8' }}>
            <span>{footerSettings.footer_copyright}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Terms &amp; Conditions</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings Editor Form */}
      <form onSubmit={handleSaveSettings} className="admin-footer-editor-grid">
        {/* Card 1: Travel Planning Showcase & WhatsApp Configuration */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">Planning Showcase & WhatsApp CTA</h2>
          <p className="admin-card-subtitle">Configure the prominent showcase section and instant WhatsApp inquiry button.</p>

          <div className="form-group">
            <label htmlFor="foot-badge" className="form-label">Showcase Top Badge</label>
            <input
              id="foot-badge"
              type="text"
              className="form-input"
              value={footerSettings.footer_planning_badge}
              onChange={(e) => setFooterSettings({ ...footerSettings, footer_planning_badge: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="foot-title" className="form-label">Planning Hero Headline</label>
            <input
              id="foot-title"
              type="text"
              className="form-input"
              value={footerSettings.footer_planning_title}
              onChange={(e) => setFooterSettings({ ...footerSettings, footer_planning_title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="foot-lead" className="form-label">Planning Description / Lead Text</label>
            <textarea
              id="foot-lead"
              className="form-textarea"
              rows="3"
              value={footerSettings.footer_planning_lead}
              onChange={(e) => setFooterSettings({ ...footerSettings, footer_planning_lead: e.target.value })}
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="foot-btn-text" className="form-label">WhatsApp Button Label</label>
              <input
                id="foot-btn-text"
                type="text"
                className="form-input"
                value={footerSettings.footer_planning_btn_text}
                onChange={(e) => setFooterSettings({ ...footerSettings, footer_planning_btn_text: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="foot-whatsapp" className="form-label">Target WhatsApp Number</label>
              <input
                id="foot-whatsapp"
                type="text"
                className="form-input"
                value={footerSettings.contact_whatsapp}
                onChange={(e) => setFooterSettings({ ...footerSettings, contact_whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="foot-whatsapp-msg" className="form-label">Default WhatsApp Prefilled Message</label>
            <textarea
              id="foot-whatsapp-msg"
              className="form-textarea"
              rows="2"
              value={footerSettings.footer_planning_whatsapp_msg}
              onChange={(e) => setFooterSettings({ ...footerSettings, footer_planning_whatsapp_msg: e.target.value })}
            />
          </div>
        </div>

        {/* Card 2: Brand Identity & Copyright */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">Brand Info & Legal Copyright</h2>
          <p className="admin-card-subtitle">Configure contact details, email, phone, and bottom legal disclaimer.</p>

          <div className="form-group">
            <label htmlFor="foot-sitename" className="form-label">Brand Name</label>
            <input
              id="foot-sitename"
              type="text"
              className="form-input"
              value={footerSettings.site_name}
              onChange={(e) => setFooterSettings({ ...footerSettings, site_name: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="foot-phone" className="form-label">Contact Phone</label>
              <input
                id="foot-phone"
                type="text"
                className="form-input"
                value={footerSettings.contact_phone}
                onChange={(e) => setFooterSettings({ ...footerSettings, contact_phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="foot-email" className="form-label">Contact Email</label>
              <input
                id="foot-email"
                type="email"
                className="form-input"
                value={footerSettings.contact_email}
                onChange={(e) => setFooterSettings({ ...footerSettings, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="foot-copyright" className="form-label">Bottom Copyright Statement</label>
            <input
              id="foot-copyright"
              type="text"
              className="form-input"
              value={footerSettings.footer_copyright}
              onChange={(e) => setFooterSettings({ ...footerSettings, footer_copyright: e.target.value })}
              required
            />
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="submit"
              className="btn btn-luxury-primary"
              disabled={savingSettings}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {savingSettings ? 'Saving Changes...' : '💾 Save Footer Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
