import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { z } from "zod";

const TransactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  amount: z.number().or(z.string()),
  type: z.string(),
  description: z.string(),
  reference: z.string().nullable(),
  created_at: z.string(),
  user: z.object({
    name: z.string().nullable(),
    email: z.string(),
  }).nullable(),
});
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Download, Eye, FileText, User as UserIcon, Calendar, Hash, Receipt } from "lucide-react";
import { useState } from "react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  credit: "default",
  debit: "secondary"
};

export default function AdminInvoices() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: () => api.get("/admin/invoices", z.array(TransactionSchema)),
  });

  const filtered = transactions.filter((t: any) => {
    const q = search.toLowerCase();
    return (
      String(t.id).includes(q) ||
      t.user?.email.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.reference && t.reference.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <SEOHead title="All Transactions" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Financial History</h1>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, email, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID / Ref</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading transactions...</TableCell></TableRow>
                ) : filtered.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-[10px]">
                      <div className="flex flex-col">
                        <span>#TX-{t.id}</span>
                        {t.reference && <span className="text-muted-foreground truncate max-w-[100px]">{t.reference}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{t.user?.name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{t.user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{t.description}</TableCell>
                    <TableCell className={t.type === 'credit' ? 'text-green-600 font-semibold text-sm' : 'text-sm'}>
                      {t.type === 'credit' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[t.type] ?? "secondary"}>{t.type}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(t)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Transaction Details
            </DialogTitle>
            <DialogDescription>Full record for transaction #TX-{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Transaction ID
                  </p>
                  <p className="text-sm font-mono font-medium">{selected.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date & Time
                  </p>
                  <p className="text-sm">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-lg border p-3 bg-muted/30 space-y-3">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-sm font-medium">{selected.user?.name || "N/A"}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{selected.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selected.description}</p>
                    {selected.reference && (
                      <p className="text-[10px] text-muted-foreground font-mono break-all italic">Ref: {selected.reference}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Transaction Amount</span>
                <div className="text-right">
                  <p className={`text-lg font-bold ${selected.type === 'credit' ? 'text-green-600' : ''}`}>
                    {selected.type === 'credit' ? '+' : '-'}${Number(selected.amount).toFixed(2)}
                  </p>
                  <Badge className="capitalize text-[10px] h-4" variant={STATUS_VARIANT[selected.type]}>
                    {selected.type}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="w-full gap-2" variant="outline" onClick={() => window.print()}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
