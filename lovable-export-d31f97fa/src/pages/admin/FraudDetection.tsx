import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminFraudSignals, useAdminRiskScores, useAdminLoginHistory, useResolveFraudSignal } from "@/hooks/use-backend";
import { toast } from "sonner";
import { format } from "date-fns";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-destructive/10 text-destructive",
};

const SIGNAL_LABELS: Record<string, string> = {
  login_anomaly: "Login Anomaly",
  usage_spike: "Usage Spike",
  impossible_travel: "Impossible Travel",
  rapid_auth: "Rapid Auth Attempts",
};

export default function FraudDetection() {
  const [filter, setFilter] = useState("unresolved");

  const { data: signals, isLoading: signalsLoading } = useAdminFraudSignals(
    filter === "all" ? undefined : filter === "resolved"
  );
  const { data: riskScores, isLoading: scoresLoading } = useAdminRiskScores();
  const { data: loginHistory, isLoading: loginsLoading } = useAdminLoginHistory();

  const resolveSignal = useResolveFraudSignal();

  const handleResolve = async (id: number | string) => {
    try {
      await resolveSignal.mutateAsync(id);
      toast.success("Signal resolved successfully");
    } catch (error) {
      toast.error("Failed to resolve signal");
    }
  };

  const criticalCount = signals?.filter(s => s.severity === "critical" && !s.is_resolved).length ?? 0;
  const highRiskUsers = riskScores?.filter(r => r.risk_score >= 70).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" /> Fraud Detection
        </h1>
        <p className="text-muted-foreground">Monitor login anomalies, usage abuse, and risk scores</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Signals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{signals?.filter(s => !s.is_resolved).length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{criticalCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">High-Risk Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-warning">{highRiskUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Login Events (24h)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{loginHistory?.length ?? 0}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signals">
        <TabsList>
          <TabsTrigger value="signals">Fraud Signals</TabsTrigger>
          <TabsTrigger value="risk">Risk Scores</TabsTrigger>
          <TabsTrigger value="logins">Login History</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex justify-end">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals?.map(s => (
                    <TableRow key={s.id}>
                      <TableCell><Badge variant="outline">{SIGNAL_LABELS[s.signal_type] ?? s.signal_type}</Badge></TableCell>
                      <TableCell><span className={`rounded px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLORS[s.severity] ?? ""}`}>{s.severity}</span></TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {s.description}
                        {s.user && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            User: {s.user.name || s.user.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{s.geo_city ? `${s.geo_city}, ${s.geo_country}` : s.geo_country ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{s.ip_address ?? "—"}</TableCell>
                      <TableCell className="text-xs">{format(new Date(s.created_at), "MMM d, HH:mm")}</TableCell>
                      <TableCell>
                        {!s.is_resolved ? (
                          <Button size="sm" variant="outline" onClick={() => handleResolve(s.id)}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                          </Button>
                        ) : (
                          <Badge variant="secondary">Resolved</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!signals?.length && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No fraud signals detected</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Factors</TableHead>
                    <TableHead>Last Calculated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskScores?.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">
                        {r.user ? (r.user.name || r.user.email) : r.user_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${r.risk_score >= 70 ? "bg-destructive" : r.risk_score >= 40 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${r.risk_score}%` }} />
                          </div>
                          <span className="text-sm font-semibold">{r.risk_score}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className={`rounded px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLORS[r.risk_level] ?? ""}`}>{r.risk_level}</span></TableCell>
                      <TableCell className="text-xs">{Array.isArray(r.factors) ? (r.factors as string[]).join(", ") : "—"}</TableCell>
                      <TableCell className="text-xs">{format(new Date(r.last_calculated_at), "MMM d, HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                  {!riskScores?.length && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No risk scores calculated yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory?.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">
                        {l.user ? (l.user.name || l.user.email) : l.user_id}
                      </TableCell>
                      <TableCell><Badge variant={l.success ? "default" : "destructive"}>{l.success ? "Success" : "Failed"}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{l.ip_address ?? "—"}</TableCell>
                      <TableCell>{l.geo_city ? `${l.geo_city}, ${l.geo_country}` : l.geo_country ?? "—"}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs">{l.user_agent ?? "—"}</TableCell>
                      <TableCell className="text-xs">{format(new Date(l.created_at), "MMM d, HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                  {!loginHistory?.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No login events recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
