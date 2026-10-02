import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { updatePageMeta } from '../../utils/metadata';

import UserStats from '../../components/admin/users/UserStats';
import UserFilters from '../../components/admin/users/UserFilters';
import UserTable from '../../components/admin/users/UserTable';
import UserDetailModal from '../../components/admin/users/UserDetailModal';
import UserStatusModal from '../../components/admin/users/UserStatusModal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminUsersPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canCreate = hasPermission('users.create');

  const [usersData, setUsersData] = useState({
    data: [],
    meta: { total: 0, page: 1, per_page: 15, total_pages: 1 },
    stats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    sort_by: 'created_at',
    sort_order: 'DESC',
    page: 1,
    per_page: 15,
  });

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusActionType, setStatusActionType] = useState('deactivate'); // 'activate' | 'deactivate' | 'delete'
  const [isOperating, setIsOperating] = useState(false);

  useEffect(() => {
    updatePageMeta({
      title: 'Customer Accounts & Bookings | Wanderer South India',
      description: 'Manage customer accounts, inspect booked tours, track traveler counts, and handle customer profiles.',
    });
  }, []);

  // Fetch Users
  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: filters.page,
          per_page: filters.per_page,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
        };

        if (filters.search) params.search = filters.search;
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        if (filters.role && filters.role !== 'all') params.role = filters.role;

        const response = await userService.getUsers(params);
        if (isMounted) {
          setUsersData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch staff members from the server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [filters, reloadTrigger]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      role: 'all',
      sort_by: 'created_at',
      sort_order: 'DESC',
      page: 1,
      per_page: 15,
    });
  }, []);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    setStatusActionType(user.status === 'active' ? 'deactivate' : 'activate');
    setStatusModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setStatusActionType('delete');
    setStatusModalOpen(true);
  };

  const handleConfirmStatusAction = async () => {
    if (!selectedUser) return;

    try {
      setIsOperating(true);

      if (statusActionType === 'activate') {
        await userService.activateUser(selectedUser.id);
        toast.success(`Account for "${selectedUser.name}" has been activated.`, 'Account Activated');
      } else if (statusActionType === 'deactivate') {
        await userService.deactivateUser(selectedUser.id);
        toast.warning(`Account for "${selectedUser.name}" has been disabled.`, 'Account Disabled');
      } else if (statusActionType === 'delete') {
        await userService.deleteUser(selectedUser.id);
        toast.info(`Account for "${selectedUser.name}" has been deleted.`, 'Account Deleted');
      }

      setStatusModalOpen(false);
      setSelectedUser(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.message || 'Failed to perform requested action on user account.', 'Error');
    } finally {
      setIsOperating(false);
    }
  };

  const { total_pages, page, total } = usersData.meta || {};

  return (
    <div className="admin-page-container">
      {/* 1. Page Header */}
      <div className="admin-page-header">
        <div className="header-info">
          <span className="page-category-badge">Customer Directory & Reservations</span>
          <h1 className="admin-page-title">Customer Accounts & Bookings</h1>
          <p className="admin-page-subtitle">
            Inspect customer profiles, track how many guests/travelers they have booked, see which tours they selected, and manage accounts.
          </p>
        </div>

        <div className="header-actions">
          {canCreate && (
            <Link to="/admin/users/new" className="btn btn-primary">
              <span aria-hidden="true">➕</span> New Customer Account
            </Link>
          )}
        </div>
      </div>

      {/* 2. Real Metrics KPI Grid */}
      <UserStats stats={usersData.stats} />

      {/* 3. Search & Filter Bar */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Main Table / Mobile Cards Area */}
      <div className="users-table-section">
        {loading ? (
          <div className="table-loading-wrapper">
            <Loading message="Loading customer accounts from database..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to Load Customers"
            message={error}
            retryText="Retry Connection"
            onRetry={() => setReloadTrigger((prev) => prev + 1)}
          />
        ) : (
          <>
            <UserTable
              users={usersData.data}
              onViewUser={handleViewUser}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={handleDeleteUser}
              isOperating={isOperating}
            />

            {/* Pagination Controls */}
            {total_pages > 1 && (
              <div className="pagination-bar">
                <span className="pagination-info">
                  Showing <strong>{usersData.data.length}</strong> of <strong>{total}</strong> customers
                </span>
                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleFilterChange({ page: Math.max(1, page - 1) })}
                    disabled={page <= 1}
                  >
                    &larr; Previous
                  </button>
                  <span className="page-counter">
                    Page {page} of {total_pages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleFilterChange({ page: Math.min(total_pages, page + 1) })}
                    disabled={page >= total_pages}
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. User Detail Modal */}
      {detailModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* 6. Status Action Confirmation Modal */}
      {statusModalOpen && selectedUser && (
        <UserStatusModal
          user={selectedUser}
          actionType={statusActionType}
          isOpen={statusModalOpen}
          isProcessing={isOperating}
          onConfirm={handleConfirmStatusAction}
          onCancel={() => {
            setStatusModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
