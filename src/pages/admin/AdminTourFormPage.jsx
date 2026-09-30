import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import tourService from '../../services/tourService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import TourForm from '../../components/admin/tours/TourForm';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminTourFormPage({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEdit = mode === 'edit' || Boolean(id);

  // Form State
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Update Page Title
  useEffect(() => {
    updatePageMeta({
      title: isEdit
        ? `Admin - Edit Tour Package | Wonderer South India`
        : `Admin - Create New Tour Package | Wonderer South India`,
      description: 'Author and configure tour package details, pricing, itineraries, and media visuals.',
    });
  }, [isEdit]);

  // Load Existing Data if in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;

    let isMounted = true;
    async function loadTour() {
      try {
        setLoading(true);
        setError(null);
        const data = await tourService.getTour(id);
        if (isMounted) {
          setInitialData(data);
          if (data?.title) {
            updatePageMeta({
              title: `Admin - Edit ${data.title} | Wonderer South India`,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load tour details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTour();

    return () => {
      isMounted = false;
    };
  }, [isEdit, id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      if (isEdit) {
        await tourService.updateTour(id, formData);
        toast.success(
          `Tour "${formData.title}" updated successfully!`,
          'Tour Updated'
        );
      } else {
        const created = await tourService.createTour(formData);
        toast.success(
          `Tour "${created.title || formData.title}" created successfully!`,
          'Tour Created'
        );
      }

      navigate('/admin/tours');
    } catch (err) {
      const errorMsg =
        err?.message ||
        (err?.errors ? Object.values(err.errors).join(' ') : 'Failed to save tour package.');
      setServerError(errorMsg);
      toast.error(errorMsg, 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="tour-form-page-container">
        <div className="tour-form-loading-card">
          <Loading message="Loading curated journey configuration..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-form-page-container">
        <ErrorState
          title="Tour Package Not Found"
          message={error}
          onRetry={() => navigate('/admin/tours')}
        />
      </div>
    );
  }

  return (
    <div className="tour-form-page-container">
      {/* Header & Breadcrumb Card */}
      <div className="tour-form-header-card">
        <div className="form-header-left">
          <nav className="tour-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin" className="breadcrumb-nav-link">
              Admin
            </Link>
            <span className="breadcrumb-divider">/</span>
            <Link to="/admin/tours" className="breadcrumb-nav-link">
              Tour Catalog
            </Link>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current-label" aria-current="page">
              {isEdit ? `Edit: ${initialData?.title || 'Tour Package'}` : 'New Tour Package'}
            </span>
          </nav>

          <div className="form-header-title-box">
            <span className="form-header-eyebrow">
              {isEdit ? 'TOUR PACKAGE EDITOR' : 'NEW JOURNEY CREATOR'}
            </span>
            <h2 className="form-page-title">
              {isEdit ? `Edit Tour: ${initialData?.title}` : 'Create New Tour Package'}
            </h2>
            <p className="form-page-subtitle">
              Configure destinations, pricing, duration, activity categories, itineraries and Media Library visuals.
            </p>
          </div>
        </div>

        <div className="form-header-right">
          {isEdit && initialData?.slug && (
            <a
              href={`/tours/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm btn-preview-live"
              title="Preview public tour page in new tab"
            >
              <span>↗</span> Live Preview
            </a>
          )}

          <Link to="/admin/tours" className="btn btn-outline btn-sm">
            ← Back to Catalog
          </Link>
        </div>
      </div>

      {/* Server Validation Alert */}
      {serverError && (
        <div className="tour-form-error-alert" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <div className="error-content">
            <strong>Validation Error:</strong>
            <p>{serverError}</p>
          </div>
        </div>
      )}

      {/* Main Tour Form */}
      <TourForm
        key={initialData?.id || 'new'}
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode={isEdit ? 'edit' : 'create'}
      />
    </div>
  );
}

