import client from '../api/client';

export const MAX_DOCUMENT_SIZE_MB = 5;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export const inquiryService = {
  /**
   * Submit a public trip request / customer inquiry.
   * Consumes /api/v1/trip-requests (or /inquiries)
   * @param {Object} data - Trip form payload
   * @returns {Promise<Object>}
   */
  createTripRequest: async (data) => {
    const res = await client.post('/trip-requests', data);
    return res.data || res;
  },
  createInquiry: async (data) => {
    const res = await client.post('/trip-requests', data);
    return res.data || res;
  },

  /**
   * Public: Get sanitized trip request confirmation summary by ID or reference string (e.g. TRP-2026-000013).
   * @param {string|number} referenceOrId
   * @returns {Promise<Object>}
   */
  getPublicTripSummary: async (referenceOrId) => {
    const res = await client.get(`/trip-requests/public-summary/${encodeURIComponent(referenceOrId)}`);
    return res.data || res;
  },

  /**
   * Admin: List trip requests with filters and pagination.
   * @param {Object} params - { search, status, destination_id, tour_id, date_from, date_to, page, limit }
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  getTripRequests: async (params = {}) => {
    const res = await client.get('/trip-requests', params);
    return {
      items: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
    };
  },
  getInquiries: async (params = {}) => {
    const res = await client.get('/trip-requests', params);
    return {
      items: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
    };
  },

  /**
   * Admin: Get trip request summary statistics (real KPI counts).
   * @returns {Promise<Object>}
   */
  getTripRequestStats: async () => {
    const res = await client.get('/trip-requests/stats');
    return res.data || { total: 0, new: 0, contacted: 0, converted: 0, closed: 0 };
  },
  getInquiryStats: async () => {
    const res = await client.get('/trip-requests/stats');
    return res.data || { total: 0, new: 0, contacted: 0, converted: 0, closed: 0 };
  },

  /**
   * Admin: Get single trip request by ID.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getTripRequest: async (id) => {
    const res = await client.get(`/trip-requests/${encodeURIComponent(id)}`);
    return res.data;
  },
  getInquiry: async (id) => {
    const res = await client.get(`/trip-requests/${encodeURIComponent(id)}`);
    return res.data;
  },

  /**
   * Admin: View / Download attached document through authenticated endpoint.
   * @param {number|string} id
   * @param {'passport'|'ticket'} type
   * @returns {Promise<Object>}
   */
  getDocumentDownload: async (id, type) => {
    const res = await client.get(`/trip-requests/${encodeURIComponent(id)}/documents/${encodeURIComponent(type)}`);
    return res.data;
  },

  /**
   * Admin: Update trip request status and optional notes.
   * @param {number|string} id
   * @param {Object} payload - { status: 'new'|'contacted'|'converted'|'closed', admin_notes: string, quotation_amount: number }
   * @returns {Promise<Object>}
   */
  updateTripRequestStatus: async (id, payload) => {
    const res = await client.patch(`/trip-requests/${encodeURIComponent(id)}`, payload);
    return res.data;
  },
  updateInquiryStatus: async (id, payload) => {
    const res = await client.patch(`/trip-requests/${encodeURIComponent(id)}`, payload);
    return res.data;
  },

  /**
   * Admin: Delete trip request.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  deleteTripRequest: async (id) => {
    const res = await client.delete(`/trip-requests/${encodeURIComponent(id)}`);
    return res.data;
  },
  deleteInquiry: async (id) => {
    const res = await client.delete(`/trip-requests/${encodeURIComponent(id)}`);
    return res.data;
  },
};

export default inquiryService;
