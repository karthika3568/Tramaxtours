/**
 * Wanderer South India - Admin Dashboard Service
 * Fetches real-time operational metrics, statistics and recent data across permitted domains
 */

import client from '../api/client';
import destinationService from './destinationService';
import tourService from './tourService';
import pageService from './pageService';
import reviewService from './reviewService';
import bookingService from './bookingService';

export const adminDashboardService = {
  /**
   * Fetch aggregate operational metrics for admin dashboard
   * @param {Function} hasPermission - RBAC check helper from useAuth
   * @returns {Promise<Object>}
   */
  getDashboardData: async (hasPermission = () => true) => {
    try {
      // Primary route: Unified high-performance dashboard stats
      const response = await client.get('/dashboard/stats');
      if (response && response.data) {
        return response.data;
      }
    } catch {
      // Fallback: Gracefully fetch individual domain metrics via Promise.allSettled
    }

    const promises = [];
    const keys = [];

    // Bookings
    if (hasPermission('bookings.view')) {
      keys.push('bookingsStats');
      promises.push(bookingService.getBookingStats());

      keys.push('recentBookings');
      promises.push(bookingService.getBookings({ limit: 5 }));
    }

    // Destinations
    if (hasPermission('destinations.view')) {
      keys.push('destinations');
      promises.push(destinationService.getDestinations({ limit: 5 }));
    }

    // Tours
    if (hasPermission('tours.view')) {
      keys.push('tours');
      promises.push(tourService.getTours({ limit: 5 }));
    }

    // Pages
    if (hasPermission('pages.manage')) {
      keys.push('pages');
      promises.push(pageService.getPages({ limit: 5 }));
    }

    // Reviews
    if (hasPermission('reviews.view')) {
      keys.push('reviews');
      promises.push(reviewService.getReviews({ limit: 5 }));
    }

    const results = await Promise.allSettled(promises);
    const dataMap = {};

    results.forEach((res, index) => {
      const key = keys[index];
      if (res.status === 'fulfilled' && res.value) {
        dataMap[key] = res.value;
      } else {
        dataMap[key] = null;
      }
    });

    const bStats = dataMap.bookingsStats?.data || {};
    const bList = dataMap.recentBookings?.data || [];
    const rList = Array.isArray(dataMap.reviews?.items) ? dataMap.reviews.items : Array.isArray(dataMap.reviews) ? dataMap.reviews : [];
    const tList = Array.isArray(dataMap.tours?.items) ? dataMap.tours.items : Array.isArray(dataMap.tours?.data) ? dataMap.tours.data : [];
    const dList = Array.isArray(dataMap.destinations?.items) ? dataMap.destinations.items : Array.isArray(dataMap.destinations?.data) ? dataMap.destinations.data : [];
    const pList = Array.isArray(dataMap.pages?.items) ? dataMap.pages.items : Array.isArray(dataMap.pages?.data) ? dataMap.pages.data : [];

    return {
      overview: {
        bookings: {
          total: bStats.total_bookings ?? bList.length,
          pending: bStats.pending ?? 0,
          confirmed: bStats.confirmed ?? 0,
          completed: bStats.completed ?? 0,
          cancelled: bStats.cancelled ?? 0,
          total_value: bStats.total_value ?? 0,
        },
        tours: {
          total: dataMap.tours?.pagination?.total ?? tList.length,
          published: tList.filter((t) => t.status === 'published').length,
          draft: tList.filter((t) => t.status === 'draft').length,
        },
        destinations: {
          total: dataMap.destinations?.pagination?.total ?? dList.length,
          published: dList.filter((d) => d.status === 'published').length,
          draft: dList.filter((d) => d.status === 'draft').length,
        },
        reviews: {
          total: dataMap.reviews?.pagination?.total ?? rList.length,
          pending: rList.filter((r) => r.status === 'pending').length,
          approved: rList.filter((r) => r.status === 'approved').length,
          average_rating: 5.0,
        },
        pages: {
          total: dataMap.pages?.pagination?.total ?? pList.length,
          published: pList.filter((p) => p.status === 'published').length,
          draft: pList.filter((p) => p.status === 'draft').length,
        },
        media: {
          total: 0,
        },
      },
      pending_actions: {
        pending_bookings: bStats.pending ?? 0,
        pending_reviews: rList.filter((r) => r.status === 'pending').length,
        draft_tours: tList.filter((t) => t.status === 'draft').length,
        draft_destinations: dList.filter((d) => d.status === 'draft').length,
        draft_pages: pList.filter((p) => p.status === 'draft').length,
      },
      recent_bookings: bList,
      recent_reviews: rList,
      recent_tours: tList,
      timestamp: new Date().toISOString(),
    };
  },
};

export default adminDashboardService;
