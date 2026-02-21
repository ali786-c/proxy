import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Gift, Copy, Users, DollarSign, TrendingUp } from "lucide-react";

export default function Referral() {
  const referralCode = "UPGRADED-HARDIN-2026";
  const copyCode = () => {
    navigator.clipboard.writeText(`https://upgradedproxy.com/signup?ref=${referralCode}`);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  return (
    <>
      <SEOHead title="Referral Program" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Referral Program</h1>
          <p className="text-sm text-muted-foreground">Earn commissions by inviting new users. Get 10% of their first purchase!</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="pt-6 text-center"><Users className="h-8 w-8 mx-auto text-primary" /><p className="mt-2 text-2xl font-bold">12</p><p className="text-sm text-muted-foreground">Total Referrals</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><DollarSign className="h-8 w-8 mx-auto text-success" /><p className="mt-2 text-2xl font-bold">$86.40</p><p className="text-sm text-muted-foreground">Total Earned</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><TrendingUp className="h-8 w-8 mx-auto text-warning" /><p className="mt-2 text-2xl font-bold">$12.50</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Your Referral Link</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={`https://upgradedproxy.com/signup?ref=${referralCode}`} className="font-mono text-sm" />
              <Button onClick={copyCode} className="gap-1.5 shrink-0"><Copy className="h-4 w-4" /> Copy</Button>
            </div>
            <p className="text-xs text-muted-foreground">Share this link and earn 10% commission on every first purchase made by referred users.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
