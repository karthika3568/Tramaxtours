import { useState } from 'react';
import MediaPickerModal from '../media/MediaPickerModal';
import { getMediaUrl } from '../../../utils/media';

export default function TourGalleryManager({ gallery = [], onChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAddMedia = (selectedAsset) => {
    if (!selectedAsset) return;

    const alreadyExists = gallery.some(
      (item) =>
        item.media_id === selectedAsset.id ||
        item.media?.id === selectedAsset.id ||
        (item.id === selectedAsset.id && !item.media_id)
    );
    if (alreadyExists) {
      alert('This media asset is already in the tour gallery.');
      setIsPickerOpen(false);
      return;
    }

    const newItem = {
      media_id: selectedAsset.id,
      media: selectedAsset,
      is_cover: gallery.length === 0 ? 1 : 0,
      display_order: gallery.length,
    };

    onChange([...gallery, newItem]);
    setIsPickerOpen(false);
  };

  const handleRemove = (index) => {
    const updated = gallery
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({
        ...item,
        display_order: idx,
      }));
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...gallery];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, display_order: idx })));
  };

  const handleMoveDown = (index) => {
    if (index === gallery.length - 1) return;
    const updated = [...gallery];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, display_order: idx })));
  };

  const handleSetCover = (index) => {
    const updated = gallery.map((item, idx) => ({
      ...item,
      is_cover: idx === index ? 1 : 0,
    }));
    onChange(updated);
  };

  return (
    <div className="tour-gallery-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Tour Experience Photo Gallery ({gallery.length} Images)</h4>
          <p className="module-manager-desc">
            Attach compelling imagery of this safari / tour experience. Designate one photo as the primary cover.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsPickerOpen(true)}
        >
          + Add Image from Media Library
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="module-empty-box">
          <span className="empty-icon">🖼️</span>
          <p className="empty-text">No gallery images attached to this tour package.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={() => setIsPickerOpen(true)}
          >
            Select First Image
          </button>
        </div>
      ) : (
        <div className="tour-gallery-grid-admin">
          {gallery.map((item, idx) => {
            const mediaObj = item.media || item;
            const isCover = Boolean(item.is_cover);

            return (
              <div key={item.id || item.media_id || idx} className={`tour-gallery-card ${isCover ? 'is-cover-card' : ''}`}>
                <div className="tour-gallery-thumb-wrapper">
                  <img
                    src={getMediaUrl(mediaObj)}
                    alt={mediaObj.alt_text || 'Tour gallery'}
                    className="tour-gallery-thumb"
                  />
                  <div className="tour-gallery-order-badge">#{idx + 1}</div>
                  {isCover && <div className="tour-cover-badge">★ Primary Cover</div>}
                </div>

                <div className="tour-gallery-card-body">
                  <span className="tour-gallery-media-title" title={mediaObj.original_name || mediaObj.filename}>
                    {mediaObj.original_name || mediaObj.filename || `Media #${item.media_id}`}
                  </span>

                  <label className="tour-cover-radio-label">
                    <input
                      type="radio"
                      name="tour_cover_radio"
                      checked={isCover}
                      onChange={() => handleSetCover(idx)}
                    />
                    <span>Set as Primary Cover</span>
                  </label>

                  <div className="tour-gallery-actions">
                    <div className="order-btn-group">
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === gallery.length - 1}
                        title="Move Right"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-danger-xs"
                      onClick={() => handleRemove(idx)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isPickerOpen && (
        <MediaPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleAddMedia}
          title="Select Tour Gallery Image"
        />
      )}
    </div>
  );
}
