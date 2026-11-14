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

  return (
    <div className="admin-login-page-wrapper single-card-layout">
      <div className="admin-login-form-pane centered-form-pane">
        <div className="admin-login-form-card" style={{ maxWidth: '520px', padding: '20px 26px' }}>
          <div className="form-card-header text-center" style={{ marginBottom: '10px' }}>
            <Link to="/" className="login-brand-header-link" aria-label="Wonderer South India Home" style={{ marginBottom: '4px' }}>
              <img
                src="/logo.png"
                alt="Wonderer South India"
                className="login-brand-logo-img"
                style={{ maxHeight: '38px', objectFit: 'contain' }}
              />
            </Link>
            <h1 className="form-portal-title" style={{ fontSize: '20px', margin: '0 0 2px 0' }}>Create an Account</h1>
            <p className="form-portal-subtitle" style={{ fontSize: '12.5px' }}>
              Join Wonderer South India to book and manage your tours.
            </p>
          </div>

          {generalError && (
            <div className="auth-alert" role="alert" style={{ marginBottom: '8px', padding: '6px 10px' }}>
              <div className="auth-alert-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="auth-alert-text" style={{ fontSize: '12.5px' }}>{generalError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label htmlFor="reg-name" className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon" aria-hidden="true"><UserIcon size={15} /></span>
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

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label htmlFor="reg-phone" className="form-label">
                  Mobile / WhatsApp
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon" aria-hidden="true"><PhoneIcon size={15} /></span>
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
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label htmlFor="reg-email" className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-leading-icon" aria-hidden="true"><MailIcon size={15} /></span>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label htmlFor="reg-password" className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="password-input-wrapper">
                  <span className="input-leading-icon" aria-hidden="true"><KeyIcon size={15} /></span>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Min. 6 chars"
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
                    {showPassword ? <EyeIcon size={15} /> : <LockIcon size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label htmlFor="reg-confirm-password" className="form-label">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="password-input-wrapper">
                  <span className="input-leading-icon" aria-hidden="true"><KeyIcon size={15} /></span>
                  <input
                    id="reg-confirm-password"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Repeat password"
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
                    {showConfirmPassword ? <EyeIcon size={15} /> : <LockIcon size={15} />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && (
                  <span className="form-error">{fieldErrors.password_confirmation}</span>
                )}
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '10px' }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="btn-full btn-login-submit"
                style={{ height: '40px', fontSize: '14px' }}
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Already have an account */}
          <div style={{ marginTop: '0.65rem', padding: '6px 10px', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center', fontSize: '0.825rem' }}>
            <span style={{ color: '#000000', fontWeight: 600 }}>Already have an account? </span>
            <Link
              to={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
              style={{ color: '#01806c', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </div>

          <div className="login-card-footer" style={{ marginTop: '8px', paddingTop: '8px' }}>
            <Link to="/" className="return-website-link">
              <span>←</span> Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

