import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { DollarSign, RefreshCw } from "lucide-react";

function useCurrencies() {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      // Transitioned to Laravel (placeholder)
      return [];
    },
  });
}

export default function AdminCurrencies() {
  const { data: currencies, isLoading } = useCurrencies();
  const queryClient = useQueryClient();

  const updateRate = useMutation({
    mutationFn: async ({ id, exchange_rate }: { id: string; exchange_rate: number }) => {
      // Neutralized (Admin API endpoint required)
      console.log("Updating rate for", id, exchange_rate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({ title: "Exchange rate updated (Mock)" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // Neutralized
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["currencies"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> Multi-Currency Management</h1>
        <p className="text-muted-foreground">Manage supported currencies and exchange rates (auto-detect by region)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Currencies</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{currencies?.filter(c => c.is_active).length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Currencies</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{currencies?.length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Regions Covered</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{currencies?.reduce((a, c) => a + (c.auto_detect_regions as string[] ?? []).length, 0) ?? 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Currencies & Exchange Rates</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Exchange Rate (vs USD)</TableHead>
                <TableHead>Auto-Detect Regions</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies?.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <span className="font-semibold">{c.code}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-lg">{c.symbol}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={Number(c.exchange_rate)}
                      className="w-28"
                      onBlur={e => {
                        const val = parseFloat(e.target.value);
                        if (val && val !== Number(c.exchange_rate)) {
                          updateRate.mutate({ id: c.id, exchange_rate: val });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(c.auto_detect_regions as string[] ?? []).map(r => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.is_active ?? false} onCheckedChange={v => toggleActive.mutate({ id: c.id, is_active: v })} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
