import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import homeBenefitsService from '../../services/homeBenefitsService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const COMMON_ICONS = ['🛡️', '⭐', '🧭', '🌍', '💎', '✈️', '🏝️', '🏆', '🌿', '🤝', '🛎️', '🚗'];

export default function AdminHomeBenefitsPage() {
  const toast = useToast();
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '⭐',
    display_order: 0,
    status: 'active',
  });

  const fetchBenefits = () => setReloadTrigger((prev) => prev + 1);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Homepage Benefits & Value Highlights',
      description: 'Visually manage the "Why Travel With Us" benefit cards and luxury guarantees',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBenefits() {
      try {
        setLoading(true);
        const res = await homeBenefitsService.getBenefits({ limit: 50, sort_by: 'display_order', sort_order: 'ASC' });
        const list = res?.data?.benefits || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setBenefits(list);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load benefits');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBenefits();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, toast]);

  const handleOpenCreate = () => {
    setEditingBenefit(null);
    setFormData({
      title: '',
      description: '',
      icon: '⭐',
      display_order: benefits.length + 1,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      title: benefit.title || '',
      description: benefit.description || '',
      icon: benefit.icon || '⭐',
      display_order: benefit.display_order ?? 0,
      status: benefit.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Please enter a benefit title');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim() || '⭐',
        display_order: Number(formData.display_order) || 0,
        status: formData.status,
      };

      if (editingBenefit) {
        await homeBenefitsService.updateBenefit(editingBenefit.id, payload);
        toast.success('Benefit updated successfully');
      } else {
        await homeBenefitsService.createBenefit(payload);
        toast.success('Benefit card created successfully');
      }

      setIsModalOpen(false);
      fetchBenefits();
    } catch (err) {
      toast.error(err.message || 'Failed to save benefit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (benefit) => {
    try {
      const newStatus = benefit.status === 'active' ? 'inactive' : 'active';
      if (newStatus === 'active') {
        await homeBenefitsService.activateBenefit(benefit.id);
      } else {
        await homeBenefitsService.deactivateBenefit(benefit.id);
      }
      toast.success(`Benefit marked ${newStatus}`);
      fetchBenefits();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (benefit) => {
    if (!window.confirm(`Are you sure you want to remove "${benefit.title}"?`)) {
      return;
    }
    try {
      await homeBenefitsService.deleteBenefit(benefit.id);
      toast.success('Benefit removed successfully');
      fetchBenefits();
    } catch (err) {
      toast.error(err.message || 'Failed to delete benefit');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= benefits.length) return;

    const currentBenefit = benefits[index];
    const targetBenefit = benefits[targetIndex];

    try {
      const currentOrder = currentBenefit.display_order ?? index + 1;
      const targetOrder = targetBenefit.display_order ?? targetIndex + 1;

      await Promise.all([
        homeBenefitsService.updateBenefit(currentBenefit.id, { display_order: targetOrder }),
        homeBenefitsService.updateBenefit(targetBenefit.id, { display_order: currentOrder }),
      ]);

      toast.success('Benefits reordered successfully');
      fetchBenefits();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder benefits');
    }
  };

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
            <span className="breadcrumb-current">Why Travel With Us (Benefits)</span>
          </div>
          <h1 className="admin-page-title">Homepage Benefits & Guarantees</h1>
          <p className="admin-page-subtitle">
            Visually manage value proposition cards, service assurances, and quality commitments displayed on the public homepage.
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
            + Add New Benefit
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="admin-stats-ribbon">
        <div className="stat-pill">
          <span className="stat-label">Total Benefit Cards:</span>
          <span className="stat-value">{benefits.length}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Active / Live:</span>
          <span className="stat-value text-teal">{benefits.filter((b) => b.status === 'active').length}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Section Placement:</span>
          <span className="stat-value font-mono">Homepage #5 (Benefits Grid)</span>
        </div>
      </div>

      {/* Visual Benefit Cards Grid */}
      {loading ? (
        <Loading message="Loading Homepage Benefit Cards..." />
      ) : benefits.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No Benefits Configured"
          description="Highlight why travelers choose Wanderer South India with luxury guarantee cards."
          actionText="+ Create First Benefit"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="visual-benefits-grid">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`visual-benefit-card ${benefit.status === 'inactive' ? 'is-inactive' : ''}`}
            >
              <div className="benefit-card-top">
                <div className="benefit-icon-badge">{benefit.icon || '⭐'}</div>
                <div className="benefit-meta-right">
                  <span className="order-badge">#{index + 1} • Seq: {benefit.display_order}</span>
                  <span className={`status-badge-luxury ${benefit.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {benefit.status === 'active' ? '● Live' : '○ Inactive'}
                  </span>
                </div>
              </div>

              <div className="benefit-card-body">
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-desc">{benefit.description}</p>
              </div>

              <div className="benefit-card-footer">
                <div className="visual-reorder-group">
                  <button
                    type="button"
                    className="btn-icon-control"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    title="Move left/up"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn-icon-control"
                    disabled={index === benefits.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    title="Move right/down"
                  >
                    →
                  </button>
                </div>

                <div className="visual-actions-group">
                  <button
                    type="button"
                    className={`btn-action-pill ${benefit.status === 'active' ? 'btn-status-deactivate' : 'btn-status-activate'}`}
                    onClick={() => handleToggleStatus(benefit)}
                  >
                    {benefit.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    className="btn-action-pill btn-action-edit"
                    onClick={() => handleOpenEdit(benefit)}
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className="btn-action-pill btn-action-delete"
                    onClick={() => handleDelete(benefit)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBenefit ? `Edit Benefit: ${editingBenefit.title}` : 'Add New Benefit Card'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="admin-form-luxury">
          {/* Quick Icon Selector */}
          <div className="form-group">
            <label className="form-label">Benefit Symbol / Icon</label>
            <div className="icon-selector-grid">
              {COMMON_ICONS.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  className={`icon-picker-btn ${formData.icon === ico ? 'is-selected' : ''}`}
                  onClick={() => setFormData({ ...formData, icon: ico })}
                >
                  {ico}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-input mt-2 font-mono"
              placeholder="Or enter custom emoji / symbol"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="benefit-title" className="form-label">
              Benefit Heading / Title <span className="text-danger">*</span>
            </label>
            <input
              id="benefit-title"
              type="text"
              className="form-input"
              placeholder="e.g. Best Price & Luxury Guarantee"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="benefit-desc" className="form-label">
              Benefit Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="benefit-desc"
              className="form-textarea"
              rows="3"
              placeholder="e.g. Transparent pricing with 5-star concierge service, bespoke itineraries, and 24/7 on-ground assistance."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="benefit-order" className="form-label">Display Order Sequence</label>
              <input
                id="benefit-order"
                type="number"
                min="0"
                className="form-input"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="benefit-status" className="form-label">Publishing Status</label>
              <select
                id="benefit-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">● Active (Visible on Homepage)</option>
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
              {submitting ? 'Saving Benefit...' : editingBenefit ? 'Update Benefit' : 'Publish Benefit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
