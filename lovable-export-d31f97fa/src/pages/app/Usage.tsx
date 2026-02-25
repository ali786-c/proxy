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
import { useUsage, useEvents } from "@/hooks/use-backend";
import { Loader2 } from "lucide-react";

// Mock data generators removed. Using hooks.

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
  const [rangeLabel, setRangeLabel] = useState("7d");
  const { data: usageData, isLoading: usageLoading } = useUsage(rangeLabel);
  const { data: events, isLoading: eventsLoading } = useEvents();

  const data = usageData?.data || [];
  const totalBw = usageData?.total_bandwidth_mb || 0;
  const totalReqs = usageData?.total_requests || 0;
  const avgSuccess = usageData?.avg_success_rate || 0;

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
                variant={rangeLabel === r.label ? "default" : "outline"}
                size="sm"
                onClick={() => setRangeLabel(r.label)}
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
            <CardContent><p className="text-2xl font-bold">{(totalBw / 1000).toFixed(1)} GB</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{totalReqs.toLocaleString()}</p></CardContent>
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
                {eventsLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading events...</TableCell></TableRow>
                ) : (events || []).map((ev: any) => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      <Badge variant={EVENT_BADGE_MAP[ev.type] ?? "secondary"} className="text-xs">
                        {ev.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{ev.message}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(ev.created_at).toLocaleString()}
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
