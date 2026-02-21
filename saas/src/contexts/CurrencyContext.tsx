import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState("USD");

  const { data: currencies } = useQuery({
    queryKey: ["supported-currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supported_currencies")
        .select("code, name, symbol, exchange_rate")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return (data ?? []).map(c => ({ ...c, exchange_rate: Number(c.exchange_rate) }));
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  // Auto-detect currency by region on first load
  useEffect(() => {
    if (!currencies?.length) return;
    const saved = localStorage.getItem("preferred_currency");
    if (saved && currencies.find(c => c.code === saved)) {
      setCurrencyCode(saved);
      return;
    }
    // Try to detect from timezone / locale
    try {
      const locale = navigator.language;
      const regionMatch = locale.match(/-([A-Z]{2})$/);
      if (regionMatch) {
        const region = regionMatch[1];
        // Check auto_detect_regions from our list
        const detected = currencies.find(c => c.code !== "USD") ?? currencies[0];
        if (detected) setCurrencyCode(detected.code);
      }
    } catch {
      // fallback to USD
    }
  }, [currencies]);

  const currency = currencies?.find(c => c.code === currencyCode) ?? DEFAULT_CURRENCY;

  const handleSetCurrency = (code: string) => {
    setCurrencyCode(code);
    localStorage.setItem("preferred_currency", code);
  };

  const convert = (usdAmount: number) => usdAmount * currency.exchange_rate;
  const formatPrice = (usdAmount: number) => {
    const converted = convert(usdAmount);
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode: handleSetCurrency, currencies: currencies ?? [DEFAULT_CURRENCY], convert, format: formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
