import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import destinationService from '../../services/destinationService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import DestinationForm from '../../components/admin/destinations/DestinationForm';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminDestinationFormPage({ mode = 'create' }) {
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
        ? `Admin - Edit Destination | Tramax Tours`
        : `Admin - Create New Destination | Tramax Tours`,
      description: 'Author and configure destination details, narratives, and media.',
    });
  }, [isEdit]);

  // Load Existing Data if in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;

    let isMounted = true;
    async function loadDestination() {
      try {
        setLoading(true);
        setError(null);
        const data = await destinationService.getDestination(id);
        if (isMounted) {
          setInitialData(data);
          if (data?.name) {
            updatePageMeta({
              title: `Admin - Edit ${data.name} | Tramax Tours`,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load destination details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDestination();

    return () => {
      isMounted = false;
    };
  }, [isEdit, id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      if (isEdit) {
        await destinationService.updateDestination(id, formData);
        toast.success(
          `Destination "${formData.name}" updated successfully!`,
          'Destination Updated'
        );
      } else {
        const created = await destinationService.createDestination(formData);
        toast.success(
          `Destination "${created.name || formData.name}" created successfully!`,
          'Destination Created'
        );
      }

      navigate('/admin/destinations');
    } catch (err) {
      const errorMsg =
        err?.message ||
        (err?.errors ? Object.values(err.errors).join(' ') : 'Failed to save destination.');
      setServerError(errorMsg);
      toast.error(errorMsg, 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-form-page-container">
        <Loading message="Loading destination data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-form-page-container">
        <ErrorState
          title="Destination Not Found"
          message={error}
          onRetry={() => navigate('/admin/destinations')}
        />
      </div>
    );
  }

  return (
    <div className="admin-form-page-container">
      {/* Header & Breadcrumb */}
      <div className="form-page-header">
        <nav className="admin-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin" className="breadcrumb-link">
            Admin
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/admin/destinations" className="breadcrumb-link">
            Destinations
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">
            {isEdit ? `Edit: ${initialData?.name || 'Destination'}` : 'New Destination'}
          </span>
        </nav>

        <div className="form-page-title-row">
          <h2 className="admin-page-title">
            {isEdit ? `Edit Destination: ${initialData?.name}` : 'Create New Destination'}
          </h2>
          <p className="admin-page-subtitle">
            Configure destination headlines, media library visuals, coordinates, and publishing state.
          </p>
        </div>
      </div>

      {/* Server Validation Alert */}
      {serverError && (
        <div className="admin-server-error-banner" role="alert">
          <strong>Validation Error:</strong> {serverError}
        </div>
      )}

      {/* Main Destination Form */}
      <DestinationForm
        key={initialData?.id || 'new'}
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode={isEdit ? 'edit' : 'create'}
      />
    </div>
  );
}
