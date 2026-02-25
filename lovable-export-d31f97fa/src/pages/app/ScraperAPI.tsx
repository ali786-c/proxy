import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Zap, Globe, Shield } from "lucide-react";

export default function ScraperAPI() {
  return (
    <>
      <SEOHead title="Scraper API" noindex />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Scraper API</h1>
          <Badge className="bg-warning text-warning-foreground">Beta</Badge>
        </div>
        <p className="text-muted-foreground">Extract data from any website with a simple API call. No proxy management needed.</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Fast", desc: "Sub-second responses with smart retry logic" },
            { icon: Globe, title: "Global", desc: "Target any country with automatic geo-routing" },
            { icon: Shield, title: "Anti-Bot Bypass", desc: "Built-in CAPTCHA solving and fingerprinting" },
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

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> Quick Start</CardTitle></CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
{`curl -X POST https://api.upgradedproxy.com/v1/scrape \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "render_js": true}'`}
            </pre>
          </CardContent>
        </Card>

        <Button size="lg">Get API Key</Button>
      </div>
    </>
  );
}
