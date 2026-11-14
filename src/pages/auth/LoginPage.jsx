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

  // Interactive Forgot Password & Reset state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }
    setIsForgotSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email: forgotEmail.trim().toLowerCase() });
      const code = res?.data?.code || res?.code || '';
      if (code) {
        setForgotCode(code);
      }
      setForgotStep(2);
      toast.success('Verification code generated. Please enter your new password.', 'Code Sent');
    } catch (err) {
      setForgotError(err.message || 'No registered account found with this email. Please check your address.');
      toast.error(err.message || 'Email lookup failed.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotCode.trim() || forgotCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Password confirmation does not match.');
      return;
    }

    setIsForgotSubmitting(true);
    try {
      await authService.resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        code: forgotCode.trim(),
        password: forgotNewPassword,
        password_confirmation: forgotConfirmPassword,
      });
      setForgotSuccessMsg('Your password has been successfully reset! You can now sign in.');
      setForgotStep(3);
      setFormData((prev) => ({
        ...prev,
        email: forgotEmail.trim().toLowerCase(),
        password: forgotNewPassword,
      }));
      toast.success('Password reset successfully!', 'Success');
    } catch (err) {
      setForgotError(err.message || 'Invalid or expired verification code. Please try again.');
      toast.error(err.message || 'Password reset failed.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleCloseForgotModal = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotError('');
    setForgotSuccessMsg('');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
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

      {/* Interactive Forgot Password & Reset Modal */}
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
              maxWidth: '460px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                {forgotStep === 1 ? 'Forgot Password' : forgotStep === 2 ? 'Reset Your Password' : 'Password Reset Complete'}
              </h3>
              <button
                type="button"
                onClick={handleCloseForgotModal}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {forgotError && (
              <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {forgotError}
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Enter your registered account email address. We will generate a verification code to reset your password.
                </p>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="forgot-email" className="form-label">
                    Registered Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseForgotModal}
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
                    Get Verification Code
                  </Button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleResetPasswordSubmit}>
                <div style={{ padding: '0.75rem 1rem', background: '#f0fdfa', color: '#0f766e', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #ccfbf1' }}>
                  Verification code generated for <strong>{forgotEmail}</strong>. {forgotCode ? <span>Your code is: <strong>{forgotCode}</strong></span> : ''}
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="reset-code" className="form-label">
                    6-Digit Verification Code <span className="text-danger">*</span>
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 123456"
                    style={{ letterSpacing: '2px', fontWeight: 700 }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="reset-new-password" className="form-label">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="reset-confirm-password" className="form-label">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setForgotStep(1)}
                    disabled={isForgotSubmitting}
                  >
                    Back
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isForgotSubmitting}
                    disabled={isForgotSubmitting}
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <div>
                <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  {forgotSuccessMsg}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={handleCloseForgotModal}
                >
                  Sign In With New Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
