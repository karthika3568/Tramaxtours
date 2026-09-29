import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import pageService from '../../services/pageService';
import PageHero from '../../components/public/common/PageHero';
import CmsContentRenderer from '../../components/public/common/CmsContentRenderer';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import useAuth from '../../hooks/useAuth';

export default function ContentPage({ defaultSlug = null }) {
  const { slug: paramSlug } = useParams();
  const slug = paramSlug || defaultSlug || 'terms-conditions';
  const { user, hasPermission } = useAuth();
  const canManagePages = hasPermission('pages.manage') || user?.role === 'admin' || user?.role === 'super_admin';

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { footerColumns } = useSiteSettings();

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const data = await pageService.getPage(slug);
        if (!data) {
          throw new Error('The requested page was not found.');
        }

        if (isMounted) {
          setPage(data);

          // Update SEO Metadata
          updatePageMeta({
            title: `${data.seo_title || data.title} — Tramax Tours`,
            description:
              data.seo_description ||
              data.subtitle ||
              `Read about ${data.title} at Tramax Tours.`,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load page content.');
          setPage(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [slug, reloadTrigger]);

  if (loading) {
    return (
      <div className="page-section container">
        <Loading message="Loading page content..." />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="page-section container">
        <ErrorState
          title="Page Not Found"
          message={error || `The page "${slug}" is unavailable or has been unpublished.`}
          retryText="Retry"
          onRetry={() => setReloadTrigger((prev) => prev + 1)}
        />
      </div>
    );
  }

  // Quick navigation policy pages from footer settings if applicable
  const policyPages = footerColumns?.policy_pages || [];

  return (
    <div className="cms-page-wrapper">
      <PageHero
        title={page.title}
        subtitle={page.subtitle}
        badge="Legal & Information"
        breadcrumbs={[{ label: 'Information' }, { label: page.title }]}
        heroMedia={page.hero_media}
      />

      <div className="container cms-body-container">
        {canManagePages && (
          <div className="cms-admin-notice-bar">
            <div className="cms-admin-notice-info">
              <span className="cms-admin-badge">Admin Mode Active</span>
              <span>You have administrative rights to edit and republish this page directly.</span>
            </div>
            <Link
              to={`/admin/pages/${page.id}/edit`}
              className="btn btn-sm btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
            >
              <span>✏️</span> Edit This Page in Admin
            </Link>
          </div>
        )}

        <div className="cms-layout-grid">
          <main className="cms-main-content">
            <article className="cms-article-card">
              <div className="cms-article-header">
                <div>
                  <h2 className="cms-article-title">{page.title}</h2>
                  {page.updated_at && (
                    <span className="cms-last-updated">
                      Last Updated: {new Date(page.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="cms-article-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => window.print()}
                    title="Print this document"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    🖨️ Print / Save PDF
                  </button>
                </div>
              </div>

              <CmsContentRenderer content={page.content} />
            </article>
          </main>

          {/* Sidebar for other policy/information pages */}
          <aside className="cms-sidebar">
            {policyPages.length > 0 && (
              <div className="sidebar-sticky-card cms-nav-card" style={{ marginBottom: '24px' }}>
                <h3 className="sidebar-title">Information & Policies</h3>
                <nav className="cms-sidebar-nav" aria-label="Policy Pages">
                  <ul className="cms-sidebar-links">
                    {policyPages.map((link) => {
                      const isActive = link.url === `/pages/${slug}` || link.url === `/${slug}`;
                      return (
                        <li key={link.id} className="cms-sidebar-item">
                          <Link
                            to={link.url}
                            className={`cms-sidebar-link ${isActive ? 'active' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <span>{link.label}</span>
                            <span className="arrow-icon" aria-hidden="true">&rarr;</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            )}

            <div className="sidebar-sticky-card cms-nav-card">
              <div className="sidebar-inquiry-box">
                <span className="inquiry-box-title">Official Assistance</span>
                <p className="inquiry-box-text">
                  Have questions regarding our policies, booking terms, or refund procedure? Our concierge is available 24/7.
                </p>
                <div style={{ margin: '14px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <div>📞 <a href="tel:+918072566010" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>+91 80725 66010</a></div>
                  <div style={{ marginTop: '4px' }}>📧 <a href="mailto:contact@tramaxtours.in" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>contact@tramaxtours.in</a></div>
                </div>
                <Link to="/contact" className="btn btn-primary btn-sm btn-block">
                  Contact Our Team
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
