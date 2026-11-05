import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pageService from '../../services/pageService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';

export default function AdminAboutPageManager() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState(null);

  const [formData, setFormData] = useState({
    title: 'About Wonderer South India',
    slug: 'about-us',
    content: '',
    status: 'published',
    meta_title: 'About Wonderer South India — Bespoke Travel & Luxury Journeys',
    meta_description: 'Learn about Wonderer South India, our passion for hospitality, cultural expeditions, and wildlife safaris.',
  });

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - About Page Management',
      description: 'Manage the public About Us page content, company story narrative, and SEO metadata',
    });

    async function loadAboutPage() {
      try {
        setLoading(true);
        // Look up about page by slug
        const res = await pageService.getPage('about-us');
        const data = res?.data || res;

        if (data && data.id) {
          setPageId(data.id);
          setFormData({
            title: data.title || 'About Wonderer South India',
            slug: data.slug || 'about-us',
            content: data.content || '',
            status: data.status || 'published',
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
          });
        }
      } catch {
        // Fallback default if not yet created in DB
      } finally {
        setLoading(false);
      }
    }

    loadAboutPage();
  }, [toast]);

  const handleSave = async (statusOverride = null) => {
    try {
      setSaving(true);
      const targetStatus = statusOverride || formData.status;

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        subtitle: null,
        content: formData.content.trim(),
        hero_media_id: null,
        status: targetStatus,
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
      };

      if (pageId) {
        await pageService.updatePage(pageId, payload);
        toast.success(`About page ${targetStatus === 'published' ? 'published' : 'saved as draft'} successfully`);
      } else {
        const created = await pageService.createPage(payload);
        const newId = created?.data?.id || created?.id;
        if (newId) setPageId(newId);
        toast.success('About page created and published successfully');
      }

      setFormData((prev) => ({ ...prev, status: targetStatus }));
    } catch (err) {
      toast.error(err.message || 'Failed to save About page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading About Page Architecture..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Visual Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">About Page Management</span>
          </div>
          <h1 className="admin-page-title">About Page Editor</h1>
          <p className="admin-page-subtitle">
            Manage the company heritage narrative, story details, and SEO metadata seen on the public /about page.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-luxury-outline"
          >
            Live Preview ↗
          </a>
          <button
            type="button"
            className="btn btn-secondary-luxury"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn btn-luxury-primary"
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            {saving ? 'Publishing...' : '🚀 Publish Changes'}
          </button>
        </div>
      </div>

      {/* Structured Content Form */}
      <div className="admin-about-editor-grid">
        {/* Left Column: Narrative Story & Content */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">1. Page Information & Narrative Story</h2>
          <p className="admin-card-subtitle">Manage company heritage, brand philosophy, and about story text.</p>

          <div className="form-group">
            <label htmlFor="about-title" className="form-label">Page Heading / Brand Name</label>
            <input
              id="about-title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="about-content" className="form-label">Company Story & Narrative Content</label>
            <textarea
              id="about-content"
              className="form-textarea"
              rows="12"
              placeholder="Describe the company heritage, foundation, bespoke safari services, chauffeur guides, and travel philosophy..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>

        {/* Right Column: SEO & Publishing */}
        <div className="admin-card-luxury">
          <h2 className="admin-card-title">2. SEO & Publishing Control</h2>
          <p className="admin-card-subtitle">Search engine metadata and public publication status.</p>

          <div className="form-group">
            <label htmlFor="about-slug" className="form-label">URL Slug</label>
            <input
              id="about-slug"
              type="text"
              className="form-input font-mono"
              value={formData.slug}
              disabled
              title="Locked to public route /about"
            />
            <span className="form-help">Connected directly to public route <code>/about</code></span>
          </div>

          <div className="form-group">
            <label htmlFor="about-meta-title" className="form-label">SEO Meta Title</label>
            <input
              id="about-meta-title"
              type="text"
              className="form-input"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="about-meta-desc" className="form-label">SEO Meta Description</label>
            <textarea
              id="about-meta-desc"
              className="form-textarea"
              rows="3"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="about-status-sel" className="form-label">Page Status</label>
            <select
              id="about-status-sel"
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="published">● Published (Live to Visitors)</option>
              <option value="draft">○ Draft (Hidden from Public)</option>
            </select>
          </div>

          <div className="about-subsections-info-box">
            <h3 className="info-box-title">Dynamic Connected Elements</h3>
            <p className="info-box-desc">
              The public About page also automatically renders your active <strong>Homepage Benefits</strong> and <strong>CMS Story Sections</strong>.
            </p>
            <div className="info-box-links">
              <Link to="/admin/website/home/benefits" className="btn-link-action">
                Manage Benefits →
              </Link>
              <Link to="/admin/website/home/sections" className="btn-link-action">
                Manage CMS Sections →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
