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
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    password_confirmation: false,
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

  /**
   * Validate a single form field
   */
  const validateField = (name, value, currentFormData = formData) => {
    switch (name) {
      case 'name': {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          return 'Full name is required.';
        }
        if (trimmed.length < 2) {
          return 'Full name must be at least 2 characters.';
        }
        if (trimmed.length > 100) {
          return 'Full name cannot exceed 100 characters.';
        }
        if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) {
          return 'Full name may only contain letters, spaces, hyphens, and periods.';
        }
        return '';
      }
      case 'phone': {
        const raw = (value || '').trim();
        if (!raw) {
          return 'Phone number is required.';
        }
        if (!/^[0-9]+$/.test(raw)) {
          return 'Phone number must contain digits only (no letters or special characters).';
        }
        if (raw.length !== 10) {
          return 'Phone number must be exactly 10 digits.';
        }
        if (!/^[6-9]/.test(raw)) {
          return 'First digit of phone number must be 6, 7, 8, or 9.';
        }
        return '';
      }
      case 'email': {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          return 'Email address is required.';
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
          return 'Please enter a valid email address.';
        }
        return '';
      }
      case 'password': {
        if (!value) {
          return 'Password is required.';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
          return 'Password must contain at least one letter and one number.';
        }
        return '';
      }
      case 'password_confirmation': {
        if (!value) {
          return 'Please confirm your password.';
        }
        if (value !== currentFormData.password) {
          return 'Passwords do not match.';
        }
        return '';
      }
      default:
        return '';
    }
  };

  /**
   * Validate all form fields
   */
  const validateForm = (dataToValidate = formData) => {
    const errors = {};
    const fields = ['name', 'phone', 'email', 'password', 'password_confirmation'];
    fields.forEach((field) => {
      const err = validateField(field, dataToValidate[field], dataToValidate);
      if (err) {
        errors[field] = err;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value, formData);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // If the field has been touched or currently has an error, re-validate immediately to clear/update error
    if (touched[name] || fieldErrors[name]) {
      const errorMsg = validateField(name, value, updatedData);
      setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));

      // Also re-validate confirmation if password changes and confirmation was touched
      if (name === 'password' && touched.password_confirmation) {
        const confirmErr = validateField('password_confirmation', updatedData.password_confirmation, updatedData);
        setFieldErrors((prev) => ({ ...prev, password_confirmation: confirmErr }));
      }
    }

    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Mark all fields touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      password_confirmation: true,
    });

    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
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
        setFieldErrors((prev) => ({ ...prev, ...err.errors }));
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
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="e.g. Anand Kumar"
                    className={`form-input has-icon ${fieldErrors.name ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
                    required
                  />
                </div>
                {fieldErrors.name && <span id="reg-name-error" className="form-error" role="alert">{fieldErrors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label htmlFor="reg-phone" className="form-label">
                  Mobile / WhatsApp <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon" aria-hidden="true"><PhoneIcon size={15} /></span>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="10-digit number (e.g. 9840291110)"
                    className={`form-input has-icon ${fieldErrors.phone ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'reg-phone-error' : undefined}
                    required
                  />
                </div>
                {fieldErrors.phone && <span id="reg-phone-error" className="form-error" role="alert">{fieldErrors.phone}</span>}
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
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className={`form-input has-icon ${fieldErrors.email ? 'input-error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                  required
                />
              </div>
              {fieldErrors.email && <span id="reg-email-error" className="form-error" role="alert">{fieldErrors.email}</span>}
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
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="Min. 8 chars (letter & number)"
                    className={`form-input has-icon has-trailing ${fieldErrors.password ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
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
                {fieldErrors.password && <span id="reg-password-error" className="form-error" role="alert">{fieldErrors.password}</span>}
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
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="Confirm password"
                    className={`form-input has-icon has-trailing ${fieldErrors.password_confirmation ? 'input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.password_confirmation)}
                    aria-describedby={fieldErrors.password_confirmation ? 'reg-confirm-password-error' : undefined}
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
                  <span id="reg-confirm-password-error" className="form-error" role="alert">{fieldErrors.password_confirmation}</span>
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

