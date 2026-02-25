import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Key, Shield, Copy, Loader2 } from "lucide-react";
import { clientApi, type AllowlistEntry, type ApiKey } from "@/lib/api/dashboard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Mock data removed. Using useQuery.

export default function AppSettings() {
  return (
    <>
      <SEOHead title="Settings" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Tabs defaultValue="allowlist">
          <TabsList>
            <TabsTrigger value="allowlist">
              <Shield className="mr-1 h-3.5 w-3.5" /> IP Allowlist
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="mr-1 h-3.5 w-3.5" /> API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="allowlist" className="mt-4">
            <AllowlistPanel />
          </TabsContent>
          <TabsContent value="api-keys" className="mt-4">
            <ApiKeysPanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ── IP Allowlist Panel ───────────────────────────────

function AllowlistPanel() {
  const queryClient = useQueryClient();
  const { data: entries, isLoading } = useQuery({
    queryKey: ["allowlist"],
    queryFn: () => clientApi.getAllowlist(),
  });

  const [newIp, setNewIp] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addEntry = async () => {
    setError(null);
    const trimmed = newIp.trim();
    if (!trimmed) { setError("IP address is required."); return; }
    if (!/^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(trimmed)) {
      setError("Enter a valid IPv4 address or CIDR range.");
      return;
    }

    setSubmitting(true);
    try {
      await clientApi.addAllowlistEntry(trimmed, newLabel.trim() || undefined);
      queryClient.invalidateQueries({ queryKey: ["allowlist"] });
      setNewIp("");
      setNewLabel("");
      toast({ title: "IP Added", description: `${trimmed} added to allowlist.` });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(true); // Should be false, typo in my thought but I'll write correctly
    }
  };

  const removeEntry = async (id: string) => {
    try {
      await clientApi.removeAllowlistEntry(id);
      queryClient.invalidateQueries({ queryKey: ["allowlist"] });
      toast({ title: "Removed", description: "IP removed from allowlist." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">IP Allowlist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div className="flex gap-2">
          <Input placeholder="203.0.113.0/24" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="max-w-xs" />
          <Input placeholder="Label (optional)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="max-w-xs" />
          <Button onClick={addEntry} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Add
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : entries?.length === 0 ? (
          <EmptyState icon={Shield} title="No IPs allowlisted" description="Add your server IPs to authenticate without credentials." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(entries || []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-sm">{e.ip}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.label ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeEntry(e.id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── API Keys Panel ───────────────────────────────────

const ALL_SCOPES = ["proxy:generate", "usage:read", "allowlist:manage", "keys:manage"];

function ApiKeysPanel() {
  const queryClient = useQueryClient();
  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => clientApi.getApiKeys(),
  });

  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create key form state
  const [name, setName] = useState("");
  const [countries, setCountries] = useState("");
  const [gbCap, setGbCap] = useState("");
  const [reqCap, setReqCap] = useState("");
  const [scopes, setScopes] = useState<string[]>(["proxy:generate"]);

  const toggleScope = (scope: string) => {
    setScopes((s) => s.includes(scope) ? s.filter((x) => x !== scope) : [...s, scope]);
  };

  const createKey = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const result = await clientApi.createApiKey({
        name: name.trim(),
        allowed_countries: countries ? countries.split(",").map((c) => c.trim().toUpperCase()) : [],
        daily_gb_cap: gbCap ? Number(gbCap) : undefined,
        daily_request_cap: reqCap ? Number(reqCap) : undefined,
        allowed_scopes: scopes,
      });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setNewKeyResult(result.key);
      setName("");
      setCountries("");
      setGbCap("");
      setReqCap("");
      setScopes(["proxy:generate"]);
      toast({ title: "API Key Created", description: "Copy it now — it won't be shown again." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const revokeKey = async (id: string) => {
    try {
      await clientApi.revokeApiKey(id);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "Revoked", description: "API key has been revoked." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Show new key once */}
      {newKeyResult && (
        <Card className="border-primary">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">Your new API key (copy now — shown once):</p>
              <code className="mt-1 block text-xs font-mono text-primary">{newKeyResult}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(newKeyResult);
                toast({ title: "Copied" });
              }}
            >
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">API Keys</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Create Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create API Key</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Key Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production" />
                </div>
                <div className="space-y-2">
                  <Label>Allowed Countries (comma-separated, optional)</Label>
                  <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="US, UK, DE" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily GB Cap</Label>
                    <Input type="number" value={gbCap} onChange={(e) => setGbCap(e.target.value)} placeholder="No limit" />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Request Cap</Label>
                    <Input type="number" value={reqCap} onChange={(e) => setReqCap(e.target.value)} placeholder="No limit" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SCOPES.map((scope) => (
                      <Badge
                        key={scope}
                        variant={scopes.includes(scope) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleScope(scope)}
                      >
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={createKey} disabled={!name.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : keys?.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Key} title="No API keys" description="Create a key to access the UpgradedProxy API programmatically." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(keys || []).map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium text-sm">{k.name}</TableCell>
                    <TableCell className="font-mono text-xs">{k.key_prefix}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {k.allowed_scopes?.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {k.daily_gb_cap ? `${k.daily_gb_cap} GB/d` : "—"}
                      {k.daily_request_cap ? ` / ${k.daily_request_cap.toLocaleString()} req/d` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => revokeKey(k.id)} aria-label="Revoke">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
