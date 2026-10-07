import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ isMobile = false }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', region: 'International' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', region: 'German / DE' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <div className="mobile-language-switcher" style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', marginTop: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          🌐 Select Language / Sprache
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {languages.map((item) => {
            const isActive = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isActive ? '2px solid #1226de' : '1px solid #e2e8f0',
                  background: isActive ? 'rgba(18, 38, 222, 0.08)' : '#ffffff',
                  color: isActive ? '#1226de' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="language-switcher-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn-language-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Language selector: current ${currentLang.label}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '7px 15px',
          background: 'rgba(248, 250, 252, 0.95)',
          border: '1.5px solid #e2e8f0',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#1e293b',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{currentLang.flag}</span>
        <span style={{ letterSpacing: '0.04em' }}>{currentLang.code.toUpperCase()}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#64748b',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="language-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '180px',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '6px',
            zIndex: 1050,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(18, 38, 222, 0.08)' : 'transparent',
                  border: 'none',
                  color: isSelected ? '#1226de' : '#334155',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{item.flag}</span>
                  <div>
                    <div>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                      {item.region}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <span style={{ color: '#1226de', fontWeight: 'bold' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
