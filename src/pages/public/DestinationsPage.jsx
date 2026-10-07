import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import destinationService from '../../services/destinationService';
import DestinationCard from '../../components/public/destinations/DestinationCard';
import Breadcrumbs from '../../components/public/common/Breadcrumbs';
import Pagination from '../../components/public/common/Pagination';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { updatePageMeta } from '../../utils/metadata';

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    updatePageMeta({
      title: 'Destinations — Explore South India | Wonderer South India',
      description:
        'Discover breathtaking travel destinations with Wonderer South India. From Tamil Nadu heritage temples to Kerala backwaters, Karnataka palaces, and Goa beaches.',
    });
  }, []);

  // Debounce live typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== appliedSearch) {
        setAppliedSearch(searchQuery.trim());
        setCurrentPage(1);
        const newParams = {};
        if (searchQuery.trim()) newParams.search = searchQuery.trim();
        newParams.page = '1';
        setSearchParams(newParams);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery, appliedSearch, setSearchParams]);

  // Fetch destinations
  useEffect(() => {
    let isMounted = true;
    async function loadDestinations() {
      try {
        setLoading(true);
        setError(null);
        const params = {
          page: currentPage,
          limit: 9,
          search: appliedSearch || undefined,
        };
        const response = await destinationService.getDestinations(params);
        if (isMounted) {
          const items = response.items || (Array.isArray(response) ? response : []);
          setDestinations(items);
          setPagination(
            response.pagination || {
              page: currentPage,
              total_pages: 1,
              total: items.length,
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load destinations. Please try again.');
          setDestinations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, [currentPage, appliedSearch, reloadTrigger]);

  const handleRetry = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchQuery.trim());
    const newParams = {};
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    newParams.page = '1';
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const newParams = {};
    if (appliedSearch) newParams.search = appliedSearch;
    newParams.page = String(newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="destinations-catalog-page">
      {/* Page Header / Hero */}
      <section className="catalog-header-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Destinations' }]} />
          <div className="catalog-header-content">
            <span className="section-badge">World of Wonders</span>
            <h1 className="catalog-page-title">Explore Our Destinations</h1>
            <p className="catalog-page-subtitle">
              Immerse yourself in ancient Dravidian heritage, palm-fringed emerald backwaters, majestic palaces, and sun-kissed beaches.
            </p>
          </div>

          {/* Search Bar inside Destination Page */}
          <div className="catalog-search-wrapper" style={{ maxWidth: '850px', width: '100%', margin: '28px auto 0' }}>
            <form
              onSubmit={handleSearchSubmit}
              className="catalog-search-form"
              role="search"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#ffffff',
                padding: '6px 8px 6px 18px',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1.5px solid #e2e8f0',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div className="search-input-group" style={{ flex: '1 1 auto', position: 'relative', display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <span className="search-icon" aria-hidden="true" style={{ position: 'relative', fontSize: '18px', color: '#1226de', marginRight: '10px', pointerEvents: 'none', flexShrink: 0 }}>🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search destinations by name or state (e.g. Tamil Nadu, Kerala)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search destinations"
                  style={{
                    width: '100%',
                    flex: '1 1 auto',
                    minWidth: 0,
                    padding: '8px 28px 8px 0',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#0f172a',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    borderRadius: 0,
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search input"
                    style={{
                      position: 'absolute',
                      right: '4px',
                      background: '#e2e8f0',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#475569',
                      fontSize: '10px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                style={{
                  padding: '9px 24px',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '14px',
                  height: '40px',
                  minWidth: '90px',
                  width: 'auto',
                  flex: '0 0 auto',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1226de',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(18, 38, 222, 0.3)',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0a178c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1226de'; }}
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Catalog Content Section */}
      <section className="catalog-body-section container">
        {appliedSearch && (
          <div className="search-filter-status">
            <p>
              Showing results for: <strong>&quot;{appliedSearch}&quot;</strong>
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm clear-filter-btn"
              onClick={handleClearSearch}
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="catalog-loading-wrap">
            <Loading message="Fetching destinations..." />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="catalog-error-wrap">
            <ErrorState
              title="Unable to Load Destinations"
              message={error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && destinations.length === 0 && (
          <div className="catalog-empty-wrap">
            <EmptyState
              title="No Destinations Found"
              message={
                appliedSearch
                  ? `No destinations match your search term "${appliedSearch}". Try searching for another location like Tamil Nadu, Kerala, Karnataka, or Goa.`
                  : 'No published destinations are available at this moment. Please check back soon!'
              }
              action={
                appliedSearch ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleClearSearch}
                  >
                    View All Destinations
                  </button>
                ) : null
              }
            />
          </div>
        )}

        {/* Destinations Grid */}
        {!loading && !error && destinations.length > 0 && (
          <>
            <div className="destinations-grid">
              {destinations.map((destination) => (
                <DestinationCard key={destination.slug || destination.id} destination={destination} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <div className="catalog-pagination-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages}
                  totalItems={pagination.total || destinations.length}
                  itemsPerPage={9}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
