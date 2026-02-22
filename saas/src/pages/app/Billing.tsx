import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, CreditCard, Wallet, Bitcoin, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePaymentConfig } from "@/contexts/PaymentConfigContext";
import type { Invoice, Plan } from "@/lib/api/dashboard";

// Mock constants removed

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
};

const PAYMENT_METHODS = [
  { id: "stripe" as const, name: "Stripe", subtitle: "Credit/Debit Card", icon: CreditCard },
  { id: "paypal" as const, name: "PayPal", subtitle: "PayPal Balance", icon: Wallet },
  { id: "crypto" as const, name: "Crypto", subtitle: "BTC, ETH, USDT", icon: Bitcoin },
];

import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useStripeCheckout, useProfile, useInvoices } from "@/hooks/use-backend";

export default function Billing() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: profile } = useProfile();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const stripeCheckout = useStripeCheckout();

  const [topUpAmount, setTopUpAmount] = useState("50");
  const { gateways, autoTopUpEnabled } = usePaymentConfig();
  const [clientAutoTopUp, setClientAutoTopUp] = useState(false);
  const [minBalance, setMinBalance] = useState("5");

  const handlePay = async (method: string) => {
    if (method !== "Stripe") {
      toast({ title: "Coming Soon", description: `${method} is not yet implemented.` });
      return;
    }

    try {
      const amount = parseFloat(topUpAmount);
      if (isNaN(amount) || amount < 5) {
        toast({ title: "Invalid Amount", description: "Minimum top-up is $5.", variant: "destructive" });
        return;
      }
      await stripeCheckout.mutateAsync({ amount });
    } catch (err: any) {
      toast({ title: "Checkout Error", description: err.message, variant: "destructive" });
    }
  };

  const anyGatewayEnabled = gateways.stripe || gateways.paypal || gateways.crypto;

  return (
    <>
      <SEOHead title="Account & Billing" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Account & Billing</h1>

        {/* Add Balance / Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" /> Add Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div className="space-y-1.5">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  min="5"
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Promo Code (optional)</Label>
                <div className="flex gap-2">
                  <Input placeholder="WELCOME20" />
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast({ title: "Coupon Applied", description: "20% discount applied to your balance." })}>Apply</Button>
                </div>
              </div>
            </div>

            {!anyGatewayEnabled && (
              <p className="text-sm text-muted-foreground italic">No payment methods are currently available. Please contact support.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((pm) => {
                const enabled = gateways[pm.id];
                return (
                  <Button
                    key={pm.id}
                    variant={enabled ? "default" : "outline"}
                    className={`h-auto py-4 flex-col gap-1 ${!enabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={!enabled || stripeCheckout.isPending}
                    onClick={() => handlePay(pm.name)}
                  >
                    <pm.icon className="h-6 w-6" />
                    <span className="font-semibold">{pm.name}</span>
                    <span className="text-[11px] font-normal opacity-80">{pm.subtitle}</span>
                    {!enabled && <span className="text-[10px] font-normal">Not available</span>}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Auto Top-Up (only if admin enabled it) */}
        {autoTopUpEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCw className="h-5 w-5" /> Auto Top-Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Auto Top-Up</p>
                  <p className="text-xs text-muted-foreground">Automatically add balance when it drops below the threshold</p>
                </div>
                <Switch checked={clientAutoTopUp} onCheckedChange={setClientAutoTopUp} />
              </div>
              {clientAutoTopUp && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Min Balance Threshold ($)</Label>
                    <Input type="number" value={minBalance} onChange={(e) => setMinBalance(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Top-Up Amount ($)</Label>
                    <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Selection */}
        <div className="grid gap-4 sm:grid-cols-3">
          {productsLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
          ) : (
            (products ?? []).map((plan: any) => {
              return (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {plan.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-3xl font-bold">
                      €{Number(plan.price).toFixed(2)}
                      <span className="text-base font-normal text-muted-foreground">
                        /GB
                      </span>
                    </p>
                    <Button
                      variant="default"
                      className="w-full"
                      asChild
                    >
                      <Link to="/app/proxies">Generate Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesLoading ? (
                  <TableRow><TableCell colSpan={4}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
                ) : invoices?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No transactions found.</TableCell></TableRow>
                ) : (
                  invoices?.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Badge variant={inv.type === 'credit' ? 'default' : 'secondary'}>
                          {inv.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className={inv.type === 'credit' ? 'text-green-600 font-bold' : ''}>
                        {inv.type === 'credit' ? '+' : '-'}${Number(inv.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">{inv.description}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
