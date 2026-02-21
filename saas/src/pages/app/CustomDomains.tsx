import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Globe, Plus, Trash2, Copy, Shield, CheckCircle, Clock, XCircle } from "lucide-react";

const SSL_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
  active: { variant: "default", icon: CheckCircle },
  issuing: { variant: "outline", icon: Clock },
  pending: { variant: "secondary", icon: Clock },
  failed: { variant: "destructive", icon: XCircle },
};

function useCustomDomains() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["custom-domains", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Transitioned to Laravel
      return [];
    },
  });
}

export default function CustomDomains() {
  const { user } = useAuth();
  const { data: domains, isLoading } = useCustomDomains();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ domain: "", proxy_type: "residential" });

  const addDomain = useMutation({
    mutationFn: async () => {
      // Neutralized
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] });
      toast({ title: "Mock: Domain added." });
      setDialogOpen(false);
      setForm({ domain: "", proxy_type: "residential" });
    },
  });

  const deleteDomain = useMutation({
    mutationFn: async (id: string) => {
      // Neutralized
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] });
      toast({ title: "Domain removed (Mock)" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6" /> Custom Proxy Domains</h1>
          <p className="text-muted-foreground">Use your own domain for proxy endpoints</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Domain</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Custom Proxy Domain</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Domain</Label>
                <Input placeholder="proxy.yourdomain.com" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} />
              </div>
              <div>
                <Label>Proxy Type</Label>
                <Select value={form.proxy_type} onValueChange={v => setForm(f => ({ ...f, proxy_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="datacenter">Datacenter</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="isp">ISP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => addDomain.mutate()} disabled={addDomain.isPending || !form.domain} className="w-full">
                {addDomain.isPending ? "Adding…" : "Add Domain"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DNS Setup Instructions</CardTitle>
          <CardDescription>Add a CNAME record pointing your domain to our proxy endpoint, then add the TXT record to verify ownership.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline">1</Badge>
              <span>Add a <code className="bg-muted px-1 rounded">CNAME</code> record: <code className="bg-muted px-1 rounded">proxy.yourdomain.com → endpoint.upgraderproxy.com</code></span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">2</Badge>
              <span>Add a <code className="bg-muted px-1 rounded">TXT</code> record with the verification value shown below</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">3</Badge>
              <span>Wait for DNS propagation and SSL provisioning (up to 24 hours)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Domains</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Proxy Type</TableHead>
                <TableHead>DNS Verified</TableHead>
                <TableHead>SSL Status</TableHead>
                <TableHead>TXT Record</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains?.map(d => {
                const sslInfo = SSL_BADGES[d.ssl_status] ?? SSL_BADGES.pending;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.domain}</TableCell>
                    <TableCell className="capitalize">{d.proxy_type}</TableCell>
                    <TableCell>
                      {d.dns_verified ? (
                        <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>
                      ) : (
                        <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sslInfo.variant}>
                        <sslInfo.icon className="mr-1 h-3 w-3" />{d.ssl_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="bg-muted px-1 rounded text-xs">{d.dns_txt_record?.slice(0, 20)}…</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(d.dns_txt_record ?? "")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteDomain.mutate(d.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!domains?.length && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No custom domains configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
