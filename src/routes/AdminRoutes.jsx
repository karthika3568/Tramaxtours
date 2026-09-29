import { useEffect } from 'react';
import { updatePageMeta } from '../utils/metadata';

function AdminPlaceholderView({ title, description, domainName }) {
  useEffect(() => {
    updatePageMeta({
      title: `Admin - ${title}`,
      description: `Manage ${domainName} in Tramax Tours administration portal`,
    });
  }, [title, domainName]);

  return (
    <div className="admin-module-placeholder">
      <div className="admin-module-header">
        <div>
          <span className="placeholder-badge">Admin Domain: {domainName}</span>
          <h1 className="admin-page-title">{title}</h1>
        </div>
      </div>

      <div className="placeholder-card">
        <p className="placeholder-subtitle">{description}</p>
        <div className="placeholder-info">
          <p>
            Backend APIs for <strong>{domainName}</strong> are verified (Phases 1–14).
          </p>
        </div>
      </div>
    </div>
  );
}

// Authentication & Core Dashboards
export { default as AdminLoginPage } from '../pages/auth/LoginPage';
export { default as AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

// Visual Website Management Suite (Phase 8N)
export { default as AdminWebsiteOverviewPage } from '../pages/admin/AdminWebsiteOverviewPage';
export { default as AdminHomePageManager } from '../pages/admin/AdminHomePageManager';
export { default as AdminNavigationPage } from '../pages/admin/AdminNavigationPage';
export { default as AdminHeroSlidesPage } from '../pages/admin/AdminHeroSlidesPage';
export { default as AdminCmsSectionsPage } from '../pages/admin/AdminCmsSectionsPage';
export { default as AdminHomeBenefitsPage } from '../pages/admin/AdminHomeBenefitsPage';
export { default as AdminAboutPageManager } from '../pages/admin/AdminAboutPageManager';
export { default as AdminContactPageManager } from '../pages/admin/AdminContactPageManager';
export { default as AdminFooterManagerPage } from '../pages/admin/AdminFooterManagerPage';

// Media & Asset Management
export { default as AdminMediaPage } from '../pages/admin/AdminMediaPage';

// Catalog & Content Operations
export { default as AdminDestinationsPage } from '../pages/admin/AdminDestinationsPage';
export { default as AdminDestinationFormPage } from '../pages/admin/AdminDestinationFormPage';

export { default as AdminToursPage } from '../pages/admin/AdminToursPage';
export { default as AdminTourFormPage } from '../pages/admin/AdminTourFormPage';

export { default as AdminPagesPage } from '../pages/admin/AdminPagesPage';
export { default as AdminPageFormPage } from '../pages/admin/AdminPageFormPage';

export { default as AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
export { default as AdminReviewsPage } from '../pages/admin/AdminReviewsPage';

// Access Control & Staff
export { default as AdminUsersPage } from '../pages/admin/AdminUsersPage';
export { default as AdminUserFormPage } from '../pages/admin/AdminUserFormPage';
export { default as AdminRolesPage } from '../pages/admin/AdminRolesPage';

// System Settings Management
export { default as AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
export { default as AdminSocialLinksPage } from '../pages/admin/AdminSocialLinksPage';
export { default as AdminFooterLinksPage } from '../pages/admin/AdminFooterManagerPage';
