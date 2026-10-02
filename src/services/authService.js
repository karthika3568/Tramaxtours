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
   * Fetch current authenticated user and permissions
   * @returns {Promise<{user: Object}>}
   */
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
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
