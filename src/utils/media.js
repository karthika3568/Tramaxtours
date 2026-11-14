/**
 * Wanderer South India - Media & Image URL Helper
 * Resolves media paths from backend Media API or relative paths to fully-qualified URLs.
 */

import defaultHeroFallback from '../assets/hero.png';

export { defaultHeroFallback };

/**
 * Resolve a media object, file_path, or URL to a complete browser URL.
 * @param {Object|string|null} mediaOrPath
 * @param {string} [fallback]
 * @returns {string}
 */
export function getMediaUrl(mediaOrPath, fallback = defaultHeroFallback) {
  if (!mediaOrPath) return fallback;

  let path = '';
  if (typeof mediaOrPath === 'string') {
    path = mediaOrPath.trim();
  } else if (typeof mediaOrPath === 'object') {
    path = (mediaOrPath.url || mediaOrPath.file_path || '').trim();
  }

  if (!path) return fallback;

  // If already absolute or data URI
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    // If it points to local development port (e.g., localhost:8000), strip origin to point to active backend
    if (path.includes('localhost') || path.includes('127.0.0.1')) {
      try {
        const parsed = new URL(path);
        path = parsed.pathname;
      } catch {
        path = path.replace(/^https?:\/\/[^/]+/, '');
      }
    } else {
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && path.startsWith('http://')) {
        return path.replace(/^http:\/\//, 'https://');
      }
      return path;
    }
  }

  // Frontend public/asset static files should remain relative
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (
    cleanPath.startsWith('/assets/') ||
    cleanPath.startsWith('/images/') ||
    cleanPath.startsWith('/brand-') ||
    cleanPath === '/logo.png' ||
    cleanPath === '/favicon.ico' ||
    cleanPath.startsWith('/@')
  ) {
    return cleanPath;
  }

  // Derive active backend origin (e.g. https://tour.ethiodeploy.app or http://localhost:8000)
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://tour.ethiodeploy.app/api/v1';
  const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');

  return `${backendOrigin}${cleanPath}`;
}

export default getMediaUrl;
