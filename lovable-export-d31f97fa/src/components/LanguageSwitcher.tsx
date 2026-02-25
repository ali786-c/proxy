import { useI18n } from "@/contexts/I18nContext";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FLAG_MAP: Record<Locale, { flag: string; label: string }> = {
  en: { flag: "🇬🇧", label: "English" },
  es: { flag: "🇪🇸", label: "Español" },
  fr: { flag: "🇫🇷", label: "Français" },
  de: { flag: "🇩🇪", label: "Deutsch" },
  pt: { flag: "🇧🇷", label: "Português" },
  tr: { flag: "🇹🇷", label: "Türkçe" },
  zh: { flag: "🇨🇳", label: "中文" },
  ru: { flag: "🇷🇺", label: "Русский" },
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, locales } = useI18n();
  const current = FLAG_MAP[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
          aria-label="Change language"
        >
          <span className="text-base leading-none">{current.flag}</span>
          <span className={compact ? "hidden sm:inline" : ""}>{locale.toUpperCase()}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {(Object.keys(locales) as Locale[]).map((code) => {
          const { flag, label } = FLAG_MAP[code];
          const isActive = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className={`flex items-center gap-2.5 cursor-pointer ${isActive ? "bg-primary/10 text-primary font-semibold" : ""}`}
            >
              <span className="text-lg leading-none">{flag}</span>
              <span>{label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
