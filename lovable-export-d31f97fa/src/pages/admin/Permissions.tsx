import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock, Search, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MessageSchema } from "@/lib/api/client";
import { z } from "zod";

const SimpleUserSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string(),
  role: z.string(),
});
import { useState } from "react";

export default function AdminPermissions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users-roles"],
    queryFn: () => api.get("/admin/users", z.array(SimpleUserSchema)),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) =>
      api.post(`/admin/users/${userId}/role`, MessageSchema, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      toast({ title: "Role Updated", description: "User permissions have been modified." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SEOHead title="Admin — User Permissions" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" /> User Roles
            </h1>
            <p className="text-sm text-muted-foreground">Manage administrative access for system users.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading users...</TableCell></TableRow>
                ) : filtered.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => roleMutation.mutate({ userId: u.id, role: newRole })}
                        disabled={roleMutation.isPending}
                      >
                        <SelectTrigger className="w-[120px] ml-auto h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
