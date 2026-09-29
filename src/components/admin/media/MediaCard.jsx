import { getMediaUrl } from '../../../utils/media';

export default function MediaCard({
  media,
  onPreview,
  onEdit,
  onDelete,
  canManage = false,
  canDelete = false,
}) {
  if (!media) return null;

  const imageUrl = getMediaUrl(media);
  const isImage = media.is_image || (media.mime_type && media.mime_type.startsWith('image/'));

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    if (media.url) {
      navigator.clipboard.writeText(media.url);
    }
  };

  return (
    <article className="media-admin-card">
      <div
        className="media-card-thumbnail"
        onClick={() => onPreview(media)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPreview(media);
          }
        }}
        aria-label={`Preview ${media.original_name || media.filename}`}
      >
        {isImage ? (
          <img
            src={imageUrl}
            alt={media.alt_text || media.original_name || 'Media asset'}
            loading="lazy"
            className="media-card-img"
          />
        ) : (
          <div className="media-card-fallback-icon">
            <span className="file-doc-icon" aria-hidden="true">📄</span>
            <span className="file-mime-text">{media.mime_type || 'Document'}</span>
          </div>
        )}

        <div className="media-hover-overlay">
          <span className="overlay-btn-text">🔍 Click to Preview</span>
        </div>

        <span className="media-id-badge">ID: {media.id}</span>
      </div>

      <div className="media-card-info">
        <h4 className="media-card-title" title={media.original_name || media.filename}>
          {media.original_name || media.filename}
        </h4>

        <div className="media-card-meta-row">
          <span className="media-meta-size">{media.file_size_human || `${Math.round(media.file_size / 1024)} KB`}</span>
          <span className="media-meta-sep">•</span>
          <span className="media-meta-date">
            {media.created_at ? new Date(media.created_at).toLocaleDateString() : ''}
          </span>
        </div>

        {media.alt_text && (
          <p className="media-card-alt" title={media.alt_text}>
            <span className="alt-label">Alt:</span> {media.alt_text}
          </p>
        )}

        <div className="media-card-actions">
          <button
            type="button"
            className="media-action-btn btn-copy"
            onClick={handleCopyUrl}
            title="Copy Public URL to clipboard"
            aria-label="Copy Public URL"
          >
            📋 Copy URL
          </button>

          {canManage && onEdit && (
            <button
              type="button"
              className="media-action-btn btn-edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(media);
              }}
              title="Edit Alt Text and Caption"
              aria-label="Edit metadata"
            >
              ✏️ Edit
            </button>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              className="media-action-btn btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(media);
              }}
              title="Delete media asset"
              aria-label="Delete media asset"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
