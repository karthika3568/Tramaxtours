import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaPickerModal from '../media/MediaPickerModal';
import CmsContentRenderer from '../../public/common/CmsContentRenderer';
import { getMediaUrl } from '../../../utils/media';

export default function PageForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  mode = 'create', // 'create' | 'edit'
}) {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Tab State: 'basic' | 'content' | 'media' | 'seo'
  const [activeTab, setActiveTab] = useState('basic');

  // Content Editor Sub-mode: 'edit' | 'preview'
  const [contentViewMode, setContentViewMode] = useState('edit');

  // Form Field States initialized from initialData
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [status, setStatus] = useState(initialData?.status || 'published');
  const [content, setContent] = useState(initialData?.content || '');

  // Media
  const [heroMedia, setHeroMedia] = useState(initialData?.hero_media || null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seo_description || ''
  );

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Auto-generate slug from title if autoSlug is enabled
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setSlug(e.target.value);
  };

  // Helper to insert formatting tags at cursor / selection
  const insertFormatting = (tagOpen, tagClose, defaultText = 'Text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${tagOpen}${selected}${tagClose}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tagOpen.length,
        start + tagOpen.length + selected.length
      );
    }, 0);
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Page title is required.';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Page title cannot exceed 255 characters.';
    }

    if (slug.trim()) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug.trim())) {
        newErrors.slug =
          'Slug must contain only lowercase alphanumeric characters and hyphens (e.g., terms-conditions).';
      } else if (slug.trim().length > 255) {
        newErrors.slug = 'Slug cannot exceed 255 characters.';
      }
    }

    if (subtitle && subtitle.trim().length > 255) {
      newErrors.subtitle = 'Subtitle cannot exceed 255 characters.';
    }

    if (!['published', 'draft'].includes(status)) {
      newErrors.status = 'Invalid status selected.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      // Switch to basic tab if basic errors exist
      if (errors.title || errors.slug || errors.subtitle) {
        setActiveTab('basic');
      }
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      subtitle: subtitle.trim() || null,
      hero_media_id: heroMedia?.id ? parseInt(heroMedia.id, 10) : null,
      content: content || '',
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      status,
    };

    onSubmit(payload);
  };

  const heroImageUrl = getMediaUrl(heroMedia);
  const currentSlugDisplay = slug || 'your-page-slug';
  const previewSiteUrl = `https://wanderersouthindia.com/pages/${currentSlugDisplay}`;

  return (
    <form className="admin-form-card" onSubmit={handleSubmit} noValidate>
      {/* Form Tabs Navigation */}
      <div className="admin-form-tabs" role="tablist" aria-label="Page Form Tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'basic'}
          className={`admin-form-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <span className="tab-icon">📄</span>
          <span>1. Basic Info</span>
          {(errors.title || errors.slug || errors.subtitle) && (
            <span className="tab-error-dot" title="Validation errors in this tab">•</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'content'}
          className={`admin-form-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <span className="tab-icon">✍️</span>
          <span>2. Page Content</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'media'}
          className={`admin-form-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <span className="tab-icon">🖼️</span>
          <span>3. Hero Media</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'seo'}
          className={`admin-form-tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <span className="tab-icon">🔍</span>
          <span>4. SEO & SERP Preview</span>
        </button>
      </div>

      {/* TAB 1: BASIC INFORMATION */}
      {activeTab === 'basic' && (
        <div className="admin-form-tab-content">
          <div className="admin-form-section-header">
            <h3 className="admin-form-section-title">Page Information</h3>
            <p className="admin-form-section-desc">
              Define the primary title, URL slug, optional subtitle, and publication status.
            </p>
          </div>

          <div className="admin-form-grid">
            {/* Title */}
            <div className="form-group span-2">
              <label htmlFor="page-title-input" className="form-label required">
                Page Title
              </label>
              <input
                id="page-title-input"
                type="text"
                className={`form-input ${errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. Terms & Conditions, About Us, Privacy Policy..."
                value={title}
                onChange={handleTitleChange}
                maxLength={255}
                required
              />
              {errors.title ? (
                <span className="form-error-msg">{errors.title}</span>
              ) : (
                <span className="form-help-text">
                  The primary heading displayed on the page and public navigation (max 255 characters).
                </span>
              )}
            </div>

            {/* Slug */}
            <div className="form-group span-2">
              <label htmlFor="page-slug-input" className="form-label">
                URL Slug
              </label>
              <div className="slug-input-wrapper">
                <span className="slug-prefix">/pages/</span>
                <input
                  id="page-slug-input"
                  type="text"
                  className={`form-input slug-field ${errors.slug ? 'is-invalid' : ''}`}
                  placeholder="terms-conditions"
                  value={slug}
                  onChange={handleSlugChange}
                  maxLength={255}
                />
              </div>
              {errors.slug ? (
                <span className="form-error-msg">{errors.slug}</span>
              ) : (
                <span className="form-help-text">
                  Unique URL path for this page. Automatically generated from title if left blank.
                </span>
              )}
            </div>

            {/* Subtitle */}
            <div className="form-group span-2">
              <label htmlFor="page-subtitle-input" className="form-label">
                Subtitle / Excerpt <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="page-subtitle-input"
                type="text"
                className={`form-input ${errors.subtitle ? 'is-invalid' : ''}`}
                placeholder="e.g. Learn how Wanderer South India handles customer information and privacy rights."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={255}
              />
              {errors.subtitle && (
                <span className="form-error-msg">{errors.subtitle}</span>
              )}
            </div>

            {/* Publication Status */}
            <div className="form-group span-2">
              <label htmlFor="page-status-select-form" className="form-label required">
                Publication Status
              </label>
              <select
                id="page-status-select-form"
                className="form-input form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="published">Published (Visible to public visitors)</option>
                <option value="draft">Draft (Hidden from public catalog)</option>
              </select>
              <span className="form-help-text">
                Published pages are accessible via their public URL slug.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAGE CONTENT & LIVE PREVIEW */}
      {activeTab === 'content' && (
        <div className="admin-form-tab-content">
          <div className="admin-form-section-header cms-editor-header-row">
            <div>
              <h3 className="admin-form-section-title">Page Content & Formatting</h3>
              <p className="admin-form-section-desc">
                Author the main content using plain text or standard HTML markup.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="cms-editor-mode-toggle" role="group" aria-label="Editor View Toggle">
              <button
                type="button"
                className={`mode-toggle-btn ${contentViewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setContentViewMode('edit')}
              >
                ✏️ Editor Mode
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${contentViewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setContentViewMode('preview')}
              >
                👁️ Live Safe Preview
              </button>
            </div>
          </div>

          {contentViewMode === 'edit' ? (
            <div className="cms-editor-container">
              {/* Toolbar */}
              <div className="cms-editor-toolbar" role="toolbar" aria-label="Formatting Toolbar">
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Heading 2 (Section Title)"
                  onClick={() => insertFormatting('<h2>', '</h2>', 'Section Heading')}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Heading 3 (Subheading)"
                  onClick={() => insertFormatting('<h3>', '</h3>', 'Subheading')}
                >
                  H3
                </button>
                <span className="toolbar-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Bold Text"
                  onClick={() => insertFormatting('<strong>', '</strong>', 'bold text')}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Italic Text"
                  onClick={() => insertFormatting('<em>', '</em>', 'italic text')}
                >
                  <em>I</em>
                </button>
                <span className="toolbar-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Unordered List"
                  onClick={() =>
                    insertFormatting(
                      '<ul>\n  <li>',
                      '</li>\n  <li>Item 2</li>\n</ul>',
                      'First Item'
                    )
                  }
                >
                  • List
                </button>
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Blockquote Note"
                  onClick={() =>
                    insertFormatting('<blockquote>', '</blockquote>', 'Important note or quote.')
                  }
                >
                  ❝ Quote
                </button>
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Hyperlink"
                  onClick={() =>
                    insertFormatting('<a href="https://example.com">', '</a>', 'Link Text')
                  }
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  className="toolbar-btn"
                  title="Paragraph Wrap"
                  onClick={() => insertFormatting('<p>', '</p>', 'Paragraph text goes here.')}
                >
                  ¶ Paragraph
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                id="page-content-textarea"
                className="form-input cms-content-textarea"
                rows={18}
                placeholder="Write page content here... Supports plain text paragraphs as well as standard HTML tags (<h2>, <p>, <ul>, <strong>, <a>)."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Word / Char Counter Footer */}
              <div className="cms-editor-footer">
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                  Characters: {content.length} | Words:{' '}
                  {content.trim() ? content.trim().split(/\s+/).length : 0}
                </span>
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                  Pro-tip: Click &quot;Live Safe Preview&quot; above to see rendered output.
                </span>
              </div>
            </div>
          ) : (
            /* Live Preview Mode */
            <div className="cms-preview-viewport">
              <div className="cms-preview-banner">
                <span>👁️ Live CMS Rendering Preview</span>
                <span className="text-muted">Uses public CmsContentRenderer</span>
              </div>
              <div className="cms-article-card cms-preview-card">
                <div className="cms-article-header">
                  <h2 className="cms-article-title">{title || 'Untitled Page'}</h2>
                  {subtitle && <p className="text-muted">{subtitle}</p>}
                </div>
                <CmsContentRenderer content={content} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HERO MEDIA */}
      {activeTab === 'media' && (
        <div className="admin-form-tab-content">
          <div className="admin-form-section-header">
            <h3 className="admin-form-section-title">Hero Banner Image</h3>
            <p className="admin-form-section-desc">
              Select an image from the central Media Library to serve as the hero banner background for this page.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group span-2">
              <div className="media-preview-slot">
                {heroImageUrl ? (
                  <div className="media-preview-card">
                    <img
                      src={heroImageUrl}
                      alt={heroMedia.alt_text || heroMedia.title || title}
                      className="media-preview-image"
                    />
                    <div className="media-preview-info">
                      <strong className="media-preview-name">
                        {heroMedia.title || heroMedia.filename || 'Hero Image'}
                      </strong>
                      <span className="media-preview-meta text-muted">
                        ID: #{heroMedia.id} | {heroMedia.mime_type || 'Image'}
                      </span>
                      <div className="media-preview-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setIsMediaPickerOpen(true)}
                        >
                          Change Media
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-delete-danger"
                          onClick={() => setHeroMedia(null)}
                        >
                          Remove Media
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="media-empty-slot">
                    <div className="media-empty-icon">🖼️</div>
                    <p className="media-empty-text">No hero banner image assigned.</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      Select from Media Library
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & SERP PREVIEW */}
      {activeTab === 'seo' && (
        <div className="admin-form-tab-content">
          <div className="admin-form-section-header">
            <h3 className="admin-form-section-title">Search Engine Optimization (SEO)</h3>
            <p className="admin-form-section-desc">
              Configure search engine metadata to improve discoverability on Google and social media.
            </p>
          </div>

          <div className="admin-form-grid">
            {/* SEO Title */}
            <div className="form-group span-2">
              <div className="form-label-with-counter">
                <label htmlFor="page-seo-title-input" className="form-label">
                  SEO Meta Title
                </label>
                <span
                  className={`char-counter ${
                    seoTitle.length > 60 ? 'counter-warning' : ''
                  }`}
                >
                  {seoTitle.length}/60 recommended
                </span>
              </div>
              <input
                id="page-seo-title-input"
                type="text"
                className="form-input"
                placeholder="e.g. Terms and Conditions | Wanderer South India"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={255}
              />
              <span className="form-help-text">
                Defaults to page title if left blank. Optimal length is between 50-60 characters.
              </span>
            </div>

            {/* SEO Description */}
            <div className="form-group span-2">
              <div className="form-label-with-counter">
                <label htmlFor="page-seo-desc-input" className="form-label">
                  SEO Meta Description
                </label>
                <span
                  className={`char-counter ${
                    seoDescription.length > 160 ? 'counter-warning' : ''
                  }`}
                >
                  {seoDescription.length}/160 recommended
                </span>
              </div>
              <textarea
                id="page-seo-desc-input"
                className="form-input"
                rows={3}
                placeholder="Brief summary of the page for search results and social snippets..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                maxLength={500}
              />
              <span className="form-help-text">
                Optimal length is between 120-160 characters.
              </span>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="form-group span-2">
              <label className="form-label">Google Search Result Preview</label>
              <div className="serp-preview-box">
                <div className="serp-url">{previewSiteUrl}</div>
                <div className="serp-title">
                  {seoTitle || title || 'Wanderer South India — Page Title'}
                </div>
                <div className="serp-desc">
                  {seoDescription ||
                    subtitle ||
                    'Discover Wanderer South India policy and legal information. Read our official terms, privacy practices, and guidelines.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Bottom Action Bar */}
      <div className="admin-form-actions-bar">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate('/admin/pages')}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <div className="form-submit-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving Changes...'
              : mode === 'edit'
              ? 'Save & Update Page'
              : 'Create Page'}
          </button>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(mediaItem) => {
          setHeroMedia(mediaItem);
          setIsMediaPickerOpen(false);
        }}
        selectedMediaId={heroMedia?.id}
      />
    </form>
  );
}
