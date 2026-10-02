/**
 * Wanderer South India - User & Staff Management Service
 * Communicates with backend endpoints:
 * GET    /api/v1/users
 * GET    /api/v1/users/stats
 * POST   /api/v1/users
 * GET    /api/v1/users/:id
 * PUT    /api/v1/users/:id
 * POST   /api/v1/users/:id/activate
 * POST   /api/v1/users/:id/deactivate
 * DELETE /api/v1/users/:id
 */

import client from '../api/client';

export const userService = {
  /**
   * List staff/users with pagination, search, status, and role filters
   * @param {Object} params
   * @returns {Promise<{data: Array, meta: Object, stats: Object}>}
   */
  getUsers: async (params = {}) => {
    const response = await client.get('/users', { params });
    return response.data;
  },

  /**
   * Get aggregate user and staff statistics
   * @returns {Promise<Object>}
   */
  getUserStats: async () => {
    const response = await client.get('/users/stats');
    return response.data;
  },

  /**
   * Get single user details by ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getUser: async (id) => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new staff / user account
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  createUser: async (userData) => {
    const response = await client.post('/users', userData);
    return response.data;
  },

  /**
   * Update an existing user account
   * @param {number|string} id
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  updateUser: async (id, userData) => {
    const response = await client.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Activate user account
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  activateUser: async (id) => {
    const response = await client.post(`/users/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate / disable user account
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  deactivateUser: async (id) => {
    const response = await client.post(`/users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Soft-delete user account
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deleteUser: async (id) => {
    const response = await client.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
