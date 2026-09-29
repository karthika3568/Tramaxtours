export default function TourPricing({
  pricingTiers = [],
  includes = [],
  excludes = [],
  basePrice,
  currency = 'EUR',
}) {
  const currencySymbol = currency === 'EUR' ? '€' : currency;

  return (
    <div className="tour-pricing-section detail-content-block">
      <h3 className="detail-section-title">Pricing & Inclusions</h3>

      {/* Pricing Tiers Table / Cards */}
      {pricingTiers && pricingTiers.length > 0 ? (
        <div className="pricing-tiers-wrapper">
          <h4 className="sub-block-title">Tiered Group Pricing</h4>
          <div className="pricing-tiers-grid">
            {pricingTiers.map((tier, idx) => (
              <div key={tier.id || idx} className="pricing-tier-card">
                <span className="tier-title">{tier.service_option || tier.title || 'Standard Rate'}</span>
                <div className="tier-price-row">
                  <span className="tier-price">
                    {currencySymbol}{Number(tier.price !== undefined ? tier.price : (tier.price_per_person || 0)).toLocaleString()}
                  </span>
                  <span className="tier-unit">/ person</span>
                </div>
                {(tier.min_persons || tier.max_persons) && (
                  <span className="tier-capacity">
                    Group: {tier.min_persons || 1}
                    {tier.max_persons ? ` - ${tier.max_persons}` : '+'} pax
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : basePrice ? (
        <div className="pricing-tiers-wrapper">
          <div className="pricing-tier-card" style={{ maxWidth: '280px' }}>
            <span className="tier-title">Standard Package Rate</span>
            <div className="tier-price-row">
              <span className="tier-price">
                {currencySymbol}{Number(basePrice || 0).toLocaleString()}
              </span>
              <span className="tier-unit">/ person</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Inclusions & Exclusions */}
      {(includes.length > 0 || excludes.length > 0) && (
        <div className="inclusions-exclusions-grid">
          {includes.length > 0 && (
            <div className="inclusions-box">
              <h4 className="inclusions-title">
                <span className="check-icon" aria-hidden="true">✓</span> What is Included
              </h4>
              <ul className="inclusions-list">
                {includes.map((item, idx) => (
                  <li key={item.id || idx} className="inclusion-item">
                    <span className="bullet-check" aria-hidden="true">✓</span>
                    <span>{item.item_text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {excludes.length > 0 && (
            <div className="exclusions-box">
              <h4 className="exclusions-title">
                <span className="cross-icon" aria-hidden="true">✕</span> What is Not Included
              </h4>
              <ul className="exclusions-list">
                {excludes.map((item, idx) => (
                  <li key={item.id || idx} className="exclusion-item">
                    <span className="bullet-cross" aria-hidden="true">✕</span>
                    <span>{item.item_text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
