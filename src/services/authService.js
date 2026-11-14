/**
 * Wanderer South India - Authentication Service
 * Communicates with backend endpoints:
 * POST /api/v1/auth/login
 * GET  /api/v1/auth/me
 * POST /api/v1/auth/logout
 */

import client from '../api/client';

export const authService = {
  /**
   * Authenticate user with email and password
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<{token: string, token_type: string, expires_in: number, user: Object}>}
   */
  login: async ({ email, password }) => {
    const response = await client.post('/auth/login', { email, password }, { requiresAuth: false });
    return response.data;
  },

  /**
   * Register a new customer account
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} [data.phone]
   * @param {string} data.password
   * @param {string} [data.password_confirmation]
   * @returns {Promise<{token: string, token_type: string, expires_in: number, user: Object}>}
   */
  register: async (data) => {
    const response = await client.post('/auth/register', data, { requiresAuth: false });
    return response.data;
  },

  /**
   * Fetch current authenticated user and permissions
   * @returns {Promise<{user: Object}>}
   */
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  /**
   * Update personal profile details
   * @param {Object} data
   * @returns {Promise<{user: Object}>}
   */
  updateProfile: async (data) => {
    const response = await client.put('/auth/profile', data);
    return response.data;
  },

  /**
   * Change user account password
   * @param {Object} data
   * @param {string} data.current_password
   * @param {string} data.new_password
   * @param {string} data.new_password_confirmation
   * @returns {Promise<any>}
   */
  changePassword: async (data) => {
    const response = await client.post('/auth/change-password', data);
    return response.data;
  },

  /**
   * Request password reset code
   * @param {Object} data
   * @param {string} data.email
   * @returns {Promise<any>}
   */
  forgotPassword: async (data) => {
    const response = await client.post('/auth/forgot-password', data, { requiresAuth: false });
    return response.data;
  },

  /**
   * Complete password reset using verification code
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.code
   * @param {string} data.password
   * @param {string} [data.password_confirmation]
   * @returns {Promise<any>}
   */
  resetPassword: async (data) => {
    const response = await client.post('/auth/reset-password', data, { requiresAuth: false });
    return response.data;
  },

  /**
   * Invalidate user session on backend
   * @returns {Promise<any>}
   */
  logout: async () => {
    try {
      const response = await client.post('/auth/logout');
      return response.data;
    } catch {
      // Backend logout failure should not block local cleanup
      return null;
    }
  },
};

export default authService;
