import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminPermissions() {
  const queryClient = useQueryClient();

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      return [];
    },
  });

  const { data: rolePerms } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: async () => {
      return [];
    },
  });

  const togglePerm = useMutation({
    mutationFn: async ({ role, permissionId, enabled }: { role: "admin" | "client"; permissionId: string; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase.from("role_permissions").insert({ role, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("role_permissions").delete().eq("role", role).eq("permission_id", permissionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({ title: "Permission Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const hasPermission = (role: string, permId: string) =>
    rolePerms?.some((rp) => rp.role === role && rp.permission_id === permId) ?? false;

  const categories = [...new Set(permissions?.map((p) => p.category) ?? [])];
  const roles = ["admin", "client"] as const;

  const categoryIcons: Record<string, string> = {
    proxy: "🌐",
    billing: "💳",
    support: "🎧",
    users: "👥",
    api: "🔑",
    audit: "📋",
    settings: "⚙️",
    org: "🏢",
  };

  return (
    <>
      <SEOHead title="Admin — Permissions" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="h-6 w-6" /> Role Permissions (RBAC)
          </h1>
          <p className="text-sm text-muted-foreground">Manage granular permissions for each role.</p>
        </div>

        {categories.map((cat) => (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{categoryIcons[cat] ?? "📦"}</span>
                <span className="capitalize">{cat}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Description</TableHead>
                    {roles.map((r) => (
                      <TableHead key={r} className="text-center capitalize">{r}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions
                    ?.filter((p) => p.category === cat)
                    .map((perm) => (
                      <TableRow key={perm.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{perm.name}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{perm.description}</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role} className="text-center">
                            <Switch
                              checked={hasPermission(role, perm.id)}
                              onCheckedChange={(enabled) =>
                                togglePerm.mutate({ role, permissionId: perm.id, enabled })
                              }
                              disabled={role === "admin"} // Admins keep all perms
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
