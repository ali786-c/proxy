import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Removed supabase import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Palette, Globe, Percent, Users } from "lucide-react";

import api from "@/lib/api";

export default function AdminResellers() {
  const resellers: any[] = [];
  const isLoading = false;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  // ... rest logic neutralized
  const [form, setForm] = useState({
    user_id: "",
    company_name: "",
    commission_rate: "10",
    brand_primary_color: "#3B82F6",
    brand_secondary_color: "#1E40AF",
    custom_domain: "",
  });

  const createReseller = useMutation({
    mutationFn: async (reseller: any) => {
      // Neutralized
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      toast({ title: "Reseller created (Mock)" });
      setDialogOpen(false); // Keep this to close dialog
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleReseller = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // Neutralized
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resellers"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">White-Label Reseller Portal</h1>
          <p className="text-muted-foreground">Manage reseller partners and their branding</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Reseller</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Reseller Profile</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User ID</Label>
                <Input placeholder="UUID of existing user" value={form.user_id} onChange={(e) => setForm(f => ({ ...f, user_id: e.target.value }))} />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input type="number" value={form.commission_rate} onChange={(e) => setForm(f => ({ ...f, commission_rate: e.target.value }))} />
                </div>
                <div>
                  <Label>Custom Domain</Label>
                  <Input placeholder="reseller.example.com" value={form.custom_domain} onChange={(e) => setForm(f => ({ ...f, custom_domain: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.brand_primary_color} onChange={(e) => setForm(f => ({ ...f, brand_primary_color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" />
                    <Input value={form.brand_primary_color} onChange={(e) => setForm(f => ({ ...f, brand_primary_color: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.brand_secondary_color} onChange={(e) => setForm(f => ({ ...f, brand_secondary_color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" />
                    <Input value={form.brand_secondary_color} onChange={(e) => setForm(f => ({ ...f, brand_secondary_color: e.target.value }))} />
                  </div>
                </div>
              </div>
              <Button onClick={() => createReseller.mutate()} disabled={createReseller.isPending} className="w-full">
                {createReseller.isPending ? "Creating…" : "Create Reseller"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Resellers</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{resellers?.length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{resellers?.filter(r => r.is_active).length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">With Custom Domain</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{resellers?.filter(r => r.custom_domain).length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Commission</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{resellers?.length ? (resellers.reduce((a, r) => a + Number(r.commission_rate), 0) / resellers.length).toFixed(1) : 0}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Reseller Partners</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Branding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resellers?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.company_name}</TableCell>
                    <TableCell>{r.custom_domain || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{Number(r.commission_rate)}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <div className="h-5 w-5 rounded" style={{ backgroundColor: r.brand_primary_color ?? "#3B82F6" }} />
                        <div className="h-5 w-5 rounded" style={{ backgroundColor: r.brand_secondary_color ?? "#1E40AF" }} />
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <Switch checked={r.is_active ?? false} onCheckedChange={(v) => toggleReseller.mutate({ id: r.id, is_active: v })} />
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
