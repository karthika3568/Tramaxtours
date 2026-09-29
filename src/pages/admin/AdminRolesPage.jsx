import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import roleService from '../../services/roleService';
import { updatePageMeta } from '../../utils/metadata';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissionsData, setPermissionsData] = useState({ grouped: {}, permissions: [], total: 0 });
  const [selectedRoleSlug, setSelectedRoleSlug] = useState('all');
  const [permSearch, setPermSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    updatePageMeta({
      title: 'Roles & Permissions Matrix | Tramax Admin',
      description: 'Inspect system roles, member allocations, and granular RBAC permission matrix.',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRolesAndPermissions() {
      try {
        setLoading(true);
        setError(null);

        const [rolesRes, permsRes] = await Promise.all([
          roleService.getRoles(),
          roleService.getPermissions(),
        ]);

        if (isMounted) {
          setRoles(rolesRes || []);
          setPermissionsData(permsRes || { grouped: {}, permissions: [], total: 0 });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load system roles and permissions.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRolesAndPermissions();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

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
      default:
        return 'role-badge-default';
    }
  };

  const activeRoles = selectedRoleSlug === 'all'
    ? roles
    : roles.filter((r) => r.slug === selectedRoleSlug);

  // Grouped permissions filtered by search query
  const grouped = permissionsData.grouped || {};
  const filteredGroups = {};

  Object.entries(grouped).forEach(([groupName, permsList]) => {
    const matchingPerms = permsList.filter((p) => {
      if (!permSearch.trim()) return true;
      const q = permSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        groupName.toLowerCase().includes(q)
      );
    });

    if (matchingPerms.length > 0) {
      filteredGroups[groupName] = matchingPerms;
    }
  });

  return (
    <div className="admin-page-container roles-page">
      {/* 1. Header */}
      <div className="admin-page-header">
        <div className="header-info">
          <span className="page-category-badge">Access & Authorization</span>
          <h1 className="admin-page-title">Roles & Permissions Directory</h1>
          <p className="admin-page-subtitle">
            Overview of system authorization roles, active member counts, and live RBAC permissions matrix.
          </p>
        </div>

        <div className="header-actions">
          <Link to="/admin/users" className="btn btn-outline">
            👥 Staff Management &rarr;
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="table-loading-wrapper">
          <Loading message="Loading system roles and RBAC permission matrix..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load RBAC Configuration"
          message={error}
          retryText="Retry"
          onRetry={() => setReloadTrigger((prev) => prev + 1)}
        />
      ) : (
        <>
          {/* 2. Role Cards Grid */}
          <div className="roles-cards-grid">
            {roles.map((role) => {
              const isSuper = role.slug === 'super_admin';
              const isSelected = selectedRoleSlug === role.slug;

              return (
                <div
                  key={role.id}
                  className={`role-overview-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedRoleSlug(prev => prev === role.slug ? 'all' : role.slug)}
                >
                  <div className="role-card-top">
                    <span className={`role-badge ${getRoleBadgeClass(role.slug)}`}>
                      {role.name}
                    </span>
                    {role.is_system && <span className="system-role-tag">System Core</span>}
                  </div>

                  <h3 className="role-card-title">{role.name}</h3>
                  <p className="role-card-desc">{role.description || 'No description provided.'}</p>

                  <div className="role-card-footer">
                    <span className="role-card-stat">
                      👥 <strong>{role.users_count ?? 0}</strong> {role.users_count === 1 ? 'member' : 'members'}
                    </span>
                    <span className="role-card-stat">
                      🔑 <strong>{isSuper ? 'Wildcard (*)' : role.permissions?.length || 0}</strong> perms
                    </span>
                  </div>

                  <button
                    type="button"
                    className="role-select-indicator"
                    aria-label={`Filter matrix for ${role.name}`}
                  >
                    {isSelected ? '✓ Matrix Filtered' : 'Inspect Matrix &rarr;'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 3. Permission Matrix Section */}
          <div className="permission-matrix-section">
            <div className="matrix-header-bar">
              <div>
                <h2 className="matrix-title">RBAC Permission Matrix</h2>
                <p className="matrix-subtitle">
                  {selectedRoleSlug === 'all'
                    ? `Showing complete authorization map across ${roles.length} roles and ${permissionsData.total} permissions`
                    : `Filtered view for "${roles.find(r => r.slug === selectedRoleSlug)?.name}" role`}
                </p>
              </div>

              <div className="matrix-controls">
                {/* Search Permissions */}
                <div className="matrix-search-box">
                  <span className="search-icon" aria-hidden="true">🔍</span>
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search permissions or modules..."
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    aria-label="Search permissions"
                  />
                  {permSearch && (
                    <button
                      type="button"
                      className="filter-search-clear"
                      onClick={() => setPermSearch('')}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter by Role Button Group */}
                <div className="matrix-role-filter">
                  <button
                    type="button"
                    className={`btn btn-xs ${selectedRoleSlug === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedRoleSlug('all')}
                  >
                    All Roles
                  </button>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`btn btn-xs ${selectedRoleSlug === r.slug ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setSelectedRoleSlug(r.slug)}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="matrix-table-wrapper">
              <table className="permission-matrix-table">
                <thead>
                  <tr>
                    <th className="perm-name-col">Module & Permission</th>
                    <th className="perm-desc-col">Description</th>
                    {activeRoles.map((r) => (
                      <th key={r.id} className="role-col-header text-center">
                        <span className={`role-badge-compact ${getRoleBadgeClass(r.slug)}`}>
                          {r.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(filteredGroups).map(([groupName, perms]) => (
                    <tr key={groupName} className="matrix-group-row">
                      <td colSpan={2 + activeRoles.length} className="group-divider-cell">
                        <span className="group-divider-badge">📁 {groupName}</span>
                        <span className="group-divider-count">{perms.length} actions</span>
                      </td>
                    </tr>
                  )).concat(
                    Object.entries(filteredGroups).flatMap(([groupName, perms]) =>
                      perms.map((p) => (
                        <tr key={p.id} className="matrix-data-row">
                          <td className="perm-name-cell">
                            <code className="perm-code">{p.name}</code>
                          </td>
                          <td className="perm-desc-cell">
                            {p.description || <span className="text-muted">General permission for {groupName}</span>}
                          </td>
                          {activeRoles.map((role) => {
                            const isSuper = role.slug === 'super_admin';
                            const hasPerm = isSuper || (role.permissions && role.permissions.some(rp => rp.name === p.name || rp.id === p.id));

                            return (
                              <td key={role.id} className="text-center perm-check-cell">
                                {hasPerm ? (
                                  <span className="perm-granted" title={`Granted to ${role.name}`}>
                                    ✓
                                  </span>
                                ) : (
                                  <span className="perm-denied" title={`Not granted to ${role.name}`}>
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
