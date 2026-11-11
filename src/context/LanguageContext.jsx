/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const LanguageContext = createContext();

// Comprehensive German Translation Dictionary
export const GERMAN_DICTIONARY = {
  // Navigation & Core Menu
  'Home': 'Startseite',
  'Destinations': 'Reiseziele',
  'Tours': 'Touren',
  'Testimonials': 'Gästebewertungen',
  'About Us': 'Über uns',
  'About': 'Über uns',
  'Contact Us': 'Kontakt',
  'Contact': 'Kontakt',
  'Request My Trip': 'Reise anfragen',
  'Explore Tours': 'Touren entdecken',
  'Sign In': 'Anmelden',
  'Sign Out': 'Abmelden',
  'Admin Console': 'Admin-Konsole',
  'My Bookings': 'Meine Buchungen',
  'Language': 'Sprache',
  'Select Language / Sprache': 'Sprache wählen / Select Language',
  'English': 'Englisch',
  'Deutsch': 'Deutsch',
  'German': 'Deutsch',

  // Tour Types & Categories
  'Special Experiences & Wellness Programs': 'Besondere Erlebnisse & Wellness-Programme',
  'Special Experiences': 'Besondere Erlebnisse',
  'City Sightseeing Tours': 'Stadtrundfahrten & Sightseeing',
  'Cultural & Heritage Tours': 'Kultur- & Kulturerbetouren',
  'Family Tours': 'Familientouren',
  'Guided Tours': 'Geführte Touren',
  'Historical Tours': 'Historische Touren',
  'One Day Tours': 'Eintägige Tagestouren',
  'Pilgrimage / Temple Tours': 'Pilger- & Tempeltouren',
  'Private Tours': 'Privattouren',
  'Surfing Tour': 'Surfkurs & Wellenabenteuer',
  'Surfing Your Best Day': 'Surfen: Ihr bester Tag auf den Wellen',
  'Medical Trips': 'Medizin- & Ayurveda-Reisen',
  'Medical Trip': 'Medizinische Reise',
  'Palm Leaf Horoscope': 'Palmblatt-Nadi-Astrologie',
  'Palm Leaf Reading': 'Palmblattlesung & Schicksalsdeutung',
  'Waves': 'Wellen',
  'Health': 'Gesundheit',
  'Nadi': 'Nadi',
  'Special': 'Besonders',
  'Ancient destiny predictions (Maharishis)': 'Uralte Schicksalsdeutungen der Maharishis',
  'Doctor consultations, surgery & wellness': 'Arztberatung, Chirurgie & Ayurveda-Wellness',
  'Surf lessons & ocean coaching': 'Surfunterricht & Ozean-Coaching',
  '1.5-Hour Lesson': '1,5-Stunden-Unterricht',
  'Covelong Point & Mahabalipuram Waves': 'Wellen in Covelong Point & Mahabalipuram',
  'Vaitheeswaran Kovil Heritage Temple Grounds': 'Historische Tempelanlage Vaitheeswaran Kovil',
  'Certified English & German Speaking Guides': 'Zertifizierte englisch- und deutschsprachige Guides',

  // Tour Detail Page, Attributes & Headers
  'Duration:': 'Dauer:',
  'Duration': 'Dauer',
  'Language:': 'Sprache:',
  'Language': 'Sprache',
  'Languages:': 'Sprachen:',
  'Languages': 'Sprachen',
  'Tour type:': 'Tourtyp:',
  'Tour type': 'Tourtyp',
  'Tour Types:': 'Tour-Kategorien:',
  'Tour Types': 'Tour-Kategorien',
  'Opening Times:': 'Öffnungszeiten:',
  'Opening Times': 'Öffnungszeiten',
  'Overview': 'Überblick & Reisebeschreibung',
  'Key Tour Information': 'Wichtige Tour-Informationen',
  'Highlights': 'Höhepunkte',
  'Tour Highlights': 'Tour-Höhepunkte',
  'Itinerary': 'Reiseverlauf',
  'Tour Itinerary': 'Tour-Reiseverlauf',
  'Day-by-Day Itinerary': 'Tagesablauf & Programm',
  'Places Covered & Route Map': 'Besuchte Sehenswürdigkeiten & Routenkarte',
  'Places Covered': 'Besuchte Sehenswürdigkeiten',
  'Route Map': 'Routenkarte',
  'Why Choose This Tour': 'Warum diese Tour wählen',
  'Pricing Tiers & Group Rates': 'Preise & Gruppenstaffelung',
  'Standard Package Rate': 'Standard-Paketpreis',
  'Tour Organizer & Inquiries': 'Veranstalter & Beratung',
  'Official E-Mail': 'Offizielle E-Mail',
  'Phone & WhatsApp': 'Telefon & WhatsApp',
  'Price Includes': 'Im Preis inbegriffen',
  'Price Excludes': 'Nicht im Preis inbegriffen',
  'Customer Reviews & Feedback': 'Kundenbewertungen & Feedback',
  'Customer Reviews': 'Kundenbewertungen',
  'Frequently Asked Questions': 'Häufig gestellte Fragen (FAQ)',
  'Related Tours You May Like': 'Weitere Touren, die Ihnen gefallen könnten',
  'Related Tours': 'Ähnliche Touren',
  'Ready to Begin Your South India Adventure?': 'Bereit für Ihr Südindien-Abenteuer?',
  'Let our specialists tailor an exclusive journey crafted entirely around your dreams.': 'Lassen Sie unsere Spezialisten eine exklusive Traumreise ganz nach Ihren Wünschen gestalten.',
  'Explore Tour Packages': 'Tour-Angebote entdecken',
  'Contact Our Specialists': 'Reise-Experten kontaktieren',
  'Private cab tour (not shared with others)': 'Private Autotour (exklusiv nur für Ihre Gruppe)',
  'Pickup and drop from your hotel / residence': 'Abholung und Rückbringung von Ihrem Hotel / Wohnort',
  'Full-day local sightseeing tour': 'Ganztägige lokale Sightseeing-Tour',
  '1 booked': '1 Buchung',

  // Booking Card, Price & Actions
  'STARTING FROM': 'AB',
  'Starting from': 'Ab',
  'Starting From': 'Ab',
  'per person': 'pro Person',
  '/ adult': '/ Erwachsener',
  '/ child': '/ Kind',
  'Select Travel Date:': 'Reisedatum wählen:',
  'Select Travel Date': 'Reisedatum wählen',
  'Travel Date': 'Reisedatum',
  'Number of Guests': 'Anzahl der Gäste',
  'Runs: Daily': 'Täglich verfügbar',
  'Runs Daily': 'Täglich verfügbar',
  'Book Now': 'Jetzt buchen',
  'Instant Booking': 'Sofort reservieren',
  'Reserve Your Tour': 'Tour reservieren',
  'Check Availability': 'Verfügbarkeit prüfen',
  'Confirm Reservation': 'Buchung bestätigen',
  'Pay on Arrival': 'Zahlung bei Ankunft',
  'Pay on Arrival / Cash or Card': 'Zahlung bei Ankunft / Bar oder Karte',
  'Total Price': 'Gesamtpreis',
  'Special Requests / Notes': 'Besondere Wünsche / Notizen',
  'Hotel Pickup Address / Location': 'Hotel / Abholadresse',
  'Pickup Location': 'Abholort',
  'Book via WhatsApp': 'Über WhatsApp buchen',
  'Direct WhatsApp Booking': 'Direkte WhatsApp-Buchung',
  'Chat on WhatsApp': 'Auf WhatsApp chatten',
  'Share on WhatsApp': 'Auf WhatsApp teilen',
  'Send WhatsApp Quotation': 'WhatsApp-Angebot senden',
  'Download PDF Receipt': 'PDF-Beleg herunterladen',
  'Download / Print PDF Voucher': 'PDF-Gutschein herunterladen / drucken',
  'Print PDF Voucher': 'PDF-Gutschein drucken',
  'Print Voucher': 'Gutschein drucken',
  'Share': 'Teilen',
  'Link Copied!': 'Link kopiert!',
  'View Tour': 'Tour ansehen',
  'View Details': 'Details ansehen',
  'reviews': 'Bewertungen',
  'review': 'Bewertung',

  // Search & Filter Bar
  'Search destination, tour, or attraction...': 'Reiseziel, Tour oder Attraktion suchen...',
  'Search Tours': 'Touren suchen',
  'All Destinations': 'Alle Reiseziele',
  'All Categories': 'Alle Kategorien',
  'All Durations': 'Alle Reisedauern',
  'Filter by Destination': 'Nach Reiseziel filtern',
  'Filter by Category': 'Nach Kategorie filtern',
  'Filter by Duration': 'Nach Dauer filtern',
  'Filter by Price': 'Nach Preis filtern',
  'Clear All Filters': 'Alle Filter zurücksetzen',
  'Reset Filters': 'Filter zurücksetzen',
  'Sort by': 'Sortieren nach',
  'Sort by:': 'Sortieren nach:',
  'Recommended': 'Empfohlen',
  'Price: Low to High': 'Preis: Aufsteigend',
  'Price: High to Low': 'Preis: Absteigend',
  'Duration: Short to Long': 'Dauer: Kürzeste zuerst',
  'Duration: Long to Short': 'Dauer: Längste zuerst',
  'Top Rated': 'Bestbewertet',
  'Showing': 'Angezeigt:',
  'entries': 'Einträge',

  // Homepage Sections
  'Choose Your Experience': 'Wählen Sie Ihr Reiseerlebnis',
  'From peaceful spiritual journeys to breathtaking coastal getaways, explore curated travel categories.': 'Von friedvollen Tempelreisen bis hin zu atemberaubenden Küstenausflügen – entdecken Sie handverlesene Reisekategorien.',
  'Curated Day Tours & Experiences': 'Ausgewählte Tagestouren & Erlebnisse',
  'Handpicked premium private excursions crafted for international travelers and culture lovers.': 'Handverlesene private Ausflüge, maßgeschneidert für internationale Reisende und Kulturbegeisterte.',
  'Why Travel With Wonderer South India': 'Warum mit Wonderer South India reisen?',
  'We blend heritage expertise, luxury chauffeur comforts, and transparent pricing for an exceptional holiday.': 'Wir verbinden lokales Kulturerbe, modernen Chauffeurkomfort und transparente Preise für einen perfekten Urlaub.',
  'Loved by Travelers Worldwide': 'Weltweit von Reisenden geschätzt',
  'Read real verified feedback from guests who explored Tamil Nadu and South India with us.': 'Echte Bewertungen unserer Gäste, die Südindien mit uns bereist haben.',
  'Discover the possibilities': 'Unbegrenzte Möglichkeiten entdecken',
  'With nearly half a million attractions, hotels & more, you’re sure to find joy.': 'Mit hunderten Attraktionen, Tempeln und Traumhotels erleben Sie pure Freude.',
  'Enjoy deals & delights': 'Beste Angebote & exklusive Vorteile',
  'Quality activities. Great prices. Plus, earn credits to save more.': 'Erstklassige Touren. Faire Preise. Unvergessliche Erinnerungen garantiert.',
  'Exploring made easy': 'Reisen leicht gemacht',
  'Book last minute, skip lines & get free cancellation for easier exploring.': 'Bequem buchen, Warteschlangen vermeiden und entspannt Südindien erkunden.',
  'Travel you can trust': 'Reisekomfort mit Vertrauen',
  "Read reviews & get reliable customer support. We're with you at every step.": 'Verifizierte Bewertungen und 24/7 persönlicher deutsch-/englischsprachiger Gästeservice.',
  'Planning your trip is simple and fun': 'Reiseplanung ist einfach und macht Spaß',
  'Local expert tour guides & Chauffeurs': 'Lokale Reiseexperten & private Chauffeure',
  'Sensational value & Pay on Arrival option': 'Hervorragendes Preis-Leistungs-Verhältnis & Bezahlung bei Ankunft',
  'Private tours operated solely for your group': 'Private Touren – exklusiv nur für Ihre Reisegruppe',

  // About Page
  'Who We Are': 'Wer wir sind',
  'What We Do': 'Was wir tun',
  'Why Book With Us?': 'Warum bei uns buchen?',
  'Travel You Can Truly Trust': 'Reisen, denen Sie vertrauen können',
  'Backed by experienced local drivers, seamless coordination, and transparent pricing.': 'Unterstützt von erfahrenen Chauffeuren, reibungsloser Organisation und transparenten Festpreisen.',
  'We Believe Planning Your Journey Should Be as Enjoyable as the Trip Itself.': 'Wir glauben, dass die Reiseplanung genauso viel Freude machen sollte wie die Reise selbst.',
  '100% Private Escorted Vehicles & Tailored Hospitality': '100% private Begleitfahrzeuge & maßgeschneiderte Gastfreundschaft',
  'Curating India\'s Most Fascinating Destinations': 'Indiens faszinierendste Reiseziele entdecken',
  'From majestic mist-clad mountains and serene backwater rivers to world-heritage temple architecture and tropical coastlines.': 'Von majestätischen Bergen und ruhigen Backwaters bis zu weltberühmten Tempelbauten und Tropenstränden.',
  'Hill Station Expeditions': 'Bergstations-Expeditionen',
  'Munnar, Ooty, Kodaikanal, and Wayanad misty heights with tea estates and panoramic viewpoints.': 'Munnar, Ooty, Kodaikanal und Wayanad Höhenzüge mit malerischen Teeplantagen.',
  'Sacred Temple Circuits': 'Heilige Tempel-Rundreisen',
  'Mahabalipuram shore carvings, Madurai Meenakshi, Rameshwaram, and Tanjore Chola architectural wonders.': 'Mahabalipuram Felsenreliefs, Madurai Meenakshi, Rameshwaram und Chola-Tempelwunder.',
  'Backwaters & Beaches': 'Backwaters & Tropenstrände',
  'Alleppey houseboat cruises, Pondicherry French quarters, and serene palm-lined Goa coastlines.': 'Alleppey Hausboot-Fahrten, Pondicherry Kolonialviertel und Goas Palmenstrände.',
  'Custom Itineraries': 'Maßgeschneiderte Reiserouten',
  '100% tailor-made schedules designed around your flight timings, family preferences, and budget.': '100% maßgeschneiderte Reiseabläufe, abgestimmt auf Ihre Flüge, Familie und Budget.',
  'Art & Cultural Heritage': 'Kunst & Kulturelles Erbe',
  'Wildlife & Nature Sanctuaries': 'Wildtier- & Naturschutzgebiete',

  // Plan Your Trip / Request My Trip
  '1. Contact & Guest Info': '1. Kontakt- & Gastinformationen',
  '2. Trip Schedule & Party Size': '2. Reisezeitraum & Gruppengröße',
  '3. Transportation & Flight/Train Schedules': '3. Transport & Flug-/Zugverbindungen',
  '4. Hotel Tier, Budget & Guide': '4. Hotelkategorie, Budget & Reiseleiter',
  '5. Tour Experience Interests': '5. Gewünschte Reiseerlebnisse',
  '6. Attached Documents': '6. Angehängte Reisedokumente',
  '7. Customer Message & Notes': '7. Persönliche Nachricht & Wünsche',
  'WhatsApp / Phone': 'WhatsApp / Telefon',
  'Email Address': 'E-Mail-Adresse',
  'Country / Nationality': 'Land / Nationalität',
  'Name Breakdown': 'Namensaufteilung',
  'Destination(s)': 'Reiseziel(e)',
  'Pickup Point': 'Abholort',
  'Dates & Duration': 'Reisedaten & Dauer',
  'Travelers': 'Reisende',
  'Vehicle:': 'Fahrzeug:',
  'Airport Pickup:': 'Flughafen-Abholung:',
  'Airport Drop:': 'Flughafen-Rückbringung:',
  'Flight / Train:': 'Flug / Zug:',
  'Stay Tier': 'Hotelkategorie',
  'Tour Guide & Language': 'Reiseleiter & Sprache',
  'Customer Budget': 'Kundenbudget',
  'Passport Copy:': 'Reisepass-Kopie:',
  'Flight Ticket:': 'Flugticket:',
  'Quotation Package Amount:': 'Angebotspreis Gesamtpaket:',
  'Internal Coordinator Notes:': 'Hinweise des Reisekoordinators:',
  'Quote Pending': 'Angebot in Bearbeitung',
  'Attached (Private Storage)': 'Angehängt (Geschützter Speicher)',
  'Not provided': 'Nicht angegeben',
  'Required': 'Erforderlich',
  'Yes': 'Ja',
  'No': 'Nein',
  'Flexible': 'Flexibel',

  // Footer & Common
  'Quick Links': 'Schnelllinks',
  'Top Destinations': 'Top Reiseziele',
  'Contact Information': 'Kontaktinformationen',
  'All rights reserved. Wonderer South India.': 'Alle Rechte vorbehalten. Wonderer South India.',
  'All rights reserved.': 'Alle Rechte vorbehalten.',
  'Something went wrong': 'Etwas ist schiefgelaufen',
  'We encountered an unexpected error while loading this section. Please try reloading the page.': 'Beim Laden dieses Bereichs ist ein unerwarteter Fehler aufgetreten. Bitte laden Sie die Seite neu.',
  'Reload Page': 'Seite neu laden',
  'Back to Homepage': 'Zurück zur Startseite',
  'Page Not Found': 'Seite nicht gefunden',

  // Words & Short Tokens
  'Days': 'Tage',
  'Day': 'Tag',
  'Nights': 'Nächte',
  'Night': 'Nacht',
  'Hours': 'Stunden',
  'Hour': 'Stunde',
  'Adults': 'Erwachsene',
  'Adult': 'Erwachsener',
  'Kids': 'Kinder',
  'Kid': 'Kind',
  'Children': 'Kinder',
  'Child': 'Kind',
  'Infants': 'Kleinkinder',
  'Infant': 'Kleinkind',
  'Rooms': 'Zimmer',
  'Room': 'Zimmer',
  'Guests': 'Gäste',
  'Guest': 'Gast',
};

