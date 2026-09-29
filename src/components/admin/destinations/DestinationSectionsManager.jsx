import { useState } from 'react';
import MediaPickerModal from '../media/MediaPickerModal';
import { getMediaUrl } from '../../../utils/media';

const SECTION_TYPE_OPTIONS = [
  { value: 'seasonal_activities', label: 'Seasonal Activity (Accordion Row)' },
  { value: 'best_time_to_visit', label: 'Best Time to Visit' },
  { value: 'sightseeing', label: 'Sightseeing & Key Attractions' },
  { value: 'cultural_heritage', label: 'Cultural & Heritage Experiences' },
  { value: 'wildlife', label: 'Wildlife & Safari Highlights' },
  { value: 'custom', label: 'Custom Narrative Section' },
];

export default function DestinationSectionsManager({ sections = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [pickerIndex, setPickerIndex] = useState(null);

  const handleAddActivity = () => {
    const newSection = {
      section_type: 'seasonal_activities',
      title: '',
      subtitle: '',
      content: '',
      media_id: null,
      media: null,
      status: 'active',
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

  const handleToggleStatus = (index) => {
    const current = sections[index]?.status || 'active';
    const nextStatus = current === 'active' ? 'inactive' : 'active';
    handleUpdateField(index, 'status', nextStatus);
  };

  const handleRemove = (index) => {
    if (!window.confirm('Are you sure you want to remove this seasonal activity?')) return;
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
      <div className="module-manager-header flex justify-between items-center mb-4">
        <div>
          <h4 className="module-manager-title text-lg font-bold text-slate-900">
            Seasonal Activities &amp; Destination Content ({sections.length} Activities)
          </h4>
          <p className="module-manager-desc text-sm text-slate-500">
            Manage interactive accordion activities, answers, attached visuals, status, and display order displayed on the destination detail page.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm flex items-center gap-1.5"
          onClick={handleAddActivity}
        >
          <span>+</span> Add Activity
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="module-empty-box p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <span className="empty-icon text-3xl">📅</span>
          <p className="empty-text text-slate-600 mt-2 font-medium">No Seasonal Activities defined for this destination.</p>
          <p className="text-xs text-slate-400 mt-1">Add activities like &quot;Best Time to Visit&quot;, &quot;Comfortable Private Sightseeing&quot;, etc.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm mt-4"
            onClick={handleAddActivity}
          >
            + Add First Activity
          </button>
        </div>
      ) : (
        <div className="dest-sections-list space-y-3">
          {sections.map((section, idx) => {
            const isEditing = editingIndex === idx;
            const currentTypeObj = SECTION_TYPE_OPTIONS.find((t) => t.value === section.section_type);
            const isActive = (section.status || 'active') === 'active';
            const itemMedia = section.media || (section.media_id ? { id: section.media_id } : null);

            return (
              <div
                key={section.id || idx}
                className={`dest-section-admin-card rounded-xl border transition-all ${
                  isEditing
                    ? 'border-teal-600 bg-white shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="section-card-header p-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                  <div className="section-card-title-meta flex items-center gap-2.5 flex-1 min-w-[280px]">
                    <span className="section-order-badge text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                      #{idx + 1}
                    </span>
                    {itemMedia && (
                      <img
                        src={getMediaUrl(itemMedia)}
                        alt="Thumbnail"
                        className="w-8 h-8 rounded object-cover border border-slate-200"
                      />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <strong className="section-title-preview text-sm text-slate-900 truncate">
                        {section.title || <em className="text-slate-400">Untitled Activity</em>}
                      </strong>
                      <span className="text-[11px] text-slate-500 truncate max-w-md">
                        {section.content ? (
                          section.content.slice(0, 75) + (section.content.length > 75 ? '...' : '')
                        ) : (
                          <em className="text-slate-400">No answer content provided</em>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="section-card-actions flex items-center gap-2">
                    {/* Active / Inactive Status Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(idx)}
                      title={`Click to ${isActive ? 'Deactivate' : 'Activate'}`}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {isActive ? '● Active' : '○ Inactive'}
                    </button>

                    {/* Order buttons */}
                    <div className="inline-flex rounded-md border border-slate-200 bg-white">
                      <button
                        type="button"
                        className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 border-l border-slate-200 disabled:opacity-30 disabled:hover:bg-white"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === sections.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-xs px-3 py-1 text-xs"
                      onClick={() => setEditingIndex(isEditing ? null : idx)}
                    >
                      {isEditing ? 'Collapse' : 'Edit'}
                    </button>

                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded text-xs transition-colors"
                      onClick={() => handleRemove(idx)}
                      title="Delete activity"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded Section Editor */}
                {isEditing && (
                  <div className="section-card-body p-4 bg-white space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Activity Title *</label>
                        <input
                          type="text"
                          className="form-input form-input-sm w-full"
                          value={section.title || ''}
                          onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                          placeholder="e.g. Best Time to Visit Tamil Nadu"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                        <select
                          className="form-select form-select-sm w-full"
                          value={section.status || 'active'}
                          onChange={(e) => handleUpdateField(idx, 'status', e.target.value)}
                        >
                          <option value="active">Active (Visible)</option>
                          <option value="inactive">Inactive (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Answer / Content Details *
                      </label>
                      <textarea
                        rows={4}
                        className="form-textarea form-textarea-sm w-full text-sm"
                        value={section.content || ''}
                        onChange={(e) => handleUpdateField(idx, 'content', e.target.value)}
                        placeholder="Detailed activity description, season recommendations, sightseeing highlights..."
                      />
                    </div>

                    {/* Attached Image for Seasonal Section */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Section Visual Image (Shown on Left Side when active)
                      </label>
                      <div className="flex items-center gap-4">
                        {section.media || section.media_id ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={getMediaUrl(section.media || { id: section.media_id })}
                              alt={section.title || 'Section visual'}
                              className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                            />
                            <div className="text-xs">
                              <span className="block font-medium text-slate-700">
                                {section.media?.original_name || `Attached Media #${section.media_id}`}
                              </span>
                              <button
                                type="button"
                                className="text-red-600 hover:underline mt-1 font-semibold block"
                                onClick={() => {
                                  handleUpdateField(idx, 'media', null);
                                  handleUpdateField(idx, 'media_id', null);
                                }}
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No specific image attached (fallback to destination hero image).</span>
                        )}

                        <button
                          type="button"
                          className="btn btn-outline btn-xs ml-auto"
                          onClick={() => setPickerIndex(idx)}
                        >
                          {section.media || section.media_id ? 'Change Image' : 'Select Image'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => setEditingIndex(null)}
                      >
                        Done Editing
                      </button>
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
          title="Select Activity Image"
        />
      )}
    </div>
  );
}
