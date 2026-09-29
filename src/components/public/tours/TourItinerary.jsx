import { useState } from 'react';

export default function TourItinerary({ itineraries = [] }) {
  const [openDays, setOpenDays] = useState({ 0: true }); // First day open by default

  if (!itineraries || itineraries.length === 0) return null;

  const toggleDay = (idx) => {
    setOpenDays((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const all = {};
    itineraries.forEach((_, idx) => {
      all[idx] = true;
    });
    setOpenDays(all);
  };

  const collapseAll = () => {
    setOpenDays({});
  };

  return (
    <div className="tour-itinerary-section detail-content-block">
      <div className="section-title-with-actions">
        <h3 className="detail-section-title">Daily Itinerary</h3>
        <div className="accordion-bulk-actions">
          <button type="button" onClick={expandAll} className="bulk-action-btn">
            Expand All
          </button>
          <span className="bullet-sep">/</span>
          <button type="button" onClick={collapseAll} className="bulk-action-btn">
            Collapse All
          </button>
        </div>
      </div>

      <div className="itinerary-timeline">
        {itineraries.map((day, idx) => {
          const isOpen = Boolean(openDays[idx]);

          return (
            <div
              key={day.id || idx}
              className={`itinerary-item ${isOpen ? 'is-open' : ''}`}
            >
              <div className="itinerary-timeline-node">
                <span className="node-dot" />
                <span className="node-line" />
              </div>

              <div className="itinerary-card">
                <button
                  type="button"
                  className="itinerary-header-btn"
                  onClick={() => toggleDay(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`itinerary-content-${idx}`}
                >
                  <div className="itinerary-title-group">
                    <span className="itinerary-day-badge">
                      Day {day.day_number || idx + 1}
                    </span>
                    <h4 className="itinerary-item-title">{day.title}</h4>
                  </div>
                  <span className="itinerary-toggle-icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div id={`itinerary-content-${idx}`} className="itinerary-body">
                    {day.description && (
                      <p className="itinerary-desc">{day.description}</p>
                    )}

                    {(day.meals_included || day.accommodation) && (
                      <div className="itinerary-meta-pills">
                        {day.meals_included && (
                          <span className="meta-pill">
                            🍽️ Meals: <strong>{day.meals_included}</strong>
                          </span>
                        )}
                        {day.accommodation && (
                          <span className="meta-pill">
                            🏨 Stay: <strong>{day.accommodation}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
