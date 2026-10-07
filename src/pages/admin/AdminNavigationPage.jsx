import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteSettingsService from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';
import Loading from '../../components/ui/Loading';

const DEFAULT_MENU_ITEMS = [
  { id: 'home', label: 'Home', path: '/', is_active: true, is_protected: true },
  { id: 'destinations', label: 'Destinations', path: '/destinations', is_active: true, is_protected: true },
  { id: 'tours', label: 'Tours', path: '/tours', is_active: true, is_protected: true },
  { id: 'testimonials', label: 'Testimonials', path: '/#testimonials', is_active: true, is_protected: true },
  { id: 'about', label: 'About', path: '/about', is_active: true, is_protected: true },
  { id: 'contact', label: 'Contact', path: '/contact', is_active: true, is_protected: true },
  { id: 'request_trip', label: 'Request My Trip', path: '/request-my-trip', is_active: true, is_protected: true, is_cta: true },
];

export default function AdminNavigationPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [settings, setSettings] = useState({
    site_name: 'Wonderer South India',
    site_tagline: 'Tailored Journeys Across South India',
    logo_url: '',
    header_cta_label: 'Request My Trip',
    header_cta_url: '/request-my-trip',
    top_bar_phone: '+91 8072566010',
    top_bar_email: 'contact@wonderersouthindia.in',
    show_top_bar: 'true',
    show_staff_portal_link: 'true',
  });

  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Public Navigation Management',
      description: 'Visually configure header navbar, logo, primary menu items, and top bar',
    });

    async function fetchNavSettings() {
      try {
        setLoading(true);
        const res = await siteSettingsService.getSettings();
        const data = res?.data || {};
        const flatSettings = Array.isArray(data)
          ? data.reduce((acc, item) => ({ ...acc, [item.setting_key]: item.setting_value }), {})
          : (data.settings || data);

        setSettings((prev) => ({
          ...prev,
          site_name: flatSettings.site_name || prev.site_name,
          site_tagline: flatSettings.site_tagline || prev.site_tagline,
          logo_url: flatSettings.site_logo_url || flatSettings.logo_url || prev.logo_url,
          header_cta_label: flatSettings.header_cta_label || prev.header_cta_label,
          header_cta_url: flatSettings.header_cta_url || prev.header_cta_url,
          top_bar_phone: flatSettings.contact_phone || prev.top_bar_phone,
          top_bar_email: flatSettings.contact_email || prev.top_bar_email,
        }));
      } catch (err) {
        toast.error(err.message || 'Failed to load navigation settings');
      } finally {
        setLoading(false);
      }
    }

    fetchNavSettings();
  }, [toast]);

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updates = {
        site_name: settings.site_name,
        site_tagline: settings.site_tagline,
        logo_url: settings.logo_url,
        site_logo_url: settings.logo_url,
        header_cta_label: settings.header_cta_label,
        header_cta_url: settings.header_cta_url,
        contact_phone: settings.top_bar_phone,
        contact_email: settings.top_bar_email,
      };

      await siteSettingsService.updateBulkSettings(updates);
      toast.success('Public navigation settings updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update navigation settings');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (asset) => {
    setSettings((prev) => ({
      ...prev,
      logo_url: asset.file_path || asset.url,
    }));
    setIsMediaPickerOpen(false);
    toast.success('Brand logo selected from Media Library');
  };

  const handleMoveMenuItem = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menuItems.length) return;
    const newItems = [...menuItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setMenuItems(newItems);
  };

  const handleToggleMenuItem = (index) => {
    const newItems = [...menuItems];
    newItems[index].is_active = !newItems[index].is_active;
    setMenuItems(newItems);
  };

  if (loading) {
    return <Loading message="Loading Navigation Architecture..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Navigation & Header</span>
          </div>
          <h1 className="admin-page-title">Public Website Navigation</h1>
          <p className="admin-page-subtitle">
            Visually manage the primary public navbar, brand identity, header CTA button, and contact details matching the live website.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-luxury-outline"
          >
            Live Preview ↗
          </a>
          <button
            type="button"
            className="btn btn-luxury-primary"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Navigation'}
          </button>
        </div>
      </div>

      {/* Live Interactive Navbar Preview */}
      <div className="visual-navbar-preview-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
        <div className="preview-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <span className="preview-card-tag" style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.05em', color: '#1226de' }}>LIVE NAVBAR VISUAL PREVIEW</span>
          <span className="preview-badge-status" style={{ fontSize: '12px', color: '#64748b' }}>● Live Site Navbar Simulation</span>
        </div>

        {/* Main Navbar */}
        <div className="mock-main-navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#ffffff' }}>
          <div className="mock-brand-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="mock-logo-img" style={{ maxHeight: '40px' }} />
            ) : (
              <div className="mock-logo-symbol" style={{ fontWeight: 900, color: '#1226de', fontSize: '20px' }}>
                {settings.site_name}
              </div>
            )}
          </div>

          <div className="mock-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {menuItems.filter((i) => i.is_active).map((item) => (
              item.is_cta ? (
                <span
                  key={item.id}
                  className="mock-nav-cta-pill"
                  style={{
                    background: 'linear-gradient(135deg, #1226de 0%, #0a178c 100%)',
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: '0 4px 14px rgba(1, 170, 144, 0.25)',
                  }}
                >
                  ✨ {item.label}
                </span>
              ) : (
                <span key={item.id} className="mock-nav-link" style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  {item.label}
                </span>
              )
            ))}
          </div>

          <div className="mock-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}>
              Sign In
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Editor Sections */}
      <form onSubmit={handleSaveAll} className="admin-nav-editor-grid">
        {/* Left Column: Brand & CTA Configuration */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">Brand Identity & CTA</h2>
          <p className="admin-card-subtitle">Configure the brand logo, company name, and primary call-to-action button.</p>

          <div className="form-group">
            <label className="form-label">Brand Logo</label>
            <div className="media-selector-row">
              <div className="media-thumbnail-preview">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Brand Logo" />
                ) : (
                  <div className="no-media-placeholder">Text Logo (Default)</div>
                )}
              </div>
              <div className="media-selector-actions">
                <button
                  type="button"
                  className="btn btn-secondary-luxury"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  🖼 Select Logo from Media Library
                </button>
                {settings.logo_url && (
                  <button
                    type="button"
                    className="btn btn-text-danger"
                    onClick={() => setSettings((prev) => ({ ...prev, logo_url: '' }))}
                  >
                    Use Text Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="site-name-input" className="form-label">Site / Brand Name</label>
            <input
              id="site-name-input"
              type="text"
              className="form-input"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="site-tagline-input" className="form-label">Site Tagline</label>
            <input
              id="site-tagline-input"
              type="text"
              className="form-input"
              value={settings.site_tagline}
              onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="header-cta-label" className="form-label">Book Now CTA Label</label>
              <input
                id="header-cta-label"
                type="text"
                className="form-input"
                value={settings.header_cta_label}
                onChange={(e) => setSettings({ ...settings, header_cta_label: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="header-cta-url" className="form-label">CTA Target Link</label>
              <input
                id="header-cta-url"
                type="text"
                className="form-input"
                value={settings.header_cta_url}
                onChange={(e) => setSettings({ ...settings, header_cta_url: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="top-phone" className="form-label">Top Bar Phone</label>
              <input
                id="top-phone"
                type="text"
                className="form-input"
                value={settings.top_bar_phone}
                onChange={(e) => setSettings({ ...settings, top_bar_phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="top-email" className="form-label">Top Bar Email</label>
              <input
                id="top-email"
                type="email"
                className="form-input"
                value={settings.top_bar_email}
                onChange={(e) => setSettings({ ...settings, top_bar_email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Menu Items Structure */}
        <div className="admin-card-luxury">
          <div className="card-header-flex">
            <div>
              <h2 className="admin-card-title">Primary Menu Links</h2>
              <p className="admin-card-subtitle">Manage public navigation routes, sequence, and visibility.</p>
            </div>
          </div>

          <div className="visual-menu-items-list">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className={`visual-menu-item-row ${!item.is_active ? 'is-disabled' : ''}`}
              >
                <div className="menu-item-left">
                  <span className="menu-drag-icon">☰</span>
                  <div className="menu-item-info">
                    <strong className="menu-item-label">{item.label}</strong>
                    <span className="menu-item-path">{item.path}</span>
                  </div>
                </div>

                <div className="menu-item-right">
                  <span className={`status-pill ${item.is_active ? 'pill-active' : 'pill-inactive'}`}>
                    {item.is_active ? 'Active' : 'Hidden'}
                  </span>

                  <div className="menu-order-btns">
                    <button
                      type="button"
                      className="btn-order"
                      disabled={index === 0}
                      onClick={() => handleMoveMenuItem(index, 'up')}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-order"
                      disabled={index === menuItems.length - 1}
                      onClick={() => handleMoveMenuItem(index, 'down')}
                      title="Move Down"
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`btn-action-pill ${item.is_active ? 'btn-status-deactivate' : 'btn-status-activate'}`}
                    onClick={() => handleToggleMenuItem(index)}
                  >
                    {item.is_active ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="nav-safety-notice">
            <span className="safety-icon">🛡️</span>
            <span className="safety-text">
              Core public routes (Home, Tours, Destinations, About, Contact) and the Staff Portal are protected to prevent accidental broken customer pathways.
            </span>
          </div>
        </div>
      </form>

      {/* Media Picker Modal for Brand Logo */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        selectedMediaId={null}
        title="Select Brand Logo"
      />
    </div>
  );
}
