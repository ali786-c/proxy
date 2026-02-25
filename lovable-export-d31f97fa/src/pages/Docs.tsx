import { SEOHead } from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Key,
  Shield,
  Code,
  Zap,
  Server,
  Wifi,
  Monitor,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { useState, useCallback } from "react";

function CopyBlock({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono">{code}</pre>
    </div>
  );
}

const QUICK_START = [
  { step: "1", title: "Create an account", desc: "Sign up at upgradedproxy.com/signup. Add balance to get started instantly." },
  { step: "2", title: "Choose authentication", desc: "Add your server IP to the allowlist, or use username:password credentials." },
  { step: "3", title: "Connect to the gateway", desc: "Point your HTTP client at gate.upgradedproxy.com with your credentials." },
];

const ENDPOINTS = [
  { method: "POST", path: "/proxy/generate", desc: "Generate proxy credentials" },
  { method: "GET", path: "/me/usage", desc: "Get bandwidth usage stats" },
  { method: "GET", path: "/me/ip-allowlist", desc: "List IP allowlist entries" },
  { method: "POST", path: "/me/ip-allowlist", desc: "Add IP to allowlist" },
  { method: "DELETE", path: "/me/ip-allowlist/:id", desc: "Remove IP from allowlist" },
  { method: "GET", path: "/me/api-keys", desc: "List API keys" },
  { method: "POST", path: "/me/api-keys", desc: "Create API key" },
  { method: "DELETE", path: "/me/api-keys/:id", desc: "Revoke API key" },
  { method: "GET", path: "/me/subscription", desc: "Get current subscription" },
  { method: "GET", path: "/me/invoices", desc: "List invoices" },
  { method: "GET", path: "/me/events", desc: "Get recent events" },
];

const PROXY_TYPES = [
  { icon: Globe, name: "Residential", port: "7777", protocol: "HTTP/HTTPS/SOCKS5", pricing: "€0.64/GB" },
  { icon: Shield, name: "Premium Residential", port: "7778", protocol: "HTTP/HTTPS/SOCKS5", pricing: "€2.86/GB" },
  { icon: Server, name: "Datacenter", port: "7780", protocol: "HTTP/HTTPS/SOCKS5", pricing: "€0.39/GB" },
  { icon: Wifi, name: "Static Residential (ISP)", port: "7781", protocol: "HTTP/HTTPS/SOCKS5", pricing: "€3.25/IP" },
  { icon: Monitor, name: "Mobile", port: "7782", protocol: "HTTP/HTTPS/SOCKS5", pricing: "€2.86/GB" },
];

