/**
 * Tramax Tours - Reviews Service
 * Communicates with backend endpoints:
 * GET    /api/v1/reviews
 * GET    /api/v1/reviews/{id}
 * POST   /api/v1/reviews
 * PUT    /api/v1/reviews/{id}
 * DELETE /api/v1/reviews/{id}
 * POST   /api/v1/reviews/{id}/restore
 * POST   /api/v1/reviews/{id}/approve
 * POST   /api/v1/reviews/{id}/reject
 * POST   /api/v1/reviews/{id}/feature
 * POST   /api/v1/reviews/{id}/unfeature
 */

import client from '../api/client';

export const reviewService = {
  /**
   * List customer reviews with optional search, filters, sorting, and pagination
   * @param {Object} [params]
   * @returns {Promise<Array & { items: any[], pagination: any }>}
   */
  getReviews: async (params = {}) => {
    const query = { sort_by: 'created_at', sort_order: 'DESC', ...params };

    // Default to approved only if status is omitted (for public site backwards compatibility)
    if (!('status' in params)) {
      query.status = 'approved';
    } else if (params.status === '' || params.status === 'all') {
      delete query.status;
    }

    if (params.search === '') delete query.search;
    if (params.tour_id === 'all' || params.tour_id === '') delete query.tour_id;
    if (params.rating === 'all' || params.rating === '') delete query.rating;
    if (params.is_featured === 'all' || params.is_featured === '') delete query.is_featured;

    const response = await client.get('/reviews', query);
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
   * Get complete details for a single review by numeric ID
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getReview: async (id) => {
    const response = await client.get(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Create a new review
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createReview: async (data) => {
    const response = await client.post('/reviews', data);
    return response.data;
  },

  /**
   * Update an existing review
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateReview: async (id, data) => {
    const response = await client.put(`/reviews/${id}`, data);
    return response.data;
  },

  /**
   * Delete a review (reversible soft-delete or force permanent)
   * @param {number|string} id
   * @param {boolean} [force=false]
   * @returns {Promise<any>}
   */
  deleteReview: async (id, force = false) => {
    const query = force ? { force: 'true' } : {};
    const response = await client.delete(`/reviews/${id}`, query);
    return response.data;
  },

  /**
   * Restore a soft-deleted review
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  restoreReview: async (id) => {
    const response = await client.post(`/reviews/${id}/restore`);
    return response.data;
  },

  /**
   * Approve a review
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  approveReview: async (id) => {
    const response = await client.post(`/reviews/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a review
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  rejectReview: async (id) => {
    const response = await client.post(`/reviews/${id}/reject`);
    return response.data;
  },

  /**
   * Feature a review
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  featureReview: async (id) => {
    const response = await client.post(`/reviews/${id}/feature`);
    return response.data;
  },

  /**
   * Unfeature a review
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  unfeatureReview: async (id) => {
    const response = await client.post(`/reviews/${id}/unfeature`);
    return response.data;
  },
};

export default reviewService;
