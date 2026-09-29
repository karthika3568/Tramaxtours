import { ALLOWED_TOUR_TYPES } from '../../../services/tourService';

export default function TourFilters({
  search,
  onSearchChange,
  destinationId,
  onDestinationChange,
  destinationsList = [],
  status,
  onStatusChange,
  tourType,
  onTourTypeChange,
  isFeatured,
  onIsFeaturedChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  onReset,
}) {
  const isFiltered =
    Boolean(search) ||
    (destinationId && destinationId !== 'all') ||
    (status && status !== 'all') ||
    (tourType && tourType !== 'all') ||
    (isFeatured && isFeatured !== 'all') ||
    sortBy !== 'display_order' ||
    order !== 'ASC';

  return (
    <div className="tour-filter-toolbar-card">
      {/* Search Input */}
      <div className="tour-search-row">
        <div className="tour-search-box">
          <span className="search-lead-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="tour-search-input"
            placeholder="Search tours, destinations or packages..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tours, destinations or packages"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="tour-filter-controls-grid">
        {/* Destination Filter */}
        <div className="filter-select-group">
          <label htmlFor="tour-dest-select" className="filter-group-label">
            <span className="label-icon">📍</span> Destination
          </label>
          <select
            id="tour-dest-select"
            className="filter-select-input"
            value={destinationId}
            onChange={(e) => onDestinationChange(e.target.value)}
          >
            <option value="all">All Destinations</option>
            {destinationsList.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tour Type / Category Filter (Strict 8 locked types) */}
        <div className="filter-select-group">
          <label htmlFor="tour-type-select" className="filter-group-label">
            <span className="label-icon">🧭</span> Category
          </label>
          <select
            id="tour-type-select"
            className="filter-select-input"
            value={tourType}
            onChange={(e) => onTourTypeChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            {ALLOWED_TOUR_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Publication Status Filter */}
        <div className="filter-select-group">
          <label htmlFor="tour-status-select" className="filter-group-label">
            <span className="label-icon">🏷️</span> Status
          </label>
          <select
            id="tour-status-select"
            className="filter-select-input"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Featured Spotlight Filter */}
        <div className="filter-select-group">
          <label htmlFor="tour-featured-select" className="filter-group-label">
            <span className="label-icon">⭐</span> Spotlight
          </label>
          <select
            id="tour-featured-select"
            className="filter-select-input"
            value={isFeatured}
            onChange={(e) => onIsFeaturedChange(e.target.value)}
          >
            <option value="all">All Tours</option>
            <option value="1">Featured Only</option>
            <option value="0">Standard Only</option>
          </select>
        </div>

        {/* Sorting Filter */}
        <div className="filter-select-group">
          <label htmlFor="tour-sort-select" className="filter-group-label">
            <span className="label-icon">⇅</span> Sort By
          </label>
          <select
            id="tour-sort-select"
            className="filter-select-input"
            value={`${sortBy}_${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('_');
              onSortByChange(newSort);
              onOrderChange(newOrder);
            }}
          >
            <option value="display_order_ASC">Display Order (Low → High)</option>
            <option value="display_order_DESC">Display Order (High → Low)</option>
            <option value="title_ASC">Title (A to Z)</option>
            <option value="title_DESC">Title (Z to A)</option>
            <option value="base_price_ASC">Price (Lowest First)</option>
            <option value="base_price_DESC">Price (Highest First)</option>
            <option value="duration_days_ASC">Duration (Shortest)</option>
            <option value="duration_days_DESC">Duration (Longest)</option>
            <option value="created_at_DESC">Newest Created</option>
            <option value="created_at_ASC">Oldest Created</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        {isFiltered && (
          <div className="filter-reset-group">
            <button
              type="button"
              className="btn btn-outline btn-sm btn-clear-filters"
              onClick={onReset}
              title="Clear all active filters"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

