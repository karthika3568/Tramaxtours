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
  const interest = inquiry?.tour_title || inquiry?.destination_name || 'your travel plans with Tramax Tours';
  return `Hello ${customerName}, thank you for your inquiry with Tramax Tours. We received your request regarding ${interest}. Our team will assist you shortly.`;
}
