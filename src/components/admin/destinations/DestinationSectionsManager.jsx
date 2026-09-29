import { useState } from 'react';
import MediaPickerModal from '../media/MediaPickerModal';
import { getMediaUrl } from '../../../utils/media';

const SECTION_TYPE_OPTIONS = [
  { value: 'best_time_to_visit', label: 'Best Time to Visit' },
  { value: 'sightseeing', label: 'Sightseeing & Key Attractions' },
  { value: 'cultural_heritage', label: 'Cultural & Heritage Experiences' },
  { value: 'seasonal_activities', label: 'Seasonal Activities & Climate' },
  { value: 'wildlife', label: 'Wildlife & Safari Highlights' },
  { value: 'custom', label: 'Custom Narrative Section' },
];

export default function DestinationSectionsManager({ sections = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [pickerIndex, setPickerIndex] = useState(null);

  const handleAddSection = () => {
    const newSection = {
      section_type: 'custom',
      title: '',
      subtitle: '',
      content: '',
      media_id: null,
      media: null,
      status: 'published',
      display_order: sections.length,
    };
    const updated = [...sections, newSection];
    onChange(updated);
    setEditingIndex(updated.length - 1);
  };

  const handleUpdateField = (index, field, value) => {
    const updated = sections.map((sec, idx) => {
      if (idx === index) {
        return { ...sec, [field]: value };
      }
      return sec;
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    if (!window.confirm('Are you sure you want to remove this section?')) return;
    const updated = sections.filter((_, idx) => idx !== index).map((sec, idx) => ({
      ...sec,
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
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((sec, idx) => ({ ...sec, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index - 1);
    else if (editingIndex === index - 1) setEditingIndex(index);
  };

  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((sec, idx) => ({ ...sec, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index + 1);
    else if (editingIndex === index + 1) setEditingIndex(index);
  };

  const handleMediaSelected = (asset) => {
    if (pickerIndex !== null && pickerIndex < sections.length) {
      const updated = sections.map((sec, idx) => {
        if (idx === pickerIndex) {
          return {
            ...sec,
            media_id: asset ? asset.id : null,
            media: asset || null,
          };
        }
        return sec;
      });
      onChange(updated);
    }
    setPickerIndex(null);
  };

  return (
    <div className="dest-sections-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Destination Sections ({sections.length} Sections)</h4>
          <p className="module-manager-desc">
            Organize structured content blocks such as History, Culture, Sightseeing, Seasonal Activities, Best Time to Visit, or Custom Articles.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddSection}
        >
          + Add Content Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="module-empty-box">
          <span className="empty-icon">📑</span>
          <p className="empty-text">No custom narrative sections defined for this destination.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={handleAddSection}
          >
            Create First Section
          </button>
        </div>
      ) : (
        <div className="dest-sections-list">
          {sections.map((section, idx) => {
            const isEditing = editingIndex === idx;
            const currentTypeObj = SECTION_TYPE_OPTIONS.find((t) => t.value === section.section_type);

            return (
              <div
                key={section.id || idx}
                className={`dest-section-admin-card ${isEditing ? 'card-editing' : ''}`}
              >
                <div className="section-card-header">
                  <div className="section-card-title-meta">
                    <span className="section-order-badge">#{idx + 1}</span>
                    <span className="section-type-pill">{currentTypeObj?.label || section.section_type}</span>
                    <strong className="section-title-preview">
                      {section.title || <em className="text-muted">Untitled Section</em>}
                    </strong>
                    <span className={`status-badge-sm status-${section.status || 'published'}`}>
                      {section.status || 'published'}
                    </span>
                  </div>

                  <div className="section-card-actions">
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
                        disabled={idx === sections.length - 1}
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
                      {isEditing ? 'Collapse' : 'Edit Section'}
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

                {/* Expanded Section Editor */}
                {isEditing && (
                  <div className="section-card-body">
                    <div className="form-grid-3col">
                      <div className="form-group">
                        <label className="form-label-xs required">Section Category Type *</label>
                        <select
                          className="form-select form-select-sm"
                          value={section.section_type || 'custom'}
                          onChange={(e) => handleUpdateField(idx, 'section_type', e.target.value)}
                        >
                          {SECTION_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label-xs required">Section Title *</label>
                        <input
                          type="text"
                          className="form-input form-input-sm"
                          value={section.title || ''}
                          onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                          placeholder="e.g. Best Time to Visit & Weather"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label-xs">Publication Status</label>
                        <select
                          className="form-select form-select-sm"
                          value={section.status || 'published'}
                          onChange={(e) => handleUpdateField(idx, 'status', e.target.value)}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label-xs">Subtitle / Highlight Line (Optional)</label>
                      <input
                        type="text"
                        className="form-input form-input-sm"
                        value={section.subtitle || ''}
                        onChange={(e) => handleUpdateField(idx, 'subtitle', e.target.value)}
                        placeholder="e.g. Dry season from July to October offers optimal game viewing"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-xs">Section Body Content</label>
                      <textarea
                        rows={5}
                        className="form-textarea form-textarea-sm"
                        value={section.content || ''}
                        onChange={(e) => handleUpdateField(idx, 'content', e.target.value)}
                        placeholder="Detailed narrative, tips, recommendations, historical context..."
                      />
                    </div>

                    {/* Section Image Attachment */}
                    <div className="section-media-attacher">
                      <label className="form-label-xs">Attached Section Visual (Media Library)</label>
                      <div className="section-media-flex">
                        {section.media || section.media_id ? (
                          <div className="section-media-preview-mini">
                            <img
                              src={getMediaUrl(section.media || { id: section.media_id })}
                              alt={section.title || 'Section visual'}
                            />
                            <div className="section-media-info">
                              <span className="media-name-txt">
                                {section.media?.original_name || `Media #${section.media_id}`}
                              </span>
                              <button
                                type="button"
                                className="btn-link-danger-xs"
                                onClick={() => handleUpdateField(idx, 'media', null) || handleUpdateField(idx, 'media_id', null)}
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="no-media-attached-txt">No image attached to this section.</span>
                        )}

                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => setPickerIndex(idx)}
                        >
                          {section.media || section.media_id ? 'Change Image' : 'Select Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pickerIndex !== null && (
        <MediaPickerModal
          isOpen={pickerIndex !== null}
          onClose={() => setPickerIndex(null)}
          onSelect={handleMediaSelected}
          selectedMediaId={sections[pickerIndex]?.media_id || sections[pickerIndex]?.media?.id}
          title="Select Section Visual Asset"
        />
      )}
    </div>
  );
}
