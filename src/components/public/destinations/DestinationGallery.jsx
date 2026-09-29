import { useState } from 'react';
import { getMediaUrl } from '../../../utils/media';
import Modal from '../../ui/Modal';

export default function DestinationGallery({ gallery = [], destinationName = 'Destination' }) {
  const [activeImage, setActiveImage] = useState(null);

  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="destination-gallery-section">
      <h3 className="detail-section-title">Photo Gallery</h3>
      <div className="gallery-grid">
        {gallery.map((item, idx) => {
          const imgUrl = getMediaUrl(item);

          return (
            <button
              key={item.id || idx}
              type="button"
              className="gallery-thumbnail-btn"
              onClick={() => setActiveImage({ url: imgUrl, caption: item.caption || destinationName })}
              aria-label={`View photo ${idx + 1} of ${destinationName}`}
            >
              <img
                src={imgUrl}
                alt={item.caption || `${destinationName} photo ${idx + 1}`}
                loading="lazy"
                className="gallery-img"
              />
              {item.caption && <span className="gallery-caption-overlay">{item.caption}</span>}
            </button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <Modal
          isOpen={Boolean(activeImage)}
          onClose={() => setActiveImage(null)}
          title={activeImage.caption || destinationName}
          size="lg"
        >
          <div className="lightbox-content">
            <img
              src={activeImage.url}
              alt={activeImage.caption || destinationName}
              className="lightbox-full-img"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
