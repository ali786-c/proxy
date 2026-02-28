import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MessageSchema } from "@/lib/api/client";
import { useAdminReferralStats, useAdminReferralEarnings, useUpdateInfluencerRate } from "@/hooks/use-backend";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, Settings, Gift, Search, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { z } from "zod";

export default function AdminReferrals() {
    const queryClient = useQueryClient();
    const { format: formatPrice } = useCurrency();
    const { data: stats, isLoading: statsLoading } = useAdminReferralStats();
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [earningsPage, setEarningsPage] = useState(1);
    const { data: earningsData, isLoading: earningsLoading } = useAdminReferralEarnings(statusFilter, earningsPage);
    const updateInfluencer = useUpdateInfluencerRate();

    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);

    // Use raw useQuery for general settings
    const { data: rawSettings } = useQuery({
        queryKey: ["admin", "settings", "referral"],
        queryFn: async () => {
            return api.get("/admin/settings", z.any());
        },
    });

    // Search Users for Influencer Rate
    const handleSearchUsers = async () => {
        if (!userSearch.trim()) return;
        setIsSearchingUsers(true);
        try {
            const users = await api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`, z.array(z.any()));
            setSearchedUsers(users);
        } catch (error) {
            toast({ title: "Search Error", description: "Failed to fetch users.", variant: "destructive" });
        } finally {
            setIsSearchingUsers(false);
        }
    };

    // Sync settings local state
    if (rawSettings && !settings) {
        setSettings({
            referral_system_enabled: rawSettings.referral_system_enabled === "1",
            referral_commission_percentage: rawSettings.referral_commission_percentage || "10",
            referral_hold_days: rawSettings.referral_hold_days || "14",
        });
    }

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await api.post("/admin/settings", MessageSchema, {
                referral_system_enabled: settings.referral_system_enabled ? "1" : "0",
                referral_commission_percentage: settings.referral_commission_percentage,
                referral_hold_days: settings.referral_hold_days,
            });
            toast({ title: "Settings Saved", description: "Referral configuration updated successfully." });
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (statsLoading) return <div className="p-10 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Referral Management</h1>
                    <p className="text-sm text-muted-foreground">Monitor and configure the platform referral program.</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                                <p className="text-2xl font-bold">{stats?.total_referrals}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-warning/10 rounded-full">
                                <TrendingUp className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                                <p className="text-2xl font-bold">{formatPrice(stats?.total_pending || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-success/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Paid Out</p>
                                <p className="text-2xl font-bold">{formatPrice(stats?.total_completed || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Earnings Overview</TabsTrigger>
                    <TabsTrigger value="influencers">Influencers</TabsTrigger>
                    <TabsTrigger value="settings">Global Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Recent Earning Records</CardTitle>
                                <CardDescription>View all referral commissions across the platform.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <RefreshCw className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "referrals", "earnings"] })} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Referrer</TableHead>
                                        <TableHead>Referred User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earningsData?.data?.map((earning: any) => (
                                        <TableRow key={earning.id}>
                                            <TableCell className="text-xs">{format(new Date(earning.created_at), "MMM dd, yyyy")}</TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{earning.referrer?.name}</div>
                                                <div className="text-xs text-muted-foreground">{earning.referrer?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{earning.referred?.name}</div>
                                                <div className="text-xs text-muted-foreground">{earning.referred?.email}</div>
                                            </TableCell>
                                            <TableCell className="font-bold">{formatPrice(earning.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant={earning.status === "completed" ? "success" : "warning"} className="capitalize">
                                                    {earning.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {earning.status !== "completed" && (
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-success hover:text-success hover:bg-success/10" onClick={async () => {
                                                        if (confirm("Mark this earning as completed and release to user?")) {
                                                            await api.post(`/admin/referrals/earnings/${earning.id}/status`, MessageSchema, { status: "completed" });
                                                            toast({ title: "Success", description: "Earning marked as completed." });
                                                            queryClient.invalidateQueries({ queryKey: ["admin", "referrals", "earnings"] });
                                                        }
                                                    }}>
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                {earning.status === "pending" && (
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={async () => {
                                                        if (confirm("Void this earning? It will not be paid out.")) {
                                                            await api.post(`/admin/referrals/earnings/${earning.id}/status`, MessageSchema, { status: "void" });
                                                            toast({ title: "Success", description: "Earning marked as void." });
                                                            queryClient.invalidateQueries({ queryKey: ["admin", "referrals", "earnings"] });
                                                        }
                                                    }}>
                                                        Void
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!earningsData || earningsData.data?.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                {earningsLoading ? "Loading..." : "No earning records found."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination UI */}
                            {earningsData?.last_page > 1 && (
                                <div className="flex items-center justify-between mt-4 border-t pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Page {earningsData.current_page} of {earningsData.last_page} ({earningsData.total} records)
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={earningsPage === 1}
                                            onClick={() => setEarningsPage(prev => prev - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={earningsPage === earningsData.last_page}
                                            onClick={() => setEarningsPage(prev => prev + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="influencers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Influencers</CardTitle>
                            <CardDescription>Search for users and set custom commission rates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search user by name, email or referral code..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                                />
                                <Button onClick={handleSearchUsers} disabled={isSearchingUsers}>
                                    {isSearchingUsers ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span className="ml-2">Search</span>
                                </Button>
                            </div>

                            {searchedUsers.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Current Rate</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searchedUsers.map((u: any) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="font-medium">{u.name}</div>
                                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {u.custom_referral_rate ? `${u.custom_referral_rate}%` : "Default"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const rate = prompt(`Enter custom rate (%) for ${u.name}:`, u.custom_referral_rate || "15");
                                                        if (rate !== null) {
                                                            updateInfluencer.mutate({ user_id: u.id, custom_rate: parseFloat(rate) });
                                                            // Update local state to reflect change immediately
                                                            setSearchedUsers(prev => prev.map(item => item.id === u.id ? { ...item, custom_referral_rate: parseFloat(rate) } : item));
                                                        }
                                                    }}>
                                                        Set Rate
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" /> Top Referrers
                                </h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead className="text-center">Total Referrals</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats?.top_referrers?.map((u: any) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="font-medium">{u.name}</div>
                                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                                </TableCell>
                                                <TableCell className="text-center">{u.referrals_count}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const rate = prompt("Enter custom commission rate (%) for this user:", "15");
                                                        if (rate !== null) {
                                                            updateInfluencer.mutate({ user_id: u.id, custom_rate: parseFloat(rate) });
                                                        }
                                                    }}>
                                                        Set Rate
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Referral Settings</CardTitle>
                            <CardDescription>Configure how commissions are handled sitewide.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label>Enable Referral Program</Label>
                                    <p className="text-xs text-muted-foreground">Allow users to invite users and earn commissions.</p>
                                </div>
                                <Switch
                                    checked={settings?.referral_system_enabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, referral_system_enabled: checked })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Default Commission Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={settings?.referral_commission_percentage}
                                        onChange={(e) => setSettings({ ...settings, referral_commission_percentage: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Standard percentage new referrers receive.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Escrow (Hold) Period (Days)</Label>
                                    <Input
                                        type="number"
                                        value={settings?.referral_hold_days}
                                        onChange={(e) => setSettings({ ...settings, referral_hold_days: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Days to hold funds before releasing to wallet.</p>
                                </div>
                            </div>

                            <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full gap-2">
                                <Save className="h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Configuration"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
