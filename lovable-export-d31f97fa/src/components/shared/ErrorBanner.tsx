import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 rounded-sm p-0.5 hover:bg-destructive/20" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
