import { useState } from 'react';

const COMMON_SERVICE_OPTIONS = [
  '2-3 Persons (Standard)',
  '4-5 Persons (Standard)',
  '6+ Persons (Group Rate)',
  'Solo Traveler (Single Supplement)',
  'Transportation Only (Self-Guided)',
  'Transportation + Professional Safari Guide',
  'Luxury VIP Private Land Cruiser',
];

export default function TourPricingManager({
  pricingTiers = [],
  basePrice = 0,
  currency = 'EUR',
  onChange,
}) {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddTier = () => {
    const newTier = {
      service_option: 'Standard Package',
      min_persons: 1,
      max_persons: 4,
      currency: currency || 'EUR',
      price: basePrice || 0,
      valid_from: '',
      valid_to: '',
      status: 'active',
      display_order: pricingTiers.length,
    };
    const updated = [...pricingTiers, newTier];
    onChange(updated);
    setEditingIndex(updated.length - 1);
  };

  const handleUpdateField = (index, field, value) => {
    const updated = pricingTiers.map((tier, idx) => {
      if (idx === index) {
        return { ...tier, [field]: value };
      }
      return tier;
    });
    onChange(updated);
  };

  const handleRemove = (index) => {
    if (!window.confirm('Are you sure you want to remove this pricing tier?')) return;
    const updated = pricingTiers
      .filter((_, idx) => idx !== index)
      .map((tier, idx) => ({ ...tier, display_order: idx }));
    onChange(updated);
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...pricingTiers];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((tier, idx) => ({ ...tier, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index - 1);
    else if (editingIndex === index - 1) setEditingIndex(index);
  };

  const handleMoveDown = (index) => {
    if (index === pricingTiers.length - 1) return;
    const updated = [...pricingTiers];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((tier, idx) => ({ ...tier, display_order: idx })));
    if (editingIndex === index) setEditingIndex(index + 1);
    else if (editingIndex === index + 1) setEditingIndex(index);
  };

  return (
    <div className="tour-pricing-manager">
      <div className="module-manager-header">
        <div>
          <h4 className="module-manager-title">Dynamic Tiered Pricing ({pricingTiers.length} Tiers)</h4>
          <p className="module-manager-desc">
            Define pricing options based on group size (e.g. 2-3 Persons vs 4-6 Persons) or service levels (e.g. Transportation Only vs Driver + Safari Guide).
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddTier}
        >
          + Add Pricing Tier
        </button>
      </div>

      {pricingTiers.length === 0 ? (
        <div className="module-empty-box">
          <span className="empty-icon">🏷️</span>
          <p className="empty-text">No custom tiered pricing rules. Tour will use Base Price ({currency} {basePrice}).</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={handleAddTier}
          >
            Create Tiered Pricing Rule
          </button>
        </div>
      ) : (
        <div className="tour-pricing-table-wrapper">
          <table className="admin-table pricing-admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Service Option / Title</th>
                <th>Group Pax Range</th>
                <th>Price / Person</th>
                <th>Currency</th>
                <th>Validity</th>
                <th>Status</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingTiers.map((tier, idx) => {
                const isEditing = editingIndex === idx;

                return isEditing ? (
                  <tr key={tier.id || idx} className="row-editing">
                    <td colSpan={8} className="editing-tier-cell">
                      <div className="tier-edit-panel">
                        <div className="form-grid-3col">
                          <div className="form-group span-2">
                            <label className="form-label-xs required">Service Option / Name *</label>
                            <input
                              type="text"
                              className="form-input form-input-sm"
                              list="common-service-options"
                              value={tier.service_option || ''}
                              onChange={(e) => handleUpdateField(idx, 'service_option', e.target.value)}
                              placeholder="e.g. 2-3 Persons (Standard)"
                              required
                            />
                            <datalist id="common-service-options">
                              {COMMON_SERVICE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} />
                              ))}
                            </datalist>
                          </div>

                          <div className="form-group">
                            <label className="form-label-xs required">Price per Person *</label>
                            <input
                              type="number"
                              className="form-input form-input-sm"
                              step="0.01"
                              min="0"
                              value={tier.price ?? ''}
                              onChange={(e) => handleUpdateField(idx, 'price', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-grid-4col mt-2">
                          <div className="form-group">
                            <label className="form-label-xs">Min Persons</label>
                            <input
                              type="number"
                              className="form-input form-input-sm"
                              min="1"
                              value={tier.min_persons ?? 1}
                              onChange={(e) => handleUpdateField(idx, 'min_persons', parseInt(e.target.value, 10) || 1)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label-xs">Max Persons (Optional)</label>
                            <input
                              type="number"
                              className="form-input form-input-sm"
                              min="1"
                              value={tier.max_persons ?? ''}
                              onChange={(e) => handleUpdateField(idx, 'max_persons', e.target.value !== '' ? parseInt(e.target.value, 10) : null)}
                              placeholder="Unlimited"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label-xs">Currency</label>
                            <input
                              type="text"
                              className="form-input form-input-sm"
                              value={tier.currency || currency || 'EUR'}
                              onChange={(e) => handleUpdateField(idx, 'currency', e.target.value)}
                              maxLength={10}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label-xs">Status</label>
                            <select
                              className="form-select form-select-sm"
                              value={tier.status || 'active'}
                              onChange={(e) => handleUpdateField(idx, 'status', e.target.value)}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-grid-2col mt-2">
                          <div className="form-group">
                            <label className="form-label-xs">Valid From (Optional)</label>
                            <input
                              type="date"
                              className="form-input form-input-sm"
                              value={tier.valid_from ? tier.valid_from.substring(0, 10) : ''}
                              onChange={(e) => handleUpdateField(idx, 'valid_from', e.target.value || null)}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label-xs">Valid To (Optional)</label>
                            <input
                              type="date"
                              className="form-input form-input-sm"
                              value={tier.valid_to ? tier.valid_to.substring(0, 10) : ''}
                              onChange={(e) => handleUpdateField(idx, 'valid_to', e.target.value || null)}
                            />
                          </div>
                        </div>

                        <div className="tier-edit-footer mt-3">
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            onClick={() => setEditingIndex(null)}
                          >
                            Done Editing
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={tier.id || idx}>
                    <td className="text-muted">#{idx + 1}</td>
                    <td>
                      <strong>{tier.service_option || 'Standard Option'}</strong>
                    </td>
                    <td>
                      {tier.min_persons || 1} {tier.max_persons ? `– ${tier.max_persons}` : '+'} pax
                    </td>
                    <td>
                      <span className="tier-price-tag">
                        {tier.currency || currency || 'EUR'} {Number(tier.price || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>{tier.currency || currency || 'EUR'}</td>
                    <td className="text-xs text-muted">
                      {tier.valid_from || tier.valid_to
                        ? `${tier.valid_from ? tier.valid_from.substring(0, 10) : 'Any'} → ${tier.valid_to ? tier.valid_to.substring(0, 10) : 'Any'}`
                        : 'Year-Round'}
                    </td>
                    <td>
                      <span className={`status-badge-sm status-${tier.status === 'active' ? 'published' : 'draft'}`}>
                        {tier.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="order-btn-group inline-actions">
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
                          disabled={idx === pricingTiers.length - 1}
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => setEditingIndex(idx)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger-xs"
                          onClick={() => handleRemove(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
