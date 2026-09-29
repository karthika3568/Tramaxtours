import { useState } from 'react';
import MediaPickerModal from '../media/MediaPickerModal';
import { getMediaUrl } from '../../../utils/media';

export default function DestinationGalleryManager({ gallery = [], onChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAddMedia = (selectedAsset) => {
    if (!selectedAsset) return;
    
    // Check if already in gallery
    const alreadyExists = gallery.some(
      (item) => (item.media_id === selectedAsset.id) || (item.media?.id === selectedAsset.id) || (item.id === selectedAsset.id && !item.media_id)
    );
    if (alreadyExists) {
      alert('This media asset is already in the gallery.');
      setIsPickerOpen(false);
      return;
    }

    const newItem = {
      media_id: selectedAsset.id,
      media: selectedAsset,
      is_hero_slide: 0,
      caption: selectedAsset.caption || selectedAsset.alt_text || '',
      display_order: gallery.length,
    };

    onChange([...gallery, newItem]);
    setIsPickerOpen(false);
  };

  const handleRemove = (index) => {
    const updated = gallery.filter((_, idx) => idx !== index).map((item, idx) => ({
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
    // Reassign display_order
    onChange(updated.map((item, idx) => ({ ...item, display_order: idx })));
  };

  const handleMoveDown = (index) => {
    if (index === gallery.length - 1) return;
    const updated = [...gallery];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    // Reassign display_order
    onChange(updated.map((item, idx) => ({ ...item, display_order: idx })));
  };

  const handleToggleHeroSlide = (index) => {
    const updated = gallery.map((item, idx) => {
      if (idx === index) {
        return { ...item, is_hero_slide: item.is_hero_slide ? 0 : 1 };
      }
      return item;
    });
    onChange(updated);
  };

  const handleCaptionChange = (index, value) => {
    const updated = gallery.map((item, idx) => {
      if (idx === index) {
        return { ...item, caption: value };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="dest-gallery-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Destination Gallery Showcase ({gallery.length} Images)</h4>
          <p className="module-manager-desc">
            Attach high-definition photos from the Media Library. Reorder images to determine their public presentation order.
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
          <p className="empty-text">No gallery images attached yet.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={() => setIsPickerOpen(true)}
          >
            Select First Gallery Image
          </button>
        </div>
      ) : (
        <div className="dest-gallery-grid-admin">
          {gallery.map((item, idx) => {
            const mediaObj = item.media || item;
            return (
              <div key={item.id || item.media_id || idx} className="gallery-admin-card">
                <div className="gallery-card-thumb-wrapper">
                  <img
                    src={getMediaUrl(mediaObj)}
                    alt={item.caption || mediaObj.alt_text || 'Gallery item'}
                    className="gallery-admin-thumb"
                  />
                  <div className="gallery-order-badge">#{idx + 1}</div>
                  {Boolean(item.is_hero_slide) && (
                    <div className="gallery-hero-badge">🌟 Hero Slide</div>
                  )}
                </div>

                <div className="gallery-card-details">
                  <div className="form-group mb-2">
                    <label className="form-label-xs">Caption / Alt Description</label>
                    <input
                      type="text"
                      className="form-input form-input-xs"
                      value={item.caption || ''}
                      onChange={(e) => handleCaptionChange(idx, e.target.value)}
                      placeholder="e.g. Sunset over the Savannah"
                    />
                  </div>

                  <label className="gallery-hero-toggle-label">
                    <input
                      type="checkbox"
                      checked={Boolean(item.is_hero_slide)}
                      onChange={() => handleToggleHeroSlide(idx)}
                    />
                    <span>Show in Homepage / Destination Hero Slides</span>
                  </label>

                  <div className="gallery-card-actions">
                    <div className="order-btn-group">
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Left / Earlier"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === gallery.length - 1}
                        title="Move Right / Later"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-danger-xs"
                      onClick={() => handleRemove(idx)}
                      title="Remove from gallery"
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
          title="Select Destination Gallery Image"
        />
      )}
    </div>
  );
}
