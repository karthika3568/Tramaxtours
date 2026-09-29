import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourService from '../../../services/tourService';
import TourCard from '../tours/TourCard';
import Loading from '../../ui/Loading';

const FALLBACK_POPULAR_TOURS = [
  {
    id: 'fb-maha',
    title: 'Mahabalipuram Day Tour',
    slug: 'mahabalipuram-day-tour',
    destination: { name: 'Mahabalipuram' },
    featured_image: '/uploads/media/demo_tamilnadu_mahabalipuram.jpg',
    rating: 0.0,
    reviews_count: 0,
    categories: [
      { name: 'City Sightseeing Tours' },
      { name: 'Cultural & Heritage Tours' },
      { name: 'Guided Tours' },
      { name: 'Historical Tours' },
      { name: 'One Day Tours' },
      { name: 'Private Tours' },
    ],
  },
  {
    id: 'fb-kanchi',
    title: 'Kanchipuram Day Tour',
    slug: 'kanchipuram-day-tour',
    destination: { name: 'Kanchipuram' },
    featured_image: '/uploads/media/demo_tamilnadu_kanchipuram.jpg',
    rating: 0.0,
    reviews_count: 0,
    categories: [
      { name: 'Cultural & Heritage Tours' },
      { name: 'Guided Tours' },
      { name: 'One Day Tours' },
      { name: 'Pilgrimage / Temple Tours' },
      { name: 'Private Tours' },
    ],
  },
  {
    id: 'fb-pondy',
    title: 'PONDICHERRY DAY TOUR',
    slug: 'pondicherry-day-tour',
    destination: { name: 'Pondicherry (Puducherry)' },
    featured_image: '/uploads/media/demo_tamilnadu_pondicherry.jpg',
    rating: 0.0,
    reviews_count: 0,
    categories: [
      { name: 'City Sightseeing Tours' },
      { name: 'Cultural & Heritage Tours' },
      { name: 'Guided Tours' },
      { name: 'One Day Tours' },
      { name: 'Private Tours' },
    ],
  },
  {
    id: 'fb-chennai',
    title: 'Chennai Day Tour',
    slug: 'chennai-day-tour',
    destination: { name: 'Chennai' },
    featured_image: '/uploads/media/demo_tamilnadu_chennai.jpg',
    rating: 5.0,
    reviews_count: 1,
    categories: [
      { name: 'City Sightseeing Tours' },
      { name: 'Cultural & Heritage Tours' },
      { name: 'Family Tours' },
      { name: 'Guided Tours' },
      { name: 'One Day Tours' },
      { name: 'Private Tours' },
    ],
  },
];

export default function FeaturedTours() {
  const [tours, setTours] = useState(FALLBACK_POPULAR_TOURS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        setIsLoading(true);
        const res = await tourService.getTours({ limit: 12, status: 'published', sort_by: 'display_order', order: 'ASC' });
        const list = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && list.length > 0) {
          setTours(list);
        }
      } catch {
        // Retain fallback list
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
