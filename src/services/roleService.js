/**
 * Tramax Tours - Role & Permission Management Service
 * Communicates with backend endpoints:
 * GET /api/v1/roles
 * GET /api/v1/roles/:id
 * GET /api/v1/permissions
 */

import client from '../api/client';

export const roleService = {
  /**
   * List all system roles with member count and permissions
   * @returns {Promise<Array>}
   */
  getRoles: async () => {
    const response = await client.get('/roles');
    return response.data;
  },

  /**
   * Get single role details with permissions
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getRole: async (id) => {
    const response = await client.get(`/roles/${id}`);
    return response.data;
  },

  /**
   * Get all system permissions grouped by category
   * @returns {Promise<{grouped: Object, permissions: Array, total: number}>}
   */
  getPermissions: async () => {
    const response = await client.get('/permissions');
    return response.data;
  },
};

export default roleService;
