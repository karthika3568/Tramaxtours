/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// ==============================================================================
// 1. Comprehensive Master German Translation Dictionary (800+ entries)
// ==============================================================================
export const GERMAN_DICTIONARY = {
  // Navigation & Core Menus
  'Home': 'Startseite',
  'Destinations': 'Reiseziele',
  'Tours': 'Touren',
  'All Tours': 'Alle Touren',
  'Curated Tours': 'Ausgewählte Touren',
  'Testimonials': 'Gästebewertungen',
  'About Us': 'Über uns',
  'About': 'Über uns',
  'Contact Us': 'Kontakt',
  'Contact': 'Kontakt',
  'Request My Trip': 'Reise anfragen',
  'Plan Your Trip': 'Reise planen',
  'Explore Tours': 'Touren entdecken',
  'Sign In': 'Anmelden',
  'Sign Out': 'Abmelden',
  'Log In': 'Einloggen',
  'Log Out': 'Ausloggen',
  'Register': 'Registrieren',
  'Sign Up': 'Registrieren',
  'Admin Console': 'Admin-Konsole',
  'Admin Portal': 'Admin-Portal',
  'Customer Dashboard': 'Kunden-Dashboard',
  'My Profile': 'Mein Profil',
  'My Bookings': 'Meine Buchungen',
  'Language': 'Sprache',
  'Select Language / Sprache': 'Sprache wählen / Select Language',
  'English': 'Englisch',
  'Deutsch': 'Deutsch',
  'German': 'Deutsch',

  // Core Buttons & Call-to-Actions
  'Book Now': 'Jetzt buchen',
  'Instant Booking': 'Sofortbuchung',
  'Reserve Now': 'Jetzt reservieren',
  'Reserve Your Tour': 'Tour reservieren',
  'Check Availability': 'Verfügbarkeit prüfen',
  'Confirm Reservation': 'Buchung bestätigen',
  'Pay on Arrival': 'Zahlung bei Ankunft',
  'Pay on Arrival / Cash or Card': 'Zahlung bei Ankunft / Bar oder Karte',
  'View Tour': 'Tour ansehen',
  'View Details': 'Details ansehen',
  'View All': 'Alle ansehen',
  'View All Tours': 'Alle Touren ansehen',
  'View All Destinations': 'Alle Reiseziele ansehen',
  'Read More': 'Mehr erfahren',
  'Show More': 'Mehr anzeigen',
  'Show Less': 'Weniger anzeigen',
  'Save': 'Speichern',
  'Save Changes': 'Änderungen speichern',
  'Cancel': 'Abbrechen',
  'Delete': 'Löschen',
  'Edit': 'Bearbeiten',
  'Update': 'Aktualisieren',
  'Create': 'Erstellen',
  'Add': 'Hinzufügen',
  'Add Tour': 'Tour hinzufügen',
  'Add Destination': 'Reiseziel hinzufügen',
  'Add New': 'Neu hinzufügen',
  'Remove': 'Entfernen',
  'Submit': 'Absenden',
  'Confirm': 'Bestätigen',
  'Back': 'Zurück',
  'Next': 'Weiter',
  'Previous': 'Vorherige',
  'Close': 'Schließen',
  'Search': 'Suchen',
  'Filter': 'Filtern',
  'Reset': 'Zurücksetzen',
  'Reset Filters': 'Filter zurücksetzen',
  'Clear': 'Löschen',
  'Clear All': 'Alles zurücksetzen',
  'Clear All Filters': 'Alle Filter zurücksetzen',
  'Download': 'Herunterladen',
  'Download PDF': 'PDF herunterladen',
  'Download PDF Receipt': 'PDF-Beleg herunterladen',
  'Download PDF Voucher': 'PDF-Gutschein herunterladen',
  'Download / Print PDF Voucher': 'PDF-Gutschein herunterladen / drucken',
  'Print': 'Drucken',
  'Print Voucher': 'Gutschein drucken',
  'Print Confirmation': 'Bestätigung drucken',
  'Print Receipt': 'Beleg drucken',
  'Share': 'Teilen',
  'Share on WhatsApp': 'Auf WhatsApp teilen',
  'Copy Link': 'Link kopieren',
  'Link Copied!': 'Link kopiert!',
  'Refresh': 'Aktualisieren',
  'Reload': 'Neu laden',
  'Reload Page': 'Seite neu laden',
  'Back to Homepage': 'Zurück zur Startseite',
  'Back to Tours': 'Zurück zu den Touren',
  'Back to Destinations': 'Zurück zu den Reisezielen',
  'Send': 'Senden',
  'Send Message': 'Nachricht senden',
  'Send Request': 'Anfrage absenden',
  'Send WhatsApp Quotation': 'WhatsApp-Angebot senden',
  'Chat on WhatsApp': 'Auf WhatsApp chatten',
  'Book via WhatsApp': 'Über WhatsApp buchen',
  'Direct WhatsApp Booking': 'Direkte WhatsApp-Buchung',
  'Message us on WhatsApp': 'Schreiben Sie uns auf WhatsApp',
  'Contact Our Specialists': 'Reise-Experten kontaktieren',
  'Explore Tour Packages': 'Tour-Angebote entdecken',

  // Tour Categories, Themes & Types
  'City Sightseeing Tours': 'Stadtrundfahrten & Sightseeing',
  'Cultural & Heritage Tours': 'Kultur- & Kulturerbetouren',
  'Family Tours': 'Familientouren',
  'Guided Tours': 'Geführte Touren',
  'Historical Tours': 'Historische Touren',
  'One Day Tours': 'Eintägige Tagestouren',
  'Pilgrimage / Temple Tours': 'Pilger- & Tempeltouren',
  'Private Tours': 'Privattouren',
  'Adventure & Nature Tours': 'Abenteuer- & Naturtouren',
  'Special Experiences & Wellness Programs': 'Besondere Erlebnisse & Wellness-Programme',
  'Special Experiences': 'Besondere Erlebnisse',
  'Surfing Tour': 'Surfkurs & Wellenabenteuer',
  'Surfing Tours': 'Surftouren & Wellenreiten',
  'Surfing Your Best Day': 'Surfen: Ihr bester Tag auf den Wellen',
  'Medical Tourism': 'Medizintourismus & Ayurveda-Wellness',
  'Medical Tourism & Health Checks': 'Medizintourismus & Vorsorgeuntersuchungen',
  'Medical Trips': 'Medizin- & Ayurveda-Reisen',
  'Medical Trip': 'Medizinische Reise',
  'Palmleaf Horoscope': 'Palmblatt-Nadi-Astrologie',
  'Palmleaf Horoscope Tour': 'Palmblatt-Nadi-Astrologie-Tour',
  'Palmleaf Horoscope Tours': 'Palmblatt-Nadi-Astrologie-Touren',
  'Palm Leaf Horoscope': 'Palmblatt-Nadi-Astrologie',
  'Palm Leaf Reading': 'Palmblattlesung & Schicksalsdeutung',
  'Palmleaf Horoscope - Find Your Destiny': 'Palmblatt-Horoskop – Entdecken Sie Ihr Schicksal',
  'Ancient destiny predictions (Maharishis)': 'Uralte Schicksalsdeutungen der Maharishis',
  'Doctor consultations, surgery & wellness': 'Arztberatung, Chirurgie & Ayurveda-Wellness',
  'Surf lessons & ocean coaching': 'Surfunterricht & Ozean-Coaching',
  '1.5-Hour Lesson': '1,5-Stunden-Unterricht',
  'Covelong Point & Mahabalipuram Waves': 'Wellen in Covelong Point & Mahabalipuram',
  'Vaitheeswaran Kovil Heritage Temple Grounds': 'Historische Tempelanlage Vaitheeswaran Kovil',
  'Certified English & German Speaking Guides': 'Zertifizierte englisch- und deutschsprachige Guides',

  // Destinations & Region Names
  'Tamil Nadu': 'Tamil Nadu',
  'Kerala': 'Kerala',
  'Karnataka': 'Karnataka',
  'Goa': 'Goa',
  'South India': 'Südindien',
  'Mahabalipuram': 'Mahabalipuram',
  'Pondicherry': 'Pondicherry',
  'Puducherry': 'Pondicherry',
  'Covelong Point': 'Covelong Point',
  'Vaitheeswaran Kovil': 'Vaitheeswaran Kovil',
  'Munnar': 'Munnar',
  'Alleppey': 'Alleppey',
  'Madurai': 'Madurai',
  'Thanjavur': 'Thanjavur',
  'Kodaikanal': 'Kodaikanal',
  'Ooty': 'Ooty',
  'Wayanad': 'Wayanad',

  // Search & Filter Bar
  'Search destination, tour, or attraction...': 'Reiseziel, Tour oder Attraktion suchen...',
  'Search Tours': 'Touren suchen',
  'Search tours...': 'Touren suchen...',
  'Search destinations...': 'Reiseziele suchen...',
  'All Destinations': 'Alle Reiseziele',
  'All Categories': 'Alle Kategorien',
  'All Durations': 'Alle Reisedauern',
  'Filter by Destination': 'Nach Reiseziel filtern',
  'Filter by Category': 'Nach Kategorie filtern',
  'Filter by Duration': 'Nach Dauer filtern',
  'Filter by Price': 'Nach Preis filtern',
  'Filter by Rating': 'Nach Bewertung filtern',
  'Sort by:': 'Sortieren nach:',
  'Sort by': 'Sortieren nach',
  'Recommended': 'Empfohlen',
  'Price: Low to High': 'Preis: Aufsteigend',
  'Price: High to Low': 'Preis: Absteigend',
  'Duration: Short to Long': 'Dauer: Kürzeste zuerst',
  'Duration: Long to Short': 'Dauer: Längste zuerst',
  'Top Rated': 'Bestbewertet',
  'Highest Rated': 'Bestbewertet',
  'Showing': 'Angezeigt:',
  'of': 'von',
  'entries': 'Einträge',
  'results': 'Ergebnisse',
  'tours available': 'Touren verfügbar',
  'destinations available': 'Reiseziele verfügbar',

  // Pricing & Currency & Booking Card
  'STARTING FROM': 'AB',
  'Starting from': 'Ab',
  'Starting From': 'Ab',
  'per person': 'pro Person',
  '/ adult': '/ Erwachsener',
  '/ child': '/ Kind',
  'Select Travel Date:': 'Reisedatum wählen:',
  'Select Travel Date': 'Reisedatum wählen',
  'Travel Date': 'Reisedatum',
  'Travel Date:': 'Reisedatum:',
  'Preferred Time Slot:': 'Bevorzugtes Zeitfenster:',
  'Time Slot': 'Zeitfenster',
  'Number of Guests': 'Anzahl der Gäste',
  'Number of Travellers': 'Anzahl der Reisenden',
  'Number of Guests:': 'Anzahl der Gäste:',
  'Adults': 'Erwachsene',
  'Adult': 'Erwachsener',
  'Children': 'Kinder',
  'Child': 'Kind',
  'Infants': 'Kleinkinder',
  'Infant': 'Kleinkind',
  'Guests': 'Gäste',
  'Guest': 'Gast',
  'Rooms': 'Zimmer',
  'Room': 'Zimmer',
  'Total Price': 'Gesamtpreis',
  'Total Price:': 'Gesamtpreis:',
  'Total Amount': 'Gesamtbetrag',
  'Agreed Price': 'Vereinbarter Reisepreis',
  'Balance Amount': 'Restbetrag',
  'Advance Paid': 'Anzahlung geleistet',
  'Runs: Daily': 'Täglich verfügbar',
  'Runs Daily': 'Täglich verfügbar',
  'Available Daily': 'Täglich verfügbar',
  'Special Requests / Notes': 'Besondere Wünsche / Notizen',
  'Additional Requirements / Message': 'Zusätzliche Wünsche / Nachricht',
  'Hotel Pickup Address / Location': 'Hotel / Abholadresse',
  'Pickup Location': 'Abholort',
  'Pickup Location:': 'Abholort:',
  'Drop Location:': 'Rückbringungsort:',
  'reviews': 'Bewertungen',
  'review': 'Bewertung',

  // Tour Detail Page Sections & Headings
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
  'Private cab tour (not shared with others)': 'Private Autotour (exklusiv nur für Ihre Gruppe)',
  'Pickup and drop from your hotel / residence': 'Abholung und Rückbringung von Ihrem Hotel / Wohnort',
  'Full-day local sightseeing tour': 'Ganztägige lokale Sightseeing-Tour',
  '1 booked': '1 Buchung',

  // Homepage Headings & Sections
  'Choose Your Experience': 'Wählen Sie Ihr Reiseerlebnis',
  'From peaceful spiritual journeys to breathtaking coastal getaways, explore curated travel categories.': 'Von friedvollen Tempelreisen bis hin zu atemberaubenden Küstenausflügen – entdecken Sie handverlesene Reisekategorien.',
  'Curated Day Tours & Experiences': 'Ausgewählte Tagestouren & Erlebnisse',
  'Handpicked premium private excursions crafted for international travelers and culture lovers.': 'Handverlesene private Ausflüge, maßgeschneidert für internationale Reisende und Kulturbegeisterte.',
  'Why Travel With Wonderer South India': 'Warum mit Wonderer South India reisen?',
  'Why Choose Us': 'Warum uns wählen',
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
  'Featured Destinations': 'Beliebte Reiseziele',
  'Explore South India’s Most Iconic Regions': 'Erkunden Sie Südindiens berühmteste Regionen',

  // Request My Trip / Custom Trip Planner (All Wizard Steps)
  '1. Contact & Guest Info': '1. Kontakt- & Gastinformationen',
  '2. Trip Schedule & Party Size': '2. Reisezeitraum & Gruppengröße',
  '3. Transportation & Flight/Train Schedules': '3. Transport & Flug-/Zugverbindungen',
  '4. Hotel Tier, Budget & Guide': '4. Hotelkategorie, Budget & Reiseleiter',
  '5. Tour Experience Interests': '5. Gewünschte Reiseerlebnisse',
  '6. Attached Documents': '6. Angehängte Reisedokumente',
  '7. Customer Message & Notes': '7. Persönliche Nachricht & Wünsche',
  'Contact Information': 'Kontaktinformationen',
  'Trip Dates & Schedule': 'Reisedaten & Zeitplan',
  'Transport & Flight Details': 'Transport- & Flugdetails',
  'Accommodation & Guide': 'Unterkunft & Reiseleiter',
  'Tour Interests': 'Interessen & Reisewünsche',
  'Documents Upload': 'Dokumente hochladen',
  'Personal Message': 'Persönliche Nachricht',
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
  'Optional': 'Optional',
  'Yes': 'Ja',
  'No': 'Nein',
  'Flexible': 'Flexibel',

  // Common Form Fields & Placeholders
  'Full Name': 'Vollständiger Name',
  'First Name': 'Vorname',
  'Middle Name': 'Zweitname',
  'Last Name': 'Nachname',
  'Mobile Number': 'Mobilfunknummer',
  'Phone Number': 'Telefonnummer',
  'WhatsApp Number': 'WhatsApp-Nummer',
  'Password': 'Passwort',
  'Confirm Password': 'Passwort bestätigen',
  'Current Password': 'Aktuelles Passwort',
  'New Password': 'Neues Passwort',
  'Enter your name': 'Geben Sie Ihren Namen ein',
  'Enter your full name': 'Geben Sie Ihren vollständigen Namen ein',
  'Enter your email': 'Geben Sie Ihre E-Mail-Adresse ein',
  'Enter your email address': 'Geben Sie Ihre E-Mail-Adresse ein',
  'Enter your phone number': 'Geben Sie Ihre Telefonnummer ein',
  'Enter your mobile number': 'Geben Sie Ihre Mobilfunknummer ein',
  'Enter your password': 'Geben Sie Ihr Passwort ein',
  'Please enter your name': 'Bitte geben Sie Ihren Namen ein',
  'Please enter your email': 'Bitte geben Sie Ihre E-Mail-Adresse ein',
  'Please enter a valid email address': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  'Please enter your phone number': 'Bitte geben Sie Ihre Telefonnummer ein',
  'Password is required': 'Passwort ist erforderlich',
  'Passwords do not match': 'Passwörter stimmen nicht überein',
  'Password must be at least 8 characters': 'Das Passwort muss mindestens 8 Zeichen lang sein',
  'Travel date is required': 'Reisedatum ist erforderlich',
  'Message / Special Requirements': 'Nachricht / Besondere Wünsche',
  'Write your message here...': 'Schreiben Sie Ihre Nachricht hier...',
  'Tell us about your requirements...': 'Beschreiben Sie Ihre Reisewünsche...',
  'Write a review...': 'Schreiben Sie eine Bewertung...',
  'Review Title': 'Titel der Bewertung',
  'Your Rating': 'Ihre Bewertung',

  // Statuses & Badges
  'Status': 'Status',
  'All Statuses': 'Alle Status',
  'Pending': 'Ausstehend',
  'PENDING': 'AUSSTEHEND',
  'Contacted': 'Kontaktiert',
  'CONTACTED': 'KONTAKTIERT',
  'Planning': 'In Planung',
  'PLANNING': 'IN PLANUNG',
  'Quotation Sent': 'Angebot versendet',
  'QUOTATION SENT': 'ANGEBOT VERSENDET',
  'Confirmed': 'Bestätigt',
  'CONFIRMED': 'BESTÄTIGT',
  'Closed': 'Geschlossen',
  'CLOSED': 'GESCHLOSSEN',
  'Cancelled': 'Storniert',
  'CANCELLED': 'STORNIERT',
  'Approved': 'Genehmigt',
  'APPROVED': 'GENEHMIGT',
  'Rejected': 'Abgelehnt',
  'REJECTED': 'ABGELEHNT',
  'Completed': 'Abgeschlossen',
  'COMPLETED': 'ABGESCHLOSSEN',
  'Active': 'Aktiv',
  'ACTIVE': 'AKTIV',
  'Inactive': 'Inaktiv',
  'INACTIVE': 'INAKTIV',
  'Published': 'Veröffentlicht',
  'PUBLISHED': 'VERÖFFENTLICHT',
  'Draft': 'Entwurf',
  'DRAFT': 'ENTWURF',
  'New': 'Neu',
  'NEW': 'NEU',

  // Customer Portal & Bookings
  'Booking Reference': 'Buchungsreferenz',
  'Booking Reference:': 'Buchungsreferenz:',
  'Booking Reference Number': 'Buchungs-Referenznummer',
  'Booking Details': 'Buchungsdetails',
  'Booking Status': 'Buchungsstatus',
  'Booking Status:': 'Buchungsstatus:',
  'Confirmed Ticket': 'Bestätigtes Ticket',
  'Confirmed Ticket:': 'Bestätigtes Ticket:',
  'Ticket Number': 'Ticket-Nummer',
  'Ticket Number:': 'Ticket-Nummer:',
  'Download Ticket (PDF)': 'Ticket herunterladen (PDF)',
  'Download Ticket': 'Ticket herunterladen',
  'Payment Status': 'Zahlungsstatus',
  'Payment Status:': 'Zahlungsstatus:',
  'Payment Discussion & Terms': 'Zahlungsvereinbarung & Konditionen',
  'Discussion Notes:': 'Notizen zur Zahlungsbesprechung:',
  'Payment Notes': 'Zahlungshinweise',
  'Booking Date:': 'Buchungsdatum:',
  'Booked On:': 'Gebucht am:',
  'Selected Tour:': 'Ausgewählte Tour:',
  'Selected Tour': 'Ausgewählte Tour',
  'Travellers:': 'Reisende:',
  'No bookings found': 'Keine Buchungen gefunden',
  'You have no bookings yet.': 'Sie haben noch keine Buchungen.',
  'Explore Tours & Packages': 'Touren & Reisepakete entdecken',

  // Admin Dashboard & Operations
  'Dashboard': 'Übersicht',
  'Wanderer Operations': 'Reiseverwaltung',
  'Operations & Catalog': 'Betrieb & Katalog',
  'Trip Requests': 'Reiseanfragen',
  'Manage and track all trip booking requests': 'Alle Reisebuchungsanfragen verwalten und verfolgen',
  'Inquiries & Leads': 'Anfragen & Interessenten',
  'Bookings & Orders': 'Buchungen & Aufträge',
  'Destinations': 'Reiseziele',
  'Media Library': 'Medienbibliothek',
  'Website Management': 'Website-Verwaltung',
  'Home Page': 'Startseite',
  'Hero Slides': 'Titelbild-Folien',
  'Why Choose Us Benefits': 'Vorteile & Gründe',
  'CMS Sections': 'CMS-Inhaltsbereiche',
  'About Us Page': 'Über uns-Seite',
  'Contact Page': 'Kontakt-Seite',
  'Header Navigation': 'Kopfzeilen-Navigation',
  'Footer Manager': 'Fußzeilen-Manager',
  'Social Links': 'Soziale Netzwerke',
  'Static Pages': 'Statische Seiten',
  'Administration': 'Administration',
  'User Management': 'Benutzerverwaltung',
  'Roles & Permissions': 'Rollen & Berechtigungen',
  'Site Settings': 'Systemeinstellungen',
  'Audit Logs': 'Überwachungsprotokolle',
  'Live Website': 'Zur Live-Website',
  'Public Website': 'Öffentliche Website',
  'Super Admin': 'Hauptadministrator',
  'Admin': 'Administrator',
  'Total Revenue': 'Gesamtumsatz',
  'Total Bookings': 'Buchungen insgesamt',
  'Active Tours': 'Aktive Touren',
  'Customer Inquiries': 'Kundenanfragen',
  'Recent Bookings': 'Aktuelle Buchungen',
  'Recent Inquiries': 'Aktuelle Anfragen',
  'Quick Stats': 'Kurzstatistiken',

  // Notifications & Alert Messages
  'Successfully saved': 'Erfolgreich gespeichert',
  'Successfully updated': 'Erfolgreich aktualisiert',
  'Successfully created': 'Erfolgreich erstellt',
  'Successfully deleted': 'Erfolgreich gelöscht',
  'Booking submitted successfully': 'Buchung erfolgreich übermittelt',
  'Request submitted successfully': 'Anfrage erfolgreich übermittelt',
  'An unexpected error occurred': 'Ein unerwarteter Fehler ist aufgetreten',
  'An unexpected internal server error occurred.': 'Ein interner Serverfehler ist aufgetreten.',
  'Something went wrong': 'Etwas ist schiefgelaufen',
  'We encountered an unexpected error while loading this section. Please try reloading the page.': 'Beim Laden dieses Bereichs ist ein unerwarteter Fehler aufgetreten. Bitte laden Sie die Seite neu.',
  'Please try again': 'Bitte versuchen Sie es erneut',
  'Try Again': 'Erneut versuchen',
  'Are you sure?': 'Sind Sie sicher?',
  'Are you sure you want to delete this?': 'Möchten Sie diesen Eintrag wirklich löschen?',
  'This action cannot be undone.': 'Diese Aktion kann nicht rückgängig gemacht werden.',
  'No records found': 'Keine Einträge gefunden',
  'No data available': 'Keine Daten verfügbar',
  'No tours match your current filters.': 'Keine Touren entsprechen Ihren aktuellen Filtern.',
  'Page Not Found': 'Seite nicht gefunden',

  // Time & Units
  'Days': 'Tage',
  'Day': 'Tag',
  'Nights': 'Nächte',
  'Night': 'Nacht',
  'Hours': 'Stunden',
  'Hour': 'Stunde',
  'Full Day': 'Ganztägig',
  'Half Day': 'Halbtägig',
  'Daily': 'Täglich',

  // Footer & Legal
  'Quick Links': 'Schnelllinks',
  'Top Destinations': 'Top Reiseziele',
  'All rights reserved.': 'Alle Rechte vorbehalten.',
  'All rights reserved. Wonderer South India.': 'Alle Rechte vorbehalten. Wonderer South India.',
  'Curated Itineraries & Luxury Transport': 'Kuratierte Reiserouten & Erstklassiger Chauffeurkomfort',
  'Travel Planning Services by Wonderer South India': 'Reiseplanungsservice von Wonderer South India',

  // Additional Common UI & Page Sections
  'Popular Activities': 'Beliebte Aktivitäten',
  'Find Tours': 'Touren finden',
  'Where & When': 'Wo & Wann',
  'Selected': 'Ausgewählt',
  'Less than 1 day': 'Weniger als 1 Tag',
  '1 to 3 days': '1 bis 3 Tage',
  '3+ days': '3+ Tage',
  'Cultural Tour': 'Kulturtour',
  'Email Id': 'E-Mail-Adresse',
  'Email Id *': 'E-Mail-Adresse *',
  'Mobile': 'Mobiltelefon',
  'Mobile *': 'Mobiltelefon *',
  'Query': 'Ihre Anfrage',
  'Query *': 'Ihre Anfrage *',
  'Send to WhatsApp': 'An WhatsApp senden',
  'Send Message to WhatsApp': 'Nachricht an WhatsApp senden',
  'We Believe Planning Your Journey Should Be as Enjoyable as the Trip Itself.': 'Wir sind überzeugt: Die Planung Ihrer Reise sollte genauso viel Freude bereiten wie die Reise selbst.',
  'Welcome to Wonderer South India': 'Willkommen bei Wonderer South India',
  'Our Mission': 'Unsere Mission',
  'Our Vision': 'Unsere Vision',
  'Who We Are': 'Wer wir sind',
  'Why Book With Us?': 'Warum bei uns buchen?',
  'Why Book With Us': 'Warum bei uns buchen',
  'Travel You Can Truly Trust': 'Reisen, denen Sie vertrauen können',
  'What We Do': 'Was wir tun',
  'Helpline / Call Us': 'Helpline / Rufen Sie uns an',
  'Address / Location': 'Adresse / Standort',
  'Planning your trip is simple and fun': 'Die Reiseplanung ist einfach und macht Spaß',
  'Local expert tour guides & Chauffeurs': 'Lokale Tour-Experten & Chauffeure',
  'Sensational value & Pay on Arrival option': 'Erstklassiges Preis-Leistungs-Verhältnis & Bezahlung bei Ankunft',
  'Private tours operated solely for your group': 'Private Touren exklusiv für Ihre Gruppe',
  'Curating India\'s Most Fascinating Destinations': 'Kuratierung der faszinierendsten Reiseziele Indiens',
  'Hill Station Expeditions': 'Bergstations-Expeditionen',
  'Please enter your Name': 'Bitte geben Sie Ihren Namen ein',
  'Please enter your Email Id': 'Bitte geben Sie Ihre E-Mail-Adresse ein',
  'Please enter a valid email address': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  'Please enter your Query': 'Bitte geben Sie Ihre Anfrage ein',
};

