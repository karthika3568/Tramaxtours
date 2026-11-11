import { useState } from 'react';
import { CheckIcon, CopyIcon, EditIcon, EyeIcon, FileTextIcon, ImageIcon, TrashIcon } from '../../../components/common/Icons';
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

  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = getMediaUrl(media);
  const isImage = (media.is_image || (media.mime_type && media.mime_type.startsWith('image/'))) && !imgError;

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    const targetUrl = media.url || imageUrl;
    if (targetUrl) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="media-admin-card">
      {/* 1. Thumbnail Container with Hover Preview */}
      <div
        className="media-card-thumbnail-box"
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
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="media-doc-placeholder">
            <span className="doc-icon" aria-hidden="true">
              {media.mime_type?.startsWith('image/') ? <ImageIcon size={32} /> : <FileTextIcon size={32} />}
            </span>
            <span className="doc-ext-badge">{media.mime_type || 'Asset'}</span>
          </div>
        )}

        {/* Top-Left ID Badge */}
        <span className="media-card-id-badge">ID: {media.id}</span>

        {/* Hover Overlay with Preview Action */}
        <div className="media-card-overlay">
          <span className="overlay-view-btn">
            <EyeIcon size={13} /> Click to Preview
          </span>
        </div>
      </div>

      {/* 2. Text Details & Metadata */}
      <div className="media-card-details">
        <h4 className="media-file-name" title={media.original_name || media.filename}>
          {media.original_name || media.filename}
        </h4>

        <div className="media-meta-subline">
          <span className="media-meta-size">
            {media.file_size_human || `${Math.round((media.file_size || 0) / 1024)} KB`}
          </span>
          <span className="media-meta-sep">•</span>
          <span className="media-meta-date">
            {media.created_at ? new Date(media.created_at).toLocaleDateString() : ''}
          </span>
        </div>

        {media.alt_text ? (
          <p className="media-card-alt" title={media.alt_text}>
            <strong className="alt-label">Alt:</strong> {media.alt_text}
          </p>
        ) : (
          <p className="media-card-alt media-card-alt-empty" title="No alt text">
            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11px' }}>No alt text provided</span>
          </p>
        )}
      </div>

      {/* 3. Actions Bar */}
      <div className="media-card-actions-bar">
        <button
          type="button"
          className="media-action-btn btn-copy"
          onClick={handleCopyUrl}
          title="Copy URL to clipboard"
          aria-label="Copy Public URL"
        >
          {copied ? (
            <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
              <CheckIcon size={12} strokeWidth={2.5} color="#059669" /> Copied!
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CopyIcon size={12} /> Copy URL
            </span>
          )}
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
              <EditIcon size={12} /> Edit
            </button>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              className="media-action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(media);
              }}
              title="Delete media asset"
              aria-label="Delete media asset"
            >
              <TrashIcon size={13} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
