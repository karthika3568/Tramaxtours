import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Button from '../../components/ui/Button';
import { ADMIN_ROLES } from '../../utils/roles';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading, role, roles } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'Sign In — Tramax Tours',
      description: 'Sign in to access your tour bookings, traveler profile, or administrative portal.',
    });
  }, []);

  // If already authenticated, redirect based on role and prior page
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const isAdmin = ADMIN_ROLES.includes(role) || roles.some((r) => ADMIN_ROLES.includes(r));
      const target = location.state?.from?.pathname || (isAdmin ? '/admin' : '/tours');
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, location.state, role, roles]);

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const data = await login(formData.email.trim().toLowerCase(), formData.password);
      const user = data?.user;
      const userRole = user?.role;
      const isAdmin = Boolean(userRole && ADMIN_ROLES.includes(userRole));

      let target = '/tours';
      if (isAdmin) {
        const fromAdmin = location.state?.from?.pathname?.startsWith('/admin');
        target = fromAdmin ? location.state.from.pathname : '/admin';
      } else {
        target = location.state?.from?.pathname || '/tours';
      }

      toast.success(
        `Welcome back, ${user?.name || 'Traveler'}!`,
        'Signed In'
      );
      navigate(target, { replace: true });
    } catch (err) {
      const errorMsg =
        err.message || 'Unable to sign in. Please verify your credentials.';
      setGeneralError(errorMsg);

      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors);
      }

      toast.error(errorMsg, 'Authentication Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page-wrapper single-card-layout">
      <div className="admin-login-form-pane centered-form-pane">
        <div className="admin-login-form-card">
          <div className="form-card-header text-center">
            <Link to="/" className="login-brand-header-link" aria-label="Tramax Tours Home">
              <img src="/logo.png" alt="Tramax Tours" className="login-brand-logo-img" />
            </Link>
            <h1 className="form-portal-title">Sign In</h1>
            <p className="form-portal-subtitle">
              Welcome back! Please enter your email and password.
            </p>
          </div>

          {generalError && (
            <div className="auth-alert" role="alert">
              <div className="auth-alert-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="auth-alert-text">{generalError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-leading-icon" aria-hidden="true">✉️</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`form-input has-icon ${fieldErrors.email ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span id="email-error" className="form-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <div className="label-with-hint">
                <label htmlFor="password" className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
              </div>
              <div className="password-input-wrapper">
                <span className="input-leading-icon" aria-hidden="true">🔑</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`form-input has-icon has-trailing ${fieldErrors.password ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="password-error" className="form-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="btn-full btn-login-submit"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="login-card-footer">
            <Link to="/" className="return-website-link">
              <span>←</span> Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
