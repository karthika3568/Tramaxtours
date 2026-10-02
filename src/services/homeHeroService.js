/**
 * Wanderer South India - Homepage Hero Slides Service
 * Communicates with /api/v1/home-hero-slides
 */

import client from '../api/client';

export const homeHeroService = {
  /**
   * List homepage hero slides
   * @param {Object} [params]
   * @returns {Promise<any[]>}
   */
  getSlides: async (params = {}) => {
    const query = { sort_by: 'display_order', sort_order: 'ASC', ...params };
    const response = await client.get('/home-hero-slides', query);
    return response.data || [];
  },

  /**
   * Get single hero slide by ID
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getSlide: async (id) => {
    const response = await client.get(`/home-hero-slides/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Create a new hero slide
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createSlide: async (data) => {
    const response = await client.post('/home-hero-slides', data);
    return response.data;
  },

  /**
   * Update an existing hero slide
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateSlide: async (id, data) => {
    const response = await client.put(`/home-hero-slides/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete a hero slide
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deleteSlide: async (id) => {
    const response = await client.delete(`/home-hero-slides/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Activate a hero slide
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  activateSlide: async (id) => {
    const response = await client.post(`/home-hero-slides/${encodeURIComponent(id)}/activate`);
    return response.data;
  },

  /**
   * Deactivate a hero slide
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deactivateSlide: async (id) => {
    const response = await client.post(`/home-hero-slides/${encodeURIComponent(id)}/deactivate`);
    return response.data;
  },
};

export default homeHeroService;

