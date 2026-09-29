import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { updatePageMeta } from '../utils/metadata';
import useAuth from '../hooks/useAuth';

export default function ForbiddenPage() {
  const { user } = useAuth();
  const location = useLocation();
  const requiredPermission = location.state?.requiredPermission;

  useEffect(() => {
    updatePageMeta({
      title: 'Access Denied (403)',
      description: 'You do not have permission to access this area.',
    });
  }, []);

  return (
    <div className="page-section container flex-center">
      <div className="placeholder-card forbidden-card text-center">
        <div className="forbidden-icon" aria-hidden="true">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className="placeholder-badge badge-warning">HTTP 403 — Forbidden</span>
        <h1 className="placeholder-title">Access Denied</h1>
        <p className="placeholder-subtitle">
          Your account (<strong>{user?.name || 'User'}</strong> — <em>{user?.role || 'Guest'}</em>) does not possess the required permissions to access this administrative module.
        </p>

        {requiredPermission && (
          <div className="forbidden-detail">
            <span>Required permission: <code>{Array.isArray(requiredPermission) ? requiredPermission.join(', ') : requiredPermission}</code></span>
          </div>
        )}

        <div className="placeholder-actions">
          <Link to="/admin" className="btn btn-primary">
            Go to Admin Dashboard
          </Link>
          <Link to="/" className="btn btn-outline">
            Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
