import { lazy } from 'react';

// Authentication & Core Dashboards
export const AdminLoginPage = lazy(() => import('../pages/auth/LoginPage'));
export const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));

// Visual Website Management Suite (Phase 8N)
export const AdminHomePageManager = lazy(() => import('../pages/admin/AdminHomePageManager'));
export const AdminNavigationPage = lazy(() => import('../pages/admin/AdminNavigationPage'));
export const AdminHeroSlidesPage = lazy(() => import('../pages/admin/AdminHeroSlidesPage'));
export const AdminCmsSectionsPage = lazy(() => import('../pages/admin/AdminCmsSectionsPage'));
export const AdminHomeBenefitsPage = lazy(() => import('../pages/admin/AdminHomeBenefitsPage'));
export const AdminAboutPageManager = lazy(() => import('../pages/admin/AdminAboutPageManager'));
export const AdminContactPageManager = lazy(() => import('../pages/admin/AdminContactPageManager'));
export const AdminFooterManagerPage = lazy(() => import('../pages/admin/AdminFooterManagerPage'));

// Media & Asset Management
export const AdminMediaPage = lazy(() => import('../pages/admin/AdminMediaPage'));

// Catalog & Content Operations
export const AdminDestinationsPage = lazy(() => import('../pages/admin/AdminDestinationsPage'));
export const AdminDestinationFormPage = lazy(() => import('../pages/admin/AdminDestinationFormPage'));

export const AdminToursPage = lazy(() => import('../pages/admin/AdminToursPage'));
export const AdminTourFormPage = lazy(() => import('../pages/admin/AdminTourFormPage'));

export const AdminPagesPage = lazy(() => import('../pages/admin/AdminPagesPage'));
export const AdminPageFormPage = lazy(() => import('../pages/admin/AdminPageFormPage'));

export const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage'));
export const AdminInquiriesPage = lazy(() => import('../pages/admin/AdminInquiriesPage'));
export const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));

// Access Control & Staff
export const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
export const AdminUserFormPage = lazy(() => import('../pages/admin/AdminUserFormPage'));
export const AdminRolesPage = lazy(() => import('../pages/admin/AdminRolesPage'));

// System Settings Management
export const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
export const AdminSocialLinksPage = lazy(() => import('../pages/admin/AdminSocialLinksPage'));
export const AdminFooterLinksPage = lazy(() => import('../pages/admin/AdminFooterManagerPage'));
