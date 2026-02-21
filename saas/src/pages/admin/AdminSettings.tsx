import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Settings, Globe, Mail, Shield } from "lucide-react";

export default function AdminSettings() {
  return (
    <>
      <SEOHead title="Admin Settings" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">System Settings</h1>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5" /> General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Site Name</Label><Input defaultValue="UpgradedProxy" /></div>
            <div className="space-y-1.5"><Label>Support Email</Label><Input defaultValue="support@upgradedproxy.com" /></div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Maintenance Mode</p><p className="text-xs text-muted-foreground">Disable public access temporarily</p></div>
              <Switch />
            </div>
            <Button onClick={() => toast({ title: "Saved" })}>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Mail className="h-5 w-5" /> Email / SMTP</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>SMTP Host</Label><Input placeholder="smtp.example.com" /></div>
              <div className="space-y-1.5"><Label>SMTP Port</Label><Input placeholder="587" /></div>
              <div className="space-y-1.5"><Label>Username</Label><Input placeholder="user@example.com" /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
            </div>
            <Button onClick={() => toast({ title: "Saved" })}>Save SMTP</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">2FA Required for Admin</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Rate Limiting</p><p className="text-xs text-muted-foreground">Limit API requests per minute</p></div>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => toast({ title: "Saved" })}>Save Security</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
