/**
 * Customer Portal Service
 * Handles customer-scoped bookings, stats, details, and confirmed ticket downloads.
 */

import client from '../api/client';

export const customerService = {
  /**
   * Get authenticated customer's bookings with pagination and status filters
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.per_page=10]
   * @param {string} [params.status='all']
   * @param {string} [params.sort_by='created_at']
   * @param {string} [params.sort_order='DESC']
   * @returns {Promise<{data: Array, pagination: Object, stats: Object}>}
   */
  getMyBookings: async (params = {}) => {
    const response = await client.get('/customer/bookings', { params });
    return response.data;
  },

  /**
   * Get customer dynamic booking statistics
   * @returns {Promise<{total_bookings: number, pending_bookings: number, confirmed_bookings: number, completed_bookings: number, cancelled_bookings: number}>}
   */
  getMyBookingStats: async () => {
    const response = await client.get('/customer/bookings/stats');
    return response.data;
  },

  /**
   * Get single booking detail by ID with strict ownership verification
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getMyBookingDetail: async (id) => {
    const response = await client.get(`/customer/bookings/${id}`);
    return response.data;
  },

  /**
   * Download confirmed ticket PDF
   * @param {number|string} id
   * @param {string} [ticketNumber]
   */
  downloadTicketPdf: async (id, ticketNumber) => {
    const filename = `Ticket-${ticketNumber || id}.pdf`;
    const response = await client.get(`/customer/bookings/${id}/receipt`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },
};

export default customerService;
