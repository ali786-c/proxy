import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";

const MOCK_INVOICES = [
  { id: "INV-2026-001", user: "alex@company.com", amount: 499, status: "paid", date: "2026-02-15", plan: "Enterprise" },
  { id: "INV-2026-002", user: "sarah@agency.io", amount: 149, status: "paid", date: "2026-02-14", plan: "Pro 100GB" },
  { id: "INV-2026-003", user: "mike@startup.co", amount: 29, status: "pending", date: "2026-02-13", plan: "Starter 10GB" },
  { id: "INV-2026-004", user: "lisa@corp.com", amount: 89, status: "failed", date: "2026-02-12", plan: "Pro 50GB" },
  { id: "INV-2026-005", user: "john@dev.net", amount: 29, status: "paid", date: "2026-02-11", plan: "Starter 10GB" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = { paid: "default", pending: "secondary", failed: "destructive" };

export default function AdminInvoices() {
  return (
    <>
      <SEOHead title="All Invoices" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Invoices</h1>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INVOICES.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                    <TableCell>{inv.user}</TableCell>
                    <TableCell>{inv.plan}</TableCell>
                    <TableCell>${inv.amount}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[inv.status] ?? "secondary"}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{inv.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
