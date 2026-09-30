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

const QUICK_DESTINATIONS = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Goa'];

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

  const handleSelectQuickDest = (name) => {
    if (appliedSearch.toLowerCase() === name.toLowerCase()) {
      handleClearSearch();
    } else {
      setSearchQuery(name);
      setAppliedSearch(name);
      setCurrentPage(1);
      setSearchParams({ search: name, page: '1' });
    }
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
          <div className="catalog-search-wrapper">
            <form onSubmit={handleSearchSubmit} className="catalog-search-form" role="search">
              <div className="search-input-group">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search destinations (e.g. Tamil Nadu, Kerala, Karnataka, Goa)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search destinations"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search input"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary search-submit-btn">
                Search
              </button>
            </form>

            {/* Quick Filter Destination Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={handleClearSearch}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  !appliedSearch
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                All Destinations
              </button>
              {QUICK_DESTINATIONS.map((q) => {
                const isSelected = appliedSearch.toLowerCase() === q.toLowerCase();
                return (
                  <button
                    type="button"
                    key={q}
                    onClick={() => handleSelectQuickDest(q)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
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
