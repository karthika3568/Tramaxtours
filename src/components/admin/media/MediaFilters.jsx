export default function MediaFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  order,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}) {
  return (
    <div className="media-filters-toolbar">
      {/* Search Input */}
      <div className="media-search-group">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="media-search-input"
          placeholder="Search by filename, alt text, or caption..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search media files"
        />
        {search && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search text"
          >
            ✕
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="media-filter-select-group">
        <label htmlFor="media-type-select" className="sr-only">Filter by media type</label>
        <select
          id="media-type-select"
          className="media-filter-dropdown"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="image">Images Only (JPEG, PNG, WEBP, SVG)</option>
          <option value="document">Documents Only (PDF)</option>
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="media-filter-select-group">
        <label htmlFor="media-sort-select" className="sr-only">Sort media list</label>
        <select
          id="media-sort-select"
          className="media-filter-dropdown"
          value={`${sortBy}_${order}`}
          onChange={(e) => {
            const val = e.target.value;
            const [newSort, newOrder] = val.split('_');
            onSortChange(newSort, newOrder);
          }}
        >
          <option value="id_DESC">Newest Uploads First</option>
          <option value="id_ASC">Oldest Uploads First</option>
          <option value="file_size_DESC">Size: Largest First</option>
          <option value="file_size_ASC">Size: Smallest First</option>
          <option value="original_name_ASC">Name: A to Z</option>
          <option value="original_name_DESC">Name: Z to A</option>
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-outline btn-sm media-reset-btn"
          onClick={onResetFilters}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
