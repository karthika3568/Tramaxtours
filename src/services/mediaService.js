/**
 * Tramax Tours - Admin Media Service
 * Communicates with backend endpoints:
 * GET /api/v1/media
 * GET /api/v1/media/{id}
 * POST /api/v1/media/upload
 * PUT /api/v1/media/{id}
 * DELETE /api/v1/media/{id}
 */

import client from '../api/client';

export const mediaService = {
  /**
   * List paginated media items with search, mime_type/type filter, and sorting
   * @param {Object} [params]
   * @returns {Promise<{items: any[], pagination: any}>}
   */
  getMedia: async (params = {}) => {
    const query = { sort_by: 'id', order: 'DESC', ...params };
    const response = await client.get('/media', query);
    const items = response.data || [];
    const pagination = response.pagination || {
      total: items.length,
      page: 1,
      limit: items.length,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    };

    const result = [...items];
    result.items = items;
    result.pagination = pagination;
    return result;
  },

  /**
   * Get single media record details with usage references and uploader info
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getMediaById: async (id) => {
    const response = await client.get(`/media/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Upload new media asset (multipart/form-data)
   * @param {FormData} formData - Contains 'file', optional 'alt_text', optional 'caption'
   * @returns {Promise<any>}
   */
  uploadMedia: async (formData) => {
    const response = await client.post('/media/upload', formData);
    return response.data;
  },

  /**
   * Update media metadata (alt_text, caption)
   * @param {number|string} id
   * @param {{ alt_text?: string, caption?: string }} payload
   * @returns {Promise<any>}
   */
  updateMedia: async (id, payload) => {
    const response = await client.put(`/media/${encodeURIComponent(id)}`, payload);
    return response.data;
  },

  /**
   * Delete media asset from database and disk
   * @param {number|string} id
   * @param {boolean} [force=false]
   * @returns {Promise<any>}
   */
  deleteMedia: async (id, force = false) => {
    const params = force ? { force: 'true' } : {};
    const response = await client.delete(`/media/${encodeURIComponent(id)}`, { params });
    return response.data;
  },
};

export default mediaService;
