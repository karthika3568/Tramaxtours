import { useState, useMemo } from 'react';

export default function UserRolePermissionPanel({
  user,
  availableRoles = [],
  onRoleChange = null,
  isChangingRole = false,
  readOnly = false,
}) {
  const [selectedRoleId, setSelectedRoleId] = useState(
    user?.role_details?.[0]?.id || availableRoles.find((r) => r.slug === user?.role)?.id || ''
  );
  const [filterQuery, setFilterQuery] = useState('');

  const isSuperAdmin = user?.role === 'super_admin' || (user?.roles && user?.roles.includes('super_admin'));
  const effectivePermissions = useMemo(() => user?.permissions || [], [user?.permissions]);

  // Group effective permissions by category
  const groupedPermissions = useMemo(() => {
    const groups = {};
    effectivePermissions.forEach((perm) => {
      const parts = perm.split('.');
      const groupName = parts.length > 1
        ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).replace(/_/g, ' ')
        : 'General';

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(perm);
    });
    return groups;
  }, [effectivePermissions]);

  // Filter grouped permissions by search term
  const filteredGroups = useMemo(() => {
    if (!filterQuery.trim()) return groupedPermissions;
    const q = filterQuery.toLowerCase();
    const result = {};

    Object.entries(groupedPermissions).forEach(([groupName, perms]) => {
      const matching = perms.filter((p) => p.toLowerCase().includes(q) || groupName.toLowerCase().includes(q));
      if (matching.length > 0) {
        result[groupName] = matching;
      }
    });

    return result;
  }, [groupedPermissions, filterQuery]);

  const getRoleBadgeClass = (roleSlug) => {
    switch (roleSlug) {
      case 'super_admin':
        return 'role-badge-super';
      case 'admin':
        return 'role-badge-admin';
      case 'editor':
        return 'role-badge-editor';
      case 'moderator':
        return 'role-badge-moderator';
      case 'staff':
        return 'role-badge-staff';
      default:
        return 'role-badge-default';
    }
  };

  const handleRoleSelect = (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
    if (onRoleChange) {
      const targetRole = availableRoles.find((r) => Number(r.id) === Number(roleId));
      onRoleChange(targetRole || roleId);
    }
  };

  return (
    <div className="user-role-permission-panel">
      {/* 1. Role Assignment & Overview Section */}
      <div className="panel-section role-summary-section">
        <div className="panel-section-header">
          <h4 className="panel-section-title">🛡️ Role & Authorization Level</h4>
          <span className="panel-header-badge">Backend Authoritative</span>
        </div>

        <div className="role-summary-card">
          <div className="role-summary-main">
            <span className="role-summary-label">Current Assigned Role:</span>
            <div className="role-badge-wrapper">
              <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                {user?.role ? user.role.replace(/_/g, ' ') : 'None'}
              </span>
              {isSuperAdmin && (
                <span className="super-wildcard-tag">👑 Wildcard Access (*)</span>
              )}
            </div>
          </div>

          {!readOnly && onRoleChange && availableRoles.length > 0 && (
            <div className="role-change-controls">
              <label htmlFor="assign-role-select" className="role-change-label">
                Change Role:
              </label>
              <select
                id="assign-role-select"
                className="form-select form-select-sm role-select-dropdown"
                value={selectedRoleId}
                onChange={handleRoleSelect}
                disabled={isChangingRole}
              >
                {availableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.slug}) {r.is_system ? '• System' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 2. Effective RBAC Permissions Breakdown */}
      <div className="panel-section permissions-breakdown-section">
        <div className="panel-section-header">
          <div>
            <h4 className="panel-section-title">🔑 Effective Permissions</h4>
            <p className="panel-section-subtitle">
              Granular privileges derived directly from assigned role policies.
            </p>
          </div>

          {!isSuperAdmin && effectivePermissions.length > 6 && (
            <div className="perm-filter-box">
              <input
                type="text"
                className="perm-filter-input"
                placeholder="Filter permissions..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                aria-label="Filter effective permissions"
              />
              {filterQuery && (
                <button
                  type="button"
                  className="perm-filter-clear"
                  onClick={() => setFilterQuery('')}
                  aria-label="Clear filter"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {isSuperAdmin ? (
          <div className="super-admin-permission-banner">
            <span className="crown-icon">👑</span>
            <div className="banner-content">
              <strong>Unrestricted Super Administrator Privileges</strong>
              <p>
                This account holds wildcard authorization (<code>*</code>). All backend actions across catalog items, bookings, users, media, and security settings are automatically permitted.
              </p>
            </div>
          </div>
        ) : Object.keys(filteredGroups).length > 0 ? (
          <div className="permissions-grouped-grid">
            {Object.entries(filteredGroups).map(([groupName, perms]) => (
              <div key={groupName} className="permission-group-block">
                <div className="group-block-header">
                  <span className="group-block-title">{groupName}</span>
                  <span className="group-block-count">{perms.length}</span>
                </div>
                <div className="group-block-tags">
                  {perms.map((p) => (
                    <span key={p} className="perm-tag-item">
                      <span className="perm-check-icon">✓</span>
                      <code className="perm-slug">{p}</code>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="permissions-empty-box">
            <p>
              {filterQuery
                ? `No permissions match "${filterQuery}".`
                : 'No administrative permissions assigned to this user.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