// Sort keys by descending length so phrases match before individual words
const SORTED_DE_KEYS = Object.keys(GERMAN_DICTIONARY).sort((a, b) => b.length - a.length);

/**
 * Translates an English text string into German using the dictionary
 */
export function translateTextToGerman(text) {
  if (!text || typeof text !== 'string') return text;
  let translated = text;

  // Direct exact match
  if (GERMAN_DICTIONARY[translated.trim()]) {
    const trimmed = translated.trim();
    return translated.replace(trimmed, GERMAN_DICTIONARY[trimmed]);
  }

  // Substring phrase replacement
  for (const k of SORTED_DE_KEYS) {
    if (translated.includes(k)) {
      translated = translated.split(k).join(GERMAN_DICTIONARY[k]);
    }
  }

  return translated;
}

export const TRANSLATIONS = {
  en: { ...GERMAN_DICTIONARY }, // in EN mode, keys represent the default
  de: GERMAN_DICTIONARY,
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('wanderer_language') || 'en';
  });

  const observerRef = useRef(null);

  // Sync language with HTML lang attribute and localStorage
  useEffect(() => {
    localStorage.setItem('wanderer_language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Real-time DOM Text Translator & Google Translate Engine
  useEffect(() => {
    if (language === 'de') {
      // 1. Activate Google Website Translate if available
      try {
        document.cookie = 'googtrans=/en/de; path=/; domain=' + window.location.hostname;
        document.cookie = 'googtrans=/en/de; path=/;';
        
        // Dynamically load Google Translate element script once
        if (!document.getElementById('google-translate-script')) {
          window.googleTranslateElementInit = function () {
            if (window.google?.translate?.TranslateElement) {
              new window.google.translate.TranslateElement(
                { pageLanguage: 'en', includedLanguages: 'en,de', autoDisplay: false },
                'google_translate_element'
              );
            }
          };
          const s = document.createElement('script');
          s.id = 'google-translate-script';
          s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          document.body.appendChild(s);
        }

        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'de';
          select.dispatchEvent(new Event('change'));
        }
      } catch {
        // Continue with local dictionary translator
      }

      // 2. Client-Side Live DOM Translator
      const translateNode = (node) => {
        if (!node) return;

        // Text nodes
        if (node.nodeType === Node.TEXT_NODE) {
          const val = node.nodeValue;
          if (val && val.trim().length > 0) {
            if (!node._originalEn) {
              node._originalEn = val;
            }
            const translated = translateTextToGerman(val);
            if (translated !== val) {
              node.nodeValue = translated;
            }
          }
          return;
        }

        // Element attributes (placeholders, titles, aria-labels)
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Skip script, style, code, and svg tags
          const tag = node.tagName.toLowerCase();
          if (['script', 'style', 'code', 'pre', 'noscript'].includes(tag)) {
            return;
          }

          if (node.placeholder) {
            if (!node._originalPlaceholder) {
              node._originalPlaceholder = node.placeholder;
            }
            node.placeholder = translateTextToGerman(node._originalPlaceholder);
          }

          if (node.title) {
            if (!node._originalTitle) {
              node._originalTitle = node.title;
            }
            node.title = translateTextToGerman(node._originalTitle);
          }

          if (node.getAttribute('aria-label')) {
            if (!node._originalAria) {
              node._originalAria = node.getAttribute('aria-label');
            }
            node.setAttribute('aria-label', translateTextToGerman(node._originalAria));
          }

          // Walk children
          for (let child = node.firstChild; child; child = child.nextSibling) {
            translateNode(child);
          }
        }
      };

      // Initial pass
      translateNode(document.body);

      // Mutation Observer to translate dynamic changes, page navigation & AJAX
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      let timeoutId = null;
      observerRef.current = new MutationObserver((mutations) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          for (const m of mutations) {
            if (m.type === 'childList') {
              m.addedNodes.forEach(translateNode);
            } else if (m.type === 'characterData') {
              const node = m.target;
              if (node && node.nodeValue && !node._originalEn) {
                translateNode(node);
              }
            }
          }
        }, 30);
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

    } else {
      // Revert to English
      try {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
      } catch {
        // Ignore
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Restore original English text
      const restoreNode = (node) => {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE && node._originalEn) {
          node.nodeValue = node._originalEn;
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node._originalPlaceholder) {
            node.placeholder = node._originalPlaceholder;
          }
          if (node._originalTitle) {
            node.title = node._originalTitle;
          }
          if (node._originalAria) {
            node.setAttribute('aria-label', node._originalAria);
          }
          for (let child = node.firstChild; child; child = child.nextSibling) {
            restoreNode(child);
          }
        }
      };

      restoreNode(document.body);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [language]);

  const t = (key, fallback = '') => {
    if (language === 'de') {
      if (GERMAN_DICTIONARY[key]) return GERMAN_DICTIONARY[key];
      return translateTextToGerman(fallback || key);
    }
    return fallback || key;
  };

  const changeLanguage = (langCode) => {
    if (langCode === 'en' || langCode === 'de') {
      setLanguageState(langCode);
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
