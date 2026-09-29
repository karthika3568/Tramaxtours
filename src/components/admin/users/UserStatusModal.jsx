export default function UserStatusModal({
  user,
  actionType, // 'activate' | 'deactivate' | 'delete'
  isOpen,
  isProcessing,
  onConfirm,
  onCancel,
}) {
  if (!isOpen || !user) return null;

  const getTitle = () => {
    switch (actionType) {
      case 'activate':
        return 'Activate Staff Account';
      case 'deactivate':
        return 'Disable Staff Account';
      case 'delete':
        return 'Delete Staff Account';
      default:
        return 'Confirm Action';
    }
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    switch (actionType) {
      case 'activate':
        return 'Activate Account';
      case 'deactivate':
        return 'Disable Account';
      case 'delete':
        return 'Delete Account';
      default:
        return 'Confirm';
    }
  };

  const getButtonClass = () => {
    switch (actionType) {
      case 'activate':
        return 'btn-success';
      case 'deactivate':
        return 'btn-warning';
      case 'delete':
        return 'btn-danger';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="admin-modal-container confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{getTitle()}</h3>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="confirmation-content">
            <div className="confirmation-icon-wrapper">
              {actionType === 'delete' && <span className="warning-icon">🗑️</span>}
              {actionType === 'deactivate' && <span className="warning-icon">⏸️</span>}
              {actionType === 'activate' && <span className="success-icon">▶️</span>}
            </div>

            <p className="confirmation-message">
              Are you sure you want to{' '}
              <strong>{actionType === 'delete' ? 'delete' : actionType === 'deactivate' ? 'disable' : 'activate'}</strong>{' '}
              the staff account for <strong>{user.name}</strong> ({user.email})?
            </p>

            {actionType === 'deactivate' && (
              <div className="modal-alert-box alert-warning">
                <strong>Important:</strong> Disabling this account will prevent the user from logging in or performing any administrative actions until re-activated.
              </div>
            )}

            {actionType === 'delete' && (
              <div className="modal-alert-box alert-danger">
                <strong>Warning:</strong> Soft-deleting this account will immediately revoke all access and hide this user from staff listings.
              </div>
            )}
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${getButtonClass()}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
