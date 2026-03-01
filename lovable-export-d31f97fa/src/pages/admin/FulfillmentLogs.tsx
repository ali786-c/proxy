import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const FulfillmentLogSchema = z.object({
    id: z.number(),
    user_id: z.number().nullable(),
    event_id: z.string(),
    provider: z.string(),
    type: z.string(),
    stage: z.number(),
    status: z.string(),
    error_message: z.string().nullable(),
    details: z.any().nullable(),
    created_at: z.string(),
    user: z.object({
        name: z.string(),
        email: z.string()
    }).nullable()
});

const PagedLogsSchema = z.object({
    data: z.array(FulfillmentLogSchema),
    total: z.number()
});

export default function FulfillmentLogs() {
    const [search, setSearch] = useState("");

    const { data: logs, isLoading } = useQuery({
        queryKey: ["admin-fulfillment-logs"],
        queryFn: async () => {
            return await api.get("/admin/fulfillment-logs", PagedLogsSchema);
        },
    });

    const filtered = (logs?.data ?? []).filter((log) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            log.event_id.toLowerCase().includes(q) ||
            log.user?.email.toLowerCase().includes(q) ||
            log.provider.toLowerCase().includes(q)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success": return "default";
            case "failed": return "destructive";
            case "processing": return "secondary";
            default: return "outline";
        }
    };

    const getStageIcon = (currentStage: number, logStage: number, status: string) => {
        if (logStage > currentStage) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (logStage === currentStage) {
            if (status === "failed") return <AlertCircle className="h-4 w-4 text-red-500" />;
            if (status === "processing") return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <>
            <SEOHead title="Admin — Fulfillment Monitor" noindex />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary" />
                            Fulfillment Monitor
                        </h1>
                        <p className="text-sm text-muted-foreground">Real-time tracking of payment-to-proxy fulfillment stages.</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search Event ID, User Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 max-w-sm"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Logs</CardTitle>
                        <CardDescription>Tracing the 3 stages: Payment Commit → Evomi Provisioning → Result Dispatch.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Event / User</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Stage Trace</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading monitor data...</TableCell></TableRow>
                                )}
                                {!isLoading && filtered.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono font-bold truncate max-w-[150px]">{log.event_id}</span>
                                                <span className="text-[10px] text-muted-foreground">{log.user?.email ?? "Guest"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize text-[10px]">{log.provider}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center gap-1">
                                                    {getStageIcon(1, log.stage, log.status)}
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Billing</span>
                                                </div>
                                                <div className="h-px w-4 bg-border" />
                                                <div className="flex flex-col items-center gap-1">
                                                    {getStageIcon(2, log.stage, log.status)}
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Evomi</span>
                                                </div>
                                                <div className="h-px w-4 bg-border" />
                                                <div className="flex flex-col items-center gap-1">
                                                    {getStageIcon(3, log.stage, log.status)}
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Result</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(log.status)} className="capitalize text-[10px]">
                                                {log.status === 'failed' ? 'Error' : log.status}
                                            </Badge>
                                            {log.error_message && (
                                                <p className="text-[10px] text-red-500 mt-1 max-w-[200px] truncate">{log.error_message}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-xs h-8">Inspect</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Log Details</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-bold">Stage</p>
                                                                <p>{log.stage} / 3</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">Status</p>
                                                                <p className="capitalize">{log.status}</p>
                                                            </div>
                                                        </div>
                                                        {log.error_message && (
                                                            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                                                <p className="font-bold mb-1">Error Message</p>
                                                                {log.error_message}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold mb-2">Technical Metadata (JSON)</p>
                                                            <pre className="p-4 bg-slate-950 text-slate-50 rounded-lg text-xs overflow-x-auto">
                                                                {JSON.stringify(log.details, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
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
