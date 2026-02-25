import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone, Fingerprint, Zap } from "lucide-react";

export default function ScrapingBrowser() {
  return (
    <>
      <SEOHead title="Scraping Browser" noindex />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Scraping Browser</h1>
          <Badge className="bg-warning text-warning-foreground">Beta</Badge>
        </div>
        <p className="text-muted-foreground">A fully managed headless browser with built-in proxy rotation and anti-detection.</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: MonitorSmartphone, title: "Headless Chrome", desc: "Full browser rendering with JavaScript execution" },
            { icon: Fingerprint, title: "Anti-Detection", desc: "Automated fingerprint rotation and evasion" },
            { icon: Zap, title: "Fast Sessions", desc: "Persistent sessions with automatic proxy switching" },
          ].map((f) => (
            <Card key={f.title}>
              <CardContent className="pt-6 text-center">
                <f.icon className="h-8 w-8 mx-auto text-primary" />
                <h3 className="mt-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button size="lg">Request Beta Access</Button>
      </div>
    </>
  );
}
