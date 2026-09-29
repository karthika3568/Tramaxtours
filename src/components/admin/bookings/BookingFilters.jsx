export default function BookingFilters({
  search = '',
  status = 'all',
  paymentStatus = 'all',
  tourId = '',
  dateFrom = '',
  dateTo = '',
  sortBy = 'created_at',
  order = 'DESC',
  toursList = [],
  onFilterChange,
  onResetFilters,
}) {
  const hasActiveFilters =
    Boolean(search) ||
    status !== 'all' ||
    paymentStatus !== 'all' ||
    Boolean(tourId) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    sortBy !== 'created_at' ||
    order !== 'DESC';

  return (
    <div className="booking-filters-card">
      <div className="booking-filters-grid">
        {/* Search */}
        <div className="filter-group search-filter-group">
          <label htmlFor="booking-search" className="filter-label">
            Search Bookings
          </label>
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              id="booking-search"
              className="form-input form-input-sm"
              placeholder="Search order #, customer, email, phone..."
              value={search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            />
          </div>
        </div>

        {/* Booking Status Filter */}
        <div className="filter-group">
          <label htmlFor="booking-status-filter" className="filter-label">
            Booking Status
          </label>
          <select
            id="booking-status-filter"
            className="form-select form-select-sm"
            value={status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Tour Package Filter */}
        <div className="filter-group">
          <label htmlFor="booking-tour-filter" className="filter-label">
            Tour Package
          </label>
          <select
            id="booking-tour-filter"
            className="form-select form-select-sm"
            value={tourId}
            onChange={(e) => onFilterChange({ tour_id: e.target.value, page: 1 })}
          >
            <option value="">All Tours</option>
            {toursList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="filter-group">
          <label htmlFor="booking-payment-filter" className="filter-label">
            Payment Status
          </label>
          <select
            id="booking-payment-filter"
            className="form-select form-select-sm"
            value={paymentStatus}
            onChange={(e) => onFilterChange({ payment_status: e.target.value, page: 1 })}
          >
            <option value="all">All Payments</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid / Collected</option>
            <option value="failed">Payment Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Travel Date Range */}
        <div className="filter-group">
          <label htmlFor="booking-date-from" className="filter-label">
            Travel Date From
          </label>
          <input
            type="date"
            id="booking-date-from"
            className="form-input form-input-sm"
            value={dateFrom}
            onChange={(e) => onFilterChange({ date_from: e.target.value, page: 1 })}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="booking-date-to" className="filter-label">
            Travel Date To
          </label>
          <input
            type="date"
            id="booking-date-to"
            className="form-input form-input-sm"
            value={dateTo}
            onChange={(e) => onFilterChange({ date_to: e.target.value, page: 1 })}
          />
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="booking-sort-filter" className="filter-label">
            Sort Order
          </label>
          <select
            id="booking-sort-filter"
            className="form-select form-select-sm"
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('-');
              onFilterChange({ sort_by: newSort, order: newOrder, page: 1 });
            }}
          >
            <option value="created_at-DESC">Newest Bookings First</option>
            <option value="created_at-ASC">Oldest Bookings First</option>
            <option value="booking_date-ASC">Upcoming Travel Dates</option>
            <option value="total_price-DESC">Amount: High to Low</option>
            <option value="total_price-ASC">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filters-active-bar">
          <span className="active-filter-indicator">Active filters applied</span>
          <button
            type="button"
            className="btn btn-outline btn-xs btn-clear-filters"
            onClick={onResetFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
