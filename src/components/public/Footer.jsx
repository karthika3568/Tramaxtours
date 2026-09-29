import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import FooterLinks from './FooterLinks';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const { getSetting, footerColumns } = useSiteSettings();
  const { t, language } = useLanguage();

  const siteName = getSetting('site_name', 'Tramax Tours');
  const footerAbout = language === 'de'
    ? t('footer_about')
    : getSetting('footer_about', t('footer_about'));

  const contactPhone = getSetting('contact_phone', '+91 8072566010');
  const contactEmail = getSetting('contact_email', 'contact@tramaxtours.in');
  const contactAddress = getSetting('contact_address', 'Chennai, Tamil Nadu, India');
  const contactHours = language === 'de' ? 'Mo - So: 08:00 - 21:00 Uhr IST' : getSetting('contact_business_hours', 'Mon - Sun: 08:00 AM - 09:00 PM IST');
  const logoUrl = getSetting('site_logo_url', '') || '/logo.png';
  const copyright =
    getSetting('footer_copyright', '') ||
    `© ${new Date().getFullYear()} ${siteName}. ${t('footer_rights', 'All rights reserved.')}`;

  const usefulLinks = footerColumns['useful_links'] || [];
  const policyLinks = footerColumns['policy_pages'] || [];

  return (
    <footer className="public-footer" id="site-footer">
      {/* Top Footer Main Grid */}
      <div className="container footer-main-container">
        <div className="footer-grid">
          {/* Column 1: Brand & Contact Information */}
          <div className="footer-column brand-column">
            <Link to="/" className="footer-brand-link">
              <img src={logoUrl} alt={siteName} className="footer-brand-logo-img" />
            </Link>
            <p className="footer-about-text">{footerAbout}</p>

            <div className="footer-contact-block">
              {contactAddress && (
                <div className="footer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{contactAddress}</span>
                </div>
              )}

              {contactPhone && (
                <div className="footer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href={`tel:${contactPhone.replace(/\s+/g, '')}`}>{contactPhone}</a>
                </div>
              )}

              {contactEmail && (
                <div className="footer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </div>
              )}

              {contactHours && (
                <div className="footer-contact-item text-muted-footer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{contactHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <FooterLinks
            title={t('footer_quick_links', 'Quick Navigation')}
            links={usefulLinks}
            className="nav-links-column"
          />

          {/* Column 3: Policy / Legal Links */}
          <FooterLinks
            title={language === 'de' ? 'Rechtliches & Info' : 'Policies & Info'}
            links={policyLinks}
            className="policy-links-column"
          />

          {/* Column 4: Social & Experiences */}
          <div className="footer-column social-column">
            <h4 className="footer-column-title">{language === 'de' ? 'Folgen Sie uns' : 'Connect With Us'}</h4>
            <p className="social-intro-text">
              {language === 'de'
                ? 'Erleben Sie tägliche Reise-Highlights, Tempelfunde und saisonale Angebote auf unseren Social-Media-Kanälen.'
                : 'Follow our daily safari highlights, cultural discoveries, and seasonal travel packages across our social channels.'}
            </p>
            <SocialLinks variant="footer" />

            <div className="footer-badge-box">
              <span className="badge-title">Verified Hospitality Partner</span>
              <p className="badge-subtitle">Licensed & Certified Luxury Travel Operator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">{copyright}</p>
          <div className="footer-bottom-links">
            <Link to="/pages/terms-conditions">Terms & Conditions</Link>
            <span className="bullet-sep" aria-hidden="true">•</span>
            <Link to="/pages/privacy-policy">Privacy Policy</Link>
            <span className="bullet-sep" aria-hidden="true">•</span>
            <Link to="/login">Admin Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
