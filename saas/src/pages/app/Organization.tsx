import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, UserPlus, Users, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Organization() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["orgs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      return [];
    },
  });

  const createOrg = useMutation({
    mutationFn: async () => {
      // Neutralized
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      setNewOrgName("");
      toast({ title: "Organization Created (Mock)" });
    },
  });

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const { data: members } = useQuery({
    queryKey: ["org-members", selectedOrg],
    enabled: !!selectedOrg,
    queryFn: async () => {
      return [];
    },
  });

  const { data: invites } = useQuery({
    queryKey: ["org-invites", selectedOrg],
    enabled: !!selectedOrg,
    queryFn: async () => {
      return [];
    },
  });

  const sendInvite = useMutation({
    mutationFn: async () => {
      // Neutralized (Admin API required)
      console.log("Inviting", inviteEmail, "as", inviteRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-invites"] });
      setInviteEmail("");
      toast({ title: "Invite Sent (Mock)" });
    },
  });

  const roleColor: Record<string, "default" | "secondary" | "outline"> = {
    owner: "default",
    admin: "secondary",
    member: "outline",
    viewer: "outline",
  };

  return (
    <>
      <SEOHead title="Organization" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Create Org</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Organization</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Acme Corp" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => createOrg.mutate()} disabled={!newOrgName.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Org List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {orgs?.length === 0 && !isLoading && (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No organizations yet. Create one to get started.</p>
              </CardContent>
            </Card>
          )}
          {orgs?.map((membership: any) => (
            <Card
              key={membership.org_id}
              className={`cursor-pointer transition-colors ${selectedOrg === membership.org_id ? "border-primary" : ""}`}
              onClick={() => setSelectedOrg(membership.org_id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{membership.organizations?.name}</CardTitle>
                  <Badge variant={roleColor[membership.role] ?? "outline"}>{membership.role}</Badge>
                </div>
                <CardDescription className="text-xs">
                  Slug: {membership.organizations?.slug}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Selected Org Details */}
        {selectedOrg && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Members</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm"><UserPlus className="mr-1 h-4 w-4" /> Invite</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={() => sendInvite.mutate()} disabled={!inviteEmail}>Send Invite</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-sm">{m.profiles?.full_name || "—"}</TableCell>
                        <TableCell className="text-sm">{m.profiles?.email || "—"}</TableCell>
                        <TableCell><Badge variant={roleColor[m.role] ?? "outline"} className="text-xs">{m.role}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.department || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(m.joined_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pending Invites */}
            {invites && invites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> Pending Invites</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invites.map((inv: any) => (
                        <TableRow key={inv.id}>
                          <TableCell className="text-sm">{inv.email}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{inv.role}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
