import { useState, useEffect } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { usePaymentConfig } from "@/contexts/PaymentConfigContext";
import { CreditCard, Wallet, Bitcoin, Eye, EyeOff, Save, Loader2, RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MessageSchema } from "@/lib/api/client";
import { z } from "zod";
import { useAdminPaymentGateways } from "@/hooks/use-backend";

interface GatewayConfig {
  id: "stripe" | "paypal" | "crypto";
  name: string;
  icon: typeof CreditCard;
  fields: { key: string; label: string; placeholder: string; value: string; secret?: boolean }[];
}

const GATEWAY_TEMPLATES: GatewayConfig[] = [
  {
    id: "stripe",
    name: "Stripe",
    icon: CreditCard,
    fields: [
      { key: "stripe_publishable_key", label: "Publishable Key", placeholder: "pk_live_...", value: "", secret: false },
      { key: "stripe_secret_key", label: "Secret Key", placeholder: "sk_live_...", value: "", secret: true },
      { key: "stripe_webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", value: "", secret: true },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: Wallet,
    fields: [
      { key: "paypal_client_id", label: "Client ID", placeholder: "AV...", value: "" },
      { key: "paypal_client_secret", label: "Client Secret", placeholder: "EL...", value: "" },
      { key: "paypal_mode", label: "Mode (sandbox/live)", placeholder: "sandbox", value: "" },
    ],
  },
  {
    id: "crypto",
    name: "Crypto (USDT/BTC/ETH)",
    icon: Bitcoin,
    fields: [
      { key: "crypto_wallet_address", label: "Wallet Address", placeholder: "0x...", value: "" },
      { key: "crypto_provider", label: "Provider (e.g. NOWPayments)", placeholder: "nowpayments", value: "" },
      { key: "crypto_api_key", label: "API Key", placeholder: "Your API key", value: "" },
    ],
  },
];

export default function PaymentGateways() {
  const queryClient = useQueryClient();
  const { gateways: enabledGateways, toggleGateway } = usePaymentConfig();
  const [localGateways, setLocalGateways] = useState<GatewayConfig[]>(GATEWAY_TEMPLATES);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => api.get("/admin/settings", z.record(z.string())),
  });

  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useAdminPaymentGateways();

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.post("/admin/settings", MessageSchema, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      refetchStatus();
      toast({ title: "Configuration Saved", description: "Gateway settings have been updated and verified." });
    },
    onError: () => toast({ title: "Save Failed", description: "Could not save settings to backend.", variant: "destructive" }),
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only sync once when settings are initially loaded and not already initialized
    if (Object.keys(settings).length > 0 && !isInitialized) {
      setLocalGateways(prev => prev.map(gw => ({
        ...gw,
        fields: gw.fields.map(f => ({ ...f, value: settings[f.key] || "" }))
      })));
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const updateField = (gatewayId: string, fieldKey: string, value: string) => {
    setLocalGateways((prev) =>
      prev.map((g) =>
        g.id === gatewayId
          ? { ...g, fields: g.fields.map((f) => (f.key === fieldKey ? { ...f, value } : f)) }
          : g
      )
    );
  };

  const saveGateway = (id: string) => {
    const gw = localGateways.find((g) => g.id === id);
    if (!gw) return;

    const payload: Record<string, string> = {};
    gw.fields.forEach(f => {
      payload[f.key] = f.value;
    });

    saveMutation.mutate(payload);
  };

  const getStatusBadge = (gwId: string) => {
    const info = statusData?.gateways?.find((g: any) => g.id === gwId);
    if (!info) return null;

    if (info.status === 'connected') return <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90 gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>;
    if (info.status === 'error') return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Config Error</Badge>;
    return <Badge variant="secondary">Not Configured</Badge>;
  };

  if (settingsLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <>
      <SEOHead title="Payment Gateways" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Gateways</h1>
            <p className="text-sm text-muted-foreground">Configure and enable payment methods for clients.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchStatus()} disabled={statusLoading} className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} /> Verify Status
          </Button>
        </div>

        <div className="grid gap-6">
          {localGateways.map((gw) => {
            const isEnabled = enabledGateways[gw.id];
            return (
              <Card key={gw.id} className={isEnabled ? "border-primary/30 ring-1 ring-primary/10 shadow-sm" : "opacity-70"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className={`rounded-lg p-2 ${isEnabled ? "bg-primary/10" : "bg-muted"}`}>
                        <gw.icon className={`h-5 w-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2">
                          {gw.name}
                          {getStatusBadge(gw.id)}
                        </span>
                        {isEnabled && statusData?.gateways?.find((g: any) => g.id === gw.id)?.webhook_health === 'missing' && (
                          <span className="text-[10px] text-destructive flex items-center gap-1 font-normal mt-1">
                            <AlertCircle className="h-2.5 w-2.5" /> Webhook secret missing - payments won't auto-credit
                          </span>
                        )}
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-3 bg-muted/50 py-1 px-3 rounded-full">
                      <Label htmlFor={`toggle-${gw.id}`} className="text-xs font-medium cursor-pointer">
                        {isEnabled ? "Live for Clients" : "Disabled"}
                      </Label>
                      <Switch
                        id={`toggle-${gw.id}`}
                        checked={isEnabled}
                        onCheckedChange={() => {
                          toggleGateway(gw.id);
                          saveMutation.mutate({ [`gateway_${gw.id}_enabled`]: isEnabled ? "0" : "1" });
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {gw.fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{field.label}</Label>
                        <div className="relative">
                          <Input
                            id={`${gw.id}-${field.key}`}
                            name={`${gw.id}-${field.key}`}
                            type={field.secret ? (showSecrets[`${gw.id}-${field.key}`] ? "text" : "password") : "text"}
                            placeholder={field.placeholder}
                            value={field.value}
                            onChange={(e) => updateField(gw.id, field.key, e.target.value)}
                            className="bg-muted/30 focus-visible:ring-primary/20"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                          />
                          {field.secret && (
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowSecrets((s) => ({ ...s, [`${gw.id}-${field.key}`]: !s[`${gw.id}-${field.key}`] }))}
                            >
                              {showSecrets[`${gw.id}-${field.key}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-muted">
                    <p className="text-[10px] text-muted-foreground">Changes take effect immediately across the platform.</p>
                    <Button
                      onClick={() => saveGateway(gw.id)}
                      className="gap-2"
                      size="sm"
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save {gw.name} Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed bg-muted/20">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" /> Security Implementation
            </p>
            <p className="max-w-md mx-auto">These keys are stored in the system database. Ensure your backend environment is secured and database is properly firewalled.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
