import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TourPlacesMap({ places = [], tourTitle = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const validPlaces = (places || []).filter(
    (p) =>
      p &&
      p.latitude !== null &&
      p.latitude !== undefined &&
      !isNaN(Number(p.latitude)) &&
      p.longitude !== null &&
      p.longitude !== undefined &&
      !isNaN(Number(p.longitude)) &&
      (Number(p.latitude) !== 0 || Number(p.longitude) !== 0)
  );

  useEffect(() => {
    if (!mapContainerRef.current || validPlaces.length === 0) return;

    // Clean up previous map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map with scrollWheelZoom disabled to prevent scroll trapping
    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const latLngs = [];
    markersRef.current = [];

    validPlaces.forEach((place, idx) => {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      latLngs.push([lat, lng]);

      // Custom styled pin with sequence number
      const markerHtml = `
        <div style="
          background: #1226de;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 12px rgba(18, 38, 222, 0.45);
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${idx + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-tour-place-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const popupContent = `
        <div style="font-family: inherit; min-width: 180px; max-width: 260px; padding: 2px;">
          <span style="font-size: 11px; font-weight: 800; color: #1226de; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">
            Stop #${idx + 1}
          </span>
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 4px; line-height: 1.3;">
            ${place.name}
          </strong>
          ${
            place.short_description
              ? `<p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.45;">${place.short_description}</p>`
              : ''
          }
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

      markersRef.current.push(marker);
    });

    // Auto-fit bounds
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
    } else if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [places]);

  if (!places || places.length === 0) {
    return null;
  }

  const handleFocusMarker = (idx) => {
    const marker = markersRef.current[idx];
    const map = mapInstanceRef.current;
    if (marker && map) {
      const latLng = marker.getLatLng();
      map.setView(latLng, Math.max(map.getZoom(), 14), { animate: true });
      marker.openPopup();
    }
  };

  return (
    <div className="tour-places-map-wrapper" style={{ marginTop: '20px' }}>
      {/* Interactive Leaflet Map Container */}
      {validPlaces.length > 0 && (
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '340px',
            borderRadius: '16px',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
            zIndex: 1,
            marginBottom: '16px',
            overflow: 'hidden',
          }}
          aria-label={`Interactive Map of Places Covered in ${tourTitle || 'this tour'}`}
        />
      )}

      {/* Places List / Legend Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {places.map((place, idx) => {
          const hasCoords =
            place.latitude !== null &&
            place.latitude !== undefined &&
            !isNaN(Number(place.latitude)) &&
            place.longitude !== null &&
            place.longitude !== undefined &&
            !isNaN(Number(place.longitude));

          return (
            <button
              type="button"
              key={place.id || idx}
              onClick={() => hasCoords && handleFocusMarker(validPlaces.indexOf(place))}
              disabled={!hasCoords}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: hasCoords ? '#f1f5f9' : '#f8fafc',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                cursor: hasCoords ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (hasCoords) {
                  e.currentTarget.style.background = '#e0e7ff';
                  e.currentTarget.style.borderColor = '#1226de';
                }
              }}
              onMouseLeave={(e) => {
                if (hasCoords) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              title={hasCoords ? 'Click to pinpoint on map' : 'Location details'}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#1226de',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {idx + 1}
              </span>
              <span>{place.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