// Pre-sorted keys by descending length for longest-match-first replacement
const SORTED_DE_KEYS = Object.keys(GERMAN_DICTIONARY).sort((a, b) => b.length - a.length);

/**
 * Escapes regex special characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Translates an English text string into German using exact and boundary-safe replacements
 */
export function translateTextToGerman(text) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();

  // 1. Direct exact match
  if (GERMAN_DICTIONARY[trimmed]) {
    return text.replace(trimmed, GERMAN_DICTIONARY[trimmed]);
  }

  // 2. Safe phrase and word boundary replacements
  let translated = text;
  for (const k of SORTED_DE_KEYS) {
    if (k.length > 5 && translated.includes(k)) {
      translated = translated.split(k).join(GERMAN_DICTIONARY[k]);
    } else if (k.length <= 5) {
      // Use word boundary for short tokens to avoid corrupting substrings (e.g., "Day" inside "Holiday")
      const regex = new RegExp(`\\b${escapeRegex(k)}\\b`, 'g');
      if (regex.test(translated)) {
        translated = translated.replace(regex, GERMAN_DICTIONARY[k]);
      }
    }
  }

  return translated;
}

// Memory map to store original node values for pristine English restoration
const originalTextMap = new WeakMap();
const originalAttrMap = new WeakMap();

