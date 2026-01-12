'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'SSP' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceSSP: number, priceUSD: number) => string;
  formatPriceValue: (priceSSP: number, priceUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('SSP');

  useEffect(() => {
    // Load saved preference from localStorage
    const saved = localStorage.getItem('preferred_currency') as Currency;
    if (saved && (saved === 'SSP' || saved === 'USD')) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const formatPrice = (priceSSP: number, priceUSD: number): string => {
    if (currency === 'SSP') {
      return `${(priceSSP || 0).toLocaleString()} SSP`;
    }
    return `$${priceUSD || 0}`;
  };

  const formatPriceValue = (priceSSP: number, priceUSD: number): number => {
    return currency === 'SSP' ? priceSSP : priceUSD;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatPriceValue }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
