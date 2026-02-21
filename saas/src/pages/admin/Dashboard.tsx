import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CreditCard,
  BarChart3,
  AlertTriangle,
  Globe,
  Activity,
  Zap,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Server,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const MOCK_KPIS = {
  total_users: 4_832,
  users_change: 12.5,
  active_subs: 3_214,
  subs_change: 8.3,
  revenue_30d: 284_500,
  revenue_change: 15.2,
  bandwidth_30d_gb: 128_450,
  bandwidth_change: 6.8,
  error_rate: 2.4,
  active_proxies: 3_200_000,
  uptime: 99.97,
  top_geos: [
    { country: "United States", flag: "🇺🇸", bandwidth_gb: 42_100, users: 1_420 },
    { country: "Germany", flag: "🇩🇪", bandwidth_gb: 18_700, users: 620 },
    { country: "United Kingdom", flag: "🇬🇧", bandwidth_gb: 14_300, users: 480 },
    { country: "Brazil", flag: "🇧🇷", bandwidth_gb: 11_200, users: 390 },
    { country: "Japan", flag: "🇯🇵", bandwidth_gb: 9_800, users: 310 },
  ],
  recent_sales: [
    { user: "alex@company.com", plan: "Enterprise", amount: 499, time: "2 min ago" },
    { user: "sarah@agency.io", plan: "Pro 100GB", amount: 149, time: "15 min ago" },
    { user: "mike@startup.co", plan: "Starter 10GB", amount: 29, time: "1 hr ago" },
    { user: "lisa@corp.com", plan: "Pro 50GB", amount: 89, time: "2 hr ago" },
    { user: "john@dev.net", plan: "Starter 10GB", amount: 29, time: "3 hr ago" },
  ],
};

const MOCK_ALERTS = [
  { id: "1", type: "error" as const, message: "Error rate spike: 8.2% in EU-West cluster (last 15 min)", icon: Zap },
  { id: "2", type: "warning" as const, message: "Suspicious usage: user #3841 — 12 GB in 30 minutes from 4 geos", icon: ShieldAlert },
  { id: "3", type: "warning" as const, message: "3 charge failures in the last hour — Stripe webhook delays", icon: CreditCard },
  { id: "4", type: "info" as const, message: "Ban spike: 6.1% block rate on residential-US pool", icon: AlertTriangle },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: string;
  change?: number;
  icon: typeof Users;
  prefix?: string;
  suffix?: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">
              {prefix}{value}{suffix}
            </p>
            {change !== undefined && (
              <div className={`mt-1 flex items-center gap-1 text-xs ${isPositive ? "text-green-600" : "text-destructive"}`}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(change)}% from last month
              </div>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading stats…</div>;

  const kpi = stats || {
    total_users: 0,
    active_orders: 0,
    total_balance: 0,
    total_revenue: 0,
    recent_sales: [],
    top_geos: []
  };

  return (
    <>
      <SEOHead title="Admin Overview" noindex />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">System-wide KPIs and operational status.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={kpi.total_users.toLocaleString()} icon={Users} />
          <StatCard title="Active Orders" value={kpi.active_orders.toLocaleString()} icon={CreditCard} />
          <StatCard title="Total Revenue" value={(kpi.total_revenue).toLocaleString()} icon={DollarSign} prefix="$" />
          <StatCard title="Total Balance" value={(kpi.total_balance).toLocaleString()} icon={BarChart3} prefix="$" />
        </div>

        {/* System Health Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Proxies</p>
                  <p className="text-2xl font-bold">{(kpi.active_proxies / 1_000_000).toFixed(1)}M+</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <Server className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">{kpi.uptime}%</p>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground">Healthy</Badge>
              </div>
              <Progress value={kpi.uptime} className="mt-3 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">{kpi.error_rate}%</p>
                </div>
                <Badge variant={kpi.error_rate < 5 ? "default" : "destructive"}>
                  {kpi.error_rate < 5 ? "Normal" : "Elevated"}
                </Badge>
              </div>
              <Progress value={kpi.error_rate} max={10} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operational Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-md border p-3 text-sm ${alert.type === "error"
                      ? "border-destructive/30 bg-destructive/5"
                      : alert.type === "warning"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-border bg-muted/30"
                    }`}
                >
                  <alert.icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${alert.type === "error"
                        ? "text-destructive"
                        : alert.type === "warning"
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      }`}
                  />
                  <span>{alert.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpi.recent_sales.map((sale, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sale.user}</p>
                      <p className="text-xs text-muted-foreground">{sale.plan} · {sale.time}</p>
                    </div>
                    <span className="font-semibold text-primary">+${sale.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Geos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" /> Top Geographies (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpi.top_geos.map((geo, i) => {
                const pct = Math.round((geo.bandwidth_gb / kpi.top_geos[0].bandwidth_gb) * 100);
                return (
                  <div key={geo.country} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {geo.flag} {geo.country}
                        <span className="ml-2 text-xs text-muted-foreground">({geo.users.toLocaleString()} users)</span>
                      </span>
                      <span className="text-muted-foreground">{(geo.bandwidth_gb / 1000).toFixed(1)} TB</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
