/**
 * Formats a clean international WhatsApp click-to-chat URL.
 * Automatically cleans non-digit characters and ensures proper India / international country code.
 *
 * @param {string} rawPhone - e.g. "+91 8072566010", "8072566010", "918072566010"
 * @param {string} [message] - Optional prefilled message text
 * @returns {string} - WhatsApp URL (e.g. "https://wa.me/918072566010?text=...")
 */
export function formatWhatsAppUrl(rawPhone, message = '') {
  const fallback = '918072566010';
  if (!rawPhone || typeof rawPhone !== 'string') {
    return message ? `https://wa.me/${fallback}?text=${encodeURIComponent(message)}` : `https://wa.me/${fallback}`;
  }

  // Remove all non-numeric characters except leading plus if any
  let digits = rawPhone.replace(/\D/g, '');

  if (!digits) {
    digits = fallback;
  } else if (digits.length === 10) {
    // 10-digit standard Indian mobile number, prefix 91
    digits = `91${digits}`;
  }

  const baseUrl = `https://wa.me/${digits}`;
  if (message && typeof message === 'string' && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }

  return baseUrl;
}

/**
 * Creates a professional admin message template to WhatsApp a customer about their inquiry.
 *
 * @param {Object} inquiry
 * @returns {string}
 */
export function getAdminInquiryWhatsAppTemplate(inquiry) {
  const customerName = inquiry?.name || 'Valued Guest';
  const dest = inquiry?.destination_name || inquiry?.tour_title || 'South India';
  const vehicle = inquiry?.vehicle_preference ? `\n• 🚗 Vehicle: ${inquiry.vehicle_preference}` : '';
  const hotel = inquiry?.hotel_category ? `\n• 🏨 Stay: ${inquiry.hotel_category} (${inquiry.rooms_count || 1} ${inquiry.room_type || 'Double'} Room)` : '';
  const dates = inquiry?.arrival_date ? `\n• 📅 Travel Date: ${inquiry.arrival_date}${inquiry.duration_days ? ` (${inquiry.duration_days})` : ''}` : '';
  const quote = inquiry?.quotation_amount ? `\n• 💰 Estimated Package Price: ₹${Number(inquiry.quotation_amount).toLocaleString('en-IN')}` : '';

  return (
    `Hello ${customerName}! 🌴\n\n` +
    `Greetings from *Wonderer South India*! Thank you for requesting a custom holiday itinerary for *${dest}*.\n` +
    `${dates}${vehicle}${hotel}${quote}\n\n` +
    `Our holiday specialist has prepared your customized tour plan with verified chauffeurs, curated sightseeing, and 24/7 on-road assistance.\n\n` +
    `Would you like us to share the detailed day-by-day itinerary PDF and final quotation right here?`
  );
}

