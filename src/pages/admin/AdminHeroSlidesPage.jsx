import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import homeHeroService from '../../services/homeHeroService';
import { getMediaUrl } from '../../utils/media';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminHeroSlidesPage() {
  const toast = useToast();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    desktop_media_id: '',
    desktop_media_url: '',
    cta_label: '',
    cta_url: '',
    display_order: 0,
    status: 'active',
    start_date: '',
    end_date: '',
  });

  const fetchSlides = () => setReloadTrigger((prev) => prev + 1);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Hero Carousel Management',
      description: 'Visually manage public homepage hero carousel slides and CTAs',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadSlides() {
      try {
        setLoading(true);
        const res = await homeHeroService.getSlides({ limit: 50, sort_by: 'display_order', sort_order: 'ASC' });
        const slideList = res?.data?.slides || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setSlides(slideList);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load hero slides');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSlides();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, toast]);

  const handleOpenCreate = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      desktop_media_id: '',
      desktop_media_url: '',
      cta_label: 'Explore Tours',
      cta_url: '/tours',
      display_order: slides.length + 1,
      status: 'active',
      start_date: '',
      end_date: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    const mediaUrl = slide.desktop_media?.url || (slide.desktop_media?.file_path ? getMediaUrl(slide.desktop_media.file_path) : '');
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      desktop_media_id: slide.desktop_media_id || (slide.desktop_media?.id ?? ''),
      desktop_media_url: mediaUrl,
      cta_label: slide.cta_label || '',
      cta_url: slide.cta_url || '',
      display_order: slide.display_order ?? 0,
      status: slide.status || 'active',
      start_date: slide.start_date ? slide.start_date.split(' ')[0] : '',
      end_date: slide.end_date ? slide.end_date.split(' ')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleMediaSelect = (asset) => {
    setFormData((prev) => ({
      ...prev,
      desktop_media_id: asset.id,
      desktop_media_url: getMediaUrl(asset.file_path || asset.url),
    }));
    setIsMediaPickerOpen(false);
    toast.success('Media asset selected');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Please enter a slide title/heading');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        desktop_media_id: formData.desktop_media_id ? Number(formData.desktop_media_id) : null,
        cta_label: formData.cta_label.trim() || null,
        cta_url: formData.cta_url.trim() || null,
        display_order: Number(formData.display_order) || 0,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingSlide) {
        await homeHeroService.updateSlide(editingSlide.id, payload);
        toast.success('Hero slide updated successfully');
      } else {
        await homeHeroService.createSlide(payload);
        toast.success('Hero slide created successfully');
      }

      setIsModalOpen(false);
      fetchSlides();
    } catch (err) {
      toast.error(err.message || 'Failed to save slide');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (slide) => {
    try {
      const newStatus = slide.status === 'active' ? 'inactive' : 'active';
      if (newStatus === 'active') {
        await homeHeroService.activateSlide(slide.id);
      } else {
        await homeHeroService.deactivateSlide(slide.id);
      }
      toast.success(`Slide set to ${newStatus}`);
      fetchSlides();
    } catch (err) {
      toast.error(err.message || 'Failed to update slide status');
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Are you sure you want to delete the slide "${slide.title}"?`)) {
      return;
    }
    try {
      await homeHeroService.deleteSlide(slide.id);
      toast.success('Slide removed successfully');
      fetchSlides();
    } catch (err) {
      toast.error(err.message || 'Failed to delete slide');
    }
  };

  const handleMove = async (slideIndex, direction) => {
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const currentSlide = slides[slideIndex];
    const targetSlide = slides[targetIndex];

    try {
      // Swap display_orders
      const currentOrder = currentSlide.display_order ?? slideIndex + 1;
      const targetOrder = targetSlide.display_order ?? targetIndex + 1;

      await Promise.all([
        homeHeroService.updateSlide(currentSlide.id, { display_order: targetOrder }),
        homeHeroService.updateSlide(targetSlide.id, { display_order: currentOrder }),
      ]);

      toast.success('Slides reordered successfully');
      fetchSlides();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder slides');
    }
  };

  const activeCount = slides.filter((s) => s.status === 'active').length;

  return (
    <div className="admin-page-container">
      {/* Visual Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/admin/website/home" className="breadcrumb-link">Home Page</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Hero Carousel</span>
          </div>
          <h1 className="admin-page-title">Hero Carousel Management</h1>
          <p className="admin-page-subtitle">
            Visually manage high-impact hero slides, luxury banners, and call-to-action buttons for the public homepage.
          </p>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-luxury-outline"
            title="Open Public Homepage in New Tab"
          >
            Live Preview ↗
          </a>
          <button
            type="button"
            className="btn btn-luxury-primary"
            onClick={handleOpenCreate}
          >
            + Add New Slide
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="admin-stats-ribbon">
        <div className="stat-pill">
          <span className="stat-label">Total Slides:</span>
          <span className="stat-value">{slides.length}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Active / Live:</span>
          <span className="stat-value text-teal">{activeCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Inactive / Draft:</span>
          <span className="stat-value text-muted">{slides.length - activeCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Connected Public Route:</span>
          <span className="stat-value font-mono">/ (Hero Carousel)</span>
        </div>
      </div>

      {/* Main Visual Slide Stack */}
      {loading ? (
        <Loading message="Loading Hero Carousel Slides..." />
      ) : slides.length === 0 ? (
        <EmptyState
          icon="🌄"
          title="No Hero Slides Configured"
          description="Create your first hero carousel slide to showcase stunning travel destinations on the homepage."
          actionText="+ Create First Slide"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="visual-hero-slides-grid">
          {slides.map((slide, index) => {
            const mediaPath = slide.desktop_media?.file_path || slide.desktop_media?.url;
            const bgImage = mediaPath ? getMediaUrl(mediaPath) : '/images/hero-default.jpg';

            return (
              <div
                key={slide.id}
                className={`visual-hero-card ${slide.status === 'inactive' ? 'is-inactive' : ''}`}
              >
                {/* Visual Slide Mock Banner */}
                <div
                  className="visual-hero-card-banner"
                  style={{ backgroundImage: `linear-gradient(rgba(11, 19, 41, 0.45), rgba(11, 19, 41, 0.8)), url(${bgImage})` }}
                >
                  <div className="visual-hero-card-badges">
                    <span className="order-badge">#{index + 1} • Order: {slide.display_order}</span>
                    <span className={`status-badge-luxury ${slide.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {slide.status === 'active' ? '● Live on Website' : '○ Inactive / Draft'}
                    </span>
                  </div>

                  <div className="visual-hero-card-content">
                    <h3 className="visual-hero-title">{slide.title}</h3>
                    {slide.subtitle && <p className="visual-hero-subtitle">{slide.subtitle}</p>}
                    {slide.cta_label && (
                      <div className="visual-hero-cta-preview">
                        <span className="btn-hero-preview">
                          {slide.cta_label} →
                        </span>
                        {slide.cta_url && <span className="cta-target-url">Links to: {slide.cta_url}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Controls Toolbar */}
                <div className="visual-hero-card-footer">
                  <div className="visual-reorder-group">
                    <button
                      type="button"
                      className="btn-icon-control"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Move slide up"
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      className="btn-icon-control"
                      disabled={index === slides.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Move slide down"
                    >
                      ↓ Down
                    </button>
                  </div>

                  <div className="visual-actions-group">
                    <button
                      type="button"
                      className={`btn-action-pill ${slide.status === 'active' ? 'btn-status-deactivate' : 'btn-status-activate'}`}
                      onClick={() => handleToggleStatus(slide)}
                    >
                      {slide.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      className="btn-action-pill btn-action-edit"
                      onClick={() => handleOpenEdit(slide)}
                    >
                      ✎ Edit Slide
                    </button>
                    <button
                      type="button"
                      className="btn-action-pill btn-action-delete"
                      onClick={() => handleDelete(slide)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Slide Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlide ? `Edit Hero Slide #${editingSlide.id}` : 'Create New Hero Slide'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="admin-form-luxury">
          {/* Live Preview Inside Modal */}
          <div className="form-group-visual-preview">
            <label className="form-label">Live Slide Preview</label>
            <div
              className="modal-hero-live-preview"
              style={{
                backgroundImage: `linear-gradient(rgba(11, 19, 41, 0.45), rgba(11, 19, 41, 0.8)), url(${formData.desktop_media_url || '/images/hero-default.jpg'})`,
              }}
            >
              <h2 className="preview-heading">{formData.title || 'Your Slide Headline Here'}</h2>
              <p className="preview-sub">{formData.subtitle || 'Discover handpicked luxury journeys across Sri Lanka and beyond.'}</p>
              {formData.cta_label && (
                <div className="preview-cta">
                  <span className="btn-preview-mock">{formData.cta_label} →</span>
                </div>
              )}
            </div>
          </div>

          {/* Media Selector */}
          <div className="form-group">
            <label className="form-label">Slide Background Image</label>
            <div className="media-selector-row">
              <div className="media-thumbnail-preview">
                {formData.desktop_media_url ? (
                  <img src={formData.desktop_media_url} alt="Slide Preview" />
                ) : (
                  <div className="no-media-placeholder">No Image Selected</div>
                )}
              </div>
              <div className="media-selector-actions">
                <button
                  type="button"
                  className="btn btn-secondary-luxury"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  🖼 Choose from Media Library
                </button>
                {formData.desktop_media_id && (
                  <button
                    type="button"
                    className="btn btn-text-danger"
                    onClick={() => setFormData((prev) => ({ ...prev, desktop_media_id: '', desktop_media_url: '' }))}
                  >
                    Remove Image
                  </button>
                )}
                <span className="form-help">Recommended size: 1920x1080px high resolution landscape.</span>
              </div>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="form-group">
            <label htmlFor="slide-title" className="form-label">
              Slide Heading / Title <span className="text-danger">*</span>
            </label>
            <input
              id="slide-title"
              type="text"
              className="form-input"
              placeholder="e.g. Travel Made Simple & Memorable"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="slide-subtitle" className="form-label">
              Subtitle / Description
            </label>
            <textarea
              id="slide-subtitle"
              className="form-textarea"
              rows="3"
              placeholder="e.g. Discover handpicked luxury safaris, serene beaches, and historic tea plantations with private concierge service."
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>

          {/* CTA & Link */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="slide-cta-label" className="form-label">
                Call-to-Action (CTA) Label
              </label>
              <input
                id="slide-cta-label"
                type="text"
                className="form-input"
                placeholder="e.g. Explore Curated Tours"
                value={formData.cta_label}
                onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="slide-cta-url" className="form-label">
                Call-to-Action URL
              </label>
              <input
                id="slide-cta-url"
                type="text"
                className="form-input"
                placeholder="e.g. /tours or /destinations/sigiriya"
                value={formData.cta_url}
                onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
              />
            </div>
          </div>

          {/* Display Order & Status */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="slide-display-order" className="form-label">
                Display Order Sequence
              </label>
              <input
                id="slide-display-order"
                type="number"
                min="0"
                className="form-input"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="slide-status" className="form-label">
                Publishing Status
              </label>
              <select
                id="slide-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">● Active (Visible on Public Homepage)</option>
                <option value="inactive">○ Inactive (Draft / Hidden)</option>
              </select>
            </div>
          </div>

          {/* Date Range Scheduling */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="slide-start-date" className="form-label">
                Start Date (Optional)
              </label>
              <input
                id="slide-start-date"
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="slide-end-date" className="form-label">
                End Date (Optional)
              </label>
              <input
                id="slide-end-date"
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              className="btn btn-secondary-luxury"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-luxury-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving Slide...' : editingSlide ? 'Update Hero Slide' : 'Publish Slide'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Media Picker Modal Integration */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        selectedMediaId={formData.desktop_media_id}
        title="Select Hero Background Image"
      />
    </div>
  );
}
