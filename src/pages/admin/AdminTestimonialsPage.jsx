import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import testimonialService from '../../services/testimonialService';
import { updatePageMeta } from '../../utils/metadata';
import { getMediaUrl } from '../../utils/media';
import MediaPickerModal from '../../components/admin/media/MediaPickerModal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const emptyForm = {
  id: null,
  client_name: '',
  client_image_id: null,
  client_image_url: '',
  message: '',
  rating: 5,
  location: '',
  display_order: 0,
  status: 'active',
};

export default function AdminTestimonialsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const canManage = hasPermission('testimonials.manage');

  useEffect(() => {
    updatePageMeta({
      title: 'Admin - Testimonials | Wanderer South India',
      description: 'Manage the brand testimonials shown on the public homepage.',
    });
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      try {
        setLoading(true);
        setError(null);
        const res = await testimonialService.getTestimonials({ status: 'all', limit: 50 });
        if (isMounted) setItems(res.items || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load testimonials.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadItems();
    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const openCreateForm = () => {
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (t) => {
    setFormData({
      id: t.id,
      client_name: t.client_name,
      client_image_id: t.client_image_id,
      client_image_url: t.client_image ? getMediaUrl(t.client_image.file_path) : '',
      message: t.message,
      rating: t.rating,
      location: t.location || '',
      display_order: t.display_order,
      status: t.status,
    });
    setShowForm(true);
  };

  const handleMediaSelect = (asset) => {
    setFormData((prev) => ({
      ...prev,
      client_image_id: asset.id,
      client_image_url: getMediaUrl(asset.file_path || asset.url),
    }));
    setIsMediaPickerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.message.trim()) {
      toast.warning('Client name and message are required.', 'Details Required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        client_name: formData.client_name.trim(),
        client_image_id: formData.client_image_id || null,
        message: formData.message.trim(),
        rating: Number(formData.rating),
        location: formData.location.trim() || null,
        display_order: Number(formData.display_order) || 0,
        status: formData.status,
      };

      if (formData.id) {
        await testimonialService.updateTestimonial(formData.id, payload);
        toast.success('Testimonial updated.', 'Success');
      } else {
        await testimonialService.createTestimonial(payload);
        toast.success('Testimonial created.', 'Success');
      }

      setShowForm(false);
      setReloadTrigger((n) => n + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to save testimonial.', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await testimonialService.deleteTestimonial(id);
      toast.success('Testimonial deleted.', 'Success');
      setReloadTrigger((n) => n + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to delete testimonial.', 'Error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Testimonials</h1>
          <p>Manage the brand testimonials shown on the public homepage.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreateForm}>+ Add Testimonial</button>
        )}
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={() => setReloadTrigger((n) => n + 1)} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="No testimonials yet" message="Add a testimonial to have it appear on the public homepage." />
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {items.map((t) => (
            <div key={t.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                {t.client_image ? (
                  <img src={getMediaUrl(t.client_image.file_path)} alt={t.client_name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#01AA90', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {t.client_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 'bold' }}>{t.client_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{t.location}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '12px', padding: '2px 8px', borderRadius: '999px', background: t.status === 'active' ? '#d1fae5' : '#fee2e2', color: t.status === 'active' ? '#065f46' : '#991b1b' }}>
                  {t.status}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#334155' }}>&ldquo;{t.message}&rdquo;</p>
              <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '8px' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              {canManage && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => openEditForm(t)}>Edit</button>
                  <button className="btn btn-danger" disabled={deletingId === t.id} onClick={() => handleDelete(t.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', display: 'grid', gap: '14px' }}>
            <h2 style={{ margin: 0 }}>{formData.id ? 'Edit Testimonial' : 'Add Testimonial'}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {formData.client_image_url ? (
                <img src={formData.client_image_url} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e2e8f0' }} />
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setIsMediaPickerOpen(true)}>
                {formData.client_image_url ? 'Change Photo' : 'Select Photo (optional)'}
              </button>
            </div>

            <input className="form-input" placeholder="Client Name *" value={formData.client_name} onChange={(e) => setFormData((p) => ({ ...p, client_name: e.target.value }))} required />
            <input className="form-input" placeholder="Location (e.g. Germany)" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
            <textarea className="form-input" placeholder="Testimonial Message *" value={formData.message} onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))} rows={4} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <label>Rating
                <select className="form-input" value={formData.rating} onChange={(e) => setFormData((p) => ({ ...p, rating: e.target.value }))}>
                  {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>Order
                <input className="form-input" type="number" value={formData.display_order} onChange={(e) => setFormData((p) => ({ ...p, display_order: e.target.value }))} />
              </label>
              <label>Status
                <select className="form-input" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        selectedMediaId={formData.client_image_id}
        title="Select Client Photo"
      />
    </div>
  );
}
