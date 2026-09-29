import { useState } from 'react';

export default function TourExtrasManager({
  includes = [],
  excludes = [],
  faqs = [],
  onIncludesChange,
  onExcludesChange,
  onFaqsChange,
}) {
  const [newIncText, setNewIncText] = useState('');
  const [newExcText, setNewExcText] = useState('');
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);

  // Inclusions handlers
  const handleAddInclude = () => {
    if (!newIncText.trim()) return;
    const updated = [...includes, { item_text: newIncText.trim(), display_order: includes.length }];
    onIncludesChange(updated);
    setNewIncText('');
  };

  const handleRemoveInclude = (index) => {
    const updated = includes.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, display_order: idx }));
    onIncludesChange(updated);
  };

  const handleUpdateInclude = (index, value) => {
    const updated = includes.map((item, idx) => (idx === index ? { ...item, item_text: value } : item));
    onIncludesChange(updated);
  };

  // Exclusions handlers
  const handleAddExclude = () => {
    if (!newExcText.trim()) return;
    const updated = [...excludes, { item_text: newExcText.trim(), display_order: excludes.length }];
    onExcludesChange(updated);
    setNewExcText('');
  };

  const handleRemoveExclude = (index) => {
    const updated = excludes.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, display_order: idx }));
    onExcludesChange(updated);
  };

  const handleUpdateExclude = (index, value) => {
    const updated = excludes.map((item, idx) => (idx === index ? { ...item, item_text: value } : item));
    onExcludesChange(updated);
  };

  // FAQ handlers
  const handleAddFaq = () => {
    const newFaq = {
      question: '',
      answer: '',
      status: 'published',
      display_order: faqs.length,
    };
    const updated = [...faqs, newFaq];
    onFaqsChange(updated);
    setEditingFaqIndex(updated.length - 1);
  };

  const handleUpdateFaqField = (index, field, value) => {
    const updated = faqs.map((f, idx) => (idx === index ? { ...f, [field]: value } : f));
    onFaqsChange(updated);
  };

  const handleRemoveFaq = (index) => {
    if (!window.confirm('Remove this FAQ?')) return;
    const updated = faqs.filter((_, idx) => idx !== index).map((f, idx) => ({ ...f, display_order: idx }));
    onFaqsChange(updated);
    if (editingFaqIndex === index) setEditingFaqIndex(null);
    else if (editingFaqIndex > index) setEditingFaqIndex(editingFaqIndex - 1);
  };

  return (
    <div className="tour-extras-manager">
      {/* 1. Inclusions & Exclusions */}
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Inclusions & Exclusions</h4>
          <p className="module-manager-desc">
            Specify clearly what is included (e.g. Park Fees, 4x4 Safari Cruiser, Mineral Water) and what is not (e.g. International Flights, Tips, Visa Fees).
          </p>
        </div>
      </div>

      <div className="form-grid-2col mb-6">
        {/* Inclusions Card */}
        <div className="inc-exc-admin-box">
          <div className="inc-exc-header">
            <span className="inc-title">✓ What is Included ({includes.length})</span>
          </div>

          <div className="inc-exc-add-bar">
            <input
              type="text"
              className="form-input form-input-sm"
              value={newIncText}
              onChange={(e) => setNewIncText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInclude();
                }
              }}
              placeholder="e.g. All National Park entrance fees"
            />
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={handleAddInclude}
              disabled={!newIncText.trim()}
            >
              + Add
            </button>
          </div>

          <ul className="inc-exc-list">
            {includes.map((item, idx) => (
              <li key={item.id || idx} className="inc-exc-item">
                <span className="check-mark-bullet">✓</span>
                <input
                  type="text"
                  className="form-input form-input-xs flex-1"
                  value={item.item_text || ''}
                  onChange={(e) => handleUpdateInclude(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-danger-xs"
                  onClick={() => handleRemoveInclude(idx)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions Card */}
        <div className="inc-exc-admin-box">
          <div className="inc-exc-header">
            <span className="exc-title">✕ What is Not Included ({excludes.length})</span>
          </div>

          <div className="inc-exc-add-bar">
            <input
              type="text"
              className="form-input form-input-sm"
              value={newExcText}
              onChange={(e) => setNewExcText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddExclude();
                }
              }}
              placeholder="e.g. International airfare & visa fees"
            />
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={handleAddExclude}
              disabled={!newExcText.trim()}
            >
              + Add
            </button>
          </div>

          <ul className="inc-exc-list">
            {excludes.map((item, idx) => (
              <li key={item.id || idx} className="inc-exc-item">
                <span className="cross-mark-bullet">✕</span>
                <input
                  type="text"
                  className="form-input form-input-xs flex-1"
                  value={item.item_text || ''}
                  onChange={(e) => handleUpdateExclude(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-danger-xs"
                  onClick={() => handleRemoveExclude(idx)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Tour Specific FAQs */}
      <div className="module-manager-header mt-6">
        <div>
          <h4 className="module-manager-title">Tour Package Specific FAQs ({faqs.length} Questions)</h4>
          <p className="module-manager-desc">
            Common questions specific to this tour itinerary (e.g. "What should I wear on game drives?", "Is Wi-Fi available at the lodges?").
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddFaq}
        >
          + Add Tour FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="module-empty-box">
          <span className="empty-icon">❓</span>
          <p className="empty-text">No specific FAQs registered for this tour yet.</p>
        </div>
      ) : (
        <div className="dest-faqs-list">
          {faqs.map((faq, idx) => {
            const isEditing = editingFaqIndex === idx;

            return (
              <div key={faq.id || idx} className={`dest-faq-admin-card ${isEditing ? 'card-editing' : ''}`}>
                <div className="faq-card-header">
                  <div className="faq-card-title-meta">
                    <span className="faq-order-badge">Q{idx + 1}</span>
                    <strong className="faq-question-preview">
                      {faq.question || <em className="text-muted">Enter question...</em>}
                    </strong>
                    <span className={`status-badge-sm status-${faq.status || 'published'}`}>
                      {faq.status || 'published'}
                    </span>
                  </div>

                  <div className="faq-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => setEditingFaqIndex(isEditing ? null : idx)}
                    >
                      {isEditing ? 'Collapse' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="btn-danger-xs"
                      onClick={() => handleRemoveFaq(idx)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="faq-card-body">
                    <div className="form-group mb-3">
                      <label className="form-label-xs required">Question *</label>
                      <input
                        type="text"
                        className="form-input form-input-sm"
                        value={faq.question || ''}
                        onChange={(e) => handleUpdateFaqField(idx, 'question', e.target.value)}
                        placeholder="e.g. Are safari vehicles equipped with charging ports?"
                        required
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label-xs required">Answer *</label>
                      <textarea
                        rows={4}
                        className="form-textarea form-textarea-sm"
                        value={faq.answer || ''}
                        onChange={(e) => handleUpdateFaqField(idx, 'answer', e.target.value)}
                        placeholder="Yes, all our custom 4x4 Land Cruisers have USB & power inverter sockets..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-xs">Publication Status</label>
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: '180px' }}
                        value={faq.status || 'published'}
                        onChange={(e) => handleUpdateFaqField(idx, 'status', e.target.value)}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
