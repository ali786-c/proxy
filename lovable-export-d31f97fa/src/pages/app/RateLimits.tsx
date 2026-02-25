import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gauge, Clock, Zap, Globe, Shield, AlertTriangle } from "lucide-react";

interface RateLimit {
  endpoint: string;
  method: string;
  limit: number;
  used: number;
  window: string;
  status: "ok" | "warning" | "exceeded";
}

const MOCK_LIMITS: RateLimit[] = [
  { endpoint: "/v1/proxy/generate", method: "POST", limit: 1000, used: 342, window: "1 min", status: "ok" },
  { endpoint: "/v1/proxy/list", method: "GET", limit: 5000, used: 4120, window: "1 min", status: "warning" },
  { endpoint: "/v1/scrape", method: "POST", limit: 100, used: 100, window: "1 min", status: "exceeded" },
  { endpoint: "/v1/usage", method: "GET", limit: 300, used: 45, window: "1 min", status: "ok" },
  { endpoint: "/v1/auth/*", method: "POST", limit: 20, used: 3, window: "1 min", status: "ok" },
  { endpoint: "/v1/proxy/generate", method: "POST", limit: 50000, used: 12400, window: "1 hr", status: "ok" },
  { endpoint: "/v1/proxy/generate", method: "POST", limit: 500000, used: 89200, window: "24 hr", status: "ok" },
];

const DAILY_LIMITS = {
  bandwidth_gb: { used: 42.3, limit: 100, label: "Bandwidth" },
  requests: { used: 89200, limit: 500000, label: "Requests" },
  concurrent: { used: 128, limit: 500, label: "Concurrent Connections" },
  ips_generated: { used: 1420, limit: 10000, label: "IPs Generated" },
};

const STATUS_CONFIG = {
  ok: { color: "default" as const, bg: "bg-success/10 text-success" },
  warning: { color: "secondary" as const, bg: "bg-warning/10 text-warning" },
  exceeded: { color: "destructive" as const, bg: "bg-destructive/10 text-destructive" },
};

export default function RateLimits() {
  return (
    <>
      <SEOHead title="Rate Limits" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Rate Limits</h1>
          <p className="text-sm text-muted-foreground">Monitor your API rate limits and daily quotas in real-time.</p>
        </div>

        {/* Daily Quota Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(DAILY_LIMITS).map(([key, q]) => {
            const pct = Math.round((q.used / q.limit) * 100);
            const status = pct >= 100 ? "exceeded" : pct >= 80 ? "warning" : "ok";
            return (
              <Card key={key}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{q.label}</p>
                    <Badge variant={STATUS_CONFIG[status].color} className="text-xs">
                      {pct}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">
                    {key === "bandwidth_gb" ? `${q.used} GB` : q.used.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}/ {key === "bandwidth_gb" ? `${q.limit} GB` : q.limit.toLocaleString()}
                    </span>
                  </p>
                  <Progress value={Math.min(pct, 100)} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Per-Endpoint Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5" /> Per-Endpoint Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LIMITS.map((rl, i) => {
                  const pct = Math.round((rl.used / rl.limit) * 100);
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{rl.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{rl.method}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{rl.window}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(pct, 100)} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">
                            {rl.used.toLocaleString()} / {rl.limit.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[rl.status].bg}`}>
                          {rl.status === "ok" && <Shield className="h-3 w-3" />}
                          {rl.status === "warning" && <AlertTriangle className="h-3 w-3" />}
                          {rl.status === "exceeded" && <Zap className="h-3 w-3" />}
                          {rl.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">About Rate Limits</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Rate limits reset automatically at the end of each window period.</li>
              <li>If you hit a limit, requests return <code className="text-xs bg-muted px-1 py-0.5 rounded">429 Too Many Requests</code>.</li>
              <li>Need higher limits? Contact support or upgrade your plan.</li>
              <li>Daily quotas reset at midnight UTC.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}