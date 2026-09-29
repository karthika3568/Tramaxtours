export default function Loading({
  size = 'md',
  message = 'Loading...',
  fullPage = false,
  className = '',
}) {
  const content = (
    <div
      className={`loading-state ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className={`spinner spinner-${size}`} aria-hidden="true" />
      {message && <span className="loading-message">{message}</span>}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );

  if (fullPage) {
    return <div className="loading-fullpage-overlay">{content}</div>;
  }

  return content;
}
