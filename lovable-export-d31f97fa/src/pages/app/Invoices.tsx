import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Receipt, Calendar, CreditCard, Info } from "lucide-react";
import { useInvoices } from "@/hooks/use-backend";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SV: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  completed: "default",
  pending: "secondary",
  failed: "destructive"
};

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      <SEOHead title="Invoices" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export</Button>
        </div>
        {!invoices?.length ? (
          <EmptyState icon={Receipt} title="No invoices yet" description="Your invoices will appear here after making a purchase." />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Amount</TableHead><TableHead>Gateway</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                      <TableCell>${Number(inv.amount).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{inv.gateway ?? "—"}</TableCell>
                      <TableCell><Badge variant={SV[inv.status] ?? "secondary"}>{inv.status}</Badge></TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Invoice Details
            </DialogTitle>
            <DialogDescription>
              Detailed information for transaction {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Amount</p>
                  <p className="text-lg font-bold">${Number(selectedInvoice.amount).toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                  <Badge variant={SV[selectedInvoice.status] ?? "secondary"}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Gateway</p>
                  <div className="flex items-center gap-1.5 capitalize text-sm">
                    <CreditCard className="h-3.5 w-3.5" />
                    {selectedInvoice.gateway}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Date</p>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedInvoice.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Description</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-md italic">
                    {selectedInvoice.description || "No description provided."}
                  </p>
                </div>
                {selectedInvoice.period && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Billing Period</p>
                    <p className="text-sm">{selectedInvoice.period}</p>
                  </div>
                )}
              </div>

              {selectedInvoice.pdf_url && (
                <Button className="w-full gap-2" asChild>
                  <a href={selectedInvoice.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" /> Download PDF Receipt
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
