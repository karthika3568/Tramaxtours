/**
 * Wanderer South India - Pages & Policy CMS Service
 * Communicates with backend endpoints:
 * GET    /api/v1/pages
 * GET    /api/v1/pages/{idOrSlug}
 * POST   /api/v1/pages
 * PUT    /api/v1/pages/{id}
 * DELETE /api/v1/pages/{id}
 * POST   /api/v1/pages/{id}/restore
 * POST   /api/v1/pages/{id}/publish
 * POST   /api/v1/pages/{id}/unpublish
 */

import client from '../api/client';

export const pageService = {
  /**
   * List pages with optional search, status, sorting, and pagination
   * @param {Object} [params]
   * @returns {Promise<Array & { items: any[], pagination: any }>}
   */
  getPages: async (params = {}) => {
    const query = { sort_by: 'created_at', sort_order: 'DESC', ...params };

    // Default to published only if status is omitted (for public site backwards compatibility)
    if (!('status' in params)) {
      query.status = 'published';
    } else if (params.status === '' || params.status === 'all') {
      delete query.status;
    }

    if (params.search === '') {
      delete query.search;
    }

    const response = await client.get('/pages', query);
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
   * Retrieve complete details for a single page by slug or numeric ID
   * @param {string|number} slugOrId
   * @returns {Promise<any>}
   */
  getPage: async (slugOrId) => {
    const response = await client.get(`/pages/${encodeURIComponent(slugOrId)}`);
    return response.data;
  },

  /**
   * Create a new page
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createPage: async (data) => {
    const response = await client.post('/pages', data);
    return response.data;
  },

  /**
   * Update an existing page
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updatePage: async (id, data) => {
    const response = await client.put(`/pages/${id}`, data);
    return response.data;
  },

  /**
   * Delete a page (reversible soft delete by default, or force delete if force=true)
   * @param {number|string} id
   * @param {boolean} [force=false]
   * @returns {Promise<any>}
   */
  deletePage: async (id, force = false) => {
    const query = force ? { force: 'true' } : {};
    const response = await client.delete(`/pages/${id}`, query);
    return response.data;
  },

  /**
   * Restore a soft-deleted page
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  restorePage: async (id) => {
    const response = await client.post(`/pages/${id}/restore`);
    return response.data;
  },

  /**
   * Publish a page
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  publishPage: async (id) => {
    const response = await client.post(`/pages/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublish a page (revert to draft status)
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  unpublishPage: async (id) => {
    const response = await client.post(`/pages/${id}/unpublish`);
    return response.data;
  },
};

export default pageService;
