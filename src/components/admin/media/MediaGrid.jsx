import MediaCard from './MediaCard';
import EmptyState from '../../ui/EmptyState';

export default function MediaGrid({
  mediaItems = [],
  onPreview,
  onEdit,
  onDelete,
  canManage = false,
  canDelete = false,
  hasActiveFilters = false,
  onResetFilters,
  onOpenUpload,
}) {
  if (mediaItems.length === 0) {
    return (
      <div className="media-empty-container">
        <EmptyState
          title={hasActiveFilters ? 'No Matching Media Found' : 'No Media Assets Uploaded Yet'}
          message={
            hasActiveFilters
              ? 'No media files match your search keywords or filter criteria. Try resetting your filters.'
              : 'The media library is currently empty. Upload images, banners, or documents to use across your website.'
          }
          actionText={hasActiveFilters ? 'Reset Filters' : canManage ? '+ Upload First Asset' : undefined}
          onAction={hasActiveFilters ? onResetFilters : canManage ? onOpenUpload : undefined}
        />
      </div>
    );
  }

  return (
    <div className="media-admin-grid">
      {mediaItems.map((media) => (
        <MediaCard
          key={media.id}
          media={media}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
