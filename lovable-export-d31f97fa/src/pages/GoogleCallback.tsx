import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function GoogleCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { handleGoogleCallback } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            const code = params.get("code");
            if (!code) {
                setError("No code provided from Google.");
                return;
            }

            try {
                const result = await handleGoogleCallback(code);

                if (result && result.requires_2fa) {
                    // Redirect to login page where 2FA UI will be shown automatically
                    navigate("/login", { replace: true });
                    return;
                }

                if (result && result.role) {
                    toast.success("Successfully logged in with Google!");
                    const defaultNext = result.role === 'admin' ? "/admin" : "/app";
                    navigate(defaultNext, { replace: true });
                }
            } catch (err: any) {
                console.error("Google Callback Error:", err);
                setError(err.message || "Authentication failed.");
            }
        };

        processCallback();
    }, [params, navigate, handleGoogleCallback]);

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center shadow-lg">
                    <h1 className="text-xl font-bold text-destructive mb-4">Login Error</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="text-primary hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Authenticating with Google...</p>
        </div>
    );
}
