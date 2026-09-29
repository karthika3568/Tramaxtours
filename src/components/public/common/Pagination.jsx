export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`pagination-container ${className}`.trim()}
    >
      <div className="pagination-info">
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total records)
        </span>
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-outline btn-sm pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          &larr; Prev
        </button>

        <div className="pagination-numbers">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`pagination-num-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
        >
          Next &rarr;
        </button>
      </div>
    </nav>
  );
}
