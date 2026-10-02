import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pageService from '../../services/pageService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import PageForm from '../../components/admin/pages/PageForm';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminPageFormPage({ mode = 'create' }) {
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

  // Page Meta Title
  useEffect(() => {
    updatePageMeta({
      title: isEdit
        ? `Admin - Edit CMS Page | Wanderer South India`
        : `Admin - Create New CMS Page | Wanderer South India`,
      description: 'Author and configure custom CMS pages, legal policies, content, and SEO metadata.',
    });
  }, [isEdit]);

  // Load Existing Page Data in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;

    let isMounted = true;
    async function loadPage() {
      try {
        setLoading(true);
        setError(null);
        const data = await pageService.getPage(id);
        if (isMounted) {
          setInitialData(data);
          if (data?.title) {
            updatePageMeta({
              title: `Admin - Edit ${data.title} | Wanderer South India`,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load page details from server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [isEdit, id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      if (isEdit) {
        await pageService.updatePage(id, formData);
        toast.success(
          `Page "${formData.title}" updated successfully!`,
          'Page Saved'
        );
      } else {
        const created = await pageService.createPage(formData);
        toast.success(
          `Page "${created?.title || formData.title}" created successfully!`,
          'Page Created'
        );
      }

      navigate('/admin/pages');
    } catch (err) {
      const errorMsg =
        err?.message ||
        (err?.errors ? Object.values(err.errors).join(' ') : 'Failed to save page.');
      setServerError(errorMsg);
      toast.error(errorMsg, 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-form-page-container">
        <Loading message="Loading CMS page data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-form-page-container">
        <ErrorState
          title="Page Not Found"
          message={error}
          onRetry={() => navigate('/admin/pages')}
        />
      </div>
    );
  }

  return (
    <div className="admin-form-page-container">
      {/* Header & Breadcrumbs */}
      <div className="form-page-header">
        <nav className="admin-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin" className="breadcrumb-link">
            Admin
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/admin/pages" className="breadcrumb-link">
            Pages & Policy CMS
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">
            {isEdit ? `Edit: ${initialData?.title || 'CMS Page'}` : 'New CMS Page'}
          </span>
        </nav>

        <div className="form-page-title-row">
          <h2 className="admin-page-title">
            {isEdit ? `Edit Page: ${initialData?.title}` : 'Create New CMS Page'}
          </h2>
          <p className="admin-page-subtitle">
            Configure page content, rich markup, hero imagery, and SEO metadata.
          </p>
        </div>
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <div className="admin-server-error-banner" role="alert">
          <strong>Validation Error:</strong> {serverError}
        </div>
      )}

      {/* Main Page Form */}
      <PageForm
        key={initialData?.id || 'new'}
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode={isEdit ? 'edit' : 'create'}
      />
    </div>
  );
}
