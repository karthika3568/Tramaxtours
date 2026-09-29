import { useState, useEffect } from 'react';

export default function UserFilters({
  filters,
  onFilterChange,
  onResetFilters,
}) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounced search handling
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  const handleRoleChange = (e) => {
    onFilterChange({ role: e.target.value });
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split(':');
    onFilterChange({ sort_by: sortBy, sort_order: sortOrder });
  };

  const currentSortValue = `${filters.sort_by || 'created_at'}:${filters.sort_order || 'DESC'}`;

  const isFiltered =
    Boolean(filters.search) ||
    (filters.status && filters.status !== 'all') ||
    (filters.role && filters.role !== 'all') ||
    filters.sort_by !== 'created_at' ||
    filters.sort_order !== 'DESC';

  return (
    <div className="users-filter-bar">
      <div className="filter-search-box">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="filter-search-input"
          placeholder="Search by customer name, email, phone, or booked tour..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search customers"
        />
        {searchInput && (
          <button
            type="button"
            className="filter-search-clear"
            onClick={() => setSearchInput('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-controls-group">
        {/* Status Filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="user-status-filter" className="filter-label">
            Status:
          </label>
          <select
            id="user-status-filter"
            className="filter-select"
            value={filters.status || 'all'}
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Account Type Filter */}
        <div className="filter-select-wrapper">
          <label htmlFor="user-role-filter" className="filter-label">
            Account Type:
          </label>
          <select
            id="user-role-filter"
            className="filter-select"
            value={filters.role || 'all'}
            onChange={handleRoleChange}
          >
            <option value="all">All Accounts</option>
            <option value="customer">Registered Customers</option>
            <option value="admin">Administrators</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="filter-select-wrapper">
          <label htmlFor="user-sort-filter" className="filter-label">
            Sort By:
          </label>
          <select
            id="user-sort-filter"
            className="filter-select"
            value={currentSortValue}
            onChange={handleSortChange}
          >
            <option value="created_at:DESC">Date Created (Newest)</option>
            <option value="created_at:ASC">Date Created (Oldest)</option>
            <option value="name:ASC">Name (A → Z)</option>
            <option value="name:DESC">Name (Z → A)</option>
            <option value="email:ASC">Email (A → Z)</option>
            <option value="status:ASC">Status</option>
            <option value="last_login_at:DESC">Last Login (Recent)</option>
          </select>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-outline btn-sm filter-reset-btn"
            onClick={() => {
              setSearchInput('');
              onResetFilters();
            }}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
