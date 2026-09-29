/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_destinations: 'Destinations',
    nav_tours: 'Tours',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_explore_tours: 'Explore Tours',
    nav_sign_in: 'Sign In',
    nav_sign_out: 'Sign Out',
    nav_admin_console: 'Admin Console',
    nav_my_bookings: 'My Bookings',
    nav_language: 'Language',

    // Hero & Search
    hero_title: 'Unforgettable Indian Journeys & Curated Day Tours',
    hero_subtitle: 'Discover majestic temples, heritage coastlines, and historic wonders with premium local chauffeurs and guides.',
    search_keyword_placeholder: 'Search destination, tour, or attraction...',
    search_category_all: 'All Categories',
    search_date_placeholder: 'Select Date',
    search_guests: 'Guests',
    search_btn: 'Search Tours',
    search_view_all: 'View All Tours',

    // Tour Types & Categories
    cat_one_day_tours: 'One Day Tours',
    cat_city_sightseeing: 'City Sightseeing Tours',
    cat_cultural_heritage: 'Cultural & Heritage Tours',
    cat_guided_tours: 'Guided Tours',
    cat_private_tours: 'Private Tours',
    cat_family_tours: 'Family Tours',
    cat_historical_tours: 'Historical Tours',
    cat_pilgrimage_temple: 'Pilgrimage / Temple Tours',

    // Tour Cards & Badges
    badge_one_day: 'One Day Tour',
    badge_private: 'Private Tour',
    badge_guided: 'Guided Tour',
    badge_sightseeing: 'City Sightseeing',
    card_starting_from: 'Starting from',
    card_reviews: 'reviews',
    card_view_details: 'View Tour',
    card_book_now: 'Book Now',
    card_day: 'Day',
    card_days: 'Days',
    card_hours: 'Hours',

    // Sections
    sec_popular_categories_title: 'Choose Your Experience',
    sec_popular_categories_sub: 'From peaceful spiritual journeys to breathtaking coastal getaways, explore curated travel categories.',
    sec_featured_tours_title: 'Curated Day Tours & Experiences',
    sec_featured_tours_sub: 'Handpicked premium private excursions crafted for international travelers and culture lovers.',
    sec_why_us_title: 'Why Travel With Tramax Tours',
    sec_why_us_sub: 'We blend heritage expertise, luxury chauffeur comforts, and transparent pricing for an exceptional holiday.',
    sec_testimonials_title: 'Loved by Travelers Worldwide',
    sec_testimonials_sub: 'Read real verified feedback from guests who explored Tamil Nadu and South India with us.',

    // Booking & Profile
    booking_title: 'Reserve Your Tour',
    booking_date: 'Select Travel Date',
    booking_travelers: 'Number of Guests',
    booking_pickup_location: 'Hotel Pickup Address / Location',
    booking_special_requests: 'Special Requests / Notes',
    booking_total_price: 'Total Price',
    booking_submit: 'Confirm Reservation',
    booking_pay_on_arrival: 'Pay on Arrival / Cash or Card',
    booking_success_title: 'Booking Confirmed!',
    booking_success_desc: 'Thank you for choosing Tramax Tours. Your reservation details are confirmed below.',
    booking_voucher_pdf: 'Download PDF Receipt',
    booking_send_whatsapp: 'Share on WhatsApp',
    booking_cancel_btn: 'Cancel Reservation',

    // Footer
    footer_about: 'Tramax Tours provides premium guided excursions, private temple pilgrimages, and cultural day trips across South India with certified English & German speaking guides.',
    footer_quick_links: 'Quick Links',
    footer_top_destinations: 'Top Destinations',
    footer_contact_info: 'Contact Information',
    footer_rights: 'All rights reserved. Tramax Tours & Travels.',
  },

  de: {
    // Navigation
    nav_home: 'Startseite',
    nav_destinations: 'Reiseziele',
    nav_tours: 'Touren',
    nav_about: 'Über uns',
    nav_contact: 'Kontakt',
    nav_explore_tours: 'Touren entdecken',
    nav_sign_in: 'Anmelden',
    nav_sign_out: 'Abmelden',
    nav_admin_console: 'Admin-Konsole',
    nav_my_bookings: 'Meine Buchungen',
    nav_language: 'Sprache',

    // Hero & Search
    hero_title: 'Unvergessliche Indien-Reisen & Exklusive Tagestouren',
    hero_subtitle: 'Entdecken Sie majestätische Tempel, historische Küsten und Weltkulturerbe mit erstklassigen Chauffeuren und deutschsprachigen Reiseleitern.',
    search_keyword_placeholder: 'Reiseziel, Tour oder Sehenswürdigkeit suchen...',
    search_category_all: 'Alle Kategorien',
    search_date_placeholder: 'Datum wählen',
    search_guests: 'Gäste',
    search_btn: 'Touren suchen',
    search_view_all: 'Alle Touren anzeigen',

    // Tour Types & Categories
    cat_one_day_tours: 'Eintägige Touren',
    cat_city_sightseeing: 'Stadtrundfahrten & Sightseeing',
    cat_cultural_heritage: 'Kultur- & Kulturerbetouren',
    cat_guided_tours: 'Geführte Touren',
    cat_private_tours: 'Privattouren',
    cat_family_tours: 'Familientouren',
    cat_historical_tours: 'Historische Touren',
    cat_pilgrimage_temple: 'Pilger- & Tempeltouren',

    // Tour Cards & Badges
    badge_one_day: 'Eintägige Tour',
    badge_private: 'Privattour',
    badge_guided: 'Geführte Tour',
    badge_sightseeing: 'Stadtbesichtigung',
    card_starting_from: 'Ab',
    card_reviews: 'Bewertungen',
    card_view_details: 'Tour ansehen',
    card_book_now: 'Jetzt buchen',
    card_day: 'Tag',
    card_days: 'Tage',
    card_hours: 'Stunden',

    // Sections
    sec_popular_categories_title: 'Wählen Sie Ihr Erlebnis',
    sec_popular_categories_sub: 'Von friedvollen Tempelreisen bis hin zu atemberaubenden Küstenausflügen – entdecken Sie handverlesene Reisekategorien.',
    sec_featured_tours_title: 'Exklusive Tagestouren & Erlebnisse',
    sec_featured_tours_sub: 'Handverlesene private Ausflüge, maßgeschneidert für internationale Reisende und Kulturbegeisterte.',
    sec_why_us_title: 'Warum mit Tramax Tours reisen?',
    sec_why_us_sub: 'Wir verbinden lokales Kulturerbe, modernen Chauffeurkomfort und transparente Preise für einen perfekten Urlaub.',
    sec_testimonials_title: 'Von Gästen weltweit geschätzt',
    sec_testimonials_sub: 'Lesen Sie echte Bewertungen unserer Gäste, die Südindien mit uns entdeckt haben.',

    // Booking & Profile
    booking_title: 'Tour unverbindlich reservieren',
    booking_date: 'Reisedatum auswählen',
    booking_travelers: 'Anzahl der Gäste',
    booking_pickup_location: 'Hotel / Abholadresse',
    booking_special_requests: 'Besondere Wünsche / Notizen',
    booking_total_price: 'Gesamtpreis',
    booking_submit: 'Buchung bestätigen',
    booking_pay_on_arrival: 'Zahlung bei Ankunft / Bar oder Karte',
    booking_success_title: 'Buchung erfolgreich bestätigt!',
    booking_success_desc: 'Vielen Dank, dass Sie sich für Tramax Tours entschieden haben. Ihre Buchungsdetails finden Sie nachfolgend.',
    booking_voucher_pdf: 'PDF-Beleg herunterladen',
    booking_send_whatsapp: 'Über WhatsApp teilen',
    booking_cancel_btn: 'Reservierung stornieren',

    // Footer
    footer_about: 'Tramax Tours bietet erstklassige geführte Ausflüge, private Tempel- und Kulturreisen durch Südindien mit qualifizierten deutsch- und englischsprachigen Guides.',
    footer_quick_links: 'Schnelllinks',
    footer_top_destinations: 'Top Reiseziele',
    footer_contact_info: 'Kontakt & Standort',
    footer_rights: 'Alle Rechte vorbehalten. Tramax Tours & Travels.',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('tramax_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('tramax_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback = '') => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (currentDict[key]) return currentDict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  };

  const changeLanguage = (langCode) => {
    if (langCode === 'en' || langCode === 'de') {
      setLanguage(langCode);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback = '') => fallback || key,
    };
  }
  return context;
}
