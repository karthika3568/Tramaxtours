/**
 * Tramax Tours - Social Links Service
 * Communicates with backend endpoints:
 * GET /api/v1/social-links
 * GET /api/v1/social-links/{id}
 */

import client from '../api/client';

export const socialLinksService = {
  /**
   * List social links with optional status, platform, or search filter
   * @param {Object} [params]
   * @returns {Promise<any>}
   */
  getSocialLinks: async (params = {}) => {
    const response = await client.get('/social-links', params);
    return response.data;
  },

  /**
   * Get single social link by ID
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  getSocialLink: async (id) => {
    const response = await client.get(`/social-links/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Create a new social link
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createSocialLink: async (data) => {
    const response = await client.post('/social-links', data);
    return response.data;
  },

  /**
   * Update an existing social link
   * @param {string|number} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateSocialLink: async (id, data) => {
    const response = await client.put(`/social-links/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete a social link
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  deleteSocialLink: async (id) => {
    const response = await client.delete(`/social-links/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Activate a social link
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  activateSocialLink: async (id) => {
    const response = await client.post(`/social-links/${encodeURIComponent(id)}/activate`);
    return response.data;
  },

  /**
   * Deactivate a social link
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  deactivateSocialLink: async (id) => {
    const response = await client.post(`/social-links/${encodeURIComponent(id)}/deactivate`);
    return response.data;
  },
};

export default socialLinksService;

