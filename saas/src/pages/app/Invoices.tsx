import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useInvoices } from "@/hooks/use-backend";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Receipt } from "lucide-react";

const SV: Record<string, "default" | "secondary" | "destructive"> = { completed: "default", pending: "secondary", failed: "destructive" };

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();

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
                    <TableRow key={inv.id}>
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
    </>
  );
}
