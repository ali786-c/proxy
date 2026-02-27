import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, CreditCard } from "lucide-react";

export function PaymentStatusModal() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<"success" | "canceled" | "error" | null>(null);

    const success = searchParams.get("success") === "true";
    const canceled = searchParams.get("canceled") === "true";
    const errorMsg = searchParams.get("error");
    const isDirect = searchParams.get("direct") === "true";
    const gateway = searchParams.get("gateway") || "stripe";

    useEffect(() => {
        if (success) {
            setStatus("success");
            setOpen(true);
        } else if (canceled) {
            setStatus("canceled");
            setOpen(true);
        } else if (errorMsg) {
            setStatus("error");
            setOpen(true);
        }
    }, [success, canceled, errorMsg]);

    const handleClose = () => {
        setOpen(false);
        // Clear search params to prevent modal from reappearing on refresh
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("success");
        newParams.delete("canceled");
        newParams.delete("error");
        newParams.delete("direct");
        newParams.delete("gateway");
        setSearchParams(newParams, { replace: true });
    };

    if (!status) return null;

    const content = {
        success: {
            title: "Payment Successful!",
            description: isDirect
                ? "Your proxies have been generated and are ready for use. You can find them in the Proxy Generator or List views."
                : "Your account balance has been successfully updated. You can now use it to generate proxies.",
            icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
            action: isDirect ? "View Proxies" : "Continue",
        },
        canceled: {
            title: "Payment Canceled",
            description: "It looks like you canceled the payment process. No charges were made. You can try again whenever you're ready.",
            icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
            action: "Dismiss",
        },
        error: {
            title: "Payment Failed",
            description: errorMsg || "Something went wrong while processing your payment. Please try again or contact support for assistance.",
            icon: <XCircle className="h-12 w-12 text-destructive" />,
            action: "Try Again",
        },
    }[status];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="flex items-center justify-center p-3 rounded-full bg-muted/50">
                        {content.icon}
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-bold">{content.title}</DialogTitle>
                        <DialogDescription className="text-sm">
                            {content.description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button type="button" onClick={handleClose} className="w-full sm:w-auto min-w-[120px]">
                        {content.action}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
