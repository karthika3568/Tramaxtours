export default function DestinationFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
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
    (status && status !== 'all') ||
    (isFeatured && isFeatured !== 'all') ||
    sortBy !== 'display_order' ||
    order !== 'ASC';

  return (
    <div className="destination-filters-toolbar">
      {/* Search Input */}
      <div className="dest-search-group">
        <div className="dest-search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="dest-search-input"
            placeholder="Search destinations by name, slug, or title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search destinations"
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

      {/* Filter Selects */}
      <div className="dest-filter-controls">
        {/* Status Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="dest-status-select" className="dest-filter-label">Status:</label>
          <select
            id="dest-status-select"
            className="dest-filter-select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="dest-featured-select" className="dest-filter-label">Featured:</label>
          <select
            id="dest-featured-select"
            className="dest-filter-select"
            value={isFeatured}
            onChange={(e) => onIsFeaturedChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">Featured Only</option>
            <option value="0">Standard Only</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="dest-sort-select" className="dest-filter-label">Sort:</label>
          <select
            id="dest-sort-select"
            className="dest-filter-select"
            value={`${sortBy}_${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('_');
              onSortByChange(newSort);
              onOrderChange(newOrder);
            }}
          >
            <option value="display_order_ASC">Display Order (Asc)</option>
            <option value="display_order_DESC">Display Order (Desc)</option>
            <option value="name_ASC">Name (A-Z)</option>
            <option value="name_DESC">Name (Z-A)</option>
            <option value="created_at_DESC">Newest First</option>
            <option value="created_at_ASC">Oldest First</option>
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
