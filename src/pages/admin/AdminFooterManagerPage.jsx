import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerLinksService from '../../services/footerLinksService';
import siteSettingsService from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';

export default function AdminFooterManagerPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [footerLinks, setFooterLinks] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [submittingLink, setSubmittingLink] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Settings
  const [footerSettings, setFooterSettings] = useState({
    site_name: 'Tramax Tours',
    site_tagline: 'Curated Luxury & Adventure Travel',
    footer_about: 'Tramax Tours specializes in international tourist safaris, private sightseeing, cultural expeditions, and custom itineraries across premier destinations.',
    footer_copyright: `© ${new Date().getFullYear()} Tramax Tours. All rights reserved.`,
    contact_phone: '+91 98400 00000',
    contact_email: 'contact@tramaxtours.in',
    contact_address: 'Chennai, Tamil Nadu, India',
  });

  // Link Form
  const [linkFormData, setLinkFormData] = useState({
    label: '',
    url: '',
    column_name: 'useful_links',
    display_order: 0,
    status: 'active',
    is_external: false,
  });

  const fetchFooterData = () => setReloadTrigger((prev) => prev + 1);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Footer Visual Management',
      description: 'Visually manage global public website footer, navigation columns, and brand copyright',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFooter() {
      try {
        setLoading(true);
        const [linksRes, settingsRes] = await Promise.allSettled([
          footerLinksService.getFooterLinks({ limit: 100 }),
          siteSettingsService.getSettings(),
        ]);

        if (isMounted) {
          if (linksRes.status === 'fulfilled') {
            const rawLinks = linksRes.value?.data?.links || linksRes.value?.data || (Array.isArray(linksRes.value) ? linksRes.value : []);
            setFooterLinks(rawLinks);
          }

          if (settingsRes.status === 'fulfilled') {
            const sData = settingsRes.value?.data || {};
            const flat = Array.isArray(sData)
              ? sData.reduce((acc, item) => ({ ...acc, [item.setting_key]: item.setting_value }), {})
              : (sData.settings || sData);

            setFooterSettings((prev) => ({
              ...prev,
              site_name: flat.site_name || prev.site_name,
              site_tagline: flat.site_tagline || prev.site_tagline,
              footer_about: flat.footer_about || prev.footer_about,
              footer_copyright: flat.footer_copyright || prev.footer_copyright,
              contact_phone: flat.contact_phone || prev.contact_phone,
              contact_email: flat.contact_email || prev.contact_email,
              contact_address: flat.contact_address || prev.contact_address,
            }));
          }
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
      await siteSettingsService.updateBulkSettings({
        footer_about: footerSettings.footer_about,
        footer_copyright: footerSettings.footer_copyright,
        site_tagline: footerSettings.site_tagline,
      });
      toast.success('Footer branding & copyright updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update footer settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenCreateLink = (columnKey = 'useful_links') => {
    setEditingLink(null);
    setLinkFormData({
      label: '',
      url: '/',
      column_name: columnKey,
      display_order: footerLinks.length + 1,
      status: 'active',
      is_external: false,
    });
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link) => {
    setEditingLink(link);
    setLinkFormData({
      label: link.label || '',
      url: link.url || '',
      column_name: link.column_name || 'useful_links',
      display_order: link.display_order ?? 0,
      status: link.status || 'active',
      is_external: Boolean(link.is_external),
    });
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkFormData.label.trim() || !linkFormData.url.trim()) {
      toast.warning('Please enter link title and URL');
      return;
    }

    try {
      setSubmittingLink(true);
      const payload = {
        label: linkFormData.label.trim(),
        url: linkFormData.url.trim(),
        column_name: linkFormData.column_name,
        display_order: Number(linkFormData.display_order) || 0,
        status: linkFormData.status,
        is_external: linkFormData.is_external ? 1 : 0,
      };

      if (editingLink) {
        await footerLinksService.updateFooterLink(editingLink.id, payload);
        toast.success('Footer link updated');
      } else {
        await footerLinksService.createFooterLink(payload);
        toast.success('Footer link created');
      }

      setIsLinkModalOpen(false);
      fetchFooterData();
    } catch (err) {
      toast.error(err.message || 'Failed to save footer link');
    } finally {
      setSubmittingLink(false);
    }
  };

  const handleDeleteLink = async (link) => {
    if (!window.confirm(`Delete footer link "${link.label}"?`)) return;
    try {
      await footerLinksService.deleteFooterLink(link.id);
      toast.success('Footer link removed');
      fetchFooterData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete footer link');
    }
  };

  const usefulLinks = footerLinks.filter((l) => l.column_name === 'useful_links');
  const policyLinks = footerLinks.filter((l) => l.column_name === 'policy_pages');

  if (loading) {
    return <Loading message="Loading Footer Management System..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Visual Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Footer Management</span>
          </div>
          <h1 className="admin-page-title">Global Footer Visual Manager</h1>
          <p className="admin-page-subtitle">
            Visually manage public footer columns, brand overview text, navigation links, legal policies, and copyright statement.
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
            onClick={() => handleOpenCreateLink('useful_links')}
          >
            + Add Footer Link
          </button>
        </div>
      </div>

      {/* Visual Interactive Footer Preview Mockup */}
      <div className="visual-page-preview-container">
        <div className="visual-preview-top-banner">
          <span className="preview-label">LIVE FOOTER VISUAL SIMULATION</span>
          <span className="status-badge-luxury status-active">● Active on All Public Pages</span>
        </div>

        <div className="visual-footer-preview-box">
          <div className="visual-footer-grid">
            {/* Col 1 */}
            <div className="v-foot-col brand-col">
              <strong className="v-foot-brand-title">{footerSettings.site_name}</strong>
              <p className="v-foot-tagline">{footerSettings.site_tagline}</p>
              <p className="v-foot-about">{footerSettings.footer_about}</p>
              <div className="v-foot-contact">
                <span>📍 {footerSettings.contact_address}</span>
                <span>📞 {footerSettings.contact_phone}</span>
                <span>✉️ {footerSettings.contact_email}</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="v-foot-col">
              <div className="v-foot-header-row">
                <span className="v-foot-heading">Quick Navigation</span>
                <button
                  type="button"
                  className="btn-add-mini"
                  onClick={() => handleOpenCreateLink('useful_links')}
                  title="Add Link to this column"
                >
                  + Add
                </button>
              </div>
              <ul className="v-foot-links-list">
                {usefulLinks.length === 0 ? (
                  <li className="text-muted text-sm">No links added</li>
                ) : (
                  usefulLinks.map((l) => (
                    <li key={l.id} className="v-foot-link-item">
                      <span>{l.label}</span>
                      <div className="v-link-actions">
                        <button type="button" onClick={() => handleOpenEditLink(l)} title="Edit">✎</button>
                        <button type="button" onClick={() => handleDeleteLink(l)} title="Delete">🗑</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Col 3 */}
            <div className="v-foot-col">
              <div className="v-foot-header-row">
                <span className="v-foot-heading">Policies & Info</span>
                <button
                  type="button"
                  className="btn-add-mini"
                  onClick={() => handleOpenCreateLink('policy_pages')}
                  title="Add Link to this column"
                >
                  + Add
                </button>
              </div>
              <ul className="v-foot-links-list">
                {policyLinks.length === 0 ? (
                  <li className="text-muted text-sm">No policy links</li>
                ) : (
                  policyLinks.map((l) => (
                    <li key={l.id} className="v-foot-link-item">
                      <span>{l.label}</span>
                      <div className="v-link-actions">
                        <button type="button" onClick={() => handleOpenEditLink(l)} title="Edit">✎</button>
                        <button type="button" onClick={() => handleDeleteLink(l)} title="Delete">🗑</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Col 4 */}
            <div className="v-foot-col">
              <span className="v-foot-heading">Social & Community</span>
              <p className="v-foot-about">Explore safari footage and travel stories across our social channels.</p>
              <div className="v-foot-social-cta">
                <Link to="/admin/social-links" className="btn btn-luxury-outline btn-sm">
                  Manage Social Links ↗
                </Link>
              </div>
            </div>
          </div>

          <div className="visual-footer-bottom-bar">
            <span className="v-copyright-text">{footerSettings.footer_copyright}</span>
            <span className="v-powered-tag">Crafted with Tramax Tours CMS</span>
          </div>
        </div>
      </div>

      {/* Editor Cards Grid */}
      <div className="admin-footer-editor-grid">
        {/* Card 1: Branding & Copyright Editor */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">Brand Statement & Copyright</h2>
          <p className="admin-card-subtitle">Edit the summary bio and bottom copyright statement.</p>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label htmlFor="foot-tagline" className="form-label">Brand Tagline</label>
              <input
                id="foot-tagline"
                type="text"
                className="form-input"
                value={footerSettings.site_tagline}
                onChange={(e) => setFooterSettings({ ...footerSettings, site_tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="foot-about" className="form-label">Footer About / Bio Statement</label>
              <textarea
                id="foot-about"
                className="form-textarea"
                rows="4"
                value={footerSettings.footer_about}
                onChange={(e) => setFooterSettings({ ...footerSettings, footer_about: e.target.value })}
                required
              />
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

            <button
              type="submit"
              className="btn btn-luxury-primary"
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Footer Branding'}
            </button>
          </form>
        </div>

        {/* Card 2: All Footer Links Catalog */}
        <div className="admin-card-luxury">
          <div className="card-header-flex">
            <div>
              <h2 className="admin-card-title">Footer Navigation Link Database</h2>
              <p className="admin-card-subtitle">Full catalogue of all configured footer links.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary-luxury btn-sm"
              onClick={() => handleOpenCreateLink('useful_links')}
            >
              + Add Link
            </button>
          </div>

          <div className="footer-links-table-wrapper">
            <table className="admin-table-luxury">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL Target</th>
                  <th>Column Group</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {footerLinks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No footer links registered</td>
                  </tr>
                ) : (
                  footerLinks.map((link) => (
                    <tr key={link.id}>
                      <td className="font-semibold">{link.label}</td>
                      <td className="font-mono text-sm text-teal">{link.url}</td>
                      <td>
                        <span className="badge-column">
                          {link.column_name === 'useful_links' ? 'Quick Navigation' : 'Policies & Info'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${link.status === 'active' ? 'pill-active' : 'pill-inactive'}`}>
                          {link.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-inline">
                          <button
                            type="button"
                            className="btn-link-action"
                            onClick={() => handleOpenEditLink(link)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-link-action text-danger"
                            onClick={() => handleDeleteLink(link)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Link Edit / Create Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={editingLink ? `Edit Link: ${editingLink.label}` : 'Add Footer Link'}
        size="md"
      >
        <form onSubmit={handleSaveLink} className="admin-form-luxury">
          <div className="form-group">
            <label htmlFor="link-title" className="form-label">
              Link Label / Title <span className="text-danger">*</span>
            </label>
            <input
              id="link-title"
              type="text"
              className="form-input"
              placeholder="e.g. Terms & Conditions"
              value={linkFormData.label}
              onChange={(e) => setLinkFormData({ ...linkFormData, label: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="link-url" className="form-label">
              Link Target URL <span className="text-danger">*</span>
            </label>
            <input
              id="link-url"
              type="text"
              className="form-input font-mono"
              placeholder="e.g. /terms or /privacy-policy or https://..."
              value={linkFormData.url}
              onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="link-col" className="form-label">Target Column Group</label>
              <select
                id="link-col"
                className="form-select"
                value={linkFormData.column_name}
                onChange={(e) => setLinkFormData({ ...linkFormData, column_name: e.target.value })}
              >
                <option value="useful_links">Quick Navigation (Column 2)</option>
                <option value="policy_pages">Policies & Info (Column 3)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="link-status" className="form-label">Status</label>
              <select
                id="link-status"
                className="form-select"
                value={linkFormData.status}
                onChange={(e) => setLinkFormData({ ...linkFormData, status: e.target.value })}
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="link-order" className="form-label">Display Order Sequence</label>
            <input
              id="link-order"
              type="number"
              min="0"
              className="form-input"
              value={linkFormData.display_order}
              onChange={(e) => setLinkFormData({ ...linkFormData, display_order: e.target.value })}
            />
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              className="btn btn-secondary-luxury"
              onClick={() => setIsLinkModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-luxury-primary"
              disabled={submittingLink}
            >
              {submittingLink ? 'Saving...' : editingLink ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
