import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'SAR' | 'TND' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
  rates: Record<Currency, number>;
  updateRates: (rates: Record<Currency, number>) => void;
}

interface CurrencyProviderProps {
  children: ReactNode;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Base currency rates (USD = 1)
const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  SAR: 3.75,
  TND: 3.12,
  EUR: 0.92,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  SAR: '﷼',
  TND: 'DT',
  EUR: '€',
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    // Check admin settings first, then user preference, then default
    const adminSettings = localStorage.getItem('admin-settings');
    const defaultCurrency = adminSettings ? JSON.parse(adminSettings).defaultCurrency : null;
    return (localStorage.getItem('preferred-currency') as Currency) || defaultCurrency || 'USD';
  });
  
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);

  useEffect(() => {
    localStorage.setItem('preferred-currency', currency);
  }, [currency]);

  const convertPrice = (price: number): number => {
    return Number((price * rates[currency]).toFixed(2));
  };

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    if (currency === 'SAR' || currency === 'TND') {
      return `${convertedPrice.toFixed(2)} ${symbol}`;
    }
    if (currency === 'EUR') {
      return `€${convertedPrice.toFixed(2)}`;
    }
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  const updateRates = (newRates: Record<Currency, number>) => {
    setRates(newRates);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        rates,
        updateRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};