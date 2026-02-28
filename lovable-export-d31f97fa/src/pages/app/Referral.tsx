import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Gift, Copy, Users, DollarSign, TrendingUp, History, List } from "lucide-react";
import { useReferrals } from "@/hooks/use-backend";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function Referral() {
  const { data: referralData, isLoading } = useReferrals();
  const { format: formatPrice } = useCurrency();

  const referralCode = referralData?.referral_code || "Loading...";
  const stats = referralData?.stats || { total_referrals: 0, total_earned: 0, pending_amount: 0 };
  const earnings = referralData?.earnings || [];
  const referredUsers = referralData?.referred_users || [];

  const copyCode = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Referral Program" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Referral Program</h1>
          <p className="text-sm text-muted-foreground">Earn commissions by inviting new users. Get 10% of their top-ups and purchases!</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.total_referrals}</p>
              <p className="text-sm text-muted-foreground">Total Referred Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-success" />
              <p className="mt-2 text-2xl font-bold">{formatPrice(stats.total_earned)}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center relative">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 cursor-help text-muted-foreground/50 hover:text-muted-foreground">
                      <Info className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Commissions are held for 14 days for security verification before being released to your wallet.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TrendingUp className="h-8 w-8 mx-auto text-warning" />
              <p className="mt-2 text-2xl font-bold">{formatPrice(stats.pending_amount)}</p>
              <p className="text-sm text-muted-foreground">Pending Commission</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" /> Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/signup?ref=${referralCode}`}
                className="font-mono text-sm bg-muted/50"
              />
              <Button onClick={copyCode} className="gap-1.5 shrink-0">
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link and earn 10% commission on every purchase made by referred users.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Earning History
            </TabsTrigger>
            <TabsTrigger value="referred" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Referred Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card>
              <CardContent className="p-0">
                {earnings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map((earning: any) => (
                        <TableRow key={earning.id}>
                          <TableCell className="text-xs">
                            {format(new Date(earning.date), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="font-medium text-xs">
                            {earning.referred_user?.name}
                          </TableCell>
                          <TableCell className="text-xs">{earning.description}</TableCell>
                          <TableCell className="text-right font-bold text-success">
                            {formatPrice(earning.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="capitalize text-[10px] h-5">
                              {earning.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No earnings yet. Share your link to start earning!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referred">
            <Card>
              <CardContent className="p-0">
                {referredUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Joined Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-xs font-mono">{user.name}</TableCell>
                          <TableCell className="text-xs">{user.email}</TableCell>
                          <TableCell className="text-right text-xs">
                            {format(new Date(user.joined_at), "MMM dd, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No referred users yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
