import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import medicalTripService from '../../services/medicalTripService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { getMediaUrl } from '../../utils/media';

const MEDICAL_PRESET_IMAGES = [
  { label: '🩺 Package Banner (Blood Pro, DEXA, MRI)', url: '/uploads/media/medical_package_banner.jpg' },
  { label: '🧲 Full Body MRI Scan', url: '/uploads/media/medical_full_body_mri.jpg' },
  { label: '🧬 Blood Pro (120+ Biomarkers)', url: '/uploads/media/medical_blood_pro.jpg' },
  { label: '🏃 VO₂ Max Test', url: '/uploads/media/medical_vo2_max.jpg' },
  { label: '🦴 DEXA Scan', url: '/uploads/media/medical_dexa_scan.jpg' },
  { label: '💪 Strength Pro Assessment', url: '/uploads/media/medical_strength_pro.jpg' },
  { label: '🫁 Resting Metabolic Rate (RMR)', url: '/uploads/media/medical_rmr_metabolic.jpg' },
];

export default function AdminMedicalTripFormPage({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEdit = mode === 'edit' || Boolean(id);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'assessments' | 'guidelines'

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Executive Health Check',
    short_description: '',
    description: '',
    duration: '1 Day',
    price: 49999,
    discount_price: 42999,
    currency: 'INR',
    location: 'Chennai, Tamil Nadu',
    featured_image: '/uploads/media/medical_package_banner.jpg',
    banner_title: '',
    banner_subtitle: '',
    banner_description: '',
    banner_image: '/uploads/media/medical_package_banner.jpg',
    highlights: [],
    benefits: [],
    instructions: '',
    preparation_guidelines: '',
    included_services: [],
    excluded_services: [],
    cancellation_policy: '',
    is_active: 1,
    is_published: 1,
  });

  // Clinical Assessments list
  const [assessments, setAssessments] = useState([]);

  // Modals for sub-entities
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    subtitle: '',
    short_description: '',
    description: '',
    image: '',
    icon: 'Activity',
    covers: '',
    display_order: 1,
    is_active: 1,
  });

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeAssessmentForTest, setActiveAssessmentForTest] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState({
    test_name: '',
    description: '',
    evaluation_details: '',
    report_information: '',
  });

  // Highlight / Benefit input helpers
  const [highlightInput, setHighlightInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [includedInput, setIncludedInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');

  // Page Title
  useEffect(() => {
    updatePageMeta({
      title: isEdit
        ? 'Admin — Edit Medical Package | Wanderer South India'
        : 'Admin — Add Medical Package | Wanderer South India',
    });
  }, [isEdit]);

  // Load Existing Package
  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await medicalTripService.getAdminMedicalTripById(id);
        if (mounted && data) {
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            category: data.category || 'Executive Health Check',
            short_description: data.short_description || '',
            description: data.description || '',
            duration: data.duration || '1 Day',
            price: data.price || 0,
            discount_price: data.discount_price || '',
            currency: data.currency || 'INR',
            location: data.location || 'Chennai, Tamil Nadu',
            featured_image: data.featured_image || '',
            banner_title: data.banner_title || '',
            banner_subtitle: data.banner_subtitle || '',
            banner_description: data.banner_description || '',
            banner_image: data.banner_image || '',
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
            benefits: Array.isArray(data.benefits) ? data.benefits : [],
            instructions: data.instructions || '',
            preparation_guidelines: data.preparation_guidelines || '',
            included_services: Array.isArray(data.included_services) ? data.included_services : [],
            excluded_services: Array.isArray(data.excluded_services) ? data.excluded_services : [],
            cancellation_policy: data.cancellation_policy || '',
            is_active: Number(data.is_active) ?? 1,
            is_published: Number(data.is_published) ?? 1,
          });
          setAssessments(data.assessments || []);
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load package details.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  // Main Form Submit (Basic Info & Guidelines)
  const handleSubmitMain = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Package Title is required.', 'Validation Error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEdit) {
        await medicalTripService.updateMedicalTrip(id, formData);
        toast.success('Medical package updated successfully!', 'Saved');
      } else {
        const created = await medicalTripService.createMedicalTrip(formData);
        toast.success('Medical package created successfully! You can now add assessments and travel guidelines.', 'Created');
        navigate(`/admin/medical-trips/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save medical package.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------------------------------------------------------------
   * Assessments Management Handlers
   * -------------------------------------------------------------------------- */
  const handleOpenAddAssessment = () => {
    setEditingAssessment(null);
    setAssessmentForm({
      title: '',
      subtitle: '',
      short_description: '',
      description: '',
      image: '/uploads/media/medical_full_body_mri.jpg',
      icon: 'Activity',
      covers: '',
      display_order: assessments.length + 1,
      is_active: 1,
    });
    setIsAssessmentModalOpen(true);
  };

  const handleOpenEditAssessment = (asmt) => {
    setEditingAssessment(asmt);
    setAssessmentForm({
      title: asmt.title || '',
      subtitle: asmt.subtitle || '',
      short_description: asmt.short_description || '',
      description: asmt.description || '',
      image: asmt.image || '',
      icon: asmt.icon || 'Activity',
      covers: asmt.covers || '',
      display_order: asmt.display_order || 1,
      is_active: Number(asmt.is_active) ?? 1,
    });
    setIsAssessmentModalOpen(true);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentForm.title.trim()) {
      toast.error('Assessment Title is required.');
      return;
    }

    try {
      if (editingAssessment) {
        await medicalTripService.updateAssessment(editingAssessment.id, assessmentForm);
        toast.success('Assessment updated successfully.');
      } else {
        await medicalTripService.addAssessment(id, assessmentForm);
        toast.success('New assessment added to package!');
      }

      // Reload package
      const updated = await medicalTripService.getAdminMedicalTripById(id);
      setAssessments(updated.assessments || []);
      setIsAssessmentModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to save assessment.');
    }
  };

  const handleDeleteAssessment = async (asmtId) => {
    if (!window.confirm('Are you sure you want to delete this assessment and all its tests?')) return;
    try {
      await medicalTripService.deleteAssessment(asmtId);
      toast.success('Assessment deleted.');
      const updated = await medicalTripService.getAdminMedicalTripById(id);
      setAssessments(updated.assessments || []);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete assessment.');
    }
  };

  /* --------------------------------------------------------------------------
   * Tests Management Handlers
   * -------------------------------------------------------------------------- */
  const handleOpenAddTest = (asmt) => {
    setActiveAssessmentForTest(asmt);
    setEditingTest(null);
    setTestForm({
      test_name: '',
      description: '',
      evaluation_details: '',
      report_information: '',
    });
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (asmt, test) => {
    setActiveAssessmentForTest(asmt);
    setEditingTest(test);
    setTestForm({
      test_name: test.test_name || '',
      description: test.description || '',
      evaluation_details: test.evaluation_details || '',
      report_information: test.report_information || '',
    });
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!testForm.test_name.trim()) {
      toast.error('Test Name is required.');
      return;
    }

    try {
      if (editingTest) {
        await medicalTripService.updateTest(editingTest.id, testForm);
        toast.success('Test details updated.');
      } else {
        await medicalTripService.addTest(activeAssessmentForTest.id, testForm);
        toast.success('Test added to assessment.');
      }

      const updated = await medicalTripService.getAdminMedicalTripById(id);
      setAssessments(updated.assessments || []);
      setIsTestModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to save test.');
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Delete this clinical test?')) return;
    try {
      await medicalTripService.deleteTest(testId);
      toast.success('Test removed.');
      const updated = await medicalTripService.getAdminMedicalTripById(id);
      setAssessments(updated.assessments || []);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete test.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Loading message="Loading medical package data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px' }}>
        <ErrorState title="Error Loading Package" message={error} onRetry={() => navigate('/admin/medical-trips')} />
      </div>
    );
  }

  return (
    <div className="admin-medical-trip-form-page pb-24">
      {/* 1. Top Breadcrumb & Page Bar */}
      <div className="admin-page-hero-header">
        <div className="admin-page-hero-info">
          <Link
            to="/admin/medical-trips"
            className="admin-page-btn"
            style={{ width: '38px', height: '38px', padding: 0 }}
            title="Back to Packages"
          >
            ←
          </Link>
          <div>
            <h1 className="admin-page-hero-title">
              {isEdit ? `Edit: ${formData.title}` : 'Create New Medical Package'}
            </h1>
            <p className="admin-page-hero-subtitle">
              Configure clinical assessments, tests, and diagnostic reports dynamically.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEdit && (
            <a
              href={`/tours/medical-trip/${formData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="admin-page-btn"
              style={{ height: '40px', padding: '0 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              👁️ View Live Page
            </a>
          )}
          <button
            type="button"
            onClick={handleSubmitMain}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 20px', borderRadius: '10px', fontWeight: '700' }}
          >
            {isSubmitting ? 'Saving...' : isEdit ? '💾 Save Changes' : '✨ Create Package'}
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#ffffff',
          padding: '8px 12px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`admin-page-btn ${activeTab === 'basic' ? 'active' : ''}`}
          style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none' }}
        >
          📋 Basic Info &amp; Banner
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isEdit) {
              toast.info('Please save the package first before managing assessments.');
              return;
            }
            setActiveTab('assessments');
          }}
          className={`admin-page-btn ${activeTab === 'assessments' ? 'active' : ''}`}
          style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none' }}
        >
          🔬 Medical Assessments ({assessments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guidelines')}
          className={`admin-page-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
          style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none' }}
        >
          📜 Highlights &amp; Policies
        </button>
      </div>

      {/* 3. TAB 1: Basic Information & Banner */}
      {activeTab === 'basic' && (
        <form onSubmit={handleSubmitMain} className="admin-modern-table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Package Core Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Package Title *
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-title"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Category
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Duration
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 1 Day, 2 Days"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Price (INR / Currency) *
              </label>
              <input
                type="number"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Discount Price (Optional)
              </label>
              <input
                type="number"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Location
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Status Options
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '40px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
                  />
                  Published Live
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_active)}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  />
                  Active
                </label>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
              Short Description (Card summary)
            </label>
            <textarea
              rows={2}
              className="form-input"
              style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
              Full Package Description
            </label>
            <textarea
              rows={4}
              className="form-input"
              style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Banner Configuration */}
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Hero Banner Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Banner Title
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.banner_title}
                onChange={(e) => setFormData({ ...formData, banner_title: e.target.value })}
                placeholder="Leave blank to default to Package Title"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Banner Subtitle
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                value={formData.banner_subtitle}
                onChange={(e) => setFormData({ ...formData, banner_subtitle: e.target.value })}
                placeholder="e.g. A Complete Health Assessment for a Healthier Tomorrow."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Featured Tour Card Image
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {formData.featured_image && (
                  <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0, backgroundColor: '#f8fafc' }}>
                    <img
                      src={getMediaUrl(formData.featured_image)}
                      alt="Featured Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="/uploads/media/medical_package_banner.jpg"
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {MEDICAL_PRESET_IMAGES.slice(0, 4).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setFormData({ ...formData, featured_image: p.url })}
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: formData.featured_image === p.url ? '1px solid #01aa90' : '1px solid #e2e8f0',
                          backgroundColor: formData.featured_image === p.url ? '#f0fdfa' : '#ffffff',
                          color: formData.featured_image === p.url ? '#0f766e' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Banner Background Image URL
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {formData.banner_image && (
                  <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0, backgroundColor: '#f8fafc' }}>
                    <img
                      src={getMediaUrl(formData.banner_image)}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                    value={formData.banner_image}
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                    placeholder="/uploads/media/medical_package_banner.jpg"
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {MEDICAL_PRESET_IMAGES.slice(0, 4).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setFormData({ ...formData, banner_image: p.url })}
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: formData.banner_image === p.url ? '1px solid #01aa90' : '1px solid #e2e8f0',
                          backgroundColor: formData.banner_image === p.url ? '#f0fdfa' : '#ffffff',
                          color: formData.banner_image === p.url ? '#0f766e' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '700' }}>
              {isSubmitting ? 'Saving...' : '💾 Save Core Details'}
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB 2: Medical Assessments & Tests */}
      {activeTab === 'assessments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Clinical Assessments ({assessments.length})
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                Add unlimited medical assessments with nested diagnostic tests and reports.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAssessment}
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}
            >
              ➕ Add Assessment
            </button>
          </div>

          {assessments.length === 0 ? (
            <div className="admin-modern-table-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <span style={{ fontSize: '32px' }}>🔬</span>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>
                No Assessments Added Yet
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Click "+ Add Assessment" to configure your first clinical evaluation module.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {assessments.map((asmt, aIdx) => (
                <div key={asmt.id} className="admin-modern-table-card" style={{ padding: '20px', marginBottom: 0 }}>
                  {/* Assessment Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#f0fdf4',
                          border: '1px solid #dcfce7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          flexShrink: 0,
                        }}
                      >
                        {asmt.image ? (
                          <img
                            src={getMediaUrl(asmt.image)}
                            alt={asmt.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          '🔬'
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#01aa90', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '999px' }}>
                            #{aIdx + 1}
                          </span>
                          <strong style={{ fontSize: '16px', color: '#0f172a' }}>{asmt.title}</strong>
                          {asmt.subtitle && (
                            <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '600' }}>
                              ({asmt.subtitle})
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                          {asmt.short_description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenAddTest(asmt)}
                        className="btn btn-outline btn-xs"
                        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                      >
                        ➕ Add Test
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditAssessment(asmt)}
                        className="admin-action-btn-circle"
                        title="Edit Assessment"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssessment(asmt.id)}
                        className="admin-action-btn-circle"
                        title="Delete Assessment"
                        style={{ color: '#dc2626' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Covers row */}
                  {asmt.covers && (
                    <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#475569' }}>
                      <strong>What it covers:</strong> {asmt.covers}
                    </div>
                  )}

                  {/* Nested Tests List */}
                  <div style={{ marginTop: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                        Included Clinical Tests &amp; Reports ({asmt.tests?.length || 0})
                      </span>
                    </div>

                    {(!asmt.tests || asmt.tests.length === 0) ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        No individual tests registered yet. Click &quot;+ Add Test&quot; above.
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {asmt.tests.map((test, tIdx) => (
                          <div
                            key={test.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              background: '#ffffff',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              gap: '12px',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                                  {tIdx + 1}. {test.test_name}
                                </strong>
                              </div>
                              {test.description && (
                                <p style={{ fontSize: '12px', color: '#475569', margin: '3px 0 0 0' }}>
                                  {test.description}
                                </p>
                              )}
                              {test.evaluation_details && (
                                <p style={{ fontSize: '11.5px', color: '#059669', margin: '2px 0 0 0' }}>
                                  <strong>Evaluates:</strong> {test.evaluation_details}
                                </p>
                              )}
                              {test.report_information && (
                                <p style={{ fontSize: '11.5px', color: '#0284c7', margin: '2px 0 0 0' }}>
                                  <strong>Report:</strong> {test.report_information}
                                </p>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditTest(asmt, test)}
                                className="admin-action-btn-circle"
                                style={{ width: '28px', height: '28px', fontSize: '11px' }}
                                title="Edit Test"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTest(test.id)}
                                className="admin-action-btn-circle"
                                style={{ width: '28px', height: '28px', fontSize: '11px', color: '#dc2626' }}
                                title="Delete Test"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: Highlights, Guidelines & Policies */}
      {activeTab === 'guidelines' && (
        <form onSubmit={handleSubmitMain} className="admin-modern-table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Guidelines, Inclusions &amp; Policies
          </h3>

          {/* Highlights List */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
              Package Highlights (Bullet Points)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                placeholder="Enter a key highlight..."
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (highlightInput.trim()) {
                      setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
                      setHighlightInput('');
                    }
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (highlightInput.trim()) {
                    setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
                    setHighlightInput('');
                  }
                }}
              >
                + Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {formData.highlights.map((h, i) => (
                <span
                  key={i}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ✓ {h}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    onClick={() => {
                      const next = [...formData.highlights];
                      next.splice(i, 1);
                      setFormData({ ...formData, highlights: next });
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Instructions & Guidelines */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Important Instructions
              </label>
              <textarea
                rows={3}
                className="form-input"
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Fasting guidelines, attire recommendations, etc."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                Preparation Guidelines
              </label>
              <textarea
                rows={3}
                className="form-input"
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                value={formData.preparation_guidelines}
                onChange={(e) => setFormData({ ...formData, preparation_guidelines: e.target.value })}
                placeholder="Past medical records, medications, appointment time."
              />
            </div>
          </div>

          {/* Cancellation Policy */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
              Cancellation &amp; Rescheduling Policy
            </label>
            <textarea
              rows={2}
              className="form-input"
              style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
              value={formData.cancellation_policy}
              onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
              placeholder="Cancellation window, refund conditions, etc."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '700' }}>
              {isSubmitting ? 'Saving...' : '💾 Save Guidelines & Policies'}
            </button>
          </div>
        </form>
      )}

      {/* Assessment Modal */}
      {isAssessmentModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container" style={{ maxWidth: '580px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {editingAssessment ? 'Edit Assessment' : 'Add Clinical Assessment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAssessmentModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Assessment Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                  value={assessmentForm.title}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                  placeholder="e.g. Full Body MRI"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Subtitle
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                  value={assessmentForm.subtitle}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, subtitle: e.target.value })}
                  placeholder="e.g. Structural Assessment"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Assessment Image URL / Path
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {assessmentForm.image && (
                    <div style={{ width: '64px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0, backgroundColor: '#f8fafc' }}>
                      <img
                        src={getMediaUrl(assessmentForm.image)}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                      value={assessmentForm.image}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, image: e.target.value })}
                      placeholder="/uploads/media/medical_dexa_scan.jpg"
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {MEDICAL_PRESET_IMAGES.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setAssessmentForm({ ...assessmentForm, image: p.url })}
                          style={{
                            fontSize: '11px',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            border: assessmentForm.image === p.url ? '1px solid #01aa90' : '1px solid #e2e8f0',
                            backgroundColor: assessmentForm.image === p.url ? '#f0fdfa' : '#ffffff',
                            color: assessmentForm.image === p.url ? '#0f766e' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Short Description
                </label>
                <textarea
                  rows={2}
                  className="form-input"
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                  value={assessmentForm.short_description}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, short_description: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  What it covers
                </label>
                <textarea
                  rows={2}
                  className="form-input"
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                  value={assessmentForm.covers}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, covers: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssessmentModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {isTestModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container" style={{ maxWidth: '540px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {editingTest ? 'Edit Test' : 'Add Test to Assessment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Test Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                  value={testForm.test_name}
                  onChange={(e) => setTestForm({ ...testForm, test_name: e.target.value })}
                  placeholder="e.g. Whole Body Neuro & Spinal MRI"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Test Description
                </label>
                <textarea
                  rows={2}
                  className="form-input"
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  What Each Test Evaluates
                </label>
                <textarea
                  rows={2}
                  className="form-input"
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                  value={testForm.evaluation_details}
                  onChange={(e) => setTestForm({ ...testForm, evaluation_details: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Report Information
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px' }}
                  value={testForm.report_information}
                  onChange={(e) => setTestForm({ ...testForm, report_information: e.target.value })}
                  placeholder="e.g. Multi-slice DICOM archive and Radiologist diagnostic report."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

