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

  useEffect(() => {
    updatePageMeta({
      title: 'Destinations — Explore Sri Lanka & Beyond',
      description:
        'Discover breathtaking travel destinations with Tramax Tours. From tropical golden beaches to misty hill country and wildlife reserves.',
    });
  }, []);

  const [reloadTrigger, setReloadTrigger] = useState(0);

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
              Immerse yourself in rich heritage, pristine coastlines, lush tea plantations, and thrilling safaris curated by local experts.
            </p>
          </div>

          {/* Search Bar */}
          <div className="catalog-search-wrapper">
            <form onSubmit={handleSearchSubmit} className="catalog-search-form" role="search">
              <div className="search-input-group">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search destinations by name or region..."
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
          </div>
        </div>
      </section>

      {/* Catalog Content Section */}
      <section className="catalog-body-section container">
        {appliedSearch && (
          <div className="search-filter-status">
            <p>
              Showing results for: <strong>"{appliedSearch}"</strong>
            </p>
            <button
              type="button"
              className="btn btn-link reset-link-btn"
              onClick={handleClearSearch}
            >
              Reset Search
            </button>
          </div>
        )}

        {loading && (
          <div className="catalog-loading-wrapper">
            <Loading message="Fetching destinations..." />
          </div>
        )}

        {!loading && error && (
          <ErrorState
            title="Unable to Load Destinations"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {!loading && !error && destinations.length === 0 && (
          <EmptyState
            title="No Destinations Found"
            message={
              appliedSearch
                ? `No destinations match your search term "${appliedSearch}". Try searching for another location.`
                : 'No published destinations are available at this moment. Please check back soon!'
            }
            actionText={appliedSearch ? 'Clear Search' : undefined}
            onAction={appliedSearch ? handleClearSearch : undefined}
          />
        )}

        {!loading && !error && destinations.length > 0 && (
          <>
            <div className="destinations-grid">
              {destinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page || currentPage}
              totalPages={pagination.total_pages || 1}
              totalItems={pagination.total || destinations.length}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
