import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, RefreshCw, DollarSign } from "lucide-react";
import { useState } from "react";
import { api, MessageSchema } from "@/lib/api/client";
import { z } from "zod";

const CurrencySchema = z.object({
  id: z.number().or(z.string()),
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  exchange_rate: z.number().or(z.string()),
  is_active: z.boolean().or(z.number()),
});
import { SEOHead } from "@/components/seo/SEOHead";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_active: boolean;
}

export default function AdminCurrencies() {
  const queryClient = useQueryClient();
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newRate, setNewRate] = useState("1.0");

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ["admin-currencies"],
    queryFn: () => api.get("/admin/currencies", z.array(CurrencySchema)),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/currencies", CurrencySchema, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-currencies"] });
      setNewCode("");
      setNewName("");
      setNewSymbol("");
      setNewRate("1.0");
      toast({ title: "Currency added" });
    },
  });

  const updateRate = useMutation({
    mutationFn: ({ id, exchange_rate }: { id: string; exchange_rate: number }) =>
      api.put(`/admin/currencies/${id}`, CurrencySchema, { exchange_rate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-currencies"] });
      toast({ title: "Exchange rate updated" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/currencies/${id}/toggle`, MessageSchema, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-currencies"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newSymbol || !newRate) return;
    createMutation.mutate({
      code: newCode.toUpperCase(),
      name: newName,
      symbol: newSymbol,
      exchange_rate: parseFloat(newRate),
      is_active: true,
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading currencies...</div>;

  return (
    <>
      <SEOHead title="Admin — Currencies" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> Currencies</h1>
          <p className="text-sm text-muted-foreground">Manage supported currencies and exchange rates.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Supported Currencies</CardTitle>
              <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-currencies"] })}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Rate (vs USD)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((c: Currency) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <span className="font-bold">{c.code}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{c.name}</span>
                      </TableCell>
                      <TableCell className="text-lg">{c.symbol}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.0001"
                          defaultValue={c.exchange_rate}
                          className="w-24 ml-auto h-8 text-right px-2"
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val && val !== c.exchange_rate) {
                              updateRate.mutate({ id: c.id, exchange_rate: val });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "default" : "secondary"}>
                          {c.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={c.is_active} onCheckedChange={() => toggleMutation.mutate(c.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] uppercase">Currency Code</Badge>
                  <Input placeholder="EUR" value={newCode} onChange={(e) => setNewCode(e.target.value)} maxLength={3} />
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] uppercase">Display Name</Badge>
                  <Input placeholder="Euro" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] uppercase">Symbol</Badge>
                    <Input placeholder="€" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] uppercase">Rate (Base USD)</Badge>
                    <Input type="number" step="0.0001" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" /> Add Currency
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
