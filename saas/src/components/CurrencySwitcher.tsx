import { useCurrency } from "@/contexts/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

export function CurrencySwitcher() {
  const { currency, setCurrencyCode, currencies } = useCurrency();

  return (
    <Select value={currency.code} onValueChange={setCurrencyCode}>
      <SelectTrigger className="w-[100px] h-8 text-xs">
        <DollarSign className="h-3 w-3 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map(c => (
          <SelectItem key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
