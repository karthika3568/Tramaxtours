/**
 * Wanderer South India - Centralized API Client
 * Built on native fetch API with standard token injection,
 * JSON serialization/deserialization, and consistent error handling.
 */

import { getAccessToken } from '../utils/storage';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api/v1'
).replace(/\/+$/, '');

/**
 * Custom API error representation
 */
export class ApiError extends Error {
  constructor(message, status = 500, errors = null, data = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Build URL with query parameters
 * @param {string} endpoint
 * @param {Object} [params]
 * @returns {string}
 */
function buildUrl(endpoint, params) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${cleanEndpoint}`);

  if (params && typeof params === 'object') {
    const queryObj = params.params && typeof params.params === 'object' && !Array.isArray(params.params)
      ? params.params
      : params;

    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Core request handler
 * @param {string} endpoint
 * @param {Object} [options]
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    params = null,
    body = null,
    headers = {},
    requiresAuth = true,
    ...customConfig
  } = options;

  const url = buildUrl(endpoint, params);
  const requestHeaders = new Headers(headers);

  // Set default Accept header
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  // Inject Authorization header if token exists
  if (requiresAuth) {
    const token = getAccessToken();
    if (token && !requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let requestBody = body;

  // Handle JSON vs FormData
  if (body !== null && typeof body === 'object' && !(body instanceof FormData)) {
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    requestBody = JSON.stringify(body);
  }

  const config = {
    method,
    headers: requestHeaders,
    body: requestBody,
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';

    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      let errorMessage =
        (data && data.message) ||
        (data && data.error);

      if (!errorMessage) {
        if (response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.status >= 500) {
          errorMessage = 'Unable to sign in right now. Please try again.';
        } else {
          errorMessage = `Request failed with status ${response.status}`;
        }
      }

      const validationErrors = (data && data.errors) || null;

      throw new ApiError(
        errorMessage,
        response.status,
        validationErrors,
        data,
        false
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network / fetch execution error
    throw new ApiError(
      'Unable to connect to the management server. Please make sure the backend service is running.',
      0,
      null,
      null,
      true
    );
  }
}

/**
 * Standard HTTP verb methods
 */
export const client = {
  get: (endpoint, params = null, options = {}) =>
    request(endpoint, { method: 'GET', params, ...options }),

  post: (endpoint, body = null, options = {}) =>
    request(endpoint, { method: 'POST', body, ...options }),

  put: (endpoint, body = null, options = {}) =>
    request(endpoint, { method: 'PUT', body, ...options }),

  patch: (endpoint, body = null, options = {}) =>
    request(endpoint, { method: 'PATCH', body, ...options }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { method: 'DELETE', ...options }),
};

export default client;
