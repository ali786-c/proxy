import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePaymentConfig } from "@/contexts/PaymentConfigContext";
import { Bitcoin, Upload, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { clientApi } from "@/lib/api/dashboard";

interface ManualCryptoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultAmount?: string;
    onSuccess?: () => void;
}

export function ManualCryptoDialog({ open, onOpenChange, defaultAmount = "10", onSuccess }: ManualCryptoDialogProps) {
    const { settings } = usePaymentConfig();
    const [amount, setAmount] = useState(defaultAmount);
    const [binanceId, setBinanceId] = useState("");
    const [txid, setTxid] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get admin's Binance ID from settings if available
    const adminBinanceId = settings?.binance_pay_id || "786112233"; // Fallback example

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "ID copied to clipboard." });
    };

    const handleSubmit = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
            return;
        }
        if (!binanceId && !txid) {
            toast({ title: "Error", description: "Please provide either your Binance ID or TXID.", variant: "destructive" });
            return;
        }
        if (!file) {
            toast({ title: "Error", description: "Please upload a screenshot of your payment.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("currency", "USDT"); // Or allow selection, but USDT/Binance is common
            formData.append("amount", amount);
            if (binanceId) formData.append("binance_id", binanceId);
            if (txid) formData.append("txid", txid);
            formData.append("proof", file);

            await clientApi.submitManualCrypto(formData);

            toast({
                title: "Payment Submitted",
                description: "Admin will review your screenshot shortly. Your balance will be credited upon approval."
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (err: any) {
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bitcoin className="h-5 w-5 text-orange-500" /> Binance Pay / Manual Crypto
                    </DialogTitle>
                    <DialogDescription>
                        Pay manually via Binance ID and upload proof for instant verification.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
                        <p className="text-sm font-medium">Step 1: Send USDT to our Binance ID</p>
                        <div className="flex items-center justify-between bg-background border rounded-md p-2">
                            <span className="font-mono text-lg font-bold">{adminBinanceId}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleCopy(adminBinanceId)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic text-center">
                            Please ensure you send the exact amount. Verification usually takes 5-15 mins.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Amount Sent (€)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label>Your Binance ID</Label>
                                <Input
                                    value={binanceId}
                                    onChange={(e) => setBinanceId(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>OR TXID</Label>
                                <Input
                                    value={txid}
                                    onChange={(e) => setTxid(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Screenshot (Proof)</Label>
                            <div className="relative group">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className={`border-2 border-dashed rounded-lg p-4 transition-colors flex flex-col items-center gap-2 ${file ? "border-green-500 bg-green-500/5" : "border-muted-foreground/20 group-hover:border-primary/50"}`}>
                                    {file ? (
                                        <>
                                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground text-center">
                                                Click to upload or drag screenshot
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Submit Proof
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
