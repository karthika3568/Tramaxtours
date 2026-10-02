import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updatePageMeta } from '../utils/metadata';

export { default as HomePage } from '../pages/public/HomePage';
export { default as DestinationsPage } from '../pages/public/DestinationsPage';
export { default as DestinationDetailPage } from '../pages/public/DestinationDetailPage';
export { default as ToursPage } from '../pages/public/ToursPage';
export { default as TourDetailPage } from '../pages/public/TourDetailPage';

export { default as AboutPage } from '../pages/public/AboutPage';
export { default as ContactPage } from '../pages/public/ContactPage';
export { default as RequestTripPage } from '../pages/public/RequestTripPage';
export { default as ContentPage } from '../pages/public/ContentPage';

export { default as LoginPage } from '../pages/auth/LoginPage';
export { default as UserProfilePage } from '../pages/public/UserProfilePage';

export function NotFoundPage() {
  useEffect(() => {
    updatePageMeta({
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    });
  }, []);

  return (
    <div className="page-section container flex-center">
      <div className="placeholder-card text-center">
        <span className="placeholder-badge badge-warning">404</span>
        <h1 className="placeholder-title">Page Not Found</h1>
        <p className="placeholder-subtitle">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="placeholder-actions">
          <Link to="/" className="btn btn-primary">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
