export default function ReviewFilters({
  search,
  onSearchChange,
  tourId,
  onTourIdChange,
  toursList = [],
  status,
  onStatusChange,
  rating,
  onRatingChange,
  isFeatured,
  onIsFeaturedChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onReset,
}) {
  const isFiltered =
    Boolean(search) ||
    (tourId && tourId !== 'all') ||
    (status && status !== 'all') ||
    (rating && rating !== 'all') ||
    (isFeatured && isFeatured !== 'all') ||
    sortBy !== 'created_at' ||
    sortOrder !== 'DESC';

  return (
    <div className="destination-filters-toolbar review-filters-toolbar">
      {/* Search Input */}
      <div className="dest-search-group">
        <div className="dest-search-wrapper">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="dest-search-input"
            placeholder="Search reviews by customer name, email, content, or tour..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search customer reviews"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="dest-filter-controls">
        {/* Tour Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="review-tour-select" className="dest-filter-label">
            Tour:
          </label>
          <select
            id="review-tour-select"
            className="dest-filter-select"
            value={tourId}
            onChange={(e) => onTourIdChange(e.target.value)}
          >
            <option value="all">All Tours</option>
            {toursList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="review-status-select" className="dest-filter-label">
            Status:
          </label>
          <select
            id="review-status-select"
            className="dest-filter-select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Moderation</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="review-rating-select" className="dest-filter-label">
            Rating:
          </label>
          <select
            id="review-rating-select"
            className="dest-filter-select"
            value={rating}
            onChange={(e) => onRatingChange(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="review-featured-select" className="dest-filter-label">
            Featured:
          </label>
          <select
            id="review-featured-select"
            className="dest-filter-select"
            value={isFeatured}
            onChange={(e) => onIsFeaturedChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">Featured Only</option>
            <option value="0">Standard Only</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="review-sort-select" className="dest-filter-label">
            Sort:
          </label>
          <select
            id="review-sort-select"
            className="dest-filter-select"
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('_');
              onSortByChange(newSort);
              onSortOrderChange(newOrder);
            }}
          >
            <option value="created_at_DESC">Newest First</option>
            <option value="created_at_ASC">Oldest First</option>
            <option value="rating_DESC">Highest Rating (5 → 1)</option>
            <option value="rating_ASC">Lowest Rating (1 → 5)</option>
            <option value="status_ASC">Status</option>
          </select>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-outline btn-sm dest-reset-filters-btn"
            onClick={onReset}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
