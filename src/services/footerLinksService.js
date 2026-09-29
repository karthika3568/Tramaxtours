/**
 * Tramax Tours - Footer Links Service
 * Communicates with backend endpoints:
 * GET /api/v1/footer-links
 * GET /api/v1/footer-links/{id}
 */

import client from '../api/client';

export const footerLinksService = {
  /**
   * List footer links with optional status, column_name, or search filter
   * @param {Object} [params]
   * @returns {Promise<any>}
   */
  getFooterLinks: async (params = {}) => {
    const response = await client.get('/footer-links', params);
    return response.data;
  },

  /**
   * Get single footer link by ID
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  getFooterLink: async (id) => {
    const response = await client.get(`/footer-links/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Create a new footer link
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createFooterLink: async (data) => {
    const response = await client.post('/footer-links', data);
    return response.data;
  },

  /**
   * Update an existing footer link
   * @param {string|number} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateFooterLink: async (id, data) => {
    const response = await client.put(`/footer-links/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete a footer link
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  deleteFooterLink: async (id) => {
    const response = await client.delete(`/footer-links/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Activate a footer link
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  activateFooterLink: async (id) => {
    const response = await client.post(`/footer-links/${encodeURIComponent(id)}/activate`);
    return response.data;
  },

  /**
   * Deactivate a footer link
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  deactivateFooterLink: async (id) => {
    const response = await client.post(`/footer-links/${encodeURIComponent(id)}/deactivate`);
    return response.data;
  },
};

export default footerLinksService;

