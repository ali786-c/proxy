import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Search, ShieldOff, Shield, Plus, Minus, Package, Key, TicketIcon, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Removed supabase import

import api from "@/lib/api";

import { useAdminUsers, useAdminAction, useAdminStats } from "@/hooks/use-backend";

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const { updateBalance, banUser } = useAdminAction();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");

  // Global system stats for comparison/overview
  const { data: globalStats } = useAdminStats();
  // Placeholder for individual user stats (will be implemented in 6.5)
  const userStats = null;

  if (isLoading) return <LoadingSkeleton />;

  const filtered = (users ?? []).filter((u: any) => {
    if (search && !u.email?.toLowerCase().includes(search.toLowerCase()) && !u.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleBan = async (user: any) => {
    const isBanned = user.role === 'banned';
    try {
      await banUser.mutateAsync({
        user_id: user.id,
        reason: isBanned ? "Unbanning" : "Violated terms of service", // Backend needs to be updated for unban logic or role toggle
      });
      setSelectedUser(null);
      toast({ title: isBanned ? "User unbanned" : "User banned" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleBalanceAdjust = async (isTopUp: boolean) => {
    const amount = parseFloat(balanceAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    try {
      const result = await updateBalance.mutateAsync({
        user_id: selectedUser.id,
        amount: isTopUp ? amount : -amount,
        reason: balanceReason || (isTopUp ? "Admin top-up" : "Admin deduction"),
      });
      setBalanceAmount("");
      setBalanceReason("");
      setSelectedUser((prev: any) => prev ? { ...prev, balance: result.new_balance } : null);
      toast({ title: `Balance ${isTopUp ? "topped up" : "deducted"} successfully` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const totalUsers = (users ?? []).length;
  const bannedUsers = (users ?? []).filter((u: any) => u.role === 'banned').length;
  const totalBalance = (users ?? []).reduce((s: number, u: any) => s + Number(u.balance ?? 0), 0);

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
              <p className="text-2xl font-bold">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user: any) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(user)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{user.role || "client"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'banned' ? "destructive" : "default"}>
                        {user.role === 'banned' ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>${Number(user.balance ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!selectedUser} onOpenChange={() => { setSelectedUser(null); setBalanceAmount(""); setBalanceReason(""); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedUser.full_name || "User"}</SheetTitle>
                <SheetDescription>{selectedUser.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Role</p><p className="font-medium capitalize">{selectedUser.role || "client"}</p></div>
                  <div><p className="text-muted-foreground">Status</p><Badge variant={selectedUser.role === 'banned' ? "destructive" : "default"}>{selectedUser.role === 'banned' ? "Banned" : "Active"}</Badge></div>
                  <div><p className="text-muted-foreground">Balance</p><p className="font-medium text-lg">${Number(selectedUser.balance ?? 0).toFixed(2)}</p></div>
                  <div><p className="text-muted-foreground">Joined</p><p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
                </div>

                {/* User Stats */}
                {userStats && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="text-sm font-semibold">User Statistics</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Total Spent</p>
                          <p className="font-medium">${userStats.total_spent?.toFixed(2) ?? "0.00"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Orders</p>
                          <p className="font-medium">{userStats.active_orders ?? 0} active / {userStats.total_orders ?? 0} total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">API Keys</p>
                          <p className="font-medium">{userStats.active_keys ?? 0} active / {userStats.total_keys ?? 0} total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TicketIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Tickets</p>
                          <p className="font-medium">{userStats.open_tickets ?? 0} open / {userStats.total_tickets ?? 0} total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.ban_reason && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <strong>Ban reason:</strong> {selectedUser.ban_reason}
                  </div>
                )}

                {/* Balance Adjustment */}
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold">Adjust Balance</p>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 50.00"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                    />
                    <Label htmlFor="reason">Reason (optional)</Label>
                    <Input
                      id="reason"
                      placeholder="e.g. Manual credit for support case"
                      value={balanceReason}
                      onChange={(e) => setBalanceReason(e.target.value)}
                    />
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleBalanceAdjust(true)}
                        disabled={updateBalance.isPending || !balanceAmount}
                        className="flex-1"
                      >
                        <Plus className="mr-1 h-4 w-4" /> Top Up
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBalanceAdjust(false)}
                        disabled={updateBalance.isPending || !balanceAmount}
                        className="flex-1"
                      >
                        <Minus className="mr-1 h-4 w-4" /> Deduct
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Ban/Unban */}
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold">Access Control</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedUser.role === 'banned' ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleBan(selectedUser)}
                      disabled={banUser.isPending}
                    >
                      {selectedUser.role === 'banned' ? <Shield className="mr-2 h-4 w-4" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                      {selectedUser.role === 'banned' ? "Unban User" : "Ban User"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
