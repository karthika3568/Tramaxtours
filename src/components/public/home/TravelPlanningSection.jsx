import { useSiteSettings } from '../../../context/SiteSettingsContext';
import { formatWhatsAppUrl } from '../../../utils/whatsapp';
import SocialLinks from '../SocialLinks';

export default function TravelPlanningSection() {
  const { getSetting } = useSiteSettings();

  const siteName = getSetting('site_name', 'Wonderer South India');
  const contactPhone = getSetting('contact_phone', '+91 8072566010');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactEmail = getSetting('contact_email', 'info@wonderersouthindia.in');

  const inquiryMsg = `Hello ${siteName}! I would like to inquire about family travel amenities, vacation planning services, and custom tour packages.`;
  const whatsappUrl = formatWhatsAppUrl(contactWhatsApp, inquiryMsg);

  return (
    <section className="travel-planning-showcase-section" id="travel-planning-services">
      <div className="travel-planning-bg-overlay" />

      <div className="container travel-planning-content-wrap">
        {/* Main Planning Header */}
        <div className="travel-planning-header text-center">
          <span className="travel-planning-badge">Curated Itineraries &amp; Luxury Transport</span>
          <h2 className="travel-planning-hero-title">
            Travel Planning Services by {siteName}
          </h2>
          <p className="travel-planning-lead-text">
            Let’s work with a family travel expert to book the vacation of your dreams, complete with all the best travel amenities for a seamless experience in vacation planning!
          </p>
        </div>

        {/* Secondary Engagement Card */}
        <div className="travel-planning-engagement-box">
          <p className="travel-planning-inquiry-prompt">
            ...check if your specific vacation is one we can assist with, including travel amenities for the whole family? We’d love to hear from you during your vacation planning journey!
          </p>

          {/* Prominent WhatsApp CTA Button (Matches Client Screenshot) */}
          <div className="travel-planning-action-wrap">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-planning-pill"
              id="btn-whatsapp-planning-cta"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.114-.06-.402-.132-.931-.309-1.603-.604-1.391-.61-2.29-2.023-2.361-2.115-.069-.092-.569-.757-.569-1.444 0-.687.359-1.026.487-1.168.128-.142.279-.177.373-.177.093 0 .186 0 .267.005.087.004.204-.033.319.243.118.283.402.98.437 1.052.035.071.059.155.012.248-.047.094-.07.153-.14.234-.07.082-.146.182-.209.245-.07.069-.143.144-.061.285.082.141.365.602.784.975.54.481.996.63 1.137.7.141.07.224.06.307-.035.083-.095.356-.413.45-.555.095-.141.189-.118.318-.07.129.047.818.386.959.456.141.071.236.106.271.165.035.06.035.344-.109.749z" />
              </svg>
              <span>Message us on WhatsApp</span>
            </a>
          </div>

          {/* Direct Brand & Email Contact Section */}
          <div className="travel-planning-brand-footer text-center">
            <h3 className="planning-brand-name">{siteName}</h3>
            <a href={`mailto:${contactEmail}`} className="planning-brand-email">
              {contactEmail}
            </a>
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="planning-brand-phone">
                📞 {contactPhone}
              </a>
            )}
          </div>

          {/* Social Links Section */}
          <div className="travel-planning-social-wrap">
            <span className="planning-social-label">Social</span>
            <SocialLinks />
          </div>
        </div>
      </div>
    </section>
  );
}
