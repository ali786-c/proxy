import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { usePaymentConfig } from "@/contexts/PaymentConfigContext";
import { CreditCard, Wallet, Bitcoin, Eye, EyeOff, Save } from "lucide-react";

interface GatewayConfig {
  id: "stripe" | "paypal" | "crypto";
  name: string;
  icon: typeof CreditCard;
  connected: boolean;
  fields: { key: string; label: string; placeholder: string; value: string }[];
}

const INITIAL_GATEWAYS: GatewayConfig[] = [
  {
    id: "stripe",
    name: "Stripe",
    icon: CreditCard,
    connected: false,
    fields: [
      { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_...", value: "" },
      { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", value: "" },
      { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", value: "" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: Wallet,
    connected: false,
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "AV...", value: "" },
      { key: "client_secret", label: "Client Secret", placeholder: "EL...", value: "" },
      { key: "mode", label: "Mode (sandbox/live)", placeholder: "sandbox", value: "" },
    ],
  },
  {
    id: "crypto",
    name: "Crypto (USDT/BTC/ETH)",
    icon: Bitcoin,
    connected: false,
    fields: [
      { key: "wallet_address", label: "Wallet Address", placeholder: "0x...", value: "" },
      { key: "provider", label: "Provider (e.g. NOWPayments)", placeholder: "nowpayments", value: "" },
      { key: "api_key", label: "API Key", placeholder: "Your API key", value: "" },
    ],
  },
];

export default function PaymentGateways() {
  const { gateways: enabledGateways, toggleGateway } = usePaymentConfig();
  const [localGateways, setLocalGateways] = useState<GatewayConfig[]>(INITIAL_GATEWAYS);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const updateField = (gatewayId: string, fieldKey: string, value: string) => {
    setLocalGateways((prev) =>
      prev.map((g) =>
        g.id === gatewayId
          ? { ...g, fields: g.fields.map((f) => (f.key === fieldKey ? { ...f, value } : f)) }
          : g
      )
    );
  };

  const saveGateway = (id: "stripe" | "paypal" | "crypto") => {
    const gw = localGateways.find((g) => g.id === id);
    if (!gw) return;
    const emptyFields = gw.fields.filter((f) => !f.value.trim());
    if (emptyFields.length > 0) {
      toast({ title: "Missing fields", description: `Please fill in: ${emptyFields.map((f) => f.label).join(", ")}`, variant: "destructive" });
      return;
    }
    setLocalGateways((prev) => prev.map((g) => (g.id === id ? { ...g, connected: true } : g)));
    toast({ title: "Gateway Saved", description: `${gw.name} configuration saved.` });
  };

  return (
    <>
      <SEOHead title="Payment Gateways" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Gateways</h1>
          <p className="text-sm text-muted-foreground">Configure and enable payment methods for clients. Only enabled gateways appear in the client billing page.</p>
        </div>

        <div className="grid gap-6">
          {localGateways.map((gw) => {
            const isEnabled = enabledGateways[gw.id];
            return (
              <Card key={gw.id} className={isEnabled ? "border-primary/30 ring-1 ring-primary/10" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className={`rounded-lg p-2 ${isEnabled ? "bg-primary/10" : "bg-muted"}`}>
                        <gw.icon className={`h-5 w-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      {gw.name}
                      {gw.connected && <Badge variant="default" className="bg-success text-success-foreground">Connected</Badge>}
                      {!gw.connected && isEnabled && <Badge variant="secondary">Not configured</Badge>}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${gw.id}`} className="text-sm text-muted-foreground">
                        {isEnabled ? "Enabled for clients" : "Disabled"}
                      </Label>
                      <Switch
                        id={`toggle-${gw.id}`}
                        checked={isEnabled}
                        onCheckedChange={() => toggleGateway(gw.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                {isEnabled && (
                  <CardContent className="space-y-4">
                    {gw.fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-sm">{field.label}</Label>
                        <div className="relative">
                          <Input
                            type={showSecrets[`${gw.id}-${field.key}`] ? "text" : "password"}
                            placeholder={field.placeholder}
                            value={field.value}
                            onChange={(e) => updateField(gw.id, field.key, e.target.value)}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowSecrets((s) => ({ ...s, [`${gw.id}-${field.key}`]: !s[`${gw.id}-${field.key}`] }))}
                          >
                            {showSecrets[`${gw.id}-${field.key}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => saveGateway(gw.id)} className="gap-2">
                      <Save className="h-4 w-4" /> Save Configuration
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">⚠️ Security Notice</p>
            <p>API keys are stored locally for UI preview. Enable Lovable Cloud for encrypted secret storage in production.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
