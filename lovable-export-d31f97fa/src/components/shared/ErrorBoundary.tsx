import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/app";
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong</h1>
                    <p className="mb-8 max-w-md text-muted-foreground">
                        We've encountered an unexpected error. Don't worry, your data is safe.
                        Please try refreshing the page or going back to the dashboard.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh Page
                        </Button>
                        <Button onClick={this.handleReset} className="gap-2">
                            Back to Dashboard
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-8 max-w-2xl overflow-auto rounded-lg border bg-muted p-4 text-left text-xs text-muted-foreground">
                            <p className="mb-2 font-mono font-bold text-destructive">{this.state.error?.toString()}</p>
                            <pre className="font-mono">{this.state.error?.stack}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
