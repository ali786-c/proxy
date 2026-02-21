import { useI18n } from "@/contexts/I18nContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <Globe className="mr-1 h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(locales).map(([code, label]) => (
          <SelectItem key={code} value={code}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
