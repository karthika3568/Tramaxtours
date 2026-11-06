/**
 * Wanderer South India - Medical Trip Service
 * Communicates with /api/v1/medical-trips and /api/v1/admin/medical-trips endpoints
 */

import client from '../api/client';

export const medicalTripService = {
  /**
   * Public: List published medical trips
   */
  getPublicMedicalTrips: async (params = {}) => {
    const res = await client.get('/medical-trips', params);
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.items || []);
    return {
      items,
      pagination: res?.pagination || res?.data?.pagination || { total: items.length, page: 1, limit: 20, total_pages: 1 },
    };
  },

  getMedicalTrips: async (params = {}) => {
    return medicalTripService.getPublicMedicalTrips(params);
  },

  /**
   * Public: Get single medical trip by slug or ID with full assessments & tests
   */
  getMedicalTripBySlug: async (slug) => {
    const res = await client.get(`/medical-trips/${slug}`);
    return res?.data || null;
  },

  getMedicalTrip: async (slug) => {
    return medicalTripService.getMedicalTripBySlug(slug);
  },

  /**
   * Public: Submit medical trip booking request
   */
  submitBooking: async (firstArg, secondArg) => {
    let tripId = null;
    let data = {};
    if (typeof firstArg === 'object' && firstArg !== null) {
      data = firstArg;
      tripId = data.medical_trip_id;
    } else {
      tripId = firstArg;
      data = secondArg || {};
    }
    const url = tripId ? `/medical-trips/${tripId}/book` : '/medical-trips/book';
    const res = await client.post(url, data);
    return res?.data || res;
  },

  /* --------------------------------------------------------------------------
   * Admin Capabilities
   * -------------------------------------------------------------------------- */

  getAdminMedicalTrips: async (params = {}) => {
    const res = await client.get('/admin/medical-trips', params);
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.items || []);
    return {
      items,
      pagination: res?.pagination || res?.data?.pagination || { total: items.length, page: 1, limit: 20, total_pages: 1 },
    };
  },

  getAdminMedicalTripById: async (id) => {
    const res = await client.get(`/admin/medical-trips/${id}`);
    return res?.data || null;
  },

  createMedicalTrip: async (data) => {
    const res = await client.post('/admin/medical-trips', data);
    return res?.data || res;
  },

  updateMedicalTrip: async (id, data) => {
    const res = await client.put(`/admin/medical-trips/${id}`, data);
    return res?.data || res;
  },

  deleteMedicalTrip: async (id) => {
    const res = await client.delete(`/admin/medical-trips/${id}`);
    return res?.data || res;
  },

  togglePublish: async (id) => {
    const res = await client.post(`/admin/medical-trips/${id}/publish`);
    return res?.data || res;
  },

  toggleActive: async (id) => {
    const res = await client.post(`/admin/medical-trips/${id}/activate`);
    return res?.data || res;
  },

  /* Assessments */
  addAssessment: async (tripId, data) => {
    const res = await client.post(`/admin/medical-trips/${tripId}/assessments`, data);
    return res?.data || res;
  },

  updateAssessment: async (assessmentId, data) => {
    const res = await client.put(`/admin/medical-trips/assessments/${assessmentId}`, data);
    return res?.data || res;
  },

  deleteAssessment: async (assessmentId) => {
    const res = await client.delete(`/admin/medical-trips/assessments/${assessmentId}`);
    return res?.data || res;
  },

  reorderAssessments: async (tripId, orderedIds) => {
    const res = await client.post(`/admin/medical-trips/${tripId}/assessments/reorder`, {
      ordered_ids: orderedIds,
    });
    return res?.data || res;
  },

  /* Tests */
  addTest: async (assessmentId, data) => {
    const res = await client.post(`/admin/medical-trips/assessments/${assessmentId}/tests`, data);
    return res?.data || res;
  },

  updateTest: async (testId, data) => {
    const res = await client.put(`/admin/medical-trips/tests/${testId}`, data);
    return res?.data || res;
  },

  deleteTest: async (testId) => {
    const res = await client.delete(`/admin/medical-trips/tests/${testId}`);
    return res?.data || res;
  },

  /* Diseases Screened */
  addDisease: async (tripId, data) => {
    const res = await client.post(`/admin/medical-trips/${tripId}/diseases`, data);
    return res?.data || res;
  },

  updateDisease: async (diseaseId, data) => {
    const res = await client.put(`/admin/medical-trips/diseases/${diseaseId}`, data);
    return res?.data || res;
  },

  deleteDisease: async (diseaseId) => {
    const res = await client.delete(`/admin/medical-trips/diseases/${diseaseId}`);
    return res?.data || res;
  },

  /* Bookings Management */
  getMedicalBookings: async (params = {}) => {
    const res = await client.get('/admin/medical-trips/bookings/all', params);
    const items = res?.data || [];
    return {
      items,
      pagination: res?.pagination || { total: items.length, page: 1, limit: 20, total_pages: 1 },
    };
  },

  updateBookingStatus: async (bookingId, status) => {
    const res = await client.post(`/admin/medical-trips/bookings/${bookingId}/status`, { status });
    return res?.data || res;
  },
};

export default medicalTripService;
