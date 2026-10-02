import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UserForm({
  initialData = null,
  roles = [],
  onSubmit,
  isSubmitting = false,
  backendErrors = null,
  mode = 'create', // 'create' | 'edit'
}) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        confirm_password: '',
        role_id: initialData.role_details?.[0]?.id || (roles.find(r => r.slug === initialData.role)?.id) || '',
        status: initialData.status || 'active',
      };
    }
    const defaultRole = roles.find(r => r.slug === 'editor') || roles[0];
    return {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      role_id: defaultRole ? defaultRole.id : '',
      status: 'active',
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear client error on edit
    if (clientErrors[name]) {
      setClientErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length > 150) {
      errors.name = 'Full name cannot exceed 150 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address format.';
    }

    if (mode === 'create') {
      if (!formData.password) {
        errors.password = 'Password is required for new staff accounts.';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
      }

      if (!formData.confirm_password) {
        errors.confirm_password = 'Please confirm the account password.';
      } else if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match.';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'New password must be at least 6 characters long.';
      }
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match.';
      }
    }

    if (!formData.role_id) {
      errors.role_id = 'Please assign a role to this staff member.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || null,
      role_id: Number(formData.role_id),
      status: formData.status,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    onSubmit(payload);
  };

  const selectedRole = roles.find(r => Number(r.id) === Number(formData.role_id));
  const errors = { ...clientErrors, ...(backendErrors || {}) };

  return (
    <form className="admin-user-form" onSubmit={handleSubmit} noValidate>
      <div className="form-card-box">
        <h3 className="form-section-title">Personal & Contact Details</h3>
        
        {/* Name Field */}
        <div className="form-field-group">
          <label htmlFor="user-name" className="form-label required">
            Full Name
          </label>
          <input
            id="user-name"
            name="name"
            type="text"
            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Eleanor Vance"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="field-error-msg">{errors.name}</span>}
        </div>

        {/* Email Field */}
        <div className="form-field-group">
          <label htmlFor="user-email" className="form-label required">
            Email Address
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
            placeholder="e.g. eleanor@wanderersouthindia.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="field-error-msg">{errors.email}</span>}
        </div>

        {/* Phone Field */}
        <div className="form-field-group">
          <label htmlFor="user-phone" className="form-label">
            Phone Number <span className="text-muted">(Optional)</span>
          </label>
          <input
            id="user-phone"
            name="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="e.g. +33 6 12 34 56 78"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-card-box">
        <h3 className="form-section-title">Security & Credentials</h3>

        {/* Password Field */}
        <div className="form-field-group">
          <label htmlFor="user-password" className={`form-label ${mode === 'create' ? 'required' : ''}`}>
            {mode === 'create' ? 'Password' : 'Change Password'}
          </label>
          {mode === 'edit' && (
            <p className="field-hint">
              Leave blank to keep the current password. Fill only if resetting credentials.
            </p>
          )}
          <div className="password-input-wrapper">
            <input
              id="user-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'is-invalid' : ''}`}
              placeholder={mode === 'create' ? 'Minimum 6 characters' : 'Enter new password'}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="field-error-msg">{errors.password}</span>}
        </div>

        {/* Confirm Password Field */}
        {(mode === 'create' || formData.password.length > 0) && (
          <div className="form-field-group">
            <label htmlFor="user-confirm-password" className="form-label required">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="user-confirm-password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirm_password ? 'is-invalid' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirm_password && (
              <span className="field-error-msg">{errors.confirm_password}</span>
            )}
          </div>
        )}
      </div>

      <div className="form-card-box">
        <h3 className="form-section-title">Role & Authorization</h3>

        {/* Role Selection */}
        <div className="form-field-group">
          <label htmlFor="user-role" className="form-label required">
            Assigned Role
          </label>
          <select
            id="user-role"
            name="role_id"
            className={`form-select ${errors.role_id || errors.role ? 'is-invalid' : ''}`}
            value={formData.role_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select a role...</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.slug}) {r.is_system ? '• System' : ''}
              </option>
            ))}
          </select>
          {(errors.role_id || errors.role) && (
            <span className="field-error-msg">{errors.role_id || errors.role}</span>
          )}

          {/* Role preview box */}
          {selectedRole && (
            <div className="role-preview-box">
              <div className="role-preview-header">
                <span className="role-preview-name">🛡️ {selectedRole.name}</span>
                <span className="role-preview-count">
                  {selectedRole.slug === 'super_admin' ? '👑 All Privileges (*)' : `${selectedRole.permissions?.length || 0} permissions`}
                </span>
              </div>
              {selectedRole.description && (
                <p className="role-preview-desc">{selectedRole.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Account Status */}
        <div className="form-field-group">
          <label className="form-label required">Account Status</label>
          <div className="status-radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={handleChange}
              />
              <span className="radio-text">
                <span className="status-dot dot-active" aria-hidden="true" /> Active (Full Access)
              </span>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={handleChange}
              />
              <span className="radio-text">
                <span className="status-dot dot-inactive" aria-hidden="true" /> Inactive (Access Suspended)
              </span>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="suspended"
                checked={formData.status === 'suspended'}
                onChange={handleChange}
              />
              <span className="radio-text">
                <span className="status-dot dot-suspended" aria-hidden="true" /> Suspended
              </span>
            </label>
          </div>
          {errors.status && <span className="field-error-msg">{errors.status}</span>}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions-footer">
        <Link to="/admin/users" className="btn btn-outline">
          Cancel
        </Link>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === 'create' ? 'Creating Staff Member...' : 'Saving Changes...'
            : mode === 'create' ? '➕ Create Staff Member' : '💾 Save Changes'}
        </button>
      </div>
    </form>
  );
}
