/**
 * Tramax Tours - Destinations Service
 * Communicates with /api/v1/destinations endpoints
 */

import client from '../api/client';

export const destinationService = {
  /**
   * List destinations with optional search, status, sorting, and pagination
   * @param {Object} [params]
   * @returns {Promise<{items: any[], pagination: any}>}
   */
  getDestinations: async (params = {}) => {
    const query = { sort_by: 'display_order', order: 'ASC', ...params };

    // Default to published only if status is completely omitted (for backwards compatibility with public callers)
    if (!('status' in params)) {
      query.status = 'published';
    } else if (params.status === '' || params.status === 'all') {
      delete query.status;
    }

    if (params.is_featured === '' || params.is_featured === 'all') {
      delete query.is_featured;
    }

    const response = await client.get('/destinations', query);
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
   * Get single destination by slug or numeric ID (includes media, gallery, sections, FAQs, and usage references)
   * @param {string|number} slugOrId
   * @returns {Promise<any>}
   */
  getDestination: async (slugOrId) => {
    const response = await client.get(`/destinations/${encodeURIComponent(slugOrId)}`);
    return response.data;
  },

  /**
   * Create a new destination
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createDestination: async (data) => {
    const response = await client.post('/destinations', data);
    return response.data;
  },

  /**
   * Update an existing destination
   * @param {string|number} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateDestination: async (id, data) => {
    const response = await client.put(`/destinations/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete destination (supports soft delete or force delete)
   * @param {string|number} id
   * @param {boolean} [force=false]
   * @returns {Promise<any>}
   */
  deleteDestination: async (id, force = false) => {
    const query = force ? { force: 'true' } : {};
    const response = await client.delete(`/destinations/${encodeURIComponent(id)}`, query);
    return response.data;
  },

  /**
   * Restore a soft-deleted destination
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  restoreDestination: async (id) => {
    const response = await client.post(`/destinations/${encodeURIComponent(id)}/restore`);
    return response.data;
  },

  /**
   * Publish a destination
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  publishDestination: async (id) => {
    const response = await client.post(`/destinations/${encodeURIComponent(id)}/publish`);
    return response.data;
  },

  /**
   * Unpublish a destination (revert to draft)
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  unpublishDestination: async (id) => {
    const response = await client.post(`/destinations/${encodeURIComponent(id)}/unpublish`);
    return response.data;
  },
};

export default destinationService;
