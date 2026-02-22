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
import { Plus, Trash2, Key, Shield, Copy, User as UserIcon, Lock } from "lucide-react";
import type { AllowlistEntry, ApiKey } from "@/lib/api/dashboard";
import { useProfileInfo, useUpdateProfile, useApiKeys, useAllowlist } from "@/hooks/use-backend";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const INITIAL_IPS: AllowlistEntry[] = [
  { id: "1", ip: "203.0.113.42", label: "Production server", created_at: "2026-02-10T10:00:00Z" },
  { id: "2", ip: "198.51.100.7", label: "Staging", created_at: "2026-02-15T14:00:00Z" },
];

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "1", name: "Production", key_prefix: "upx_prod_****", allowed_countries: ["US", "UK"],
    daily_gb_cap: 50, daily_request_cap: 100000, allowed_scopes: ["proxy:generate", "usage:read"],
    created_at: "2026-01-20T10:00:00Z", last_used_at: "2026-02-20T08:30:00Z",
  },
  {
    id: "2", name: "Testing", key_prefix: "upx_test_****", allowed_countries: [],
    daily_gb_cap: 5, daily_request_cap: 10000, allowed_scopes: ["proxy:generate"],
    created_at: "2026-02-01T12:00:00Z", last_used_at: null,
  },
];

export default function AppSettings() {
  return (
    <>
      <SEOHead title="Settings" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Tabs defaultValue="allowlist">
          <TabsList>
            <TabsTrigger value="profile">
              <UserIcon className="mr-1 h-3.5 w-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="allowlist">
              <Shield className="mr-1 h-3.5 w-3.5" /> IP Allowlist
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="mr-1 h-3.5 w-3.5" /> API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <ProfilePanel />
          </TabsContent>

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
  const { data: entries, isLoading, addEntry, removeEntry } = useAllowlist();
  const [newIp, setNewIp] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    const trimmed = newIp.trim();
    if (!trimmed) { setError("IP address is required."); return; }

    if (!/^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(trimmed)) {
      setError("Enter a valid IPv4 address or CIDR range.");
      return;
    }

    try {
      await addEntry.mutateAsync({ ip: trimmed, label: newLabel.trim() || undefined });
      setNewIp("");
      setNewLabel("");
      toast({ title: "IP Added", description: `${trimmed} added to allowlist.` });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add IP.");
    }
  };

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /></div>;

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
          <Button onClick={handleAdd} disabled={addEntry.isPending}>
            {addEntry.isPending ? "Adding..." : <><Plus className="mr-1 h-4 w-4" /> Add</>}
          </Button>
        </div>

        {!entries || entries.length === 0 ? (
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
              {entries.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-sm">{e.ip}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.label ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry.mutate(e.id)}
                      disabled={removeEntry.isPending}
                      aria-label="Remove"
                    >
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
  const { data: keys, isLoading, createKey, revokeKey } = useApiKeys();
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Create key form state
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const res = await createKey.mutateAsync(name.trim());
      setNewKeyResult(res.api_key);
      setName("");
      setIsDialogOpen(false);
      toast({ title: "API Key Created", description: "Copy it now — it won't be shown again." });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to create API key.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Show new key once */}
      {newKeyResult && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">Your new API key (copy it now!):</p>
              <div className="mt-2 flex gap-2">
                <code className="flex-1 block text-xs font-mono text-primary break-all bg-background border border-primary/20 p-2 rounded">{newKeyResult}</code>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(newKeyResult || "");
                    toast({ title: "Copied to clipboard" });
                  }}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setNewKeyResult(null)}>Close</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">API Keys</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <p className="text-xs text-muted-foreground">
                  API keys allow you to generate proxies and check usage via our REST API.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!name.trim() || createKey.isPending}>
                  {createKey.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {!keys || keys.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Key} title="No API keys" description="Create a key to access the UpgradedProxy API programmatically." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k: any) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium text-sm">{k.key_name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {k.api_key.substring(0, 12)}****
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(k.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeKey.mutate(k.id)}
                        disabled={revokeKey.isPending}
                        aria-label="Revoke"
                      >
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
// ── Profile Panel ───────────────────────────────────

function ProfilePanel() {
  const { data: profile, isLoading } = useProfileInfo();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initialize name when data arrives
  useState(() => {
    if (profile?.name) setName(profile.name);
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        name: name || undefined,
        password: password || undefined,
        password_confirmation: confirmPassword || undefined,
      });
      toast({ title: "Success", description: "Profile updated successfully." });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={profile?.email} disabled className="bg-muted" />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed manually. Contact support for assistance.</p>
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={name || profile?.name || ""} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
            </div>

            <hr className="my-6 border-border" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label>Change Password</Label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground text-center">Minimum 8 characters</p>
                </div>
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
