import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourService from '../../../services/tourService';
import TourCard from '../tours/TourCard';
import Loading from '../../ui/Loading';

export default function FeaturedTours() {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        setIsLoading(true);
        const res = await tourService.getTours({ limit: 12, status: 'published', sort_by: 'display_order', order: 'ASC' });
        const list = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setTours(list);
        }
      } catch (err) {
        console.warn('Failed to load dynamic tours:', err);
        if (isMounted) {
          setTours([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && tours.length === 0) {
    return null;
  }

  return (
    <section className="popular-activities-section" aria-label="Popular Activities">
      <div className="container popular-activities-container">
        {/* Section Header */}
        <div className="popular-activities-header">
          <h2 className="popular-activities-heading">Popular Activities</h2>
          <Link to="/tours" className="popular-activities-all-link">
            See All Tours &rarr;
          </Link>
        </div>

        {/* Dynamic Tours Grid */}
        {isLoading && tours.length === 0 ? (
          <Loading message="Loading Popular Activities..." />
        ) : (
          <div className="popular-activities-grid">
            {tours.map((tour) => (
              <TourCard key={tour.id || tour.slug} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
