import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, AlertTriangle, ShieldAlert, DollarSign, Globe, Bell, Webhook } from "lucide-react";
import type { AlertConfig } from "@/lib/api/admin";

const MOCK_CONFIG: AlertConfig = {
  error_spike_pct: 5,
  ban_spike_pct: 8,
  spend_cap_usd: 5000,
  unusual_geo_threshold: 3,
  notify_email: true,
  notify_webhook: false,
  webhook_url: "",
};

export default function AdminAlerts() {
  const [config, setConfig] = useState(MOCK_CONFIG);
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof AlertConfig>(key: K, value: AlertConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    // Will call PATCH /admin/alerts
    alert("Alert thresholds saved");
    setDirty(false);
  };

  return (
    <>
      <SEOHead title="Admin — Alerts" noindex />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alert Configuration</h1>
            <p className="text-sm text-muted-foreground">Configure operational thresholds and notification channels.</p>
          </div>
          <Button onClick={handleSave} disabled={!dirty}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
            {dirty && <Badge variant="secondary" className="ml-2 text-xs">unsaved</Badge>}
          </Button>
        </div>

        {/* Threshold Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Error Spike Threshold
              </CardTitle>
              <CardDescription>Trigger alert when error rate exceeds this percentage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{config.error_spike_pct}%</span>
              </div>
              <Slider
                value={[config.error_spike_pct]}
                onValueChange={([v]) => update("error_spike_pct", v)}
                min={1}
                max={25}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">Current: alerts if error rate {">"} {config.error_spike_pct}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-yellow-600" />
                Ban Spike Threshold
              </CardTitle>
              <CardDescription>Trigger alert when proxy block/ban rate exceeds this percentage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{config.ban_spike_pct}%</span>
              </div>
              <Slider
                value={[config.ban_spike_pct]}
                onValueChange={([v]) => update("ban_spike_pct", v)}
                min={1}
                max={30}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">Current: alerts if ban rate {">"} {config.ban_spike_pct}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-primary" />
                Spend Cap
              </CardTitle>
              <CardDescription>Alert when total platform spend exceeds this daily threshold (EUR).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">€</span>
                <Input
                  type="number"
                  value={config.spend_cap_usd}
                  onChange={(e) => update("spend_cap_usd", Number(e.target.value))}
                  className="max-w-[150px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">Daily platform-wide spend alert in EUR.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary" />
                Unusual Geo Usage
              </CardTitle>
              <CardDescription>Alert when a single user connects from more than N countries in 1 hour.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{config.unusual_geo_threshold} countries</span>
              </div>
              <Slider
                value={[config.unusual_geo_threshold]}
                onValueChange={([v]) => update("unusual_geo_threshold", v)}
                min={2}
                max={15}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Flags potential credential sharing or abuse.</p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Send alerts to admin email addresses.</p>
                </div>
              </div>
              <Switch checked={config.notify_email} onCheckedChange={(v) => update("notify_email", v)} />
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Webhook className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Webhook</p>
                    <p className="text-xs text-muted-foreground">POST alert payloads to a custom endpoint.</p>
                  </div>
                </div>
                <Switch checked={config.notify_webhook} onCheckedChange={(v) => update("notify_webhook", v)} />
              </div>
              {config.notify_webhook && (
                <div className="space-y-1 pl-7">
                  <Label className="text-xs">Webhook URL</Label>
                  <Input
                    placeholder="https://your-service.com/webhook"
                    value={config.webhook_url}
                    onChange={(e) => update("webhook_url", e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
