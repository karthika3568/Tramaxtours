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
    path = mediaOrPath;
  } else if (typeof mediaOrPath === 'object') {
    path = mediaOrPath.url || mediaOrPath.file_path || '';
  }

  if (!path) return fallback;

  // Derive backend origin
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://tour.ethiodeploy.app/api/v1';
  const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');

  // If path contains localhost or 127.0.0.1 (e.g. from local APP_URL in DB), strip origin to use backendOrigin
  if (path.includes('localhost') || path.includes('127.0.0.1')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname;
    } catch {
      path = path.replace(/^https?:\/\/[^/]+/, '');
    }
  }

  // If already absolute or data URI
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && path.startsWith('http://')) {
      return path.replace(/^http:\/\//, 'https://');
    }
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendOrigin}${cleanPath}`;
}

export default getMediaUrl;
