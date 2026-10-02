/**
 * Wanderer South India - CMS Sections Service
 * Communicates with /api/v1/cms-sections
 */

import client from '../api/client';

export const cmsSectionService = {
  /**
   * List CMS sections
   * @param {Object} [params]
   * @returns {Promise<any[]>}
   */
  getCmsSections: async (params = {}) => {
    const query = { sort_by: 'display_order', sort_order: 'ASC', ...params };
    const response = await client.get('/cms-sections', query);
    return response.data || [];
  },

  /**
   * Get single CMS section by ID or section_key
   * @param {number|string} idOrKey
   * @returns {Promise<any>}
   */
  getCmsSection: async (idOrKey) => {
    const response = await client.get(`/cms-sections/${encodeURIComponent(idOrKey)}`);
    return response.data;
  },

  /**
   * Create a new CMS section
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createCmsSection: async (data) => {
    const response = await client.post('/cms-sections', data);
    return response.data;
  },

  /**
   * Update an existing CMS section
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateCmsSection: async (id, data) => {
    const response = await client.put(`/cms-sections/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete a CMS section
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deleteCmsSection: async (id) => {
    const response = await client.delete(`/cms-sections/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Activate a CMS section
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  activateCmsSection: async (id) => {
    const response = await client.post(`/cms-sections/${encodeURIComponent(id)}/activate`);
    return response.data;
  },

  /**
   * Deactivate a CMS section
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deactivateCmsSection: async (id) => {
    const response = await client.post(`/cms-sections/${encodeURIComponent(id)}/deactivate`);
    return response.data;
  },
};

export default cmsSectionService;

