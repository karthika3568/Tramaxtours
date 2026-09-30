import { useState, useEffect } from 'react';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import { formatWhatsAppUrl } from '../../../utils/whatsapp';

export default function FloatingChatWidget() {
  const { getSetting } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const phone = getSetting('contact_whatsapp', '+91 8072566010');
  const siteName = getSetting('site_name', 'Wonderer South India');

  const defaultMsg = `Hello ${siteName}! I would like assistance planning my vacation with your travel experts.`;
  const whatsappUrl = formatWhatsAppUrl(phone, defaultMsg);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (hasUnread) {
      setHasUnread(false);
    }
  };

  return (
    <div className="floating-chat-root" id="floating-whatsapp-widget" aria-label="Live WhatsApp Concierge">
      {/* Interactive Popup Card */}
      {isOpen && (
        <div className="floating-chat-card animate-fade-in-up">
          <div className="floating-chat-header">
            <div className="floating-chat-avatar-wrap">
              <div className="floating-chat-avatar">🌴</div>
              <span className="floating-online-dot" title="Online now" />
            </div>
            <div className="floating-chat-header-info">
              <h4 className="floating-chat-title">{siteName}</h4>
              <span className="floating-chat-subtitle">Vacation Planning Specialist</span>
            </div>
            <button
              type="button"
              className="floating-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              ✕
            </button>
          </div>

          <div className="floating-chat-body">
            <div className="floating-chat-bubble">
              <p>
                Hi there! 👋 Looking for private chauffeur tours, luxury temple expeditions, or custom family vacations across South India?
              </p>
              <span className="floating-chat-time">Just now</span>
            </div>
          </div>

          <div className="floating-chat-footer">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-chat-action"
              onClick={() => setIsOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.114-.06-.402-.132-.931-.309-1.603-.604-1.391-.61-2.29-2.023-2.361-2.115-.069-.092-.569-.757-.569-1.444 0-.687.359-1.026.487-1.168.128-.142.279-.177.373-.177.093 0 .186 0 .267.005.087.004.204-.033.319.243.118.283.402.98.437 1.052.035.071.059.155.012.248-.047.094-.07.153-.14.234-.07.082-.146.182-.209.245-.07.069-.143.144-.061.285.082.141.365.602.784.975.54.481.996.63 1.137.7.141.07.224.06.307-.035.083-.095.356-.413.45-.555.095-.141.189-.118.318-.07.129.047.818.386.959.456.141.071.236.106.271.165.035.06.035.344-.109.749z" />
              </svg>
              Message us on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button (Matches Client Reference Screenshot) */}
      <button
        type="button"
        className={`floating-chat-trigger-btn ${hasUnread ? 'has-badge' : ''}`}
        onClick={handleToggle}
        aria-label="Open WhatsApp Planning Support"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>

        {/* Red Unread Notification Badge */}
        {hasUnread && <span className="floating-badge-counter">1</span>}
      </button>
    </div>
  );
}
