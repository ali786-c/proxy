import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Check, X, Clock, Bitcoin, User, Hash, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ManualPayments() {
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<any>(null);
    const [note, setNote] = useState("");

    const { data: pending = [], isLoading } = useQuery({
        queryKey: ["admin-pending-crypto"],
        queryFn: () => adminApi.getPendingCrypto(),
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, status, note }: { id: number; status: "approved" | "rejected"; note?: string }) =>
            adminApi.approveCrypto(id, status, note),
        onSuccess: (data) => {
            toast({ title: "Success", description: data.message });
            queryClient.invalidateQueries({ queryKey: ["admin-pending-crypto"] });
            setSelected(null);
            setNote("");
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const handleAction = (status: "approved" | "rejected") => {
        if (!selected) return;
        approveMutation.mutate({ id: selected.id, status, note });
    };

    return (
        <>
            <SEOHead title="Manual Payment Verification" noindex />
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Manual Payment Verification</h1>
                    <p className="text-muted-foreground text-sm">Review and approve crypto transactions submitted by users.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" /> Pending Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Currency</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>TXID</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading pending payments...</TableCell></TableRow>
                                ) : pending.map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{p.user?.name}</span>
                                                <span className="text-xs text-muted-foreground">{p.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{p.currency}</Badge></TableCell>
                                        <TableCell className="font-semibold">€{Number(p.amount).toFixed(2)}</TableCell>
                                        <TableCell className="font-mono text-[10px] max-w-[150px] truncate">{p.txid}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelected(p)}>Review</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && pending.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No pending transactions.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Crypto Payment</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg bg-muted p-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">User:</span>
                                    <span className="font-medium">{selected.user?.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-bold text-primary">€{Number(selected.amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Currency:</span>
                                    <Badge variant="secondary">{selected.currency}</Badge>
                                </div>
                                <div className="flex flex-col gap-1 text-sm">
                                    <span className="text-muted-foreground">TXID:</span>
                                    <span className="font-mono text-[10px] break-all bg-background p-1.5 rounded border">{selected.txid || "N/A"}</span>
                                </div>
                                {selected.binance_id && (
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="text-muted-foreground">Binance ID:</span>
                                        <span className="font-mono text-[10px] break-all bg-background p-1.5 rounded border">{selected.binance_id}</span>
                                    </div>
                                )}
                            </div>

                            {selected.proof_url && (
                                <div className="space-y-2">
                                    <Label>Proof Screenshot</Label>
                                    <div className="border rounded-lg overflow-hidden bg-background">
                                        <img
                                            src={selected.proof_url}
                                            alt="Payment Proof"
                                            className="max-h-[300px] w-full object-contain cursor-zoom-in"
                                            onClick={() => window.open(selected.proof_url, '_blank')}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center italic">Click image to view full size</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Admin Note (optional)</Label>
                                <Input placeholder="Reason for rejection or internal note..." value={note} onChange={(e) => setNote(e.target.value)} />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="destructive" className="gap-2" onClick={() => handleAction("rejected")} disabled={approveMutation.isPending}>
                            <X className="h-4 w-4" /> Reject
                        </Button>
                        <Button className="gap-2" onClick={() => handleAction("approved")} disabled={approveMutation.isPending}>
                            <Check className="h-4 w-4" /> Approve & Credit Balance
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
