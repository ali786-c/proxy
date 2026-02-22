import { useState, useMemo } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { UsagePoint, AppEvent } from "@/lib/api/dashboard";

// Mock data generator
function generateMockData(days: number): UsagePoint[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const bandwidth = Math.round(200 + Math.random() * 800);
    const requests = Math.round(bandwidth * (8 + Math.random() * 4));
    const errors = Math.round(requests * (0.01 + Math.random() * 0.04));
    return {
      date: d.toISOString().slice(0, 10),
      bandwidth_mb: bandwidth,
      requests,
      errors,
      success_rate: Math.round(((requests - errors) / requests) * 10000) / 100,
    };
  });
}

const MOCK_EVENTS: AppEvent[] = [
  { id: "1", type: "generated", message: "Generated 50 residential proxies (US)", created_at: "2026-02-20T14:30:00Z" },
  { id: "2", type: "ban", message: "IP ban detected on datacenter pool (DE)", created_at: "2026-02-20T12:15:00Z" },
  { id: "3", type: "auth_failure", message: "Auth failure from 192.168.1.50 — IP not in allowlist", created_at: "2026-02-20T10:00:00Z" },
  { id: "4", type: "generated", message: "Generated 20 mobile proxies (JP)", created_at: "2026-02-19T18:45:00Z" },
  { id: "5", type: "error", message: "Rate limit hit: 1000 req/min exceeded", created_at: "2026-02-19T16:20:00Z" },
];

const RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
];

const EVENT_BADGE_MAP: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  generated: "default",
  ban: "destructive",
  auth_failure: "destructive",
  error: "destructive",
  info: "secondary",
};

export default function Usage() {
  const [range, setRange] = useState(7);
  const data = useMemo(() => generateMockData(range), [range]);

  const totalBw = data.reduce((s, d) => s + d.bandwidth_mb, 0);
  const totalReqs = data.reduce((s, d) => s + d.requests, 0);
  const totalErrors = data.reduce((s, d) => s + d.errors, 0);
  const avgSuccess = totalReqs > 0 ? Math.round(((totalReqs - totalErrors) / totalReqs) * 10000) / 100 : 0;

  return (
    <>
      <SEOHead title="Usage Analytics" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Usage Analytics</h1>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.days}
                variant={range === r.days ? "default" : "outline"}
                size="sm"
                onClick={() => setRange(r.days)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Bandwidth</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{Number(totalBw / 1000).toFixed(1)} GB</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{(totalReqs || 0).toLocaleString()}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Success Rate</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{avgSuccess}%</p></CardContent>
          </Card>
        </div>

        {/* Bandwidth Chart */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Bandwidth (MB/day)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Area type="monotone" dataKey="bandwidth_mb" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Errors & Success Rate */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Errors / day</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Success Rate / day (%)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="success_rate" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Events</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EVENTS.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      <Badge variant={EVENT_BADGE_MAP[ev.type] ?? "secondary"} className="text-xs">
                        {ev.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{ev.message}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {ev.created_at ? new Date(ev.created_at).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
