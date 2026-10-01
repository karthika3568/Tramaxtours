import { useState } from 'react';

export default function TourRouteMap({ tour }) {
  if (!tour) return null;

  // Extract or synthesize stops based on itinerary or destination
  const itineraryDays = Array.isArray(tour.itinerary) && tour.itinerary.length > 0
    ? tour.itinerary
    : Array.isArray(tour.itinerary_days) && tour.itinerary_days.length > 0
    ? tour.itinerary_days
    : null;

  const destinationName = tour.destination?.name || tour.destination_name || 'South India';

  // Generate route stops
  const defaultStops = [
    {
      name: 'Chennai (Departure)',
      title: 'Hotel Pickup & Coastal Drive',
      desc: 'Comfortable morning pickup in private AC vehicle with professional chauffeur guide.',
      distance: '0 km',
      lat: 13.0827,
      lng: 80.2707,
    },
    {
      name: destinationName,
      title: 'Monuments, Sightseeing & Culture',
      desc: tour.short_description || 'Guided exploration of iconic landmarks, heritage sites, and local markets.',
      distance: '60 km',
      lat: 12.6269,
      lng: 80.1927,
    },
    {
      name: `${destinationName} & Scenic Surroundings`,
      title: 'Culinary Flavors & Artisan Craft',
      desc: 'Traditional South Indian lunch and artisanal shopping before scenic return.',
      distance: '120 km',
      lat: 12.8342,
      lng: 79.7036,
    },
    {
      name: 'Chennai (Return)',
      title: 'Comfortable Evening Drop-off',
      desc: 'Safe return drop-off directly at your hotel or preferred departure point.',
      distance: 'Return',
      lat: 13.0827,
      lng: 80.2707,
    },
  ];

  const stops = itineraryDays
    ? itineraryDays.map((day, idx) => ({
        name: day.title || `Day ${day.day_number || idx + 1}`,
        title: day.title || `Day ${day.day_number || idx + 1} Itinerary`,
        desc: day.description || 'Full day guided exploration and sightseeing.',
        distance: `Stop ${idx + 1}`,
        lat: 12.5 + (idx * 0.2),
        lng: 80.0 + (idx * 0.1),
      }))
    : defaultStops;

  const [activeStopIdx, setActiveStopIdx] = useState(0);

  // OpenStreetMap embed URL centered around South India
  const mapCenterLat = 12.8;
  const mapCenterLng = 80.1;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenterLng - 1.2}%2C${mapCenterLat - 1.2}%2C${mapCenterLng + 1.2}%2C${mapCenterLat + 1.2}&layer=mapnik&marker=${mapCenterLat}%2C${mapCenterLng}`;

  return (
    <div className="tour-route-map-widget" style={{ marginTop: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#01AA90', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🗺️ Interactive Travel Route
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064d71', margin: '4px 0 0' }}>
            Tour Route &amp; Stop Visualizer
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '9999px', fontWeight: 600, color: '#475569' }}>
            🚗 Private AC Vehicle
          </span>
          <span style={{ fontSize: '12px', background: '#e6f7f4', padding: '6px 12px', borderRadius: '9999px', fontWeight: 600, color: '#01806C' }}>
            🧭 Chauffeur Guide
          </span>
        </div>
      </div>

      {/* Map + Stops Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Interactive Map Embed */}
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', minHeight: '260px', border: '1px solid #cbd5e1' }}>
          <iframe
            title={`Route map for ${tour.title}`}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '260px', display: 'block' }}
            loading="lazy"
            src={mapEmbedUrl}
          />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255, 255, 255, 0.95)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#0f172a', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            📍 {stops[activeStopIdx]?.name || destinationName}
          </div>
        </div>

        {/* Route Stops List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
          {stops.map((stop, idx) => {
            const isActive = activeStopIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStopIdx(idx)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: isActive ? '2px solid #01AA90' : '1px solid #e2e8f0',
                  background: isActive ? '#f0fdf4' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Step Circle Indicator */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive ? '#01AA90' : '#cbd5e1',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: isActive ? '#01806C' : '#1e293b', margin: 0 }}>
                      {stop.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{stop.distance}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: '4px 0 0', lineHeight: 1.4 }}>
                    {stop.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
