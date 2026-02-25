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
  Ticket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

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

import { z } from "zod";

const AdminStatsSchema = z.object({
  total_users: z.number(),
  total_active_proxies: z.number(),
  total_revenue: z.number(),
  system_total_balance: z.number(),
  recent_registrations: z.number(),
  revenue_last_24h: z.number(),
  bandwidth_30d_gb: z.number(),
  uptime: z.number(),
  error_rate: z.number(),
  recent_sales: z.array(z.object({
    user: z.string(),
    amount: z.number(),
    time: z.string(),
    plan: z.string()
  })),
  alerts: z.array(z.object({
    id: z.string(),
    type: z.string(),
    message: z.string(),
    icon: z.string()
  }))
});

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats", AdminStatsSchema),
  });

  const kpi = {
    total_users: stats?.total_users ?? 0,
    users_change: 0,
    active_subs: stats?.total_active_proxies ?? 0,
    subs_change: 0,
    revenue_30d: (stats?.total_revenue ?? 0) * 100, // back to cents for display
    revenue_change: 0,
    bandwidth_30d_gb: stats?.bandwidth_30d_gb ?? 0,
    bandwidth_change: 0,
    error_rate: stats?.error_rate ?? 0.1,
    active_proxies: stats?.total_active_proxies ?? 0,
    uptime: stats?.uptime ?? 99.99,
    top_geos: stats?.top_geos ?? [
      { country: "Global", flag: "🌐", bandwidth_gb: 0, users: stats?.total_users ?? 0 },
    ],
    recent_sales: stats?.recent_sales ?? [],
    alerts: stats?.alerts ?? [],
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading system stats...</div>;

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
          <StatCard title="Total Users" value={kpi.total_users.toLocaleString()} change={kpi.users_change} icon={Users} />
          <StatCard title="Active Subscriptions" value={kpi.active_subs.toLocaleString()} change={kpi.subs_change} icon={CreditCard} />
          <StatCard title="Revenue (30d)" value={(kpi.revenue_30d / 100).toLocaleString()} change={kpi.revenue_change} icon={DollarSign} prefix="$" />
          <StatCard
            title="Bandwidth (30d)"
            value={kpi.bandwidth_30d_gb >= 1000 ? (kpi.bandwidth_30d_gb / 1000).toFixed(1) : kpi.bandwidth_30d_gb.toFixed(1)}
            change={kpi.bandwidth_change}
            icon={BarChart3}
            suffix={kpi.bandwidth_30d_gb >= 1000 ? " TB" : " GB"}
          />
        </div>

        {/* System Health Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Proxies</p>
                  <p className="text-2xl font-bold">
                    {kpi.active_proxies >= 1000000
                      ? `${(kpi.active_proxies / 1000000).toFixed(1)}M+`
                      : kpi.active_proxies.toLocaleString()
                    }
                  </p>
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
              {kpi.alerts.length > 0 ? kpi.alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-md border p-3 text-sm ${alert.type === "error"
                    ? "border-destructive/30 bg-destructive/5"
                    : alert.type === "warning"
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-border bg-muted/30"
                    }`}
                >
                  {(() => {
                    const IconMap: Record<string, any> = {
                      Zap,
                      ShieldAlert,
                      Activity,
                      Ticket,
                      DollarSign,
                    };
                    const Icon = IconMap[alert.icon] || AlertTriangle;
                    return (
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${alert.type === "error"
                          ? "text-destructive"
                          : alert.type === "warning"
                            ? "text-yellow-600"
                            : "text-muted-foreground"
                          }`}
                      />
                    );
                  })()}
                  <span>{alert.message}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No active alerts.</p>
              )}
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
                {kpi.recent_sales.length > 0 ? kpi.recent_sales.map((sale: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sale.user}</p>
                      <p className="text-xs text-muted-foreground">{sale.plan} · {sale.time}</p>
                    </div>
                    <span className="font-semibold text-primary">+${sale.amount}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No recent sales.</p>
                )}
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
