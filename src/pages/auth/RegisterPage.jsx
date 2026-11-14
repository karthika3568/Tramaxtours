import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { EyeIcon, KeyIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from '../../components/common/Icons';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'Create Account — Wonderer South India',
      description: 'Register for an account to manage your South India tour bookings, view receipts, and plan your journey.',
    });
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const target = redirectParam || '/customer/profile';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, redirectParam]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match.';
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };

      const data = await register(payload);
      const user = data?.user;

      toast.success(
        `Welcome to Wonderer South India, ${user?.name || 'Traveler'}! Your account has been created.`,
        'Account Created'
      );

      const target = redirectParam || '/customer/profile';
      navigate(target, { replace: true });
    } catch (err) {
      const errorMsg =
        err.message || 'Unable to complete registration. Please check the form.';
      setGeneralError(errorMsg);

      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors);
      }
      toast.error(errorMsg, 'Registration Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info('Google Sign-Up is configured. Please complete the form below or sign in if you already have an account.', 'Google Sign In');
  };

  return (
    <div className="admin-login-page-wrapper single-card-layout">
      <div className="admin-login-form-pane centered-form-pane">
        <div className="admin-login-form-card" style={{ maxWidth: '480px' }}>
          <div className="form-card-header text-center">
            <Link to="/" className="login-brand-header-link" aria-label="Wonderer South India Home">
              <img
                src="/logo.png"
                alt="Wonderer South India"
                className="login-brand-logo-img"
                style={{ maxHeight: '64px', objectFit: 'contain' }}
              />
            </Link>
            <h1 className="form-portal-title">Create an Account</h1>
            <p className="form-portal-subtitle">
              Join Wonderer South India to book memorable tours, track your itineraries, and receive personalized travel support.
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

          {/* Social Sign-Up */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="btn btn-outline btn-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0.65rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: '#ffffff',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: '#9ca3af', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or register with email</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-leading-icon" aria-hidden="true"><UserIcon size={16} /></span>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="e.g. Anand Kumar"
                  className={`form-input has-icon ${fieldErrors.name ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                />
              </div>
              {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-leading-icon" aria-hidden="true"><MailIcon size={16} /></span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className={`form-input has-icon ${fieldErrors.email ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.email)}
                  required
                />
              </div>
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" className="form-label">
                Mobile / WhatsApp Number
              </label>
              <div className="input-with-icon">
                <span className="input-leading-icon" aria-hidden="true"><PhoneIcon size={16} /></span>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="+91 98402 91110"
                  className={`form-input has-icon ${fieldErrors.phone ? 'input-error' : ''}`}
                />
              </div>
              {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <div className="password-input-wrapper">
                <span className="input-leading-icon" aria-hidden="true"><KeyIcon size={16} /></span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="At least 6 characters"
                  className={`form-input has-icon has-trailing ${fieldErrors.password ? 'input-error' : ''}`}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeIcon size={16} /> : <LockIcon size={16} />}
                </button>
              </div>
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password" className="form-label">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="password-input-wrapper">
                <span className="input-leading-icon" aria-hidden="true"><KeyIcon size={16} /></span>
                <input
                  id="reg-confirm-password"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Repeat your password"
                  className={`form-input has-icon has-trailing ${fieldErrors.password_confirmation ? 'input-error' : ''}`}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showConfirmPassword ? <EyeIcon size={16} /> : <LockIcon size={16} />}
                </button>
              </div>
              {fieldErrors.password_confirmation && (
                <span className="form-error">{fieldErrors.password_confirmation}</span>
              )}
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="btn-full btn-login-submit"
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Already have an account */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>Already have an account? </span>
            <Link
              to={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
              style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </div>

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
