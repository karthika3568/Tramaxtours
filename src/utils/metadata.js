/**
 * Wanderer South India - Page Metadata Utility
 * Sets document title, meta descriptions, and canonical tags dynamically.
 */

/**
 * Update document title and common meta tags.
 * @param {Object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string} [options.canonical]
 * @param {string} [options.ogImage]
 */
export function updatePageMeta({ title, description, canonical, ogImage } = {}) {
  const defaultTitle = 'Wanderer South India — Luxury & Adventure Travel';
  document.title = title ? (title.includes('Wanderer') ? title : `${title} | Wanderer South India`) : defaultTitle;

  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }

  if (ogImage) {
    let metaOgImage = document.querySelector('meta[property="og:image"]');
    if (!metaOgImage) {
      metaOgImage = document.createElement('meta');
      metaOgImage.setAttribute('property', 'og:image');
      document.head.appendChild(metaOgImage);
    }
    metaOgImage.setAttribute('content', ogImage);
  }

  if (canonical) {
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);
  }
}
