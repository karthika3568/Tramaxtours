import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsSectionService from '../../services/cmsSectionService';
import { getMediaUrl } from '../../utils/media';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminCmsSectionsPage() {
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    subtitle: '',
    content: '',
    media_id: '',
    media_url: '',
    display_order: 0,
    status: 'active',
  });

  const fetchSections = () => setReloadTrigger((prev) => prev + 1);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Homepage Sections & CMS Management',
      description: 'Visually manage promotional content, editorial story blocks, and CMS banners',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadSections() {
      try {
        setLoading(true);
        const res = await cmsSectionService.getCmsSections({ limit: 50, sort_by: 'display_order', sort_order: 'ASC' });
        const sectionList = res?.data?.sections || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setSections(sectionList);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load CMS sections');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSections();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, toast]);

  const handleOpenCreate = () => {
    setEditingSection(null);
    setFormData({
      section_key: `section-${Date.now()}`,
      title: '',
      subtitle: '',
      content: '',
      media_id: '',
      media_url: '',
      display_order: sections.length + 1,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (section) => {
    try {
      setEditingSection(section);
      // Fetch full details if content is omitted in summary
      const res = await cmsSectionService.getCmsSection(section.id);
      const detail = res?.data || section;
      const mediaUrl = detail.media?.url || (detail.media?.file_path ? getMediaUrl(detail.media.file_path) : '');

      setFormData({
        section_key: detail.section_key || '',
        title: detail.title || '',
        subtitle: detail.subtitle || '',
        content: detail.content || '',
        media_id: detail.media_id || (detail.media?.id ?? ''),
        media_url: mediaUrl,
        display_order: detail.display_order ?? 0,
        status: detail.status || 'active',
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch section details');
    }
  };

  const handleMediaSelect = (asset) => {
    setFormData((prev) => ({
      ...prev,
      media_id: asset.id,
      media_url: getMediaUrl(asset.file_path || asset.url),
    }));
    setIsMediaPickerOpen(false);
    toast.success('Section media selected');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Please enter a section title');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        section_key: formData.section_key.trim(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        content: formData.content.trim() || null,
        media_id: formData.media_id ? Number(formData.media_id) : null,
        display_order: Number(formData.display_order) || 0,
        status: formData.status,
      };

      if (editingSection) {
        await cmsSectionService.updateCmsSection(editingSection.id, payload);
        toast.success('CMS section updated successfully');
      } else {
        await cmsSectionService.createCmsSection(payload);
        toast.success('CMS section created successfully');
      }

      setIsModalOpen(false);
      fetchSections();
    } catch (err) {
      toast.error(err.message || 'Failed to save CMS section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (section) => {
    try {
      const newStatus = section.status === 'active' ? 'inactive' : 'active';
      if (newStatus === 'active') {
        await cmsSectionService.activateCmsSection(section.id);
      } else {
        await cmsSectionService.deactivateCmsSection(section.id);
      }
      toast.success(`Section marked ${newStatus}`);
      fetchSections();
    } catch (err) {
      toast.error(err.message || 'Failed to update section status');
    }
  };

  const handleDelete = async (section) => {
    if (!window.confirm(`Are you sure you want to remove the section "${section.title}"?`)) {
      return;
    }
    try {
      await cmsSectionService.deleteCmsSection(section.id);
      toast.success('Section removed successfully');
      fetchSections();
    } catch (err) {
      toast.error(err.message || 'Failed to delete section');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const currentSection = sections[index];
    const targetSection = sections[targetIndex];

    try {
      const currentOrder = currentSection.display_order ?? index + 1;
      const targetOrder = targetSection.display_order ?? targetIndex + 1;

      await Promise.all([
        cmsSectionService.updateCmsSection(currentSection.id, { display_order: targetOrder }),
        cmsSectionService.updateCmsSection(targetSection.id, { display_order: currentOrder }),
      ]);

      toast.success('Sections reordered successfully');
      fetchSections();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder sections');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Visual Header */}
      <div className="admin-page-header-visual">
        <div className="admin-header-main">
          <div className="admin-breadcrumbs">
            <Link to="/admin/website" className="breadcrumb-link">Website Management</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/admin/website/home" className="breadcrumb-link">Home Page</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Homepage CMS Sections</span>
          </div>
          <h1 className="admin-page-title">Homepage Sections & Story Blocks</h1>
          <p className="admin-page-subtitle">
            Visually manage narrative travel stories, promotional banners, and luxury editorial sections across the public website.
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
            onClick={handleOpenCreate}
          >
            + Add New Section
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="admin-stats-ribbon">
        <div className="stat-pill">
          <span className="stat-label">Total Sections:</span>
          <span className="stat-value">{sections.length}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Active / Published:</span>
          <span className="stat-value text-teal">{sections.filter((s) => s.status === 'active').length}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Inactive / Draft:</span>
          <span className="stat-value text-muted">{sections.filter((s) => s.status === 'inactive').length}</span>
        </div>
      </div>

      {/* Visual Sections Grid */}
      {loading ? (
        <Loading message="Loading CMS Content Sections..." />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="🧩"
          title="No CMS Story Sections"
          description="Create engaging editorial banners or story sections to feature on the homepage."
          actionText="+ Create Story Section"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="visual-cms-sections-stack">
          {sections.map((section, index) => {
            const mediaPath = section.media?.file_path || section.media?.url;
            const imgSrc = mediaPath ? getMediaUrl(mediaPath) : null;

            return (
              <div
                key={section.id}
                className={`visual-cms-card ${section.status === 'inactive' ? 'is-inactive' : ''}`}
              >
                <div className="cms-card-header">
                  <div className="cms-card-meta">
                    <span className="order-badge">#{index + 1} • Key: {section.section_key}</span>
                    <span className={`status-badge-luxury ${section.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {section.status === 'active' ? '● Live on Website' : '○ Inactive / Draft'}
                    </span>
                  </div>
                  <div className="visual-reorder-group">
                    <button
                      type="button"
                      className="btn-icon-control"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-icon-control"
                      disabled={index === sections.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                {/* Visual Editorial Section Simulation */}
                <div className="cms-card-body-preview">
                  <div className="cms-preview-text">
                    {section.subtitle && <span className="cms-preview-subtitle">{section.subtitle}</span>}
                    <h3 className="cms-preview-title">{section.title}</h3>
                    {section.content && (
                      <p className="cms-preview-content-snippet">
                        {section.content.length > 180 ? `${section.content.substring(0, 180)}...` : section.content}
                      </p>
                    )}
                  </div>
                  <div className="cms-preview-media">
                    {imgSrc ? (
                      <img src={imgSrc} alt={section.title} className="cms-preview-img" />
                    ) : (
                      <div className="cms-no-img-box">No Image Attached</div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="cms-card-footer">
                  <div className="cms-info-text">
                    Display Order: <strong>{section.display_order}</strong>
                  </div>
                  <div className="visual-actions-group">
                    <button
                      type="button"
                      className={`btn-action-pill ${section.status === 'active' ? 'btn-status-deactivate' : 'btn-status-activate'}`}
                      onClick={() => handleToggleStatus(section)}
                    >
                      {section.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      className="btn-action-pill btn-action-edit"
                      onClick={() => handleOpenEdit(section)}
                    >
                      ✎ Edit Section
                    </button>
                    <button
                      type="button"
                      className="btn-action-pill btn-action-delete"
                      onClick={() => handleDelete(section)}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? `Edit Section: ${editingSection.title}` : 'Create New CMS Section'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="admin-form-luxury">
          <div className="form-group">
            <label htmlFor="cms-section-key" className="form-label">
              Unique Section Key <span className="text-danger">*</span>
            </label>
            <input
              id="cms-section-key"
              type="text"
              className="form-input font-mono"
              placeholder="e.g. why-choose-us or luxury-safari-promo"
              value={formData.section_key}
              onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="cms-title" className="form-label">
                Section Heading / Title <span className="text-danger">*</span>
              </label>
              <input
                id="cms-title"
                type="text"
                className="form-input"
                placeholder="e.g. Crafted for the Discerning Traveler"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cms-subtitle" className="form-label">
                Subtitle / Eyebrow Text
              </label>
              <input
                id="cms-subtitle"
                type="text"
                className="form-input"
                placeholder="e.g. THE TRAMAX DIFFERENCE"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cms-content" className="form-label">
              Narrative Content / Body Text
            </label>
            <textarea
              id="cms-content"
              className="form-textarea"
              rows="4"
              placeholder="Provide the descriptive story, highlight details, or promotional narrative."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Media Asset */}
          <div className="form-group">
            <label className="form-label">Accompanying Image Asset</label>
            <div className="media-selector-row">
              <div className="media-thumbnail-preview">
                {formData.media_url ? (
                  <img src={formData.media_url} alt="Section Media" />
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
                {formData.media_id && (
                  <button
                    type="button"
                    className="btn btn-text-danger"
                    onClick={() => setFormData((prev) => ({ ...prev, media_id: '', media_url: '' }))}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="cms-order" className="form-label">Display Order Sequence</label>
              <input
                id="cms-order"
                type="number"
                min="0"
                className="form-input"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cms-status" className="form-label">Publishing Status</label>
              <select
                id="cms-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">● Active (Visible on Public Website)</option>
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
              {submitting ? 'Saving Section...' : editingSection ? 'Update Section' : 'Publish Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        selectedMediaId={formData.media_id}
        title="Select Section Image"
      />
    </div>
  );
}
