import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Monitor, CheckCircle, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-12 px-4">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Download className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold">Install UpgradeRPX</h1>
        <p className="text-muted-foreground text-lg">Get the full app experience on your device — works offline, loads instantly.</p>
      </div>

      {isInstalled ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-success mb-4" />
            <h2 className="text-xl font-semibold">App Installed!</h2>
            <p className="text-muted-foreground mt-2">You're all set. The app is installed on your device.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deferredPrompt && (
            <Card>
              <CardContent className="py-6 text-center">
                <Button size="lg" onClick={handleInstall} className="gap-2">
                  <Download className="h-5 w-5" /> Install Now
                </Button>
              </CardContent>
            </Card>
          )}

          {isIOS && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Share className="h-5 w-5" /> iOS Installation</CardTitle>
                <CardDescription>Follow these steps to install on your iPhone or iPad</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2"><Badge variant="outline">1</Badge>Tap the <strong>Share</strong> button in Safari</li>
                  <li className="flex items-start gap-2"><Badge variant="outline">2</Badge>Scroll down and tap <strong>Add to Home Screen</strong></li>
                  <li className="flex items-start gap-2"><Badge variant="outline">3</Badge>Tap <strong>Add</strong> to confirm</li>
                </ol>
              </CardContent>
            </Card>
          )}

          {!deferredPrompt && !isIOS && (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                <Monitor className="mx-auto h-8 w-8 mb-2" />
                <p>Open this page in Chrome or Edge to install the app, or use your browser's menu → "Install App".</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="py-6 text-center">
                <Smartphone className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Works Offline</h3>
                <p className="text-xs text-muted-foreground mt-1">Access the dashboard even without internet</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <Download className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Fast Loading</h3>
                <p className="text-xs text-muted-foreground mt-1">Cached assets for instant startup</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <Monitor className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Native Feel</h3>
                <p className="text-xs text-muted-foreground mt-1">Full-screen experience on any device</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
