import { useState } from 'react';

const COMMON_ICONS = ['★', '🦁', '🐘', '🌅', '🚙', '🏨', '🍽️', '📸', '✈️', '⛵', '🌿', '⛰️'];

export default function TourHighlightsManager({ highlights = [], onChange }) {
  const [newText, setNewText] = useState('');
  const [newIcon, setNewIcon] = useState('★');

  const handleAddHighlight = (e) => {
    e?.preventDefault();
    if (!newText.trim()) return;

    const newItem = {
      highlight_text: newText.trim(),
      icon: newIcon || '★',
      display_order: highlights.length,
    };

    onChange([...highlights, newItem]);
    setNewText('');
  };

  const handleUpdateText = (index, value) => {
    const updated = highlights.map((h, idx) => {
      if (idx === index) {
        return { ...h, highlight_text: value };
      }
      return h;
    });
    onChange(updated);
  };

  const handleUpdateIcon = (index, iconValue) => {
    const updated = highlights.map((h, idx) => {
      if (idx === index) {
        return { ...h, icon: iconValue };
      }
      return h;
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = highlights.filter((_, idx) => idx !== index).map((h, idx) => ({
      ...h,
      display_order: idx,
    }));
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...highlights];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((h, idx) => ({ ...h, display_order: idx })));
  };

  const handleMoveDown = (index) => {
    if (index === highlights.length - 1) return;
    const updated = [...highlights];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((h, idx) => ({ ...h, display_order: idx })));
  };

  return (
    <div className="tour-highlights-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Tour Key Highlights ({highlights.length} Items)</h4>
          <p className="module-manager-desc">
            Bulleted key selling points shown on public tour header cards (e.g. "Big 5 Game Drives in Masai Mara", "Luxury Tented Camp Accommodations").
          </p>
        </div>
      </div>

      {/* Add New Highlight Form */}
      <div className="highlight-add-bar">
        <select
          className="form-select icon-select-sm"
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          title="Select Icon / Emoji"
        >
          {COMMON_ICONS.map((ic) => (
            <option key={ic} value={ic}>
              {ic}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="form-input form-input-sm highlight-input-flex"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddHighlight();
            }
          }}
          placeholder="Enter a new tour highlight and press Add..."
        />

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleAddHighlight}
          disabled={!newText.trim()}
        >
          + Add Highlight
        </button>
      </div>

      {highlights.length === 0 ? (
        <div className="module-empty-box mt-3">
          <span className="empty-icon">★</span>
          <p className="empty-text">No highlights added yet. Type a highlight above and click Add.</p>
        </div>
      ) : (
        <ul className="tour-highlights-list-admin mt-3">
          {highlights.map((h, idx) => (
            <li key={h.id || idx} className="highlight-item-admin">
              <span className="highlight-order-idx">#{idx + 1}</span>

              <select
                className="form-select icon-select-xs"
                value={h.icon || '★'}
                onChange={(e) => handleUpdateIcon(idx, e.target.value)}
              >
                {COMMON_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="form-input form-input-sm highlight-text-edit"
                value={h.highlight_text || ''}
                onChange={(e) => handleUpdateText(idx, e.target.value)}
              />

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
                  disabled={idx === highlights.length - 1}
                  title="Move Down"
                >
                  ↓
                </button>
              </div>

              <button
                type="button"
                className="btn-danger-xs"
                onClick={() => handleRemove(idx)}
                title="Remove highlight"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
