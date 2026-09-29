import { Link } from 'react-router-dom';

/**
 * Determine whether a given URL is external
 */
function isExternalUrl(url, isExternalFlag) {
  if (isExternalFlag === 1 || isExternalFlag === true) return true;
  if (!url) return false;
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

export default function FooterLinks({ title, links = [], className = '' }) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={`footer-column ${className}`.trim()}>
      {title && <h4 className="footer-column-title">{title}</h4>}
      <ul className="footer-links-list">
        {links.map((link) => {
          const external = isExternalUrl(link.url, link.is_external);

          return (
            <li key={link.id || link.label} className="footer-link-item">
              {external ? (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-nav-link external-link"
                >
                  <span>{link.label}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link to={link.url} className="footer-nav-link">
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
