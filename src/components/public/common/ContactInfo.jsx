import { useSiteSettings } from '../../../context/SiteSettingsContext';
import SocialLinks from '../SocialLinks';

export default function ContactInfo({ className = '' }) {
  const { getSetting, socialLinks } = useSiteSettings();

  const phone = getSetting('contact_phone', '+91 8072566010');
  const email = getSetting('contact_email', 'contact@wanderersouthindia.in');
  const address = getSetting('contact_address', 'Chennai, Tamil Nadu, India');
  const businessHours = getSetting('contact_business_hours', 'Monday - Sunday: 08:00 AM - 09:00 PM IST');
  const contactPerson = getSetting('contact_person', 'P. Kishore');

  return (
    <div className={`contact-info-wrapper ${className}`.trim()}>
      <div className="contact-info-cards-grid">
        {/* Phone Card */}
        <div className="contact-card">
          <div className="contact-card-icon" aria-hidden="true">📞</div>
          <div className="contact-card-content">
            <span className="contact-card-label">Direct Line / WhatsApp</span>
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="contact-card-value contact-link">
              {phone}
            </a>
            <span className="contact-card-sub">Available 7 days a week</span>
          </div>
        </div>

        {/* Email Card */}
        <div className="contact-card">
          <div className="contact-card-icon" aria-hidden="true">✉️</div>
          <div className="contact-card-content">
            <span className="contact-card-label">General & Tour Inquiries</span>
            <a href={`mailto:${email}`} className="contact-card-value contact-link">
              {email}
            </a>
            <span className="contact-card-sub">Responses within 12 hours</span>
          </div>
        </div>

        {/* Address Card */}
        <div className="contact-card">
          <div className="contact-card-icon" aria-hidden="true">📍</div>
          <div className="contact-card-content">
            <span className="contact-card-label">Head Office</span>
            <p className="contact-card-value text-normal">{address}</p>
            {contactPerson && (
              <span className="contact-card-sub">Operations Lead: {contactPerson}</span>
            )}
          </div>
        </div>

        {/* Hours Card */}
        <div className="contact-card">
          <div className="contact-card-icon" aria-hidden="true">⏱️</div>
          <div className="contact-card-content">
            <span className="contact-card-label">Business Hours</span>
            <p className="contact-card-value text-normal">{businessHours}</p>
            <span className="contact-card-sub">Customer support on tours: 24/7</span>
          </div>
        </div>
      </div>

      {/* Social Connect Box */}
      {socialLinks && socialLinks.length > 0 && (
        <div className="contact-social-box">
          <h4 className="contact-social-title">Connect with Us on Social Media</h4>
          <p className="contact-social-desc">
            Follow our latest journeys, traveler photos, and travel inspiration:
          </p>
          <SocialLinks links={socialLinks} variant="default" />
        </div>
      )}
    </div>
  );
}
