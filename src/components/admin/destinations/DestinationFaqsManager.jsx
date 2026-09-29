import { useState } from 'react';

export default function DestinationFaqsManager({ faqs = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddFaq = () => {
    const newFaq = {
      question: '',
      answer: '',
      status: 'published',
      display_order: faqs.length,
    };
    const updated = [...faqs, newFaq];
    onChange(updated);
    setEditingIndex(updated.length - 1);
  };

  const handleUpdateField = (index, field, value) => {
    const updated = faqs.map((faq, idx) => {
      if (idx === index) {
        return { ...faq, [field]: value };
      }
      return faq;
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    if (!window.confirm('Are you sure you want to remove this FAQ?')) return;
    const updated = faqs.filter((_, idx) => idx !== index).map((faq, idx) => ({
      ...faq,
      display_order: idx,
    }));
    onChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...faqs];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((faq, idx) => ({ ...faq, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index - 1);
    else if (editingIndex === index - 1) setEditingIndex(index);
  };

  const handleMoveDown = (index) => {
    if (index === faqs.length - 1) return;
    const updated = [...faqs];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((faq, idx) => ({ ...faq, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index + 1);
    else if (editingIndex === index + 1) setEditingIndex(index);
  };

  return (
    <div className="dest-faqs-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Destination FAQs ({faqs.length} Questions)</h4>
          <p className="module-manager-desc">
            Provide answers to common visitor questions (visa requirements, safety, best months to travel, packing essentials).
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddFaq}
        >
          + Add FAQ Question
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="module-empty-box">
          <span className="empty-icon">❓</span>
          <p className="empty-text">No FAQs registered for this destination yet.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={handleAddFaq}
          >
            Create First FAQ
          </button>
        </div>
      ) : (
        <div className="dest-faqs-list">
          {faqs.map((faq, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div
                key={faq.id || idx}
                className={`dest-faq-admin-card ${isEditing ? 'card-editing' : ''}`}
              >
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
                    <div className="order-btn-group">
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn-icon-order"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === faqs.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => setEditingIndex(isEditing ? null : idx)}
                    >
                      {isEditing ? 'Collapse' : 'Edit'}
                    </button>

                    <button
                      type="button"
                      className="btn-danger-xs"
                      onClick={() => handleRemove(idx)}
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
                        onChange={(e) => handleUpdateField(idx, 'question', e.target.value)}
                        placeholder="e.g. Do foreign travellers require a Yellow Fever vaccination?"
                        required
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label-xs required">Answer *</label>
                      <textarea
                        rows={4}
                        className="form-textarea form-textarea-sm"
                        value={faq.answer || ''}
                        onChange={(e) => handleUpdateField(idx, 'answer', e.target.value)}
                        placeholder="Comprehensive response providing helpful advice..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-xs">Publication Status</label>
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: '200px' }}
                        value={faq.status || 'published'}
                        onChange={(e) => handleUpdateField(idx, 'status', e.target.value)}
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
