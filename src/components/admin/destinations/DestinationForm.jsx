import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaPickerModal from '../media/MediaPickerModal';
import DestinationGalleryManager from './DestinationGalleryManager';
import DestinationSectionsManager from './DestinationSectionsManager';
import DestinationFaqsManager from './DestinationFaqsManager';
import { getMediaUrl } from '../../../utils/media';

export default function DestinationForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  mode = 'create', // 'create' | 'edit'
}) {
  const navigate = useNavigate();

  // Form Field States initialized directly from initialData
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.is_featured));
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);

  // Content Fields
  const [heroTitle, setHeroTitle] = useState(initialData?.hero_title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(initialData?.hero_subtitle || '');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [introHeading, setIntroHeading] = useState(initialData?.intro_heading || '');
  const [introLabel, setIntroLabel] = useState(initialData?.intro_label || '');
  const [introContent, setIntroContent] = useState(initialData?.intro_content || '');

  // Media references & objects
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || null);
  const [introMedia, setIntroMedia] = useState(initialData?.intro_media || null);
  const [ogImage, setOgImage] = useState(initialData?.og_image || null);

  // Child Modules State
  const [gallery, setGallery] = useState(initialData?.gallery || []);
  const [sections, setSections] = useState(initialData?.sections || []);
  const [faqs, setFaqs] = useState(initialData?.faqs || []);

  // Regional & Geographic Details
  const [language, setLanguage] = useState(initialData?.language || '');
  const [currency, setCurrency] = useState(initialData?.currency || '');
  const [religion, setReligion] = useState(initialData?.religion || '');
  const [heritage, setHeritage] = useState(initialData?.heritage || '');
  const [timezone, setTimezone] = useState(initialData?.timezone || '');
  const [latitude, setLatitude] = useState(
    initialData?.latitude !== null && initialData?.latitude !== undefined
      ? String(initialData.latitude)
      : ''
  );
  const [longitude, setLongitude] = useState(
    initialData?.longitude !== null && initialData?.longitude !== undefined
      ? String(initialData.longitude)
      : ''
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '');

  // Media Picker Modals
  const [pickerTarget, setPickerTarget] = useState(null); // 'featured' | 'intro' | 'og' | null

  // Active Form Tab
  const [activeTab, setActiveTab] = useState('basic');

  // Client Validation Errors
  const [errors, setErrors] = useState({});

  // Helper to slugify string
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug when name changes in create mode
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    if (autoSlug && mode === 'create') {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setSlug(e.target.value);
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Destination name is required.';
    } else if (name.trim().length > 150) {
      newErrors.name = 'Destination name cannot exceed 150 characters.';
    }

    if (slug.trim()) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug.trim())) {
        newErrors.slug = 'Slug may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.';
      } else if (slug.trim().length > 191) {
        newErrors.slug = 'Slug cannot exceed 191 characters.';
      }
    }

    if (latitude !== '' && latitude !== null) {
      const latNum = parseFloat(latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be a valid number between -90 and 90.';
      }
    }

    if (longitude !== '' && longitude !== null) {
      const lngNum = parseFloat(longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be a valid number between -180 and 180.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      status,
      is_featured: isFeatured ? 1 : 0,
      display_order: parseInt(displayOrder, 10) || 0,
      hero_title: heroTitle.trim() || null,
      hero_subtitle: heroSubtitle.trim() || null,
      short_description: shortDescription.trim() || null,
      intro_heading: introHeading.trim() || null,
      intro_label: introLabel.trim() || null,
      intro_content: introContent.trim() || null,
      featured_image_id: featuredImage?.id || null,
      intro_media_id: introMedia?.id || null,
      og_image_id: ogImage?.id || null,
      language: language.trim() || null,
      currency: currency.trim() || null,
      religion: religion.trim() || null,
      heritage: heritage.trim() || null,
      timezone: timezone.trim() || null,
      latitude: latitude !== '' ? parseFloat(latitude) : null,
      longitude: longitude !== '' ? parseFloat(longitude) : null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      gallery,
      sections,
      faqs,
    };

    onSubmit(payload);
  };

  // Media selection handler
  const handleMediaPicked = (asset) => {
    if (pickerTarget === 'featured') {
      setFeaturedImage(asset);
    } else if (pickerTarget === 'intro') {
      setIntroMedia(asset);
    } else if (pickerTarget === 'og') {
      setOgImage(asset);
    }
    setPickerTarget(null);
  };

  return (
    <form onSubmit={handleSubmit} className="dest-admin-form">
      {/* Form Navigation Tabs */}
      <div className="dest-form-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'basic'}
          className={`dest-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          1. Basic & Status
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'content'}
          className={`dest-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          2. Hero & Content
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'media'}
          className={`dest-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          3. Key Visuals
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'gallery'}
          className={`dest-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          4. Gallery ({gallery.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sections'}
          className={`dest-tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          5. Sections ({sections.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'faqs'}
          className={`dest-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          6. FAQs ({faqs.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'regional'}
          className={`dest-tab-btn ${activeTab === 'regional' ? 'active' : ''}`}
          onClick={() => setActiveTab('regional')}
        >
          7. Regional Details
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'seo'}
          className={`dest-tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          8. SEO & Meta
        </button>
      </div>

      {/* TAB 1: Basic & Status */}
      {activeTab === 'basic' && (
        <div className="dest-form-section-card">
          <h3 className="dest-section-title">Destination Identification & Status</h3>

          <div className="form-grid-2col">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="dest-name" className="form-label required">
                Destination Name *
              </label>
              <input
                type="text"
                id="dest-name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Kenya Safari Circuit, Zanzibar, Serengeti"
                maxLength={150}
                required
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Slug */}
            <div className="form-group">
              <label htmlFor="dest-slug" className="form-label">
                URL Slug
              </label>
              <div className="input-group-slug">
                <span className="input-prefix">/destinations/</span>
                <input
                  type="text"
                  id="dest-slug"
                  className={`form-input ${errors.slug ? 'input-error' : ''}`}
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="auto-generated-from-name"
                  maxLength={191}
                />
              </div>
              <span className="form-hint">
                Unique URL path. If left empty on creation, backend generates it automatically.
              </span>
              {errors.slug && <span className="form-error">{errors.slug}</span>}
            </div>
          </div>

          <div className="form-grid-3col">
            {/* Status */}
            <div className="form-group">
              <label htmlFor="dest-status" className="form-label required">
                Publishing Status *
              </label>
              <select
                id="dest-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft (Private / Hidden)</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived (Deactivated)</option>
              </select>
            </div>

            {/* Display Order */}
            <div className="form-group">
              <label htmlFor="dest-order" className="form-label">
                Display Order
              </label>
              <input
                type="number"
                id="dest-order"
                className="form-input"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min={0}
                step={1}
              />
              <span className="form-hint">Lower numbers appear first on the catalog and homepage.</span>
            </div>

            {/* Is Featured Toggle */}
            <div className="form-group dest-featured-toggle-group">
              <label className="form-label">Homepage Spotlight</label>
              <label className="dest-checkbox-card">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span className="checkbox-text">
                  <strong>Featured Destination</strong>
                  <small>Prominently feature on homepage slider/grid</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hero & Content */}
      {activeTab === 'content' && (
        <div className="dest-form-section-card">
          <h3 className="dest-section-title">Headlines & Narrative Content</h3>

          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="dest-hero-title" className="form-label">
                Hero Title
              </label>
              <input
                type="text"
                id="dest-hero-title"
                className="form-input"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. Majestic Kenya: The Heart of the African Safari"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dest-hero-subtitle" className="form-label">
                Hero Subtitle
              </label>
              <input
                type="text"
                id="dest-hero-subtitle"
                className="form-input"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g. Unrivaled wildlife spectacles and timeless savannahs"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dest-short-desc" className="form-label">
              Short Summary Description
            </label>
            <textarea
              id="dest-short-desc"
              rows={3}
              className="form-textarea"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A concise synopsis shown on catalog cards and overview previews..."
            />
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="dest-intro-heading" className="form-label">
                Intro Heading
              </label>
              <input
                type="text"
                id="dest-intro-heading"
                className="form-input"
                value={introHeading}
                onChange={(e) => setIntroHeading(e.target.value)}
                placeholder="e.g. Discover the Wonders of Serengeti"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dest-intro-label" className="form-label">
                Intro Badge / Label
              </label>
              <input
                type="text"
                id="dest-intro-label"
                className="form-input"
                value={introLabel}
                onChange={(e) => setIntroLabel(e.target.value)}
                placeholder="e.g. WILDLIFE & ADVENTURE"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dest-intro-content" className="form-label">
              Full Introductory Content
            </label>
            <textarea
              id="dest-intro-content"
              rows={6}
              className="form-textarea"
              value={introContent}
              onChange={(e) => setIntroContent(e.target.value)}
              placeholder="In-depth narrative describing the destination, culture, landscapes, and wildlife..."
            />
          </div>
        </div>
      )}

      {/* TAB 3: Key Visuals */}
      {activeTab === 'media' && (
        <div className="dest-form-section-card">
          <h3 className="dest-section-title">Visual Media Assets (Media Library)</h3>
          <p className="section-instruction">
            Select high-resolution images from the central Media Library. No external CDN or hardcoded images are permitted.
          </p>

          <div className="dest-media-pickers-grid">
            {/* 1. Featured Hero Image */}
            <div className="dest-media-picker-card">
              <span className="media-picker-card-title">1. Featured Hero Image</span>
              <span className="media-picker-card-desc">Main backdrop on destination catalog cards and page hero</span>

              <div className="dest-media-preview-box">
                {featuredImage ? (
                  <div className="picked-media-view">
                    <img
                      src={getMediaUrl(featuredImage)}
                      alt={featuredImage.alt_text || 'Featured Hero'}
                      className="picked-media-img"
                    />
                    <div className="picked-media-info">
                      <span className="picked-name">{featuredImage.original_name || featuredImage.filename}</span>
                      <span className="picked-meta">{featuredImage.mime_type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-media-box">
                    <span>🖼️ No Hero Image Selected</span>
                  </div>
                )}
              </div>

              <div className="media-picker-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPickerTarget('featured')}
                >
                  {featuredImage ? 'Change Hero Image' : 'Select Hero Image'}
                </button>
                {featuredImage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-clear-media"
                    onClick={() => setFeaturedImage(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* 2. Intro Section Media */}
            <div className="dest-media-picker-card">
              <span className="media-picker-card-title">2. Intro Section Media</span>
              <span className="media-picker-card-desc">Visual displayed adjacent to the introductory overview</span>

              <div className="dest-media-preview-box">
                {introMedia ? (
                  <div className="picked-media-view">
                    <img
                      src={getMediaUrl(introMedia)}
                      alt={introMedia.alt_text || 'Intro Media'}
                      className="picked-media-img"
                    />
                    <div className="picked-media-info">
                      <span className="picked-name">{introMedia.original_name || introMedia.filename}</span>
                      <span className="picked-meta">{introMedia.mime_type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-media-box">
                    <span>🌄 No Intro Media Selected</span>
                  </div>
                )}
              </div>

              <div className="media-picker-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPickerTarget('intro')}
                >
                  {introMedia ? 'Change Intro Media' : 'Select Intro Media'}
                </button>
                {introMedia && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-clear-media"
                    onClick={() => setIntroMedia(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* 3. OpenGraph Social Share Image */}
            <div className="dest-media-picker-card">
              <span className="media-picker-card-title">3. Social Share Image (OG)</span>
              <span className="media-picker-card-desc">Image displayed when link is shared on Facebook / Twitter / WhatsApp</span>

              <div className="dest-media-preview-box">
                {ogImage ? (
                  <div className="picked-media-view">
                    <img
                      src={getMediaUrl(ogImage)}
                      alt={ogImage.alt_text || 'OG Media'}
                      className="picked-media-img"
                    />
                    <div className="picked-media-info">
                      <span className="picked-name">{ogImage.original_name || ogImage.filename}</span>
                      <span className="picked-meta">{ogImage.mime_type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-media-box">
                    <span>🌐 No Social Image Selected</span>
                  </div>
                )}
              </div>

              <div className="media-picker-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPickerTarget('og')}
                >
                  {ogImage ? 'Change Social Image' : 'Select Social Image'}
                </button>
                {ogImage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-clear-media"
                    onClick={() => setOgImage(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Destination Gallery */}
      {activeTab === 'gallery' && (
        <div className="dest-form-section-card">
          <DestinationGalleryManager gallery={gallery} onChange={setGallery} />
        </div>
      )}

      {/* TAB 5: Narrative Sections */}
      {activeTab === 'sections' && (
        <div className="dest-form-section-card">
          <DestinationSectionsManager sections={sections} onChange={setSections} />
        </div>
      )}

      {/* TAB 6: Destination FAQs */}
      {activeTab === 'faqs' && (
        <div className="dest-form-section-card">
          <DestinationFaqsManager faqs={faqs} onChange={setFaqs} />
        </div>
      )}

      {/* TAB 7: Regional & Coordinates */}
      {activeTab === 'regional' && (
        <div className="dest-form-section-card">
          <h3 className="dest-section-title">Regional Information & Coordinates</h3>

          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="dest-language" className="form-label">
                Official Languages
              </label>
              <input
                type="text"
                id="dest-language"
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. English, Swahili"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dest-currency" className="form-label">
                Local Currency
              </label>
              <input
                type="text"
                id="dest-currency"
                className="form-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g. Kenyan Shilling (KES), USD"
              />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="dest-religion" className="form-label">
                Predominant Religions / Culture
              </label>
              <input
                type="text"
                id="dest-religion"
                className="form-input"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                placeholder="e.g. Christianity, Islam, Indigenous"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dest-timezone" className="form-label">
                Timezone
              </label>
              <input
                type="text"
                id="dest-timezone"
                className="form-input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. East Africa Time (UTC+3)"
              />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="dest-heritage" className="form-label">
                Heritage
              </label>
              <input
                type="text"
                id="dest-heritage"
                className="form-input"
                value={heritage}
                onChange={(e) => setHeritage(e.target.value)}
                placeholder="e.g. UNESCO World Heritage Sites"
              />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="dest-latitude" className="form-label">
                Latitude (-90.0 to 90.0)
              </label>
              <input
                type="number"
                id="dest-latitude"
                className={`form-input ${errors.latitude ? 'input-error' : ''}`}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="any"
                min="-90"
                max="90"
                placeholder="e.g. -1.286389"
              />
              {errors.latitude && <span className="form-error">{errors.latitude}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dest-longitude" className="form-label">
                Longitude (-180.0 to 180.0)
              </label>
              <input
                type="number"
                id="dest-longitude"
                className={`form-input ${errors.longitude ? 'input-error' : ''}`}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="any"
                min="-180"
                max="180"
                placeholder="e.g. 36.817223"
              />
              {errors.longitude && <span className="form-error">{errors.longitude}</span>}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SEO & Meta */}
      {activeTab === 'seo' && (
        <div className="dest-form-section-card">
          <h3 className="dest-section-title">Search Engine Optimization (SEO)</h3>

          <div className="form-group">
            <label htmlFor="dest-seo-title" className="form-label">
              Meta Title Tag
            </label>
            <input
              type="text"
              id="dest-seo-title"
              className="form-input"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Kenya Safari Tours & Packages | Wanderer South India"
              maxLength={70}
            />
            <span className="form-hint">{seoTitle.length}/70 characters recommended</span>
          </div>

          <div className="form-group">
            <label htmlFor="dest-seo-desc" className="form-label">
              Meta Description Tag
            </label>
            <textarea
              id="dest-seo-desc"
              rows={3}
              className="form-textarea"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Compelling meta description appearing in search results..."
              maxLength={160}
            />
            <span className="form-hint">{seoDescription.length}/160 characters recommended</span>
          </div>
        </div>
      )}

      {/* Form Submission Footer Bar */}
      <div className="dest-form-footer-bar">
        <button
          type="button"
          className="btn btn-outline btn-md"
          onClick={() => navigate('/admin/destinations')}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <div className="form-footer-actions">
          {mode === 'edit' && initialData?.slug && (
            <a
              href={`/destinations/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-md"
            >
              ↗ View Public Page
            </a>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-md btn-save-dest"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving Destination...'
              : mode === 'edit'
              ? 'Update Destination'
              : 'Create Destination'}
          </button>
        </div>
      </div>

      {/* Reusable Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          isOpen={Boolean(pickerTarget)}
          onClose={() => setPickerTarget(null)}
          onSelect={handleMediaPicked}
          selectedMediaId={
            pickerTarget === 'featured'
              ? featuredImage?.id
              : pickerTarget === 'intro'
              ? introMedia?.id
              : ogImage?.id
          }
          title={
            pickerTarget === 'featured'
              ? 'Select Featured Hero Image'
              : pickerTarget === 'intro'
              ? 'Select Intro Section Media'
              : 'Select OpenGraph Social Image'
          }
        />
      )}
    </form>
  );
}
