import { lazy, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updatePageMeta } from '../utils/metadata';

export const HomePage = lazy(() => import('../pages/public/HomePage'));
export const DestinationsPage = lazy(() => import('../pages/public/DestinationsPage'));
export const DestinationDetailPage = lazy(() => import('../pages/public/DestinationDetailPage'));
export const ToursPage = lazy(() => import('../pages/public/ToursPage'));
export const TourDetailPage = lazy(() => import('../pages/public/TourDetailPage'));

export const AboutPage = lazy(() => import('../pages/public/AboutPage'));
export const ContactPage = lazy(() => import('../pages/public/ContactPage'));
export const TestimonialsPage = lazy(() => import('../pages/public/TestimonialsPage'));
export const PlanTripPage = lazy(() => import('../pages/public/PlanTripPage'));
export const RequestMyTripPage = lazy(() => import('../pages/public/RequestMyTripPage'));
export const TripRequestSuccessPage = lazy(() => import('../pages/public/TripRequestSuccessPage'));
export const ContentPage = lazy(() => import('../pages/public/ContentPage'));

export const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
export const UserProfilePage = lazy(() => import('../pages/public/UserProfilePage'));

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
