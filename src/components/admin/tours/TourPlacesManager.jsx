import { useState } from 'react';

export default function TourPlacesManager({ places = [], onChange }) {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');

  const handleAddPlace = (e) => {
    e?.preventDefault();
    if (!newName.trim()) return;

    const newItem = {
      name: newName.trim(),
      short_description: newDescription.trim() || null,
      latitude: newLat !== '' ? parseFloat(newLat) : null,
      longitude: newLng !== '' ? parseFloat(newLng) : null,
      display_order: places.length,
      status: 'active',
    };

    onChange([...places, newItem]);
    setNewName('');
    setNewDescription('');
    setNewLat('');
    setNewLng('');
  };

  const handleUpdate = (index, field, value) => {
    const updated = places.map((p, idx) => {
      if (idx === index) {
        return {
          ...p,
          [field]: (field === 'latitude' || field === 'longitude')
            ? (value !== '' && value !== null ? parseFloat(value) : null)
            : value,
        };
      }
      return p;
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = places
      .filter((_, idx) => idx !== index)
      .map((p, idx) => ({ ...p, display_order: idx }));
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...places];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((p, idx) => ({ ...p, display_order: idx })));
  };

  const handleMoveDown = (index) => {
    if (index === places.length - 1) return;
    const updated = [...places];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((p, idx) => ({ ...p, display_order: idx })));
  };

  return (
    <div className="tour-places-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Places Covered &amp; Interactive Map ({places.length} Locations)</h4>
          <p className="module-manager-desc">
            Monuments, heritage temples, and attractions covered on this tour. Coordinates (latitude/longitude) are optional — if left blank, our backend will automatically geocode the location via OpenStreetMap.
          </p>
        </div>
      </div>

      {/* Add New Place Form */}
      <div className="card p-3 mb-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">➕ Add New Place Covered</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="form-label text-xs font-semibold text-slate-600 mb-1">Place / Monument Name *</label>
            <input
              type="text"
              className="form-input form-input-sm w-full"
              placeholder="e.g. Shore Temple, Mahabalipuram"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPlace();
                }
              }}
            />
          </div>
          <div>
            <label className="form-label text-xs font-semibold text-slate-600 mb-1">Short Description (Optional)</label>
            <input
              type="text"
              className="form-input form-input-sm w-full"
              placeholder="e.g. 7th-century UNESCO structural temple overlooking Bay of Bengal"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="form-label text-xs font-semibold text-slate-600 mb-1">Latitude (Optional)</label>
            <input
              type="number"
              step="any"
              className="form-input form-input-sm w-full"
              placeholder="e.g. 12.6166"
              value={newLat}
              onChange={(e) => setNewLat(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label text-xs font-semibold text-slate-600 mb-1">Longitude (Optional)</label>
            <input
              type="number"
              step="any"
              className="form-input form-input-sm w-full"
              placeholder="e.g. 80.1983"
              value={newLng}
              onChange={(e) => setNewLng(e.target.value)}
            />
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm w-full"
              onClick={handleAddPlace}
              disabled={!newName.trim()}
            >
              + Add Place Covered
            </button>
          </div>
        </div>
      </div>

      {places.length === 0 ? (
        <div className="module-empty-box mt-3 text-center p-6 border border-dashed border-slate-300 rounded-xl">
          <span className="empty-icon text-3xl block mb-1">📍</span>
          <p className="empty-text text-slate-500 text-sm">No places covered added yet. Add places above to show them on the public map.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {places.map((p, idx) => (
            <div key={p.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-start md:items-center">
              <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">#{idx + 1}</span>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                <input
                  type="text"
                  className="form-input form-input-sm"
                  title="Place Name"
                  placeholder="Place Name"
                  value={p.name || ''}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input form-input-sm"
                  title="Short Description"
                  placeholder="Short Description"
                  value={p.short_description || ''}
                  onChange={(e) => handleUpdate(idx, 'short_description', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="number"
                  step="any"
                  className="form-input form-input-sm w-24"
                  title="Latitude"
                  placeholder="Lat"
                  value={p.latitude !== null && p.latitude !== undefined ? p.latitude : ''}
                  onChange={(e) => handleUpdate(idx, 'latitude', e.target.value)}
                />
                <input
                  type="number"
                  step="any"
                  className="form-input form-input-sm w-24"
                  title="Longitude"
                  placeholder="Lng"
                  value={p.longitude !== null && p.longitude !== undefined ? p.longitude : ''}
                  onChange={(e) => handleUpdate(idx, 'longitude', e.target.value)}
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-outline btn-xs p-1"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs p-1"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === places.length - 1}
                    title="Move Down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn text-red-500 hover:text-red-700 btn-xs p-1"
                    onClick={() => handleRemove(idx)}
                    title="Remove place"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
