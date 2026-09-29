import { useState } from 'react';

export default function TourFaq({ faqs = [], title = 'Frequently Asked Questions' }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="tour-faqs-section detail-content-block">
      <h3 className="detail-section-title">{title}</h3>
      <div className="faqs-accordion-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={faq.id || idx} className={`faq-item-card ${isOpen ? 'is-active' : ''}`}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div id={`faq-answer-${idx}`} className="faq-answer-box">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
