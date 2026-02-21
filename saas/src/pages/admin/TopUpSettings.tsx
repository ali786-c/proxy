import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { usePaymentConfig } from "@/contexts/PaymentConfigContext";
import { RefreshCw, DollarSign, CreditCard, Wallet, Bitcoin, Check } from "lucide-react";

const SOURCE_PROVIDERS = [
  { id: "stripe", name: "Stripe", icon: CreditCard, desc: "Charge client's saved card via Stripe" },
  { id: "paypal", name: "PayPal", icon: Wallet, desc: "Charge client's PayPal agreement" },
  { id: "crypto", name: "Crypto Wallet", icon: Bitcoin, desc: "Deduct from client's crypto deposit" },
] as const;

export default function TopUpSettings() {
  const { autoTopUpEnabled, setAutoTopUpEnabled, gateways } = usePaymentConfig();
  const [autoTopUp, setAutoTopUp] = useState(autoTopUpEnabled);
  const [minBalance, setMinBalance] = useState("5");
  const [topUpAmount, setTopUpAmount] = useState("50");
  const [maxMonthly, setMaxMonthly] = useState("500");
  const [selectedSource, setSelectedSource] = useState<string>("stripe");
  const [fallbackSource, setFallbackSource] = useState<string>("paypal");
  const [retryAttempts, setRetryAttempts] = useState("3");
  const [retryInterval, setRetryInterval] = useState("60");
  const [notifyOnCharge, setNotifyOnCharge] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);

  const save = () => {
    setAutoTopUpEnabled(autoTopUp);
    toast({ title: "Settings Saved", description: "Auto top-up configuration updated." });
  };

  return (
    <>
      <SEOHead title="Top-Up Settings" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Top-Up & Balance Settings</h1>
          <p className="text-sm text-muted-foreground">Configure automatic balance top-up for client accounts and control which payment source to charge.</p>
        </div>

        {/* Master Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5" /> Client Auto Top-Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable Auto Top-Up for Clients</p>
                <p className="text-xs text-muted-foreground">Allow clients to opt-in to automatic balance replenishment</p>
              </div>
              <Switch checked={autoTopUp} onCheckedChange={(v) => setAutoTopUp(v)} />
            </div>
            {autoTopUp && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Min Balance Threshold ($)</Label>
                  <Input type="number" value={minBalance} onChange={(e) => setMinBalance(e.target.value)} />
                  <p className="text-[11px] text-muted-foreground">Top-up triggers when balance falls below this</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Default Top-Up Amount ($)</Label>
                  <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Monthly Top-Up ($)</Label>
                  <Input type="number" value={maxMonthly} onChange={(e) => setMaxMonthly(e.target.value)} />
                  <p className="text-[11px] text-muted-foreground">Safety cap per client per month</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" /> Auto Top-Up Source Provider
            </CardTitle>
            <CardDescription>Choose which payment method to charge clients from when auto top-up triggers. Only enabled gateways can be selected.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {SOURCE_PROVIDERS.map((sp) => {
                const isEnabled = gateways[sp.id as keyof typeof gateways];
                const isSelected = selectedSource === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => isEnabled && setSelectedSource(sp.id)}
                    disabled={!isEnabled}
                    className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all text-center ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isEnabled
                          ? "border-border hover:border-primary/50 cursor-pointer"
                          : "border-border opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <sp.icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold text-sm">{sp.name}</span>
                    <span className="text-[11px] text-muted-foreground">{sp.desc}</span>
                    {!isEnabled && <Badge variant="secondary" className="text-[10px]">Gateway disabled</Badge>}
                    {isSelected && <Badge className="text-[10px]">Primary</Badge>}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Fallback Source</Label>
                <Select value={fallbackSource} onValueChange={setFallbackSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No fallback</SelectItem>
                    {SOURCE_PROVIDERS.filter((sp) => sp.id !== selectedSource && gateways[sp.id as keyof typeof gateways]).map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">Used if primary source fails</p>
              </div>
              <div className="space-y-1.5">
                <Label>Retry Attempts</Label>
                <div className="flex gap-2">
                  <Input type="number" value={retryAttempts} onChange={(e) => setRetryAttempts(e.target.value)} className="w-20" />
                  <span className="text-sm text-muted-foreground self-center">attempts, every</span>
                  <Input type="number" value={retryInterval} onChange={(e) => setRetryInterval(e.target.value)} className="w-20" />
                  <span className="text-sm text-muted-foreground self-center">min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top-Up Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Notify client on successful charge</p>
                <p className="text-xs text-muted-foreground">Send email when auto top-up completes</p>
              </div>
              <Switch checked={notifyOnCharge} onCheckedChange={setNotifyOnCharge} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Notify admin on charge failure</p>
                <p className="text-xs text-muted-foreground">Alert when auto top-up fails after all retries</p>
              </div>
              <Switch checked={notifyOnFailure} onCheckedChange={setNotifyOnFailure} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} size="lg" className="gap-2">Save All Settings</Button>
      </div>
    </>
  );
}
