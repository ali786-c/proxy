import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrencyCode: (code: string) => void;
  currencies: Currency[];
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
}

const DEFAULT_CURRENCY: Currency = { code: "USD", name: "US Dollar", symbol: "$", exchange_rate: 1 };
const SUPPORTED_CURRENCIES: Currency[] = [
  DEFAULT_CURRENCY,
  { code: "EUR", name: "Euro", symbol: "€", exchange_rate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", exchange_rate: 0.79 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", exchange_rate: 280 },
];

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem("preferred_currency") || "USD";
  });

  const currencies = SUPPORTED_CURRENCIES;
  const currency = currencies.find(c => c.code === currencyCode) ?? DEFAULT_CURRENCY;

  const handleSetCurrency = (code: string) => {
    setCurrencyCode(code);
    localStorage.setItem("preferred_currency", code);
  };

  const convert = (usdAmount: number) => usdAmount * currency.exchange_rate;
  const formatPrice = (usdAmount: number) => {
    const converted = convert(usdAmount);
    // Use Intl.NumberFormat for better formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrencyCode: handleSetCurrency,
      currencies,
      convert,
      format: formatPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
