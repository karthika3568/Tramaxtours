export default function EmptyState({
  title = 'No items found',
  description,
  message,
  icon,
  action,
  actionLabel,
  onAction,
  className = '',
}) {
  const displayDescription = description || message || 'There are currently no records to display.';
  const displayAction = action || (actionLabel && onAction ? (
    <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
      {actionLabel}
    </button>
  ) : null);

  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon || (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {displayDescription && <p className="empty-state-description">{displayDescription}</p>}
      {displayAction && <div className="empty-state-action">{displayAction}</div>}
    </div>
  );
}

