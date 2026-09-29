import { useState } from 'react';
import { getMediaUrl } from '../../../utils/media';
import Modal from '../../ui/Modal';

export default function TourGallery({ gallery = [], tourTitle = 'Tour' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!gallery || gallery.length === 0) return null;

  const currentItem = gallery[selectedIndex] || gallery[0];
  const currentImgUrl = getMediaUrl(currentItem);
  const currentCaption = currentItem?.caption || currentItem?.alt_text || `${tourTitle} Photo ${selectedIndex + 1}`;

  const hasMultiple = gallery.length > 1;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="tour-gallery-section detail-content-block">
      <div className="gallery-header-row">
        <h3 className="detail-section-title">Tour Experience Gallery</h3>
        <span className="gallery-counter-badge">
          {selectedIndex + 1} of {gallery.length} Photos
        </span>
      </div>

      {/* Main Carousel Display Box */}
      <div className="tour-gallery-main-container">
        <div
          className="tour-gallery-main-img-box"
          onClick={() => setIsLightboxOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsLightboxOpen(true);
            }
          }}
          aria-label="Click to enlarge photo"
        >
          <img
            src={currentImgUrl}
            alt={currentCaption}
            className="tour-gallery-main-img"
          />

          {currentCaption && (
            <div className="tour-gallery-caption-bar">
              <span>{currentCaption}</span>
              <span className="expand-hint">🔍 Click to enlarge</span>
            </div>
          )}
        </div>

        {/* Carousel Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              className="gallery-nav-arrow arrow-prev"
              onClick={handlePrev}
              aria-label="Previous tour photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav-arrow arrow-next"
              onClick={handleNext}
              aria-label="Next tour photo"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className="tour-gallery-thumbnails-strip" role="tablist" aria-label="Tour photos thumbnail navigation">
          {gallery.map((item, idx) => {
            const thumbUrl = getMediaUrl(item);
            const isSelected = idx === selectedIndex;

            return (
              <button
                key={item.id || idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`gallery-thumb-btn ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={thumbUrl}
                  alt={item.caption || `Thumbnail ${idx + 1}`}
                  loading="lazy"
                  className="gallery-thumb-img"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <Modal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={currentCaption || tourTitle}
          size="lg"
        >
          <div className="lightbox-content">
            <img
              src={currentImgUrl}
              alt={currentCaption || tourTitle}
              className="lightbox-full-img"
            />
            {currentCaption && <p className="lightbox-caption">{currentCaption}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
