/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import siteSettingsService from '../services/siteSettingsService';
import footerLinksService from '../services/footerLinksService';
import socialLinksService from '../services/socialLinksService';

const SiteSettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  general: {
    site_name: 'Wanderer South India',
    site_tagline: 'Curated Luxury & Adventure Travel',
    site_logo: '',
    site_favicon: '/favicon.svg',
    default_currency: 'EUR',
    currency_symbol: '€',
    timezone: 'Asia/Kolkata',
  },
  contact: {
    contact_person: 'P. Kishore',
    contact_email: 'contact@wanderersouthindia.com',
    contact_phone: '+91 80725 66010',
    contact_address: 'Chennai, Tamil Nadu, India',
    contact_business_hours: 'Monday - Sunday: 08:00 AM - 09:00 PM IST',
  },
  footer: {
    footer_about:
      'Wanderer South India specializes in foreign-client tourism, private sightseeing, cultural heritage expeditions, and custom luxury travel.',
    footer_copyright: `© ${new Date().getFullYear()} Wanderer South India. All rights reserved.`,
  },
  seo: {
    seo_default_title: 'Wanderer South India | Premier South India Tours & Travel Experiences',
    seo_default_description:
      'Discover premium South India tours, private sightseeing, cultural heritage packages, and luxury journeys with Wanderer South India.',
  },
};

const DEFAULT_FOOTER_LINKS = [
  { id: 1, column_name: 'useful_links', label: 'Home', url: '/', display_order: 1, is_external: 0, status: 'active' },
  { id: 2, column_name: 'useful_links', label: 'Destinations', url: '/destinations', display_order: 2, is_external: 0, status: 'active' },
  { id: 3, column_name: 'useful_links', label: 'Tours & Safaris', url: '/tours', display_order: 3, is_external: 0, status: 'active' },
  { id: 4, column_name: 'useful_links', label: 'About Us', url: '/about', display_order: 4, is_external: 0, status: 'active' },
  { id: 5, column_name: 'useful_links', label: 'Contact Us', url: '/contact', display_order: 5, is_external: 0, status: 'active' },
  { id: 6, column_name: 'policy_pages', label: 'Terms & Conditions', url: '/pages/terms-conditions', display_order: 1, is_external: 0, status: 'active' },
  { id: 7, column_name: 'policy_pages', label: 'Refund Policy', url: '/pages/refund-policy', display_order: 2, is_external: 0, status: 'active' },
  { id: 8, column_name: 'policy_pages', label: 'Privacy Policy', url: '/pages/privacy-policy', display_order: 3, is_external: 0, status: 'active' },
];

const DEFAULT_SOCIAL_LINKS = [
  { id: 1, platform: 'facebook', url: 'https://facebook.com/wanderersouthindia', icon: 'facebook', display_order: 1, status: 'active' },
  { id: 2, platform: 'instagram', url: 'https://instagram.com/wanderersouthindia', icon: 'instagram', display_order: 2, status: 'active' },
  { id: 3, platform: 'youtube', url: 'https://youtube.com/@wanderersouthindia', icon: 'youtube', display_order: 3, status: 'active' },
  { id: 4, platform: 'x', url: 'https://x.com/wanderersouthindia', icon: 'twitter', display_order: 4, status: 'active' },
  { id: 5, platform: 'tripadvisor', url: 'https://tripadvisor.com', icon: 'tripadvisor', display_order: 5, status: 'active' },
];

export function SiteSettingsProvider({ children }) {
  const [groupedSettings, setGroupedSettings] = useState(DEFAULT_SETTINGS);
  const [flatSettings, setFlatSettings] = useState({});
  const [footerLinks, setFooterLinks] = useState(DEFAULT_FOOTER_LINKS);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);
  const [isLoading, setIsLoading] = useState(true);

  // Load public data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadPublicData() {
      try {
        const [settingsRes, footerRes, socialRes] = await Promise.allSettled([
          siteSettingsService.getGroupedSettings(),
          footerLinksService.getFooterLinks({ status: 'active', limit: 100 }),
          socialLinksService.getSocialLinks({ status: 'active', limit: 50 }),
        ]);

        if (!isMounted) return;

        // Process Settings
        if (settingsRes.status === 'fulfilled' && settingsRes.value) {
          const fetchedGrouped = settingsRes.value;
          setGroupedSettings((prev) => ({
            ...prev,
            ...fetchedGrouped,
          }));

          // Build flat dictionary for quick key lookups
          const flatMap = {};
          Object.values(fetchedGrouped).forEach((groupObj) => {
            if (groupObj && typeof groupObj === 'object') {
              Object.entries(groupObj).forEach(([k, v]) => {
                flatMap[k] = v;
              });
            }
          });
          setFlatSettings(flatMap);
        }

        // Process Footer Links
        if (footerRes.status === 'fulfilled' && Array.isArray(footerRes.value)) {
          setFooterLinks(footerRes.value);
        }

        // Process Social Links
        if (socialRes.status === 'fulfilled' && Array.isArray(socialRes.value)) {
          setSocialLinks(socialRes.value);
        }
      } catch {
        // Fallback defaults are already initialized
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPublicData();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Helper to retrieve a setting value with fallback
   */
  const getSetting = useCallback(
    (key, fallback = '') => {
      if (flatSettings[key] !== undefined && flatSettings[key] !== null) {
        return flatSettings[key];
      }

      // Check default groups
      for (const group of Object.values(groupedSettings)) {
        if (group && group[key] !== undefined && group[key] !== null) {
          return group[key];
        }
      }

      return fallback;
    },
    [flatSettings, groupedSettings]
  );

  /**
   * Footer links grouped by column_name and ordered by display_order
   */
  const footerColumns = useMemo(() => {
    const active = footerLinks.filter((link) => link.status === 'active');
    active.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const grouped = {};
    active.forEach((link) => {
      const col = link.column_name || 'useful_links';
      if (!grouped[col]) {
        grouped[col] = [];
      }
      grouped[col].push(link);
    });

    return grouped;
  }, [footerLinks]);

  /**
   * Active social links ordered by display_order
   */
  const activeSocialLinks = useMemo(() => {
    const active = socialLinks.filter((link) => link.status === 'active');
    active.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return active;
  }, [socialLinks]);

  const value = useMemo(
    () => ({
      settings: groupedSettings,
      getSetting,
      footerLinks,
      footerColumns,
      socialLinks: activeSocialLinks,
      isLoading,
    }),
    [groupedSettings, getSetting, footerLinks, footerColumns, activeSocialLinks, isLoading]
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

export default SiteSettingsContext;
