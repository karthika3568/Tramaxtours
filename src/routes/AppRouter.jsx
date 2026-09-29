import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import PermissionRoute from './PermissionRoute';

import LoginPage from '../pages/auth/LoginPage';
import ForbiddenPage from '../pages/ForbiddenPage';

import {
  HomePage,
  DestinationsPage,
  DestinationDetailPage,
  ToursPage,
  TourDetailPage,
  AboutPage,
  ContactPage,
  ContentPage,
  UserProfilePage,
  NotFoundPage,
} from './PublicRoutes';

import {
  AdminDashboardPage,
  AdminHomePageManager,
  AdminNavigationPage,
  AdminHeroSlidesPage,
  AdminCmsSectionsPage,
  AdminHomeBenefitsPage,
  AdminAboutPageManager,
  AdminContactPageManager,
  AdminFooterManagerPage,
  AdminMediaPage,
  AdminDestinationsPage,
  AdminDestinationFormPage,
  AdminToursPage,
  AdminTourFormPage,
  AdminPagesPage,
  AdminPageFormPage,
  AdminBookingsPage,
  AdminInquiriesPage,
  AdminUsersPage,
  AdminUserFormPage,
  AdminRolesPage,
  AdminReviewsPage,
  AdminSettingsPage,
  AdminFooterLinksPage,
  AdminSocialLinksPage,
} from './AdminRoutes';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with PublicLayout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="destinations/:slug" element={<DestinationDetailPage />} />
          <Route path="tour-destination" element={<DestinationsPage />} />
          <Route path="tour-destination/:slug" element={<DestinationDetailPage />} />
          <Route path="tours" element={<ToursPage />} />
          <Route path="tours/:slug" element={<TourDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="terms" element={<ContentPage defaultSlug="terms-conditions" />} />
          <Route path="terms-conditions" element={<ContentPage defaultSlug="terms-conditions" />} />
          <Route path="terms-and-conditions" element={<ContentPage defaultSlug="terms-conditions" />} />
          <Route path="privacy" element={<ContentPage defaultSlug="privacy-policy" />} />
          <Route path="privacy-policy" element={<ContentPage defaultSlug="privacy-policy" />} />
          <Route path="refund" element={<ContentPage defaultSlug="refund-policy" />} />
          <Route path="refunds" element={<ContentPage defaultSlug="refund-policy" />} />
          <Route path="refund-policy" element={<ContentPage defaultSlug="refund-policy" />} />
          <Route path="cancellation-policy" element={<ContentPage defaultSlug="refund-policy" />} />
          <Route path="pages/:slug" element={<ContentPage />} />
          <Route path="my-bookings" element={<UserProfilePage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Access Denied / 403 Forbidden Route */}
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Protected Admin Routes with RBAC Permission Checks */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <PermissionRoute permission="dashboard.view">
                <AdminDashboardPage />
              </PermissionRoute>
            }
          />

          {/* Website Visual CMS Suite (Phase 8N) */}
          {/* The old Website Overview hub page was removed as unnecessary UI
              (Part 21) — this route now just redirects any existing links to
              it (nav bookmarks, breadcrumbs) to the main dashboard instead of
              404ing. */}
          <Route path="website" element={<Navigate to="/admin" replace />} />
          <Route
            path="website/home"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHomePageManager />
              </PermissionRoute>
            }
          />
          <Route
            path="homepage"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHomePageManager />
              </PermissionRoute>
            }
          />
          <Route
            path="homepage-editor"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHomePageManager />
              </PermissionRoute>
            }
          />
          <Route
            path="website/navigation"
            element={
              <PermissionRoute permission="settings.view">
                <AdminNavigationPage />
              </PermissionRoute>
            }
          />
          <Route
            path="website/home/hero"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHeroSlidesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="website/home/sections"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminCmsSectionsPage />
              </PermissionRoute>
            }
          />
          <Route
            path="website/home/benefits"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHomeBenefitsPage />
              </PermissionRoute>
            }
          />
          <Route
            path="website/about"
            element={
              <PermissionRoute permission="pages.manage">
                <AdminAboutPageManager />
              </PermissionRoute>
            }
          />
          <Route
            path="website/contact"
            element={
              <PermissionRoute permission="settings.view">
                <AdminContactPageManager />
              </PermissionRoute>
            }
          />
          <Route
            path="website/footer"
            element={
              <PermissionRoute permission="footer.manage">
                <AdminFooterManagerPage />
              </PermissionRoute>
            }
          />

          {/* Media Library */}
          <Route
            path="media"
            element={
              <PermissionRoute permission="media.view">
                <AdminMediaPage />
              </PermissionRoute>
            }
          />

          {/* Destinations Management */}
          <Route
            path="destinations"
            element={
              <PermissionRoute permission="destinations.view">
                <AdminDestinationsPage />
              </PermissionRoute>
            }
          />
          <Route
            path="destinations/new"
            element={
              <PermissionRoute permission="destinations.create">
                <AdminDestinationFormPage mode="create" />
              </PermissionRoute>
            }
          />
          <Route
            path="destinations/:id/edit"
            element={
              <PermissionRoute permission="destinations.edit">
                <AdminDestinationFormPage mode="edit" />
              </PermissionRoute>
            }
          />

          {/* Tours Management */}
          <Route
            path="tours"
            element={
              <PermissionRoute permission="tours.view">
                <AdminToursPage />
              </PermissionRoute>
            }
          />
          <Route
            path="tours/new"
            element={
              <PermissionRoute permission="tours.create">
                <AdminTourFormPage mode="create" />
              </PermissionRoute>
            }
          />
          <Route
            path="tours/:id/edit"
            element={
              <PermissionRoute permission="tours.edit">
                <AdminTourFormPage mode="edit" />
              </PermissionRoute>
            }
          />



          {/* Pages Management */}
          <Route
            path="pages"
            element={
              <PermissionRoute permission="pages.manage">
                <AdminPagesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="pages/new"
            element={
              <PermissionRoute permission="pages.manage">
                <AdminPageFormPage mode="create" />
              </PermissionRoute>
            }
          />
          <Route
            path="pages/:id/edit"
            element={
              <PermissionRoute permission="pages.manage">
                <AdminPageFormPage mode="edit" />
              </PermissionRoute>
            }
          />

          {/* Bookings Management */}
          <Route
            path="bookings"
            element={
              <PermissionRoute permission="bookings.view">
                <AdminBookingsPage />
              </PermissionRoute>
            }
          />

          {/* Customer Inquiries & Leads Management */}
          <Route
            path="inquiries"
            element={
              <PermissionRoute permission="contact.view">
                <AdminInquiriesPage />
              </PermissionRoute>
            }
          />

          {/* Staff & User Management */}
          <Route
            path="users"
            element={
              <PermissionRoute permission="users.view">
                <AdminUsersPage />
              </PermissionRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <PermissionRoute permission="users.create">
                <AdminUserFormPage mode="create" />
              </PermissionRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <PermissionRoute permission="users.edit">
                <AdminUserFormPage mode="edit" />
              </PermissionRoute>
            }
          />

          {/* Roles & Permissions */}
          <Route
            path="roles"
            element={
              <PermissionRoute permission="roles.view">
                <AdminRolesPage />
              </PermissionRoute>
            }
          />

          {/* Direct Homepage Module Routes */}
          <Route
            path="cms-sections"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminCmsSectionsPage />
              </PermissionRoute>
            }
          />
          <Route
            path="home-hero-slides"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHeroSlidesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="home-benefits"
            element={
              <PermissionRoute permission="homepage.manage">
                <AdminHomeBenefitsPage />
              </PermissionRoute>
            }
          />

          {/* Reviews Management */}
          <Route
            path="reviews"
            element={
              <PermissionRoute permission="reviews.view">
                <AdminReviewsPage />
              </PermissionRoute>
            }
          />

          {/* System & Global Links */}
          <Route
            path="settings"
            element={
              <PermissionRoute permission="settings.view">
                <AdminSettingsPage />
              </PermissionRoute>
            }
          />
          <Route
            path="footer-links"
            element={
              <PermissionRoute permission="footer.manage">
                <AdminFooterLinksPage />
              </PermissionRoute>
            }
          />
          <Route
            path="social-links"
            element={
              <PermissionRoute permission="social.manage">
                <AdminSocialLinksPage />
              </PermissionRoute>
            }
          />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