export default function Docs() {
  return (
    <>
      <SEOHead
        title="Documentation — API Reference & Integration Guides"
        description="Complete API documentation for UpgradedProxy. Learn to integrate residential, datacenter, ISP, and mobile proxies with cURL, Python, Node.js, and more."
        canonical="https://upgraderpx.com/docs"
      />

      <section className="container py-12">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything you need to integrate UpgradedProxy into your applications. REST API, proxy gateway endpoints, and code examples in multiple languages.
        </p>
      </section>

      {/* Quick Start */}
      <section className="container pb-10">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_START.map((s) => (
            <Card key={s.step}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{s.step}</span>
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="h-5 w-5" /> Authentication</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold mb-2">IP Allowlist (Recommended)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add your server IPs to the allowlist from the dashboard or API. Requests from allowlisted IPs are authenticated automatically — no credentials needed in your proxy URL.
            </p>
            <CopyBlock
              title="cURL — No credentials needed"
              code={`curl -x http://gate.upgradedproxy.com:7777 \\\n  https://httpbin.org/ip`}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Username & Password</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Embed credentials in the proxy URL. Include geo-targeting and session parameters in the username field.
            </p>
            <CopyBlock
              title="cURL — With credentials"
              code={`curl -x http://user-country_us:pass@gate.upgradedproxy.com:7777 \\\n  https://httpbin.org/ip`}
            />
          </div>
        </div>
      </section>

      {/* Proxy Gateway */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5" /> Proxy Gateway</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Connect to our gateway at <code className="rounded bg-muted px-1 py-0.5">gate.upgradedproxy.com</code> on the port for your proxy type.
          All ports support HTTP, HTTPS, and SOCKS5 protocols.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROXY_TYPES.map((pt) => (
            <div key={pt.name} className="flex items-start gap-3 rounded-md border bg-card p-3">
              <pt.icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{pt.name}</p>
                <p className="text-xs text-muted-foreground">Port: <code className="font-mono">{pt.port}</code> · {pt.protocol}</p>
                <p className="text-xs font-semibold text-primary mt-0.5">{pt.pricing}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Username Parameters */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4">Username Parameters</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Pass geo-targeting and session options through the username field using <code className="rounded bg-muted px-1 py-0.5">key_value</code> pairs separated by hyphens.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-semibold">Parameter</th>
                <th className="pb-2 text-left font-semibold">Example</th>
                <th className="pb-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { param: "country", example: "country_us", desc: "ISO 3166-1 alpha-2 country code" },
                { param: "city", example: "city_newyork", desc: "City-level targeting (major markets)" },
                { param: "state", example: "state_california", desc: "State/region targeting" },
                { param: "session", example: "session_abc123", desc: "Sticky session ID (same IP for up to 60 min)" },
                { param: "lifetime", example: "lifetime_30", desc: "Session lifetime in minutes (1-60)" },
              ].map((p) => (
                <tr key={p.param} className="border-b border-border/50">
                  <td className="py-2 font-mono font-semibold">{p.param}</td>
                  <td className="py-2 font-mono text-primary">{p.example}</td>
                  <td className="py-2 text-muted-foreground">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CopyBlock
          title="Full example — US, New York, sticky session"
          code={`curl -x http://user-country_us-city_newyork-session_abc123:pass@gate.upgradedproxy.com:7777 \\\n  https://httpbin.org/ip`}
        />
      </section>

      {/* Code Examples */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Code className="h-5 w-5" /> Code Examples</h2>
        <div className="space-y-4">
          <CopyBlock
            title="Python (requests)"
            code={`import requests\n\nproxies = {\n    "http": "http://user-country_us:pass@gate.upgradedproxy.com:7777",\n    "https": "http://user-country_us:pass@gate.upgradedproxy.com:7777",\n}\n\nresponse = requests.get("https://httpbin.org/ip", proxies=proxies)\nprint(response.json())`}
          />
          <CopyBlock
            title="Node.js (fetch + https-proxy-agent)"
            code={`const HttpsProxyAgent = require('https-proxy-agent');\n\nconst agent = new HttpsProxyAgent(\n  'http://user-country_us:pass@gate.upgradedproxy.com:7777'\n);\n\nfetch('https://httpbin.org/ip', { agent })\n  .then(res => res.json())\n  .then(console.log);`}
          />
          <CopyBlock
            title="Go (net/http)"
            code={`package main\n\nimport (\n  "fmt"\n  "io/ioutil"\n  "net/http"\n  "net/url"\n)\n\nfunc main() {\n  proxyURL, _ := url.Parse("http://user-country_us:pass@gate.upgradedproxy.com:7777")\n  client := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyURL)}}\n  resp, _ := client.Get("https://httpbin.org/ip")\n  body, _ := ioutil.ReadAll(resp.Body)\n  fmt.Println(string(body))\n}`}
          />
        </div>
      </section>

      {/* REST API Endpoints */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4">REST API Endpoints</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Base URL: <code className="rounded bg-muted px-1 py-0.5">https://api.upgradedproxy.com/v1</code> · 
          Authentication: <code className="rounded bg-muted px-1 py-0.5">Authorization: Bearer YOUR_API_KEY</code>
        </p>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-semibold">Method</th>
                    <th className="p-3 text-left font-semibold">Endpoint</th>
                    <th className="p-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((ep) => (
                    <tr key={ep.path + ep.method} className="border-b border-border/50">
                      <td className="p-3">
                        <Badge variant={ep.method === "GET" ? "secondary" : ep.method === "DELETE" ? "destructive" : "default"} className="text-[10px] font-mono">
                          {ep.method}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-primary">{ep.path}</td>
                      <td className="p-3 text-muted-foreground">{ep.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rate Limits */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4">Rate Limits & Errors</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold mb-2">Rate Limits</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• API: 1,000 requests/minute per key</li>
              <li>• Proxy gateway: unlimited concurrent connections</li>
              <li>• Proxy generation: 10,000 proxies per batch</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Error Codes</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><code className="font-mono">401</code> — Invalid or missing authentication</li>
              <li><code className="font-mono">403</code> — IP not in allowlist / scope insufficient</li>
              <li><code className="font-mono">429</code> — Rate limit exceeded</li>
              <li><code className="font-mono">503</code> — Service temporarily unavailable</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Scraping Products */}
      <section className="container pb-10 border-t pt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Monitor className="h-5 w-5" /> Scraping Products</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/docs/scraping-browser" className="group">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardContent className="flex gap-3 p-4">
                <Monitor className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">Scraping Browser</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Remote headless Chromium with anti-bot evasion, CAPTCHA solving & proxy integration. Connect via CDP WebSocket.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-auto mt-0.5 shrink-0 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-8">
        <div className="container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm font-medium">Ready to integrate?</p>
          <Button asChild size="sm"><Link to="/signup">Get Your API Key <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </div>
      </section>
    </>
  );
}
