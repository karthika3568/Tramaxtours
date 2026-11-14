import { EyeIcon, KeyIcon, LockIcon, MailIcon } from '../../components/common/Icons';
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
      title: 'Sign In — Wonderer South India',
      description: 'Sign in to access your tour bookings, traveler profile, or administrative portal.',
    });
  }, []);

  // If already authenticated, redirect based on role and prior page
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      const isAdmin = ADMIN_ROLES.includes(role) || roles.some((r) => ADMIN_ROLES.includes(r));
      
      let target = '/customer/profile';
      if (isAdmin) {
        target = redirectParam && redirectParam.startsWith('/admin')
          ? redirectParam
          : (location.state?.from?.pathname?.startsWith('/admin') ? location.state.from.pathname : '/admin');
      } else {
        target = redirectParam || location.state?.from?.pathname || '/customer/profile';
      }
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, location.state, location.search, role, roles]);

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

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsForgotSubmitting(true);
    try {
      await authService.forgotPassword({ email: forgotEmail.trim().toLowerCase() });
      setForgotSuccessMsg('If an account exists with this email address, password reset instructions have been sent.');
      toast.success('Password reset instructions dispatched.', 'Email Sent');
    } catch {
      toast.error('Unable to send password reset instructions. Please try again.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In is configured. Please continue with your registered email or create an account below.', 'Google Sign In');
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

      let target = '/customer/profile';
      if (isAdmin) {
        target = redirectParam && redirectParam.startsWith('/admin')
          ? redirectParam
          : (location.state?.from?.pathname?.startsWith('/admin') ? location.state.from.pathname : '/admin');
      } else {
        target = redirectParam || location.state?.from?.pathname || '/customer/profile';
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
            <Link to="/" className="login-brand-header-link" aria-label="Wonderer South India Home">
              <img src="/logo.png" alt="Wonderer South India" className="login-brand-logo-img" style={{ maxHeight: '64px', objectFit: 'contain' }} />
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

          {/* Social Sign-In option */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
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
            <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-leading-icon" aria-hidden="true"><MailIcon size={16} /></span>
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
              <div className="label-with-hint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>
                  Password <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotEmail(formData.email);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="password-input-wrapper">
                <span className="input-leading-icon" aria-hidden="true"><KeyIcon size={16} /></span>
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
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeIcon size={16} /> : <LockIcon size={16} />}
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

          {/* Registration Option */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>New to Wonderer South India? </span>
            <Link
              to={`/register${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
              style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}
            >
              Create an Account
            </Link>
          </div>

          <div className="login-card-footer">
            <Link to="/" className="return-website-link">
              <span>←</span> Return to Public Website
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
              Reset Your Password
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Enter your registered email address and we will send you password reset instructions.
            </p>

            {forgotSuccessMsg ? (
              <div>
                <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {forgotSuccessMsg}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSuccessMsg('');
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="forgot-email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isForgotSubmitting}
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isForgotSubmitting}
                    disabled={isForgotSubmitting}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
