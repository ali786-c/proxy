import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  MonitorSmartphone,
  Fingerprint,
  Zap,
  Globe,
  Shield,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Info,
  Key,
  Code,
  ShieldCheck,
  Blocks,
} from "lucide-react";
import { useState, useCallback } from "react";

/* ── Reusable copy block ─────────────────────── */
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
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono">{code}</pre>
    </div>
  );
}

/* ── Callout component ───────────────────────── */
function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`my-4 flex gap-3 rounded-lg border p-4 text-sm ${
        type === "warning"
          ? "border-warning/50 bg-warning/10 text-warning-foreground"
          : "border-primary/30 bg-primary/5 text-foreground"
      }`}
    >
      {type === "warning" ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      )}
      <div>{children}</div>
    </div>
  );
}

/* ── Sidebar nav items ───────────────────────── */
const NAV = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick Start" },
  { id: "websocket-params", label: "WebSocket Parameters" },
  { id: "usage-examples", label: "Usage Examples" },
  { id: "captcha-support", label: "Automatic CAPTCHA Support" },
  { id: "tips", label: "Tips & Best Practices" },
];

/* ── WebSocket params table data ─────────────── */
const WS_PARAMS = [
  {
    name: "key",
    type: "string",
    example: "key=uproxy_abc123…",
    default: "— (required)",
    desc: "Your UpgradedProxy API key authorizing the browser session",
  },
  {
    name: "os",
    type: "enum",
    example: "os=windows",
    default: "provider default",
    desc: "Target OS fingerprint: windows, apple, unix",
  },
  {
    name: "proxy_country",
    type: "ISO 3166-1 α-2",
    example: "proxy_country=US",
    default: "dynamic",
    desc: "Route traffic via integrated proxy for the specified country",
  },
  {
    name: "adblock",
    type: "boolean",
    example: "adblock=true",
    default: "false",
    desc: "Enable built-in ad/tracker blocking for cleaner pages and fewer popups",
  },
  {
    name: "solve_cloudflare",
    type: "boolean",
    example: "solve_cloudflare=false",
    default: "true",
    desc: "Toggle automatic Cloudflare Turnstile solving",
  },
];

/* ── CAPTCHA providers ───────────────────────── */
const CAPTCHA_PROVIDERS = [
  { provider: "Cloudflare Turnstile", type: "Turnstile", cost: "Free" },
  { provider: "GeeTest", type: "Slider/Behavioral", cost: "Free" },
  { provider: "PerimeterX", type: "Challenge", cost: "Free" },
  { provider: "Lemin Captcha", type: "Puzzle", cost: "Free" },
  { provider: "reCAPTCHA", type: "v2/v3/Enterprise", cost: "Free" },
  { provider: "AWS Captcha", type: "WAF Captcha", cost: "Free" },
];

/* ── Features ────────────────────────────────── */
const FEATURES = [
  {
    icon: Fingerprint,
    title: "Custom Chromium Kernel",
    desc: "Spoofs fingerprints and neutralizes common anti-bot checks",
  },
  {
    icon: ShieldCheck,
    title: "Automatic CAPTCHA Solving",
    desc: "First-class Cloudflare Turnstile, reCAPTCHA, GeeTest & more",
  },
  {
    icon: Globe,
    title: "Integrated Proxies",
    desc: "Route traffic with geo-targeting directly from the session URL",
  },
  {
    icon: Blocks,
    title: "Scale by Default",
    desc: "Stateless sessions, horizontal scaling, and efficient resource usage",
  },
];

