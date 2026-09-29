/**
 * Tramax Tours - Storage Utilities
 * Token and local storage helper functions for future auth handling (Phase 3).
 */

const ACCESS_TOKEN_KEY = 'tramax_access_token';
const REFRESH_TOKEN_KEY = 'tramax_refresh_token';

/**
 * Retrieve the current stored access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Store access token in localStorage.
 * @param {string} token
 */
export function setAccessToken(token) {
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Storage access might be restricted
  }
}

/**
 * Remove stored access token.
 */
export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Storage access might be restricted
  }
}

/**
 * Retrieve the current stored refresh token.
 * @returns {string|null}
 */
export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Store refresh token in localStorage.
 * @param {string} token
 */
export function setRefreshToken(token) {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // Storage access might be restricted
  }
}

/**
 * Remove stored refresh token.
 */
export function removeRefreshToken() {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Storage access might be restricted
  }
}

/**
 * Clear all authentication tokens.
 */
export function clearTokens() {
  removeAccessToken();
  removeRefreshToken();
}
