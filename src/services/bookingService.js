import client from '../api/client';

export const bookingService = {
  /**
   * Get paginated bookings list with search and filters.
   * @param {Object} params - { search, status, payment_status, tour_id, date_from, date_to, sort_by, order, page, limit }
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  getBookings: async (params = {}) => {
    const res = await client.get('/bookings', { params });
    return {
      items: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 20, total_pages: 1 },
    };
  },

  /**
   * Get aggregate booking statistics for dashboard cards.
   * @returns {Promise<Object>}
   */
  getBookingStats: async () => {
    const res = await client.get('/bookings/stats');
    return res.data || {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
      total_revenue: 0,
      today_count: 0,
    };
  },

  /**
   * Get detailed single booking by ID or Order Number.
   * @param {string|number} idOrOrderNumber
   * @returns {Promise<Object>}
   */
  getBooking: async (idOrOrderNumber) => {
    const res = await client.get(`/bookings/${encodeURIComponent(idOrOrderNumber)}`);
    return res.data;
  },

  /**
   * Create a new booking (public or admin).
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  createBooking: async (data) => {
    const res = await client.post('/bookings', data);
    return res.data;
  },

  /**
   * Update booking notes or details.
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateBooking: async (id, data) => {
    const res = await client.put(`/bookings/${id}`, data);
    return res.data;
  },

  /**
   * Update booking status with optional notes.
   * @param {number} id
   * @param {string} status - 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  updateBookingStatus: async (id, status, notes = '') => {
    const res = await client.post(`/bookings/${id}/status`, { status, notes });
    return res.data;
  },

  /**
   * Confirm booking.
   * @param {number} id
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  confirmBooking: async (id, notes = '') => {
    const res = await client.post(`/bookings/${id}/confirm`, { notes });
    return res.data;
  },

  /**
   * Mark booking as completed.
   * @param {number} id
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  completeBooking: async (id, notes = '') => {
    const res = await client.post(`/bookings/${id}/complete`, { notes });
    return res.data;
  },

  /**
   * Cancel booking.
   * @param {number} id
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  cancelBooking: async (id, notes = '') => {
    const res = await client.post(`/bookings/${id}/cancel`, { notes });
    return res.data;
  },

  /**
   * Soft-delete booking.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  deleteBooking: async (id) => {
    const res = await client.delete(`/bookings/${id}`);
    return res.data;
  },

  /**
   * Restore soft-deleted booking.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  restoreBooking: async (id) => {
    const res = await client.post(`/bookings/${id}/restore`);
    return res.data;
  },
};

export default bookingService;
