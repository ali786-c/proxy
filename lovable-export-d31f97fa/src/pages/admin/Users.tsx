import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const UserSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string(),
  role: z.string(),
  balance: z.number().or(z.string()),
  custom_referral_rate: z.number().nullable().optional(),
  created_at: z.string(),
});

// Paginated response schema matching Laravel's paginate() output
const PaginatedUsersSchema = z.object({
  data: z.array(UserSchema),
  current_page: z.number(),
  last_page: z.number(),
  total: z.number(),
  per_page: z.number(),
});

function useAdminUsers(page: number, search: string) {
  return useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), per_page: "50" });
      if (search) params.set("search", search);
      const data = await api.get(`/admin/users?${params.toString()}`, PaginatedUsersSchema);
      return {
        ...data,
        data: data.data.map((u: any) => ({
          ...u,
          full_name: u.name,
          user_id: u.id,
          is_banned: u.role === "banned",
          user_roles: [{ role: u.role }],
        })),
      };
    },
  });
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data: result, isLoading } = useAdminUsers(page, search);
  const users = result?.data ?? [];
  const totalPages = result?.last_page ?? 1;
  const totalUsers = result?.total ?? 0;

  if (isLoading) return <LoadingSkeleton />;

  const bannedUsers = users.filter((u: any) => u.is_banned).length;
  const totalBalance = users.reduce((s: number, u: any) => s + Number(u.balance ?? 0), 0);

  return (
    <>
      <SEOHead title="Admin — Users" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all registered users, balances, and access.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Banned Users</p>
              <p className="text-2xl font-bold text-destructive">{bannedUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total User Balances</p>
              <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email…" value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{user.user_roles?.[0]?.role ?? "client"}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_banned ? "destructive" : "default"}>
                        {user.is_banned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>${Number(user.balance ?? 0).toFixed(2)}</TableCell>
                    <TableCell>
                      {user.custom_referral_rate ? (
                        <Badge variant="outline" className="text-secondary border-secondary">
                          {user.custom_referral_rate}% Rate
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} — {totalUsers} total users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
