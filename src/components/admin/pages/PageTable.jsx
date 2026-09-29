import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../utils/media';

const SYSTEM_PAGE_SLUGS = ['about-us', 'terms-conditions', 'refund-policy', 'privacy-policy'];

export default function PageTable({
  pages,
  onPublishToggle,
  onDeleteClick,
  canManage = true,
  actionLoadingId = null,
}) {
  if (!pages || pages.length === 0) {
    return null;
  }

  const getPublicUrl = (slug) => {
    if (slug === 'about-us') return '/about';
    return `/pages/${slug}`;
  };

  return (
    <div className="admin-table-container">
      {/* Desktop Table View */}
      <div className="admin-desktop-table-wrapper">
        <table className="admin-data-table" aria-label="CMS Pages">
          <thead>
            <tr>
              <th scope="col" style={{ width: '70px' }}>
                Hero
              </th>
              <th scope="col">Page Title & Slug</th>
              <th scope="col" style={{ width: '120px' }}>
                Status
              </th>
              <th scope="col">SEO Meta</th>
              <th scope="col" style={{ width: '140px' }}>
                Last Updated
              </th>
              <th scope="col" style={{ width: '220px', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const heroThumb = getMediaUrl(page.hero_media);
              const isSystemPage = SYSTEM_PAGE_SLUGS.includes(page.slug);
              const isPublished = page.status === 'published';
              const isLoading = actionLoadingId === page.id;
              const publicUrl = getPublicUrl(page.slug);

              return (
                <tr key={page.id} className="admin-table-row">
                  {/* Hero Thumbnail */}
                  <td className="dest-table-thumb-cell">
                    <div className="table-row-thumb">
                      {heroThumb ? (
                        <img
                          src={heroThumb}
                          alt={page.title}
                          loading="lazy"
                          className="table-thumb-img"
                        />
                      ) : (
                        <div className="table-thumb-fallback">
                          <span aria-hidden="true">📄</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Slug */}
                  <td className="dest-table-name-cell">
                    <div className="dest-table-name-wrapper">
                      <div className="dest-table-title-row">
                        <Link
                          to={canManage ? `/admin/pages/${page.id}/edit` : '#'}
                          className="dest-table-title-link"
                        >
                          <strong>{page.title}</strong>
                        </Link>
                        {isSystemPage && (
                          <span
                            className="admin-badge admin-badge-neutral"
                            title="System Managed Core Page"
                          >
                            System
                          </span>
                        )}
                      </div>
                      {page.subtitle && (
                        <span className="dest-table-country text-muted">
                          {page.subtitle}
                        </span>
                      )}
                      <span className="dest-table-slug text-muted">
                        <code>/{page.slug}</code>
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`admin-badge ${
                        isPublished ? 'admin-badge-success' : 'admin-badge-draft'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  {/* SEO Metadata Indicator */}
                  <td>
                    <div className="page-seo-preview-cell">
                      {page.seo_title ? (
                        <span className="page-seo-title-preview" title={page.seo_title}>
                          🏷️ {page.seo_title}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                          Default Title
                        </span>
                      )}
                      {page.seo_description && (
                        <span
                          className="page-seo-desc-preview text-muted"
                          title={page.seo_description}
                        >
                          {page.seo_description.length > 55
                            ? `${page.seo_description.substring(0, 55)}...`
                            : page.seo_description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated Date */}
                  <td className="text-muted" style={{ fontSize: '0.8125rem' }}>
                    {page.updated_at
                      ? new Date(page.updated_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-row-actions">
                      {/* Public View Link */}
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-action-icon"
                        title="View Public Page (opens in new tab)"
                        aria-label={`View public page ${page.title}`}
                      >
                        👁️
                      </a>

                      {/* Edit */}
                      {canManage && (
                        <Link
                          to={`/admin/pages/${page.id}/edit`}
                          className="btn-action-icon"
                          title="Edit CMS Page"
                          aria-label={`Edit ${page.title}`}
                        >
                          ✏️
                        </Link>
                      )}

                      {/* Publish / Unpublish Toggle */}
                      {canManage && (
                        <button
                          type="button"
                          className={`btn-action-icon ${
                            isPublished ? 'action-unpublish' : 'action-publish'
                          }`}
                          title={isPublished ? 'Unpublish (set to Draft)' : 'Publish Page'}
                          aria-label={isPublished ? 'Unpublish page' : 'Publish page'}
                          onClick={() => onPublishToggle(page)}
                          disabled={isLoading}
                        >
                          {isLoading ? '⏳' : isPublished ? '⏸️' : '🚀'}
                        </button>
                      )}

                      {/* Delete */}
                      {canManage && (
                        <button
                          type="button"
                          className="btn-action-icon action-delete"
                          title="Delete Page"
                          aria-label={`Delete ${page.title}`}
                          onClick={() => onDeleteClick(page)}
                          disabled={isLoading}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="admin-mobile-card-list">
        {pages.map((page) => {
          const heroThumb = getMediaUrl(page.hero_media);
          const isSystemPage = SYSTEM_PAGE_SLUGS.includes(page.slug);
          const isPublished = page.status === 'published';
          const isLoading = actionLoadingId === page.id;
          const publicUrl = getPublicUrl(page.slug);

          return (
            <div key={page.id} className="admin-mobile-card">
              <div className="admin-mobile-card-header">
                <div className="admin-mobile-card-thumb">
                  {heroThumb ? (
                    <img src={heroThumb} alt={page.title} loading="lazy" />
                  ) : (
                    <span>📄</span>
                  )}
                </div>

                <div className="admin-mobile-card-title-group">
                  <div className="dest-table-title-row">
                    <h3 className="admin-mobile-card-title">{page.title}</h3>
                    {isSystemPage && (
                      <span className="admin-badge admin-badge-neutral">System</span>
                    )}
                  </div>
                  <span className="dest-table-slug text-muted">
                    <code>/{page.slug}</code>
                  </span>
                </div>

                <span
                  className={`admin-badge ${
                    isPublished ? 'admin-badge-success' : 'admin-badge-draft'
                  }`}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {page.subtitle && (
                <p className="admin-mobile-card-subtitle">{page.subtitle}</p>
              )}

              <div className="admin-mobile-card-meta">
                <span className="text-muted">
                  Updated:{' '}
                  {page.updated_at
                    ? new Date(page.updated_at).toLocaleDateString()
                    : '—'}
                </span>
                {page.seo_title && (
                  <span className="admin-badge admin-badge-subtle">
                    SEO: {page.seo_title}
                  </span>
                )}
              </div>

              <div className="admin-mobile-card-actions">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  👁️ View Public
                </a>

                {canManage && (
                  <Link
                    to={`/admin/pages/${page.id}/edit`}
                    className="btn btn-primary btn-sm"
                  >
                    ✏️ Edit
                  </Link>
                )}

                {canManage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => onPublishToggle(page)}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Updating...'
                      : isPublished
                      ? '⏸️ Unpublish'
                      : '🚀 Publish'}
                  </button>
                )}

                {canManage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-delete-danger"
                    onClick={() => onDeleteClick(page)}
                    disabled={isLoading}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
