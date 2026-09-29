export default function PageFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onReset,
}) {
  const isFiltered =
    Boolean(search) ||
    (status && status !== 'all') ||
    sortBy !== 'created_at' ||
    sortOrder !== 'DESC';

  return (
    <div className="destination-filters-toolbar page-filters-toolbar">
      {/* Search Input */}
      <div className="dest-search-group">
        <div className="dest-search-wrapper">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="dest-search-input"
            placeholder="Search pages by title, subtitle, slug, or content..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search pages"
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
        {/* Status Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="page-status-select" className="dest-filter-label">
            Status:
          </label>
          <select
            id="page-status-select"
            className="dest-filter-select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="dest-filter-select-wrapper">
          <label htmlFor="page-sort-select" className="dest-filter-label">
            Sort:
          </label>
          <select
            id="page-sort-select"
            className="dest-filter-select"
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('_');
              onSortByChange(newSort);
              onSortOrderChange(newOrder);
            }}
          >
            <option value="created_at_DESC">Newest Created</option>
            <option value="created_at_ASC">Oldest Created</option>
            <option value="updated_at_DESC">Recently Updated</option>
            <option value="title_ASC">Title (A-Z)</option>
            <option value="title_DESC">Title (Z-A)</option>
            <option value="status_ASC">Status (Draft first)</option>
            <option value="status_DESC">Status (Published first)</option>
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
