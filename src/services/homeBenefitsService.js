/**
 * Tramax Tours - Homepage Benefits Service
 * Communicates with /api/v1/home-benefits
 */

import client from '../api/client';

export const homeBenefitsService = {
  /**
   * List homepage benefits
   * @param {Object} [params]
   * @returns {Promise<any[]>}
   */
  getBenefits: async (params = {}) => {
    const query = { sort_by: 'display_order', sort_order: 'ASC', ...params };
    const response = await client.get('/home-benefits', query);
    return response.data || [];
  },

  /**
   * Get single benefit by ID
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getBenefit: async (id) => {
    const response = await client.get(`/home-benefits/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Create a new homepage benefit
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createBenefit: async (data) => {
    const response = await client.post('/home-benefits', data);
    return response.data;
  },

  /**
   * Update an existing benefit
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateBenefit: async (id, data) => {
    const response = await client.put(`/home-benefits/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete a benefit
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deleteBenefit: async (id) => {
    const response = await client.delete(`/home-benefits/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Activate a benefit
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  activateBenefit: async (id) => {
    const response = await client.post(`/home-benefits/${encodeURIComponent(id)}/activate`);
    return response.data;
  },

  /**
   * Deactivate a benefit
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deactivateBenefit: async (id) => {
    const response = await client.post(`/home-benefits/${encodeURIComponent(id)}/deactivate`);
    return response.data;
  },
};

export default homeBenefitsService;

