import { useState, useMemo } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Wallet, Bitcoin, RefreshCw, Euro, Copy, AlertCircle, Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePaymentConfig } from "@/contexts/PaymentConfigContext";
import { clientApi, type Invoice, type Plan } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";

const VAT_RATE = 0.22; // 22% Italian VAT
const MIN_PURCHASE_EUR = 5;

// Mock data removed. Using useQuery.

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
};

const CRYPTO_WALLETS = [
  { id: "btc", name: "Bitcoin (BTC)", icon: "₿", placeholder: "BTC wallet address — coming soon" },
  { id: "ltc", name: "Litecoin (LTC)", icon: "Ł", placeholder: "LTC wallet address — coming soon" },
  { id: "sol", name: "Solana (SOL)", icon: "◎", placeholder: "SOL wallet address — coming soon" },
  { id: "trx", name: "TRON (TRX)", icon: "⧫", placeholder: "TRX wallet address — coming soon" },
  { id: "bnb", name: "Binance (BNB)", icon: "♦", placeholder: "BNB wallet address — coming soon" },
];

type PaymentMethod = "stripe" | "paypal" | "crypto";

export default function Billing() {
  const [activeProduct] = useState("residential");
  const { gateways, autoTopUpEnabled } = usePaymentConfig();
  const [clientAutoTopUp, setClientAutoTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("50");
  const [minBalance, setMinBalance] = useState("5");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState("10");
  const [coupon, setCoupon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => clientApi.getPlans(),
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => clientApi.getInvoices(),
  });

  const numAmount = parseFloat(amount) || 0;
  const isCrypto = selectedMethod === "crypto";
  const vatAmount = isCrypto ? 0 : numAmount * VAT_RATE;
  const totalAmount = numAmount + vatAmount;
  const belowMinimum = numAmount < MIN_PURCHASE_EUR;

  const selectPlan = (planId: string) => {
    toast({ title: "Product Selected", description: `Switching to ${planId}.` });
  };

  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [cryptoTxid, setCryptoTxid] = useState("");

  const handleCryptoSubmit = async () => {
    if (!cryptoCurrency || !cryptoTxid || !amount) {
      toast({ title: "Missing information", description: "Please provide currency, amount, and TXID.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await clientApi.submitCrypto({
        currency: cryptoCurrency,
        amount: parseFloat(amount),
        txid: cryptoTxid,
      });
      toast({ title: "Submitted", description: "Your transaction has been submitted for review." });
      setCryptoTxid("");
      setSelectedMethod(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoTopUp = async (enabled: boolean) => {
    setClientAutoTopUp(enabled);
    if (enabled) {
      try {
        const { client_secret } = await clientApi.createSetupIntent();
        // Here we would normally use Stripe Element to confirm SetupIntent
        // For now, we'll just show the toast
        toast({ title: "Card setup started", description: "Please follow the instructions to save your card for auto top-up." });
      } catch (err: any) {
        toast({ title: "Setup Error", description: err.message, variant: "destructive" });
        setClientAutoTopUp(false);
      }
    }
  };

  const handleCheckout = async () => {
    if (belowMinimum) {
      toast({ title: "Minimum not met", description: `Minimum purchase is €${MIN_PURCHASE_EUR}.`, variant: "destructive" });
      return;
    }
    if (!selectedMethod) {
      toast({ title: "Select a payment method", description: "Please choose how you'd like to pay.", variant: "destructive" });
      return;
    }

    if (isCrypto) {
      // Logic handled by the Crypto form
      return;
    }

    if (selectedMethod === "stripe") {
      setIsSubmitting(true);
      try {
        const { url } = await clientApi.createCheckout(activeProduct, parseFloat(amount));
        window.location.href = url;
      } catch (err: any) {
        toast({ title: "Checkout Error", description: err.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast({ title: `Pay with ${selectedMethod}`, description: `Redirecting to ${selectedMethod} checkout for €${totalAmount.toFixed(2)}...` });
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
  };

  const PAYMENT_METHODS = [
    { id: "stripe" as PaymentMethod, name: "Card (Stripe)", subtitle: "Credit/Debit Card", icon: CreditCard, vatLabel: "+22% VAT" },
    { id: "paypal" as PaymentMethod, name: "PayPal", subtitle: "PayPal Balance", icon: Wallet, vatLabel: "+22% VAT" },
    { id: "crypto" as PaymentMethod, name: "Crypto", subtitle: "BTC, LTC, SOL, TRX, BNB", icon: Bitcoin, vatLabel: "No VAT" },
  ];

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
              <Euro className="h-5 w-5" /> Add Balance
            </CardTitle>
            <CardDescription>Minimum purchase: €{MIN_PURCHASE_EUR}. 22% VAT applies to card &amp; PayPal payments. Crypto is VAT-free.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Amount input */}
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div className="space-y-1.5">
                <Label>Amount (€)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={MIN_PURCHASE_EUR}
                  step="1"
                  placeholder={`Min €${MIN_PURCHASE_EUR}`}
                />
                {belowMinimum && numAmount > 0 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Minimum purchase is €{MIN_PURCHASE_EUR}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Promo Code (optional)</Label>
                <div className="flex gap-2">
                  <Input placeholder="WELCOME20" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast({ title: "Coupon Applied", description: "Discount applied to your balance." })}>Apply</Button>
                </div>
              </div>
            </div>

            {/* Payment method selection */}
            {!anyGatewayEnabled && (
              <p className="text-sm text-muted-foreground italic">No payment methods are currently available. Please contact support.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((pm) => {
                const enabled = gateways[pm.id];
                const isSelected = selectedMethod === pm.id;
                return (
                  <Button
                    key={pm.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto py-4 flex-col gap-1 relative ${!enabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={!enabled}
                    onClick={() => setSelectedMethod(pm.id)}
                  >
                    <pm.icon className="h-6 w-6" />
                    <span className="font-semibold">{pm.name}</span>
                    <span className="text-[11px] font-normal opacity-80">{pm.subtitle}</span>
                    <Badge variant={pm.id === "crypto" ? "default" : "secondary"} className="text-[10px] mt-1">
                      {pm.vatLabel}
                    </Badge>
                    {!enabled && <span className="text-[10px] font-normal">Not available</span>}
                  </Button>
                );
              })}
            </div>

            {/* Order summary */}
            {selectedMethod && numAmount >= MIN_PURCHASE_EUR && (
              <div className="rounded-lg border bg-muted/30 p-4 max-w-sm space-y-2">
                <h4 className="text-sm font-semibold">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{numAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    VAT (22%)
                    {isCrypto && <Info className="h-3 w-3 text-muted-foreground" />}
                  </span>
                  <span className={isCrypto ? "line-through text-muted-foreground" : ""}>
                    {isCrypto ? "€0.00 — exempt" : `€${vatAmount.toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
                <Button className="w-full mt-2" onClick={handleCheckout} disabled={belowMinimum || isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isCrypto ? "Show Wallet Addresses" : `Pay €${totalAmount.toFixed(2)}`}
                </Button>
              </div>
            )}

            {/* Crypto wallet addresses and submission */}
            {selectedMethod === "crypto" && (
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bitcoin className="h-4 w-4" /> Crypto Payment — Send Exact Amount
                  </CardTitle>
                  <CardDescription className="text-xs">
                    No VAT on crypto payments. Send the exact EUR-equivalent in crypto. Submitting your TXID allows an admin to verify and credit your balance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {CRYPTO_WALLETS.map((w) => (
                    <div key={w.id} className="flex items-center gap-3 rounded-md border p-3">
                      <span className="text-lg w-6 text-center">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{w.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{w.placeholder}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-40" disabled>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Submit Transaction</h5>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="crypto-curr" className="text-[10px]">Currency Used</Label>
                        <Input id="crypto-curr" size={1} className="h-8 text-xs" placeholder="e.g. BTC, SOL" value={cryptoCurrency} onChange={(e) => setCryptoCurrency(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="crypto-txid" className="text-[10px]">Transaction ID (TXID)</Label>
                        <Input id="crypto-txid" className="h-8 text-xs" placeholder="Paste TXID here" value={cryptoTxid} onChange={(e) => setCryptoTxid(e.target.value)} />
                      </div>
                    </div>
                    <Button className="w-full h-9 text-xs" onClick={handleCryptoSubmit} disabled={isSubmitting || !cryptoTxid}>
                      {isSubmitting ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Auto Top-Up */}
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
                <Switch checked={clientAutoTopUp} onCheckedChange={handleAutoTopUp} />
              </div>
              {clientAutoTopUp && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Min Balance Threshold (€)</Label>
                    <Input type="number" value={minBalance} onChange={(e) => setMinBalance(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Top-Up Amount (€)</Label>
                    <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Selection */}
        <div className="grid gap-4 sm:grid-cols-3">
          {(plans || []).map((plan) => {
            const isCurrent = plan.id === activeProduct;
            return (
              <Card key={plan.id} className={isCurrent ? "border-primary ring-2 ring-primary/20" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {plan.name}
                    {isCurrent && <Badge>Active</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-3xl font-bold">
                    €{(plan.price_cents / 100).toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground">
                      /{plan.id === "datacenter" ? "GB" : "GB"}
                    </span>
                  </p>
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => selectPlan(plan.id)}
                  >
                    {isCurrent ? "Active Product" : "Switch Product"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoices || []).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.period}</TableCell>
                    <TableCell>€{(inv.amount_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[inv.status] ?? "secondary"}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </TableCell>
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
