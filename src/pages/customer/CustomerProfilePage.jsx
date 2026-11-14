import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  TicketIcon,
  UserIcon,
  XCircleIcon,
  LogOutIcon,
} from '../../components/common/Icons';
import useAuth from '../../hooks/useAuth';
import customerService from '../../services/customerService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';
import Button from '../../components/ui/Button';

export default function CustomerProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    return location.hash === '#password' ? 'password' : 'profile';
  });

  const [stats, setStats] = useState({
    total_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'My Profile & Dashboard — Wonderer South India',
      description: 'Manage your personal account, review tour bookings, and view confirmed tickets.',
    });
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  // Load customer dynamic booking stats
  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setLoadingStats(true);
        const data = await customerService.getMyBookingStats();
        if (isMounted && data) {
          setStats(data);
        }
      } catch {
        // Fallback or ignore
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Full name is required.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await updateProfile({
        name: profileData.name.trim(),
        phone: profileData.phone.trim() || null,
        avatar_url: profileData.avatar_url.trim() || null,
      });
      toast.success('Your profile details have been saved successfully.', 'Profile Updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.', 'Update Error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.current_password) {
      toast.error('Current password is required.');
      return;
    }
    if (!passwordData.new_password || passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Password confirmation does not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      toast.success('Your password has been changed successfully.', 'Password Changed');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setActiveTab('profile');
    } catch (err) {
      toast.error(err.message || 'Failed to change password. Please verify current password.', 'Error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('You have been signed out.', 'Signed Out');
    navigate('/');
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="customer-portal-container" style={{ minHeight: '80vh', padding: '2.5rem 1rem', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Welcome Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ffffff',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.name || 'Customer'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || 'T')[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {user?.name || 'Valued Traveler'}
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                {user?.email} • Member since {memberSince}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/customer/bookings" className="btn btn-secondary" style={{ background: '#ffffff', color: '#0f766e', border: 'none', fontWeight: 600 }}>
              <CalendarIcon size={16} /> My Bookings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dynamic Metric Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Bookings</span>
              <span style={{ color: '#0d9488' }}><CalendarIcon size={20} /></span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>
              {loadingStats ? '—' : stats.total_bookings}
            </div>
            <Link to="/customer/bookings" style={{ fontSize: '0.8rem', color: '#0d9488', textDecoration: 'none', fontWeight: 500 }}>
              View all bookings →
            </Link>
          </div>

          <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending / In Review</span>
              <span style={{ color: '#f59e0b' }}><ClockIcon size={20} /></span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706' }}>
              {loadingStats ? '—' : stats.pending_bookings}
            </div>
            <Link to="/customer/bookings?status=pending" style={{ fontSize: '0.8rem', color: '#d97706', textDecoration: 'none', fontWeight: 500 }}>
              Review pending requests →
            </Link>
          </div>

          <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Confirmed Tours</span>
              <span style={{ color: '#10b981' }}><CheckCircleIcon size={20} /></span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669' }}>
              {loadingStats ? '—' : stats.confirmed_bookings}
            </div>
            <Link to="/customer/bookings?status=confirmed" style={{ fontSize: '0.8rem', color: '#059669', textDecoration: 'none', fontWeight: 500 }}>
              Tickets & confirmation →
            </Link>
          </div>

          <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completed</span>
              <span style={{ color: '#6366f1' }}><TicketIcon size={20} /></span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4f46e5' }}>
              {loadingStats ? '—' : stats.completed_bookings}
            </div>
            <Link to="/customer/bookings?status=completed" style={{ fontSize: '0.8rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
              Booking history →
            </Link>
          </div>
        </div>

        {/* Main Profile Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Sidebar Menu */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                Account Settings
              </h3>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  background: activeTab === 'profile' ? '#f0fdfa' : 'transparent',
                  color: activeTab === 'profile' ? '#0d9488' : '#334155',
                  border: 'none',
                  borderLeft: activeTab === 'profile' ? '4px solid #0d9488' : '4px solid transparent',
                  fontWeight: activeTab === 'profile' ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <UserIcon size={18} /> My Profile
              </button>

              <Link
                to="/customer/bookings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  borderLeft: '4px solid transparent',
                }}
              >
                <CalendarIcon size={18} /> My Bookings
              </Link>

              <Link
                to="/customer/bookings?status=confirmed"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  borderLeft: '4px solid transparent',
                }}
              >
                <TicketIcon size={18} /> Upcoming Tours & Tickets
              </Link>

              <Link
                to="/customer/bookings?status=completed"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  borderLeft: '4px solid transparent',
                }}
              >
                <ClockIcon size={18} /> Booking History
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab('password')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  background: activeTab === 'password' ? '#f0fdfa' : 'transparent',
                  color: activeTab === 'password' ? '#0d9488' : '#334155',
                  border: 'none',
                  borderLeft: activeTab === 'password' ? '4px solid #0d9488' : '4px solid transparent',
                  fontWeight: activeTab === 'password' ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LockIcon size={18} /> Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  color: '#ef4444',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <LogOutIcon size={18} /> Logout
              </button>
            </nav>
          </div>

          {/* Tab Content Panes */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                  Personal Profile
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  View and update your personal travel profile information.
                </p>

                <form onSubmit={handleProfileSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="email" className="form-label">
                        Email Address (Account Identifier)
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="form-input"
                        style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        Email cannot be changed directly for security reasons.
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="phone" className="form-label">
                        Mobile Number / WhatsApp
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                        className="form-input"
                        placeholder="+91 98402 91110"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="avatar" className="form-label">
                        Profile Image URL
                      </label>
                      <input
                        id="avatar"
                        type="url"
                        value={profileData.avatar_url}
                        onChange={(e) => setProfileData((p) => ({ ...p, avatar_url: e.target.value }))}
                        className="form-input"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isUpdatingProfile}
                      disabled={isUpdatingProfile}
                    >
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                  Change Account Password
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  To safeguard your account and tour booking details, choose a strong, unique password.
                </p>

                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '440px' }}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="current_password" className="form-label">
                      Current Password <span className="text-danger">*</span>
                    </label>
                    <input
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData((p) => ({ ...p, current_password: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="new_password" className="form-label">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData((p) => ({ ...p, new_password: e.target.value }))}
                      className="form-input"
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="new_password_confirmation" className="form-label">
                      Confirm New Password <span className="text-danger">*</span>
                    </label>
                    <input
                      id="new_password_confirmation"
                      type="password"
                      value={passwordData.new_password_confirmation}
                      onChange={(e) => setPasswordData((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isChangingPassword}
                      disabled={isChangingPassword}
                    >
                      Update Password
                    </Button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setActiveTab('profile')}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

