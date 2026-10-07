import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../components/public/common/Breadcrumbs';
import TripRequestForm from '../../components/public/planner/TripRequestForm';
import { updatePageMeta } from '../../utils/metadata';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { formatWhatsAppUrl } from '../../utils/whatsapp';
import tourService from '../../services/tourService';
import destinationService from '../../services/destinationService';

export default function RequestMyTripPage() {
  const [searchParams] = useSearchParams();
  const tourSlug = searchParams.get('tour') || '';
  const destSlug = searchParams.get('destination') || '';
  const prefilledDate = searchParams.get('date') || '';
  const prefilledAdults = searchParams.get('adults') ? Number(searchParams.get('adults')) : 2;
  const prefilledChildren = searchParams.get('children') ? Number(searchParams.get('children')) : 0;

  const { getSetting } = useSiteSettings();
  const siteName = getSetting('site_name', 'Wanderer South India');
  const contactWhatsApp = getSetting('contact_whatsapp', '+91 8072566010');
  const contactPhone = getSetting('contact_phone', '+91 8072566010');

  const [prefilledTourTitle, setPrefilledTourTitle] = useState('');
  const [prefilledDestName, setPrefilledDestName] = useState(destSlug);

  useEffect(() => {
    updatePageMeta({
      title: `Request My Custom Trip | ${siteName}`,
      description:
        `Plan your personalized South India holiday package with ${siteName}. Choose your custom destinations, vehicle, hotel class, and get an instant quote.`,
    });
  }, [siteName]);

  // If tourSlug passed, resolve tour title & destination
  useEffect(() => {
    let isMounted = true;
    if (tourSlug) {
      const fetchTour = tourService.getTour || tourService.getTourBySlug;
      if (typeof fetchTour === 'function') {
        fetchTour(tourSlug)
          .then((res) => {
            if (!isMounted) return;
            const tourData = res?.data || res;
            if (tourData?.title) {
              setPrefilledTourTitle(tourData.title);
              if (!prefilledDestName && tourData.destination?.name) {
                setPrefilledDestName(tourData.destination.name);
              }
            }
          })
          .catch(() => {});
      }
    } else if (destSlug) {
      const fetchDest = destinationService.getDestination || destinationService.getDestinationBySlug;
      if (typeof fetchDest === 'function') {
        fetchDest(destSlug)
          .then((res) => {
            if (!isMounted) return;
            const destData = res?.data || res;
            if (destData?.name) {
              setPrefilledDestName(destData.name);
            }
          })
          .catch(() => {});
      }
    }
    return () => {
      isMounted = false;
    };
  }, [tourSlug, destSlug, prefilledDestName]);

  const quickInquiryMsg = `Hello ${siteName}! I would like to plan a custom South India tour package.`;
  const whatsappLink = formatWhatsAppUrl(contactWhatsApp, quickInquiryMsg);

  return (
    <div className="request-my-trip-page" style={{ background: '#f8fafc', color: '#0B1329', minHeight: '85vh' }}>
      {/* Clean Page Header */}
      <section className="catalog-header-section" style={{ padding: '36px 0 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Request My Trip' }]} />
          <div className="catalog-header-content" style={{ marginTop: '14px' }}>
            <span className="section-badge" style={{ fontSize: '12px', fontWeight: 800, color: '#1226de', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(18, 38, 222, 0.08)', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block', marginBottom: '8px' }}>
              Bespoke Private Journeys
            </span>
            <h1 className="catalog-page-title" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
              Request Your Custom South India Trip
            </h1>
            <p className="catalog-page-subtitle" style={{ fontSize: '15px', color: '#64748b', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
              Tell us your desired destinations, vehicle preference, and dates. Our destination specialists will craft your personalized day-by-day itinerary and quotation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <main style={{ maxWidth: '960px', margin: '0 auto' }}>
          <TripRequestForm
            initialDestination={prefilledDestName}
            initialTour={prefilledTourTitle}
            prefilledData={{
              arrival_date: prefilledDate,
              adults_count: prefilledAdults,
              children_count: prefilledChildren,
            }}
          />
        </main>
      </div>
    </div>
  );
}