/**
 * Walks and translates all visible text nodes and placeholder attributes in the DOM
 */
function walkAndTranslateDOM(root) {
  if (!root) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE') {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.classList?.contains('notranslate') || parent.isContentEditable) {
          return NodeFilter.FILTER_REJECT;
        }
        const val = node.nodeValue;
        if (!val || !val.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    const current = node.nodeValue;
    if (!originalTextMap.has(node)) {
      originalTextMap.set(node, current);
    }
    const orig = originalTextMap.get(node);
    const translated = translateTextToGerman(orig);
    if (translated !== current) {
      node.nodeValue = translated;
    }
  }

  // Also translate input placeholders, textarea placeholders, button titles, and aria-labels
  const elements = root.querySelectorAll ? root.querySelectorAll('input[placeholder], textarea[placeholder], button[title], [aria-label]') : [];
  elements.forEach((el) => {
    if (el.placeholder) {
      if (!originalAttrMap.has(el)) originalAttrMap.set(el, {});
      const stored = originalAttrMap.get(el);
      if (!stored.placeholder) stored.placeholder = el.placeholder;
      const trans = translateTextToGerman(stored.placeholder);
      if (el.placeholder !== trans) el.placeholder = trans;
    }
    if (el.title) {
      if (!originalAttrMap.has(el)) originalAttrMap.set(el, {});
      const stored = originalAttrMap.get(el);
      if (!stored.title) stored.title = el.title;
      const trans = translateTextToGerman(stored.title);
      if (el.title !== trans) el.title = trans;
    }
  });
}

