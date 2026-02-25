import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, LOCALE_LABELS, type Locale } from "@/lib/i18n/translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  locales: typeof LOCALE_LABELS;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    return saved && saved in translations ? saved : "en";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  const t = useCallback(
    (key: string) => (translations[locale] as Record<string, string>)[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales: LOCALE_LABELS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
