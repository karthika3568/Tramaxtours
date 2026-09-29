/**
 * Tramax Tours - Tours Service
 * Communicates with /api/v1/tours endpoints
 */

import client from '../api/client';

export const ALLOWED_TOUR_TYPES = [
  'City Sightseeing Tours',
  'Cultural & Heritage Tours',
  'Guided Tours',
  'One Day Tours',
  'Private Tours',
  'Family Tours',
  'Historical Tours',
  'Pilgrimage / Temple Tours',
];

export const tourService = {
  /**
   * List tours with optional search, destination, duration, price, status, sorting, and pagination
   * @param {Object} [params]
   * @returns {Promise<{items: any[], pagination: any}>}
   */
  getTours: async (params = {}) => {
    const query = { sort_by: 'display_order', order: 'ASC', ...params };

    // Default to published only if status is completely omitted (for backwards compatibility with public callers)
    if (!('status' in params)) {
      query.status = 'published';
    } else if (params.status === '' || params.status === 'all') {
      delete query.status;
    }

    if (params.is_featured === '' || params.is_featured === 'all') {
      delete query.is_featured;
    }

    if (params.destination_id === '' || params.destination_id === 'all') {
      delete query.destination_id;
    }

    if (params.tour_type === '' || params.tour_type === 'all') {
      delete query.tour_type;
    }

    const response = await client.get('/tours', query);
    const items = response.data || [];
    const pagination = response.pagination || {
      total: items.length,
      page: 1,
      limit: items.length,
      total_pages: 1,
    };

    const result = [...items];
    result.items = items;
    result.pagination = pagination;
    return result;
  },

  /**
   * Get single tour by slug or numeric ID (includes categories, media, gallery, itineraries, highlights, pricing tiers, FAQs)
   * @param {string|number} slugOrId
   * @returns {Promise<any>}
   */
  getTour: async (slugOrId) => {
    const response = await client.get(`/tours/${encodeURIComponent(slugOrId)}`);
    return response.data;
  },

  /**
   * Create a new tour package
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createTour: async (data) => {
    const response = await client.post('/tours', data);
    return response.data;
  },

  /**
   * Update an existing tour package
   * @param {string|number} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateTour: async (id, data) => {
    const response = await client.put(`/tours/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  /**
   * Delete tour (supports soft delete or force delete)
   * @param {string|number} id
   * @param {boolean} [force=false]
   * @returns {Promise<any>}
   */
  deleteTour: async (id, force = false) => {
    const query = force ? { force: 'true' } : {};
    const response = await client.delete(`/tours/${encodeURIComponent(id)}`, query);
    return response.data;
  },

  /**
   * Restore a soft-deleted tour
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  restoreTour: async (id) => {
    const response = await client.post(`/tours/${encodeURIComponent(id)}/restore`);
    return response.data;
  },

  /**
   * Publish a tour
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  publishTour: async (id) => {
    const response = await client.post(`/tours/${encodeURIComponent(id)}/publish`);
    return response.data;
  },

  /**
   * Unpublish a tour (revert to draft)
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  unpublishTour: async (id) => {
    const response = await client.post(`/tours/${encodeURIComponent(id)}/unpublish`);
    return response.data;
  },

  /**
   * Get all tour categories
   * @returns {Promise<any[]>}
   */
  getCategories: async () => {
    const response = await client.get('/tour-categories');
    return response.data || [];
  },

  /**
   * List date-specific seat availability for a tour
   * @param {string|number} tourId
   * @param {boolean} [upcomingOnly=false]
   * @returns {Promise<any[]>}
   */
  getAvailability: async (tourId, upcomingOnly = false) => {
    const response = await client.get(`/tours/${encodeURIComponent(tourId)}/availability`, upcomingOnly ? { upcoming_only: 'true' } : {});
    return response.data || [];
  },

  /**
   * Create or update the seat capacity/status for one travel date
   * @param {string|number} tourId
   * @param {Object} data - { travel_date, total_seats, is_closed, booking_cutoff_hours }
   * @returns {Promise<any>}
   */
  upsertAvailability: async (tourId, data) => {
    const response = await client.post(`/tours/${encodeURIComponent(tourId)}/availability`, data);
    return response.data;
  },

  /**
   * Remove a configured travel date
   * @param {string|number} tourId
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise<any>}
   */
  deleteAvailability: async (tourId, date) => {
    const response = await client.delete(`/tours/${encodeURIComponent(tourId)}/availability/${encodeURIComponent(date)}`);
    return response.data;
  },
};

export default tourService;