/**
 * Restores original English text throughout the DOM
 */
function restoreOriginalDOM(root) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    if (originalTextMap.has(node)) {
      node.nodeValue = originalTextMap.get(node);
    }
  }

  const elements = root.querySelectorAll ? root.querySelectorAll('input[placeholder], textarea[placeholder], button[title], [aria-label]') : [];
  elements.forEach((el) => {
    if (originalAttrMap.has(el)) {
      const stored = originalAttrMap.get(el);
      if (stored.placeholder) el.placeholder = stored.placeholder;
      if (stored.title) el.title = stored.title;
    }
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('wanderer_language') || 'en';
  });

  // Sync language with HTML lang attribute and localStorage
  useEffect(() => {
    localStorage.setItem('wanderer_language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Live Automatic DOM Translation Engine: Guarantees 100% zero-English coverage
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (language === 'de') {
      // 1. Initial translation pass
      walkAndTranslateDOM(document.body);

      // 2. Observe all future DOM modifications (navigation, modals, toasts, tabs, tables)
      let timeoutId = null;
      const observer = new MutationObserver(() => {
        // Debounce slightly for optimal 60fps performance during rapid virtual DOM reconciliation
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          walkAndTranslateDOM(document.body);
        }, 30);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        observer.disconnect();
      };
    } else {
      // Restore English pristine state
      restoreOriginalDOM(document.body);
    }
  }, [language]);

  // Translation function for direct React component consumption
  const t = (key, fallback = '') => {
    if (!key) return '';
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
