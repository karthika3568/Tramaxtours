import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CurrencyContext = createContext(null);

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)', rate: 1.0, flag: '🇮🇳' },
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 0.012, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.011, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rate: 0.0095, flag: '🇬🇧' },
];

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    try {
      return localStorage.getItem('tramax_selected_currency') || 'INR';
    } catch {
      return 'INR';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tramax_selected_currency', currencyCode);
    } catch {
      // Ignore
    }
  }, [currencyCode]);

  const currentCurrency = useMemo(() => {
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) ||
      SUPPORTED_CURRENCIES[0]
    );
  }, [currencyCode]);

  /**
   * Convert an amount in INR to selected currency
   */
  const convertPrice = (amountInInr) => {
    if (!amountInInr || isNaN(amountInInr)) return 0;
    const num = parseFloat(amountInInr);
    return Math.round(num * currentCurrency.rate);
  };

  /**
   * Format price with currency symbol (e.g. ₹4,500 or $54 or €50)
   */
  const formatPrice = (amountInInr) => {
    if (amountInInr === null || amountInInr === undefined || amountInInr === '') {
      return 'On Request';
    }
    const num = parseFloat(amountInInr);
    if (isNaN(num) || num <= 0) {
      return 'On Request';
    }

    const converted = num * currentCurrency.rate;
    const formattedNum = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: currentCurrency.code === 'INR' ? 0 : 0,
    }).format(Math.round(converted));

    return `${currentCurrency.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: currentCurrency,
        currencyCode,
        setCurrency: setCurrencyCode,
        convertPrice,
        formatPrice,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currency: SUPPORTED_CURRENCIES[0],
      currencyCode: 'INR',
      setCurrency: () => {},
      convertPrice: (v) => v || 0,
      formatPrice: (v) => (v ? `₹${Number(v).toLocaleString()}` : 'On Request'),
      supportedCurrencies: SUPPORTED_CURRENCIES,
    };
  }
  return context;
}