export default function ScrapingBrowserDocs() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <SEOHead
        title="Scraping Browser Documentation"
        description="Complete documentation for UpgradedProxy Scraping Browser. Connect via CDP WebSocket, control with Puppeteer/Playwright, auto-solve CAPTCHAs, and scale effortlessly."
        canonical="https://upgraderpx.com/docs/scraping-browser"
      />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/docs" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Documentation
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Scraping Browser</span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar nav — desktop */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-24 self-start">
            <nav className="space-y-0.5">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-3xl space-y-12">
            {/* ─── Overview ──────────────────────────── */}
            <section id="overview">
              <div className="flex items-center gap-3 mb-2">
                <MonitorSmartphone className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold">Scraping Browser</h1>
                <Badge className="bg-warning text-warning-foreground">Beta</Badge>
              </div>
              <p className="text-muted-foreground max-w-xl">
                UpgradedProxy Scraping Browser gives you instant access to a remote, hardened
                Chromium with built-in anti-bot evasion, CAPTCHA solving, and proxying. Connect
                via a single WebSocket CDP URL and control the browser using your favorite
                automation framework.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <Card key={f.title}>
                    <CardContent className="flex gap-3 p-4">
                      <f.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold">{f.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* ─── Quick Start ───────────────────────── */}
            <section id="quick-start" className="border-t pt-10">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5" /> Quick Start
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect using a Chrome DevTools Protocol (CDP) WebSocket URL:
              </p>
              <CopyBlock
                title="CDP WebSocket URL"
                code="wss://browser.upgradedproxy.com?key=YOUR_API_KEY&os=windows&proxy_country=US"
              />
              <Callout type="info">
                <strong>Optional parameters:</strong> <code className="text-xs font-mono bg-muted px-1 rounded">os</code>,{" "}
                <code className="text-xs font-mono bg-muted px-1 rounded">proxy_country</code>,{" "}
                <code className="text-xs font-mono bg-muted px-1 rounded">adblock=true</code>. To disable automatic Turnstile solving:{" "}
                <code className="text-xs font-mono bg-muted px-1 rounded">solve_cloudflare=false</code>.
              </Callout>
              <Callout type="warning">
                Use only the provided <code className="text-xs font-mono">wss://browser.upgradedproxy.com</code> endpoint.
                Your API key authorizes browser sessions and usage.
              </Callout>
            </section>

            {/* ─── WebSocket Parameters ──────────────── */}
            <section id="websocket-params" className="border-t pt-10">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Key className="h-5 w-5" /> WebSocket Parameters
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Use these query parameters on the CDP WebSocket URL to configure your Scraping Browser sessions.
              </p>

              <h3 className="text-sm font-semibold mb-2">Base Format</h3>
              <CopyBlock
                title="Base URL"
                code="wss://browser.upgradedproxy.com?key=YOUR_API_KEY[&param=value...]"
              />

              <Callout type="warning">
                Always keep your API key secret. Rotate keys from your dashboard if exposed.
              </Callout>

              <h3 className="text-sm font-semibold mt-6 mb-3">Parameters Reference</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left font-semibold">Name</th>
                          <th className="p-3 text-left font-semibold">Type</th>
                          <th className="p-3 text-left font-semibold">Example</th>
                          <th className="p-3 text-left font-semibold">Default</th>
                          <th className="p-3 text-left font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {WS_PARAMS.map((p) => (
                          <tr key={p.name} className="border-b border-border/50">
                            <td className="p-3 font-mono font-semibold text-primary">{p.name}</td>
                            <td className="p-3 text-muted-foreground">{p.type}</td>
                            <td className="p-3 font-mono">{p.example}</td>
                            <td className="p-3 text-muted-foreground">{p.default}</td>
                            <td className="p-3 text-muted-foreground">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Callout type="info">
                Parameters are optional unless marked required. Invalid values are ignored or coerced to defaults.
              </Callout>

              <h3 className="text-sm font-semibold mt-6 mb-3">Examples</h3>
              <CopyBlock
                title="Parameter combinations"
                code={`# Windows fingerprint, US proxy routing, adblock on
wss://browser.upgradedproxy.com?key=YOUR_API_KEY&os=windows&proxy_country=US&adblock=true

# Disable Turnstile solving for debugging
wss://browser.upgradedproxy.com?key=YOUR_API_KEY&solve_cloudflare=false

# Minimal: just your key
wss://browser.upgradedproxy.com?key=YOUR_API_KEY`}
              />

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <h3 className="font-semibold text-foreground text-sm">Behavior Notes</h3>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>Sessions are ephemeral; reconnect to create a fresh environment.</li>
                  <li>Anti-bot evasion is enabled by default and requires no code changes.</li>
                  <li>Integrated proxy usage and CAPTCHA solving may affect usage accounting.</li>
                </ul>
              </div>
            </section>

            {/* ─── Usage Examples ────────────────────── */}
            <section id="usage-examples" className="border-t pt-10">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Code className="h-5 w-5" /> Usage Examples
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to UpgradedProxy Scraping Browser using the Chrome DevTools Protocol (CDP) WebSocket.
                Use your preferred framework and language; examples below show idiomatic setups.
              </p>

              <Callout type="info">
                CDP URL format:{" "}
                <code className="text-xs font-mono bg-muted px-1 rounded">
                  wss://browser.upgradedproxy.com?key=YOUR_API_KEY&os=windows&proxy_country=US&adblock=true
                </code>
              </Callout>

              <Tabs defaultValue="puppeteer" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="puppeteer">Puppeteer</TabsTrigger>
                  <TabsTrigger value="playwright">Playwright</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="go">Go (Rod)</TabsTrigger>
                </TabsList>

                <TabsContent value="puppeteer" className="mt-4">
                  <CopyBlock
                    title="Puppeteer (Node.js)"
                    code={`const puppeteer = require('puppeteer');

(async () => {
  const cdpUrl = 'wss://browser.upgradedproxy.com?key=YOUR_API_KEY&os=windows&proxy_country=US&adblock=true';
  const browser = await puppeteer.connect({ browserWSEndpoint: cdpUrl, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto('https://httpbin.org/ip', { waitUntil: 'networkidle2' });
  console.log(await page.title());
  await browser.close();
})();`}
                  />
                </TabsContent>

                <TabsContent value="playwright" className="mt-4">
                  <Callout type="warning">
                    Playwright JavaScript/TypeScript is <strong>NOT compatible</strong> with the Bun runtime. Use Node.js
                    (<code className="text-xs font-mono">node</code>, <code className="text-xs font-mono">npm</code>, or{" "}
                    <code className="text-xs font-mono">npx</code>) instead.
                  </Callout>
                  <CopyBlock
                    title="Playwright (Node.js)"
                    code={`// WARNING: Do not run under Bun. Playwright JS/TS requires the Node.js runtime.
const { chromium } = require('playwright');

(async () => {
  const ws = 'wss://browser.upgradedproxy.com?key=YOUR_API_KEY&proxy_country=US';
  const browser = await chromium.connectOverCDP(ws);
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://httpbin.org/ip');
  console.log(await page.textContent('body'));
  await browser.close();
})();`}
                  />
                </TabsContent>

                <TabsContent value="python" className="mt-4">
                  <CopyBlock
                    title="Patchright (Python)"
                    code={`from patchright.sync_api import sync_playwright

cdp = 'wss://browser.upgradedproxy.com?key=YOUR_API_KEY&proxy_country=US&adblock=true'

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(cdp)
    context = browser.contexts[0] if browser.contexts else browser.new_context()
    page = context.new_page()
    page.goto('https://httpbin.org/ip')
    print(page.title())
    browser.close()`}
                  />
                </TabsContent>

                <TabsContent value="go" className="mt-4">
                  <CopyBlock
                    title="Rod (Go)"
                    code={`package main

import (
    "fmt"
    "github.com/go-rod/rod"
)

func main() {
    cdp := "wss://browser.upgradedproxy.com?key=YOUR_API_KEY&proxy_country=US&solve_cloudflare=false"
    browser := rod.New().ControlURL(cdp).MustConnect()
    page := browser.MustPage("https://httpbin.org/ip")
    fmt.Println(page.MustEval("() => document.title"))
    browser.MustClose()
}`}
                  />
                </TabsContent>
              </Tabs>
            </section>

            {/* ─── CAPTCHA Support ───────────────────── */}
            <section id="captcha-support" className="border-t pt-10">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" /> Automatic CAPTCHA Support
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                UpgradedProxy Scraping Browser includes built-in, automatic solving for popular CAPTCHA providers.
                Solving runs transparently during navigation and form submits. You can disable specific solvers
                via URL parameters (e.g., <code className="font-mono text-xs bg-muted px-1 rounded">solve_cloudflare=false</code>).
              </p>

              <h3 className="text-sm font-semibold mb-3">Supported Providers</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left font-semibold">Provider</th>
                          <th className="p-3 text-left font-semibold">Type</th>
                          <th className="p-3 text-left font-semibold">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CAPTCHA_PROVIDERS.map((c) => (
                          <tr key={c.provider} className="border-b border-border/50">
                            <td className="p-3 font-medium">{c.provider}</td>
                            <td className="p-3 text-muted-foreground">{c.type}</td>
                            <td className="p-3">
                              <Badge variant="secondary" className="text-[10px]">
                                {c.cost}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Callout type="info">
                Availability may vary by target site integration and challenge variant. The browser attempts
                safe fallbacks where possible.
              </Callout>

              <h3 className="text-sm font-semibold mt-6 mb-2">How It Works</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                <li>Detection occurs at runtime; challenges are solved inline with page actions.</li>
                <li>No external solver keys or credits needed.</li>
                <li>Solvers respect page security policies and emulate genuine user flows.</li>
              </ul>

              <h3 className="text-sm font-semibold mt-6 mb-2">Toggling Solvers</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use URL query parameters to control solvers globally per session.
              </p>
              <CopyBlock
                title="Disable Cloudflare Turnstile"
                code="wss://browser.upgradedproxy.com?key=YOUR_API_KEY&solve_cloudflare=false"
              />
            </section>

            {/* ─── Tips ──────────────────────────────── */}
            <section id="tips" className="border-t pt-10">
              <h2 className="text-xl font-bold mb-3">Tips & Best Practices</h2>
              <div className="space-y-3">
                {[
                  "Reuse a single session to perform multiple tasks sequentially when possible.",
                  "Use proxy_country to route traffic geographically without code changes.",
                  "Combine parameters for maximum stealth: os=windows&proxy_country=US&adblock=true.",
                  "Sessions are ephemeral — reconnect to create a fresh environment.",
                  "Anti-bot evasion is enabled by default and requires no code changes.",
                  "Monitor your usage dashboard to track browser session credits.",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── CTA ───────────────────────────────── */}
            <section className="border-t pt-10 pb-4">
              <div className="flex flex-col items-center gap-4 text-center rounded-lg border bg-primary/5 p-8">
                <h2 className="text-lg font-bold">Ready to start scraping?</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Get your API key from the dashboard and connect your first browser session in minutes.
                </p>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link to="/app/scraping-browser">
                      Get API Key <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/docs">Back to Docs</Link>
                  </Button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
