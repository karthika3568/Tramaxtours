import { CalendarIcon, FilterIcon, RefreshIcon, SearchIcon, XIcon } from '../../common/Icons';
import { ALLOWED_TOUR_TYPES } from '../../../services/tourService';

export default function BookingFilters({
  search = '',
  status = 'all',
  paymentStatus = 'all',
  tourId = '',
  tourType = 'all',
  dateFrom = '',
  dateTo = '',
  sortBy = 'created_at',
  order = 'DESC',
  limit = 15,
  toursList = [],
  onFilterChange,
  onResetFilters,
}) {
  const hasActiveFilters =
    Boolean(search) ||
    status !== 'all' ||
    paymentStatus !== 'all' ||
    (Boolean(tourId) && tourId !== 'all') ||
    (Boolean(tourType) && tourType !== 'all') ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    sortBy !== 'created_at' ||
    order !== 'DESC';

  const quickStatuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'payment_discussion', label: 'Discussion' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="booking-filters-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Quick Status Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginRight: '4px' }}>
          Quick Filter:
        </span>
        {quickStatuses.map((qs) => {
          const isActive = status === qs.value;
          return (
            <button
              key={qs.value}
              type="button"
              onClick={() => onFilterChange({ status: qs.value, page: 1 })}
              style={{
                background: isActive ? '#01aa90' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                border: `1px solid ${isActive ? '#01aa90' : '#e2e8f0'}`,
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {qs.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter Grid */}
      <div
        className="booking-filters-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'flex-end',
        }}
      >
        {/* Search */}
        <div className="filter-group search-filter-group" style={{ gridColumn: 'span 2', minWidth: '260px' }}>
          <label htmlFor="booking-search" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Search Bookings
          </label>
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span className="search-icon" aria-hidden="true" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }}>
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              id="booking-search"
              className="form-input form-input-sm"
              placeholder="Search by ID, customer, email, phone, tour..."
              value={search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: search ? '32px' : '12px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => onFilterChange({ search: '', page: 1 })}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Booking Status Dropdown */}
        <div className="filter-group">
          <label htmlFor="booking-status-filter" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Booking Status
          </label>
          <select
            id="booking-status-filter"
            className="form-select form-select-sm"
            value={status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="payment_discussion">Payment Discussion</option>
            <option value="awaiting_confirmation">Awaiting Confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Payment Status Dropdown */}
        <div className="filter-group">
          <label htmlFor="booking-payment-filter" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Payment Status
          </label>
          <select
            id="booking-payment-filter"
            className="form-select form-select-sm"
            value={paymentStatus}
            onChange={(e) => onFilterChange({ payment_status: e.target.value, page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid / Settled</option>
            <option value="failed">Payment Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Tour Type Dropdown (Requirement 4) */}
        <div className="filter-group">
          <label htmlFor="booking-tour-type-filter" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Tour Type
          </label>
          <select
            id="booking-tour-type-filter"
            className="form-select form-select-sm"
            value={tourType}
            onChange={(e) => onFilterChange({ tour_type: e.target.value, page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="all">All Tour Types</option>
            {ALLOWED_TOUR_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Tour Package Dropdown */}
        <div className="filter-group">
          <label htmlFor="booking-tour-filter" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Specific Tour Package
          </label>
          <select
            id="booking-tour-filter"
            className="form-select form-select-sm"
            value={tourId}
            onChange={(e) => onFilterChange({ tour_id: e.target.value, page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="">All Tours</option>
            {toursList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="filter-group">
          <label htmlFor="booking-date-from" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Travel Date From
          </label>
          <input
            type="date"
            id="booking-date-from"
            className="form-input form-input-sm"
            value={dateFrom}
            onChange={(e) => onFilterChange({ date_from: e.target.value, page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        {/* Date To */}
        <div className="filter-group">
          <label htmlFor="booking-date-to" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Travel Date To
          </label>
          <input
            type="date"
            id="booking-date-to"
            className="form-input form-input-sm"
            value={dateTo}
            onChange={(e) => onFilterChange({ date_to: e.target.value, page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="booking-sort-filter" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Sort By
          </label>
          <select
            id="booking-sort-filter"
            className="form-select form-select-sm"
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('-');
              onFilterChange({ sort_by: newSort, order: newOrder, page: 1 });
            }}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="created_at-DESC">Newest Bookings First</option>
            <option value="created_at-ASC">Oldest Bookings First</option>
            <option value="booking_date-ASC">Upcoming Travel Dates</option>
            <option value="booking_date-DESC">Past Travel Dates</option>
            <option value="total_price-DESC">Amount: High to Low</option>
            <option value="total_price-ASC">Amount: Low to High</option>
            <option value="customer_name-ASC">Customer Name (A-Z)</option>
          </select>
        </div>

        {/* Per Page Limit */}
        <div className="filter-group">
          <label htmlFor="booking-limit-filter" className="filter-label" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
            Per Page
          </label>
          <select
            id="booking-limit-filter"
            className="form-select form-select-sm"
            value={limit}
            onChange={(e) => onFilterChange({ limit: Number(e.target.value), page: 1 })}
            style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value={10}>10 records</option>
            <option value={15}>15 records</option>
            <option value={25}>25 records</option>
            <option value={50}>50 records</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicators Bar */}
      {hasActiveFilters && (
        <div
          className="filters-active-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px dashed #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Active Filters:</span>
            {search && (
              <span className="filter-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600' }}>
                Search: "{search}"
                <button type="button" onClick={() => onFilterChange({ search: '', page: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', padding: 0 }}><XIcon size={12} /></button>
              </span>
            )}
            {status !== 'all' && (
              <span className="filter-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600' }}>
                Status: {status}
                <button type="button" onClick={() => onFilterChange({ status: 'all', page: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', padding: 0 }}><XIcon size={12} /></button>
              </span>
            )}
            {paymentStatus !== 'all' && (
              <span className="filter-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600' }}>
                Payment: {paymentStatus}
                <button type="button" onClick={() => onFilterChange({ payment_status: 'all', page: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', padding: 0 }}><XIcon size={12} /></button>
              </span>
            )}
            {tourType !== 'all' && (
              <span className="filter-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3e8ff', color: '#7e22ce', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600' }}>
                Type: {tourType}
                <button type="button" onClick={() => onFilterChange({ tour_type: 'all', page: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7e22ce', padding: 0 }}><XIcon size={12} /></button>
              </span>
            )}
            {tourId && tourId !== 'all' && (
              <span className="filter-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600' }}>
                Tour: {toursList.find((t) => String(t.id) === String(tourId))?.title || `#${tourId}`}
                <button type="button" onClick={() => onFilterChange({ tour_id: '', page: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3730a3', padding: 0 }}><XIcon size={12} /></button>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="filter-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600' }}>
                Dates: {dateFrom || 'Any'} → {dateTo || 'Any'}
                <button type="button" onClick={() => onFilterChange({ date_from: '', date_to: '', page: 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 0 }}><XIcon size={12} /></button>
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={onResetFilters}
            style={{ color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <XIcon size={12} /> Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
