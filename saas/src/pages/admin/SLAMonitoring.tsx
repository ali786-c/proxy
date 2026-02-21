import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Activity, Shield, CreditCard, Plus, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  up: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-destructive",
};

function useSLAConfigs() {
  return useQuery({
    queryKey: ["sla-configs"],
    queryFn: async () => {
      // Mocked for migration
      return [
        { id: "1", proxy_type: "residential", guaranteed_uptime: 99.9, credit_per_percent: 5, measurement_window: "monthly", is_active: true },
        { id: "2", proxy_type: "mobile", guaranteed_uptime: 99.5, credit_per_percent: 10, measurement_window: "monthly", is_active: true }
      ];
    },
  });
}

function useUptimeRecords() {
  return useQuery({
    queryKey: ["uptime-records"],
    queryFn: async () => {
      // Mocked for migration
      return [];
    },
  });
}

function useSLACredits() {
  return useQuery({
    queryKey: ["sla-credits"],
    queryFn: async () => {
      // Mocked for migration
      return [];
    },
  });
}

export default function SLAMonitoring() {
  const { data: configs } = useSLAConfigs();
  const { data: uptimeRecords } = useUptimeRecords();
  const { data: slaCredits } = useSLACredits();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ proxy_type: "", guaranteed_uptime: "99.9", credit_per_percent: "5" });

  const createConfig = useMutation({
    mutationFn: async () => {
      // Mocked for migration
      console.log("Mock create SLA config", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-configs"] });
      toast({ title: "SLA config created" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const approveCredit = useMutation({
    mutationFn: async (id: string) => {
      // Mocked for migration
      console.log("Mock approve SLA credit", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-credits"] });
      toast({ title: "Credit approved" });
    },
  });

  // Calculate current uptime per proxy type
  const uptimeByType = uptimeRecords?.reduce((acc, r) => {
    if (!acc[r.proxy_type]) acc[r.proxy_type] = { total: 0, up: 0 };
    acc[r.proxy_type].total++;
    if (r.status === "up") acc[r.proxy_type].up++;
    return acc;
  }, {} as Record<string, { total: number; up: number }>) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" /> SLA Monitoring</h1>
          <p className="text-muted-foreground">Track uptime guarantees and manage credits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add SLA Config</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create SLA Configuration</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Proxy Type</Label>
                <Input placeholder="e.g. residential" value={form.proxy_type} onChange={e => setForm(f => ({ ...f, proxy_type: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Guaranteed Uptime (%)</Label>
                  <Input type="number" step="0.1" value={form.guaranteed_uptime} onChange={e => setForm(f => ({ ...f, guaranteed_uptime: e.target.value }))} />
                </div>
                <div>
                  <Label>Credit per % Downtime</Label>
                  <Input type="number" value={form.credit_per_percent} onChange={e => setForm(f => ({ ...f, credit_per_percent: e.target.value }))} />
                </div>
              </div>
              <Button onClick={() => createConfig.mutate()} disabled={createConfig.isPending} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {configs?.map(c => {
          const stats = uptimeByType[c.proxy_type];
          const uptime = stats ? ((stats.up / stats.total) * 100).toFixed(2) : "N/A";
          const meetsSLA = stats ? (stats.up / stats.total) * 100 >= Number(c.guaranteed_uptime) : true;
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">{c.proxy_type}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uptime}%</div>
                <p className="text-xs text-muted-foreground">SLA: {Number(c.guaranteed_uptime)}%</p>
                <Badge variant={meetsSLA ? "default" : "destructive"} className="mt-2">
                  {meetsSLA ? "SLA Met" : "SLA Breached"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
        {!configs?.length && (
          <Card className="md:col-span-4">
            <CardContent className="py-8 text-center text-muted-foreground">No SLA configs. Create one to start monitoring.</CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="uptime">
        <TabsList>
          <TabsTrigger value="uptime">Uptime Records</TabsTrigger>
          <TabsTrigger value="credits">SLA Credits</TabsTrigger>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="uptime">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proxy Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Checked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uptimeRecords?.slice(0, 50).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="capitalize">{r.proxy_type}</TableCell>
                      <TableCell>{r.region}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[r.status] ?? "bg-muted"}`} />
                          <span className="capitalize">{r.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{r.response_time_ms ? `${r.response_time_ms}ms` : "—"}</TableCell>
                      <TableCell className="text-xs">{format(new Date(r.checked_at), "MMM d, HH:mm:ss")}</TableCell>
                    </TableRow>
                  ))}
                  {!uptimeRecords?.length && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No uptime records yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Proxy Type</TableHead>
                    <TableHead>Actual Uptime</TableHead>
                    <TableHead>Guaranteed</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slaCredits?.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.user_id.slice(0, 8)}…</TableCell>
                      <TableCell className="capitalize">{c.proxy_type}</TableCell>
                      <TableCell>{Number(c.actual_uptime).toFixed(2)}%</TableCell>
                      <TableCell>{Number(c.guaranteed_uptime)}%</TableCell>
                      <TableCell className="font-semibold">${Number(c.credit_amount).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={c.status === "approved" ? "default" : c.status === "applied" ? "secondary" : "outline"}>{c.status}</Badge></TableCell>
                      <TableCell>
                        {c.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => approveCredit.mutate(c.id)}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!slaCredits?.length && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No SLA credits issued</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proxy Type</TableHead>
                    <TableHead>Guaranteed Uptime</TableHead>
                    <TableHead>Credit / % Downtime</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs?.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="capitalize font-medium">{c.proxy_type}</TableCell>
                      <TableCell>{Number(c.guaranteed_uptime)}%</TableCell>
                      <TableCell>{Number(c.credit_per_percent)}%</TableCell>
                      <TableCell className="capitalize">{c.measurement_window}</TableCell>
                      <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
