/**
 * Wanderer South India - Trip Requests Service
 * Communicates with backend endpoints:
 * POST   /api/v1/trip-requests
 * GET    /api/v1/trip-requests
 * GET    /api/v1/trip-requests/kpi-summary
 * GET    /api/v1/trip-requests/reference/{referenceId}
 * GET    /api/v1/trip-requests/{id}
 * PATCH  /api/v1/trip-requests/{id}
 * PATCH  /api/v1/trip-requests/{id}/status
 * POST   /api/v1/trip-requests/{id}/notes
 * GET    /api/v1/trip-requests/{id}/timeline
 * GET    /api/v1/trip-requests/{id}/documents/{documentId}/download
 * DELETE /api/v1/trip-requests/{id}
 */

import client from '../api/client';
import { getAccessToken } from '../utils/storage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api/v1').replace(/\/+$/, '');

export const tripRequestService = {
  /**
   * Submit a new trip request. Public — no auth required.
   * @param {Object|FormData} data
   * @returns {Promise<any>}
   */
  submitTripRequest: async (data) => {
    const response = await client.post('/trip-requests', data, { requiresAuth: false });
    return response.data;
  },

  /**
   * Public safe-fields-only lookup by reference ID.
   * @param {string} referenceId
   * @returns {Promise<any>}
   */
  getByReference: async (referenceId) => {
    const response = await client.get(`/trip-requests/reference/${referenceId}`, null, { requiresAuth: false });
    return response.data;
  },

  /**
   * List trip requests with admin filters and pagination.
   * @param {Object} [params]
   * @returns {Promise<Array & { items: any[], pagination: any }>}
   */
  getTripRequests: async (params = {}) => {
    const query = { sort_by: 'created_at', order: 'DESC', ...params };
    if (params.status === '' || params.status === 'all') delete query.status;
    if (params.search === '') delete query.search;

    const response = await client.get('/trip-requests', query);
    const items = response.data || [];
    const pagination = response.pagination || {
      total: items.length,
      page: 1,
      limit: items.length,
      total_pages: 1,
    };

    const result = [...items];
    result.items = items;
    result.pagination = pagination;
    return result;
  },

  /**
   * KPI counts by status.
   * @returns {Promise<any>}
   */
  getKpiSummary: async () => {
    const response = await client.get('/trip-requests/kpi-summary');
    return response.data;
  },

  /**
   * Full detail including status history and document metadata.
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getTripRequest: async (id) => {
    const response = await client.get(`/trip-requests/${id}`);
    return response.data;
  },

  /**
   * Update editable fields (not status).
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateTripRequest: async (id, data) => {
    const response = await client.patch(`/trip-requests/${id}`, data);
    return response.data;
  },

  /**
   * Change status with an optional note, logged to history.
   * @param {number|string} id
   * @param {string} status
   * @param {string} [note]
   * @returns {Promise<any>}
   */
  updateStatus: async (id, status, note = '') => {
    const response = await client.patch(`/trip-requests/${id}/status`, { status, note });
    return response.data;
  },

  /**
   * Append an admin note without changing status.
   * @param {number|string} id
   * @param {string} note
   * @returns {Promise<any>}
   */
  addNote: async (id, note) => {
    const response = await client.post(`/trip-requests/${id}/notes`, { note });
    return response.data;
  },

  /**
   * Full status-change timeline.
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getTimeline: async (id) => {
    const response = await client.get(`/trip-requests/${id}/timeline`);
    return response.data;
  },

  /**
   * Download a protected document as a Blob (binary — bypasses the JSON-oriented
   * API client) and trigger a browser save. Requires an authenticated admin token.
   * @param {number|string} id
   * @param {number|string} documentId
   * @param {string} [filename]
   * @returns {Promise<void>}
   */
  downloadDocument: async (id, documentId, filename = 'document') => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}/trip-requests/${id}/documents/${documentId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      throw new Error('Failed to download document.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Soft-delete a trip request.
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deleteTripRequest: async (id) => {
    const response = await client.delete(`/trip-requests/${id}`);
    return response.data;
  },
};

export default tripRequestService;
