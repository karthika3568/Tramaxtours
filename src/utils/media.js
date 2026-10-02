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

  // If already absolute or data URI
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Derive backend origin
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api/v1';
  const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendOrigin}${cleanPath}`;
}

export default getMediaUrl;
