/**
 * Wanderer South India - Testimonials Service
 * Communicates with backend endpoints:
 * GET    /api/v1/testimonials
 * GET    /api/v1/testimonials/{id}
 * POST   /api/v1/testimonials
 * PUT    /api/v1/testimonials/{id}
 * DELETE /api/v1/testimonials/{id}
 */

import client from '../api/client';

export const testimonialService = {
  /**
   * List testimonials with optional search, filters, sorting, and pagination.
   * Defaults to status=active for public callers; admin UI passes status=all explicitly.
   * @param {Object} [params]
   * @returns {Promise<Array & { items: any[], pagination: any }>}
   */
  getTestimonials: async (params = {}) => {
    const query = { sort_by: 'display_order', order: 'ASC', ...params };

    if (!('status' in params)) {
      query.status = 'active';
    } else if (params.status === '' || params.status === 'all') {
      delete query.status;
    }

    if (params.search === '') delete query.search;

    const response = await client.get('/testimonials', query);
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
   * Get complete details for a single testimonial by numeric ID
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getTestimonial: async (id) => {
    const response = await client.get(`/testimonials/${id}`);
    return response.data;
  },

  /**
   * Create a new testimonial
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createTestimonial: async (data) => {
    const response = await client.post('/testimonials', data);
    return response.data;
  },

  /**
   * Update an existing testimonial
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateTestimonial: async (id, data) => {
    const response = await client.put(`/testimonials/${id}`, data);
    return response.data;
  },

  /**
   * Delete a testimonial (reversible soft-delete or force permanent)
   * @param {number|string} id
   * @param {boolean} [force=false]
   * @returns {Promise<any>}
   */
  deleteTestimonial: async (id, force = false) => {
    const query = force ? { force: 'true' } : {};
    const response = await client.delete(`/testimonials/${id}`, query);
    return response.data;
  },
};

export default testimonialService;
