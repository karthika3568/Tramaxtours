export default function CmsContentRenderer({ content, className = '' }) {
  if (!content) {
    return (
      <div className="cms-empty-content">
        <p className="text-muted">No content has been published for this section yet.</p>
      </div>
    );
  }

  // If content contains HTML tags, render via dangerouslySetInnerHTML
  const containsHtml = /<[a-z][\s\S]*>/i.test(content);

  if (containsHtml) {
    return (
      <div
        className={`cms-rendered-content ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise split into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className={`cms-rendered-content ${className}`.trim()}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="cms-paragraph">
          {p}
        </p>
      ))}
    </div>
  );
}
