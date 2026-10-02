import { useState, useEffect } from 'react';
import { socialLinksService } from '../../services/socialLinksService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';

const PLATFORM_PRESETS = [
  { platform: 'whatsapp', name: 'WhatsApp', icon: '💬', defaultUrl: 'https://wa.me/918072566010' },
  { platform: 'facebook', name: 'Facebook', icon: '📘', defaultUrl: 'https://facebook.com/wanderersouthindia' },
  { platform: 'instagram', name: 'Instagram', icon: '📸', defaultUrl: 'https://instagram.com/wanderersouthindia' },
  { platform: 'youtube', name: 'YouTube', icon: '📺', defaultUrl: 'https://youtube.com/@wanderersouthindia' },
  { platform: 'twitter', name: 'X (Twitter)', icon: '🐦', defaultUrl: 'https://twitter.com/wanderersouthindia' },
  { platform: 'tripadvisor', name: 'TripAdvisor', icon: '🦉', defaultUrl: 'https://tripadvisor.com' },
];

export default function AdminSocialLinksPage() {
  const toast = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    platform: 'instagram',
    url: '',
    display_order: 1,
    status: 'active',
  });

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Social Channels & Media Links',
      description: 'Manage connected social channels, links, icons, and visibility.',
    });

    async function loadLinks() {
      try {
        setLoading(true);
        const res = await socialLinksService.getSocialLinks();
        const data = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (data.length === 0) {
          // Initialize presets if table is empty
          setLinks(
            PLATFORM_PRESETS.map((p, idx) => ({
              id: `preset-${idx}`,
              platform: p.platform,
              url: p.defaultUrl,
              display_order: idx + 1,
              status: 'active',
            }))
          );
        } else {
          setLinks(data);
        }
      } catch {
        // Fallback presets
        setLinks(
          PLATFORM_PRESETS.map((p, idx) => ({
            id: `preset-${idx}`,
            platform: p.platform,
            url: p.defaultUrl,
            display_order: idx + 1,
            status: 'active',
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadLinks();
  }, [refreshKey]);

  const handleOpenAddModal = (preset = null) => {
    setEditingLink(null);
    setFormData({
      platform: preset?.platform || 'instagram',
      url: preset?.defaultUrl || '',
      display_order: links.length + 1,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform || 'instagram',
      url: link.url || '',
      display_order: link.display_order || 1,
      status: link.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      toast.warning('Please enter a valid URL.');
      return;
    }

    try {
      if (editingLink && typeof editingLink.id === 'number') {
        await socialLinksService.updateSocialLink(editingLink.id, formData);
        toast.success('Social link updated successfully!');
      } else {
        await socialLinksService.createSocialLink(formData);
        toast.success('Social link added successfully!');
      }
      setIsModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to save social link');
    }
  };

  const handleToggleStatus = async (link) => {
    const newStatus = link.status === 'active' ? 'inactive' : 'active';
    try {
      setSavingId(link.id);
      if (typeof link.id === 'number') {
        await socialLinksService.updateSocialLink(link.id, { ...link, status: newStatus });
      }
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, status: newStatus } : l))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle status');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (link) => {
    if (!window.confirm(`Are you sure you want to delete ${link.platform}?`)) return;
    try {
      if (typeof link.id === 'number') {
        await socialLinksService.deleteSocialLink(link.id);
      }
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success('Link removed successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <Loading message="Loading social channel configurations..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header-card">
        <div>
          <span className="admin-badge-category">CHANNELS &amp; OUTREACH</span>
          <h1 className="admin-page-main-title">Social Media Channels</h1>
          <p className="admin-page-main-sub">
            Connect and manage your social channels shown in the header, footer, and booking receipts.
          </p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOpenAddModal()}>
            + Add New Channel
          </button>
        </div>
      </div>

      {/* Social Links Cards Grid */}
      <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {links.map((link) => {
          const preset = PLATFORM_PRESETS.find((p) => p.platform.toLowerCase() === (link.platform || '').toLowerCase()) || {
            icon: '🔗',
            name: link.platform,
          };
          const isActive = link.status === 'active';

          return (
            <div key={link.id} className="admin-box-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{preset.icon}</span>
                    <strong style={{ fontSize: '16px', color: '#0f172a', textTransform: 'capitalize' }}>
                      {preset.name || link.platform}
                    </strong>
                  </div>
                  <span className={`badge ${isActive ? 'badge-emerald' : 'badge-gray'}`}>
                    {isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div style={{ wordBreak: 'break-all', fontSize: '13px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#01aa90', textDecoration: 'none' }}>
                    {link.url || 'No URL configured'}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Order: #{link.display_order ?? 0}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleToggleStatus(link)}
                    disabled={savingId === link.id}
                  >
                    {isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleOpenEditModal(link)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleDelete(link)}
                    style={{ color: '#dc2626' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingLink ? 'Edit Social Channel' : 'Add Social Channel'}
              </h3>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label required">Platform</label>
                  <select
                    className="form-select"
                    value={formData.platform}
                    onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
                  >
                    {PLATFORM_PRESETS.map((p) => (
                      <option key={p.platform} value={p.platform}>
                        {p.icon} {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label required">Channel Profile URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://instagram.com/wanderersouthindia"
                    required
                  />
                </div>

                <div className="form-grid-2col" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.display_order}
                      onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value, 10) || 1 }))}
                      min={1}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
