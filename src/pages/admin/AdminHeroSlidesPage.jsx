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
  });

  const fetchSlides = () => setReloadTrigger((prev) => prev + 1);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Hero Carousel Management | Wonderer South India',
      description: 'Manage homepage hero carousel images, display sequences, and activation status.',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadSlides() {
      try {
        setLoading(true);
        const res = await homeHeroService.getSlides({ limit: 50, sort_by: 'display_order', sort_order: 'ASC' });
        const slideList = Array.isArray(res) ? res : (res?.data?.slides || res?.data || []);
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
      title: `Hero Slide ${slides.length + 1}`,
      subtitle: '',
      desktop_media_id: '',
      desktop_media_url: '',
      cta_label: '',
      cta_url: '',
      display_order: slides.length + 1,
      status: 'active',
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
    });
    setIsModalOpen(true);
  };

  const handleMediaSelect = (asset) => {
    setFormData((prev) => ({
      ...prev,
      desktop_media_id: asset.id,
      desktop_media_url: getMediaUrl(asset.file_path || asset.url),
      title: prev.title || asset.title || asset.original_name || 'Hero Slide',
    }));
    setIsMediaPickerOpen(false);
    toast.success('Hero slide image selected');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.desktop_media_id && !formData.desktop_media_url) {
      toast.warning('Please select a slide image from the media library.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim() || 'Hero Slide',
        subtitle: formData.subtitle?.trim() || null,
        desktop_media_id: formData.desktop_media_id ? Number(formData.desktop_media_id) : null,
        cta_label: formData.cta_label?.trim() || null,
        cta_url: formData.cta_url?.trim() || null,
        display_order: Number(formData.display_order) || 0,
        status: formData.status,
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
    if (!window.confirm(`Are you sure you want to delete the slide "${slide.title || `#${slide.id}`}"?`)) {
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
            Manage high-impact hero image slides and visual sequencing for the public homepage carousel.
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
          <span className="stat-label">Display Mode:</span>
          <span className="stat-value font-mono">Images Only (Public)</span>
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
            const mediaPath = slide.desktop_media?.file_path || slide.desktop_media?.url || slide.media;
            const bgImage = mediaPath ? getMediaUrl(mediaPath) : '/images/hero-default.jpg';

            return (
              <div
                key={slide.id}
                className={`visual-hero-card ${slide.status === 'inactive' ? 'is-inactive' : ''}`}
              >
                {/* Visual Slide Image Banner */}
                <div
                  className="visual-hero-card-banner"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '220px',
                    position: 'relative',
                  }}
                >
                  <div className="visual-hero-card-badges">
                    <span className="order-badge">#{index + 1} • Order: {slide.display_order}</span>
                    <span className={`status-badge-luxury ${slide.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {slide.status === 'active' ? '● Live on Website' : '○ Inactive / Draft'}
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '16px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    🏷️ {slide.title || `Slide #${slide.id}`}
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
          {/* Media Selector */}
          <div className="form-group">
            <label className="form-label">
              Slide Image <span className="text-danger">*</span>
            </label>
            <div className="media-selector-row">
              <div className="media-thumbnail-preview" style={{ width: '180px', height: '110px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
                {formData.desktop_media_url ? (
                  <img
                    src={formData.desktop_media_url}
                    alt="Slide Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="no-media-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '13px' }}>
                    No Image Selected
                  </div>
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

          {/* Internal Title / Identifier */}
          <div className="form-group">
            <label htmlFor="slide-title" className="form-label">
              Internal Slide Name / Identifier
            </label>
            <input
              id="slide-title"
              type="text"
              className="form-input"
              placeholder="e.g. Tamil Nadu Temples / Kerala Backwaters"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <span className="form-help">Used for internal admin identification. The public homepage hero renders the full image cleanly.</span>
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
                <option value="active">● Active (Live on Homepage)</option>
                <option value="inactive">○ Inactive (Draft / Hidden)</option>
              </select>
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
