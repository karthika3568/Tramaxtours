import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import userService from '../../services/userService';
import roleService from '../../services/roleService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import UserForm from '../../components/admin/users/UserForm';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminUserFormPage({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEdit = mode === 'edit';

  const [initialData, setInitialData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState(null);

  useEffect(() => {
    updatePageMeta({
      title: isEdit ? 'Edit Staff Member | Wanderer Admin' : 'New Staff Member | Wanderer Admin',
      description: 'Manage staff credentials, contact details, and role permissions.',
    });
  }, [isEdit]);

  // Load roles list
  useEffect(() => {
    let isMounted = true;
    roleService
      .getRoles()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setRoles(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load system roles:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load user data in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;

    let isMounted = true;

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getUser(id);
        if (isMounted) {
          setInitialData(userData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to retrieve staff account details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [isEdit, id]);

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setBackendErrors(null);

      if (isEdit) {
        await userService.updateUser(id, payload);
        toast.success(`Staff account for "${payload.name}" updated successfully.`, 'Account Updated');
      } else {
        await userService.createUser(payload);
        toast.success(`Staff account for "${payload.name}" created successfully.`, 'Account Created');
      }

      navigate('/admin/users');
    } catch (err) {
      if (err?.errors) {
        setBackendErrors(err.errors);
      }
      toast.error(err?.message || 'Failed to save staff member account.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container user-form-page">
      {/* Breadcrumbs & Header */}
      <div className="admin-page-header">
        <div className="header-info">
          <div className="breadcrumbs">
            <Link to="/admin/users" className="breadcrumb-link">
              &larr; Back to Staff List
            </Link>
          </div>
          <h1 className="admin-page-title">
            {isEdit ? `Edit Staff Member: ${initialData?.name || ''}` : 'Add New Staff Member'}
          </h1>
          <p className="admin-page-subtitle">
            {isEdit
              ? 'Update user information, contact details, account status, and role assignments.'
              : 'Create a new administrative user account with secure credentials and RBAC role.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="form-loading-wrapper">
          <Loading message="Loading staff account details..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Staff Account Not Found"
          message={error}
          retryText="Return to Staff List"
          onRetry={() => navigate('/admin/users')}
        />
      ) : (
        <UserForm
          key={initialData ? initialData.id : 'new-user'}
          initialData={initialData}
          roles={roles}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          backendErrors={backendErrors}
          mode={mode}
        />
      )}
    </div>
  );
}
