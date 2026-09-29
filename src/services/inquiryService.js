import client from '../api/client';

export const inquiryService = {
  /**
   * Submit a public customer inquiry from the website.
   * @param {Object} data - { name, email, phone, message, destination, tour, travelDate, travelers, ... }
   * @returns {Promise<Object>}
   */
  createInquiry: async (data) => {
    const res = await client.post('/inquiries', data);
    return res.data || res;
  },

  /**
   * Admin: List inquiries with filters and pagination.
   * @param {Object} params - { search, status, destination_id, tour_id, date_from, date_to, page, limit }
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  getInquiries: async (params = {}) => {
    const res = await client.get('/inquiries', params);
    return {
      items: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
    };
  },

  /**
   * Admin: Get inquiry summary statistics.
   * @returns {Promise<Object>}
   */
  getInquiryStats: async () => {
    const res = await client.get('/inquiries/stats');
    return res.data || { total: 0, new: 0, contacted: 0, converted: 0, closed: 0 };
  },

  /**
   * Admin: Get single inquiry by ID.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getInquiry: async (id) => {
    const res = await client.get(`/inquiries/${encodeURIComponent(id)}`);
    return res.data;
  },

  /**
   * Admin: Update inquiry status and optional notes.
   * @param {number|string} id
   * @param {Object} payload - { status: 'new'|'contacted'|'converted'|'closed', admin_notes: string }
   * @returns {Promise<Object>}
   */
  updateInquiryStatus: async (id, payload) => {
    const res = await client.put(`/inquiries/${encodeURIComponent(id)}`, payload);
    return res.data;
  },

  /**
   * Admin: Delete inquiry.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  deleteInquiry: async (id) => {
    const res = await client.delete(`/inquiries/${encodeURIComponent(id)}`);
    return res.data;
  },
};

export default inquiryService;
