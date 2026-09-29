import { useState } from 'react';

export default function TourItineraryManager({ itineraries = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddDay = () => {
    const nextDayNum = itineraries.length + 1;
    const newDay = {
      time_period: `Day ${nextDayNum}`,
      title: '',
      description: '',
      status: 'published',
      display_order: itineraries.length,
    };
    const updated = [...itineraries, newDay];
    onChange(updated);
    setEditingIndex(updated.length - 1);
  };

  const handleUpdateField = (index, field, value) => {
    const updated = itineraries.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    if (!window.confirm('Are you sure you want to remove this itinerary step?')) return;
    const updated = itineraries
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({
        ...item,
        display_order: idx,
      }));
    onChange(updated);
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...itineraries];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index - 1);
    else if (editingIndex === index - 1) setEditingIndex(index);
  };

  const handleMoveDown = (index) => {
    if (index === itineraries.length - 1) return;
    const updated = [...itineraries];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index + 1);
    else if (editingIndex === index + 1) setEditingIndex(index);
  };

  return (
    <div className="tour-itinerary-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Daily Tour Itinerary Timeline ({itineraries.length} Steps)</h4>
          <p className="module-manager-desc">
            Define day-by-day or time-period breakdown (e.g. "Day 1", "Morning", "Day 3 - Full Day Game Drive").
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddDay}
        >
          + Add Itinerary Step
        </button>
      </div>

      {itineraries.length === 0 ? (
        <div className="module-empty-box">
          <span className="empty-icon">📅</span>
          <p className="empty-text">No itinerary items created for this tour yet.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={handleAddDay}
          >
            Create Day 1
          </button>
        </div>
      ) : (
        <div className="tour-itinerary-list-admin">
          {itineraries.map((step, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div
                key={step.id || idx}
                className={`itinerary-admin-card ${isEditing ? 'card-editing' : ''}`}
              >
                <div className="itinerary-card-header">
                  <div className="itinerary-title-meta">
                    <span className="itinerary-time-pill">{step.time_period || `Step ${idx + 1}`}</span>
                    <strong className="itinerary-title-txt">
                      {step.title || <em className="text-muted">Untitled Itinerary Step</em>}
                    </strong>
                    <span className={`status-badge-sm status-${step.status || 'published'}`}>
                      {step.status || 'published'}
                    </span>
                  </div>

                  <div className="itinerary-actions">
                    <div className="order-btn-group">
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === itineraries.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => setEditingIndex(isEditing ? null : idx)}
                    >
                      {isEditing ? 'Collapse' : 'Edit'}
                    </button>

                    <button
                      type="button"
                      className="btn-danger-xs"
                      onClick={() => handleRemove(idx)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="itinerary-card-body">
                    <div className="form-grid-3col">
                      <div className="form-group">
                        <label className="form-label-xs required">Time Period / Day Label *</label>
                        <input
                          type="text"
                          className="form-input form-input-sm"
                          value={step.time_period || ''}
                          onChange={(e) => handleUpdateField(idx, 'time_period', e.target.value)}
                          placeholder="e.g. Day 1, Morning, Day 2 - Afternoon"
                          required
                        />
                      </div>

                      <div className="form-group span-2">
                        <label className="form-label-xs required">Step Title / Destination *</label>
                        <input
                          type="text"
                          className="form-input form-input-sm"
                          value={step.title || ''}
                          onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                          placeholder="e.g. Arrival in Nairobi & Scenic Rift Valley Drive to Masai Mara"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mt-2">
                      <label className="form-label-xs">Detailed Description & Activities</label>
                      <textarea
                        rows={5}
                        className="form-textarea form-textarea-sm"
                        value={step.description || ''}
                        onChange={(e) => handleUpdateField(idx, 'description', e.target.value)}
                        placeholder="Detailed schedule of morning game drive, luxury lodge check-in, bush dinner under the stars..."
                      />
                    </div>

                    <div className="form-group mt-2">
                      <label className="form-label-xs">Publication Status</label>
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: '180px' }}
                        value={step.status || 'published'}
                        onChange={(e) => handleUpdateField(idx, 'status', e.target.value)}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
