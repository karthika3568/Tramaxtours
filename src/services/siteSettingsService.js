/**
 * Wanderer South India - Site Settings Service
 * Communicates with backend endpoints:
 * GET /api/v1/site-settings
 * GET /api/v1/site-settings/group/{group}
 * GET /api/v1/site-settings/{id}
 */

import client from '../api/client';

export const siteSettingsService = {
  /**
   * List all site settings with optional filtering
   * @param {Object} [params]
   * @returns {Promise<any>}
   */
  getSettings: async (params = {}) => {
    const response = await client.get('/site-settings', params);
    return response.data;
  },

  /**
   * Fetch site settings formatted into a grouped key-value object
   * @returns {Promise<Record<string, Record<string, string>>>}
   */
  getGroupedSettings: async () => {
    const response = await client.get('/site-settings', { grouped: 'true' });
    return response.data;
  },

  /**
   * Fetch settings for a specific group (e.g., 'general', 'contact', 'footer')
   * @param {string} group
   * @returns {Promise<any>}
   */
  getByGroup: async (group) => {
    const response = await client.get(`/site-settings/group/${encodeURIComponent(group)}`);
    return response.data;
  },

  /**
   * Get single setting by ID or setting_key
   * @param {string|number} idOrKey
   * @returns {Promise<any>}
   */
  getSetting: async (idOrKey) => {
    const response = await client.get(`/site-settings/${encodeURIComponent(idOrKey)}`);
    return response.data;
  },

  /**
   * Create a new site setting
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createSetting: async (data) => {
    const response = await client.post('/site-settings', data);
    return response.data;
  },

  /**
   * Update an existing site setting
   * @param {string|number} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateSetting: async (id, data) => {
    const response = await client.put(`/site-settings/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete a site setting
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  deleteSetting: async (id) => {
    const response = await client.delete(`/site-settings/${encodeURIComponent(id)}`);
    return response.data;
  },
};

export default siteSettingsService;

