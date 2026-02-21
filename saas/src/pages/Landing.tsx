import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaOrg, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  BarChart3,
  Globe,
  Code,
  Bell,
  Zap,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  Lock,
  Check,
  ChevronRight,
  Server,
  Wifi,
  Monitor,
  Search,
  TrendingUp,
  ShoppingCart,
  Eye,
  FileSearch,
  Database,
  ArrowRight,
  X as XIcon,
  Timer,
  RefreshCw,
  Layers,
  Smartphone,
  Brain,
  MapPin,
  ShieldCheck as BrandShield,
  Plane,
} from "lucide-react";

/* ── Data ──────────────────────────────────────────────── */

const FEATURES = [
  { icon: Shield, title: "Enterprise Security", desc: "IP allowlist auth, encrypted tunnels, SOC 2 ready." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Bandwidth, success rates, and latency — live." },
  { icon: Globe, title: "190+ Countries", desc: "City-level geo-targeting per request." },
  { icon: Code, title: "REST API", desc: "Full proxy control via API. Generate, rotate, manage." },
  { icon: Bell, title: "Smart Alerts", desc: "Threshold alerts for errors, bans, and spend." },
  { icon: Zap, title: "Instant Setup", desc: "Working proxies in under 60 seconds." },
];

const SECURITY_FEATURES = [
  { icon: EyeOff, title: "No Reverse DNS Lookup", desc: "Your proxy IPs return no PTR records — completely invisible to reverse lookups. No competitor offers this." },
  { icon: Fingerprint, title: "Zero Fingerprint Headers", desc: "We strip all proxy-identifying headers (X-Forwarded-For, Via) so your traffic looks 100% organic." },
  { icon: ShieldCheck, title: "DNS Leak Protection", desc: "All DNS queries are routed through our encrypted resolvers — no leaks to your ISP or target." },
  { icon: Lock, title: "TLS Fingerprint Masking", desc: "Randomized JA3 fingerprints per session prevent TLS-based proxy detection." },
];

const PRODUCTS = [
  { name: "Residential Proxies", price: "$0.49", unit: "/GB", icon: Globe, gradient: "from-blue-500 to-indigo-600", link: "/residential-proxies", cta: "Try for Free" },
  { name: "Mobile Proxies", price: "$2.20", unit: "/GB", icon: Smartphone, gradient: "from-purple-500 to-pink-500", link: "/mobile-proxies", cta: "Try for Free" },
  { name: "Datacenter Proxies", price: "$0.35", unit: "/GB", icon: Server, gradient: "from-green-500 to-emerald-600", link: "/datacenter-proxies", cta: "Try for Free" },
  { name: "Static Residential Proxies", price: "$1.00", unit: "/IP", icon: Wifi, gradient: "from-orange-500 to-amber-500", link: "/isp-proxies", cta: "Start now" },
];

const TOP_LOCATIONS = [
  { name: "United States", flag: "🇺🇸", ips: "9,567,890+" },
  { name: "United Kingdom", flag: "🇬🇧", ips: "3,260,554+" },
  { name: "Germany", flag: "🇩🇪", ips: "3,221,909+" },
  { name: "France", flag: "🇫🇷", ips: "2,661,413+" },
  { name: "Japan", flag: "🇯🇵", ips: "3,345,678+" },
  { name: "Canada", flag: "🇨🇦", ips: "2,789,123+" },
  { name: "Australia", flag: "🇦🇺", ips: "2,123,456+" },
  { name: "South Korea", flag: "🇰🇷", ips: "1,987,654+" },
];

const FAQS = [
  { question: "What types of proxies do you offer?", answer: "Residential, datacenter, ISP, mobile, and SOCKS5 proxies — all from one dashboard and API." },
  { question: "What is no reverse DNS lookup?", answer: "Our proxy IPs have no PTR records configured. When someone performs a reverse DNS lookup on your proxy IP, it returns nothing — making it undetectable as a proxy." },
  { question: "How fast can I get started?", answer: "Under 60 seconds. Sign up, pick your plan, and generate proxies immediately through the dashboard or API." },
  { question: "Do you offer a free trial?", answer: "Yes. Every new account gets trial bandwidth to test our network before committing." },
  { question: "What protocols do you support?", answer: "HTTP, HTTPS, and SOCKS5 across all proxy types. Connect using your preferred protocol — we support them all simultaneously." },
  { question: "Is there a fair usage policy?", answer: "No hidden limits. Flat-rate pricing means everyone pays the same — whether you use 1 GB or 10 TB." },
];

const STATS = [
  { value: "10M+", label: "IP Pool" },
  { value: "190+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
  { value: "<50ms", label: "Avg Latency" },
];

const CERTIFICATIONS = ["ISO 27001", "ISO 27018", "SOC 2", "GDPR", "CCPA"];

const USE_CASES = [
  { icon: Search, title: "Search Engine Monitoring", desc: "Utilize our proxy network for smooth and efficient search engine data aggregation." },
  { icon: Brain, title: "AI Training", desc: "Enhance your AI models with high-speed proxies for detailed market analysis." },
  { icon: MapPin, title: "Localized Content Testing", desc: "Effectively manage and scale your affiliate marketing campaigns with our proxy solutions." },
  { icon: Database, title: "Data Extraction", desc: "Test and optimize content across regions using our geo-targeted residential proxies." },
  { icon: BrandShield, title: "Brand Protection", desc: "Utilize our proxies to maintain confidentiality and data integrity." },
  { icon: Plane, title: "Travel Data", desc: "Utilize our dashboard to access and manage travel data and support tickets." },
];

const PROTOCOLS = [
  { name: "HTTP", desc: "Standard web traffic" },
  { name: "HTTPS", desc: "Encrypted connections" },
  { name: "SOCKS5", desc: "Any TCP protocol" },
];

const COMPETITOR_ROWS = [
  { feature: "No Reverse DNS Lookup", us: true, others: false },
  { feature: "TLS Fingerprint Masking", us: true, others: false },
  { feature: "Zero Fingerprint Headers", us: true, others: false },
  { feature: "DNS Leak Protection", us: true, others: false },
  { feature: "Flat-Rate Pricing (No Tiers)", us: true, others: false },
  { feature: "Free Trial", us: true, others: true },
  { feature: "190+ Countries", us: true, others: true },
  { feature: "REST API", us: true, others: true },
  { feature: "Instant Setup (<60s)", us: true, others: false },
  { feature: "SOC 2 & GDPR Certified", us: true, others: true },
];

/* ── Component ─────────────────────────────────────────── */

export default function Landing() {
  return (
    <>
      <SEOHead
        title="UpgradedProxy — Fast, Undetectable Proxy Infrastructure"
        description="10M+ IPs, 190+ countries, no reverse DNS lookup. Residential, datacenter, ISP, mobile, and SOCKS5 proxies with instant setup and full API control."
        canonical="https://upgraderpx.com"
      />
      <SchemaOrg />
      <SchemaFAQ items={FAQS} />

      {/* Hero */}
      <section className="container flex flex-col items-center justify-center py-14 text-center" style={{ minHeight: 280 }}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Zap className="h-3 w-3" /> Now with TLS Fingerprint Masking
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Proxies that just work
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          10M+ IPs. 190+ countries. No reverse lookup. The only proxy provider built for stealth at scale — with flat-rate pricing for everyone.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button asChild size="sm"><Link to="/signup">Start Free Trial</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/pricing">View Pricing</Link></Button>
        </div>

        {/* Protocol badges */}
        <div className="mt-5 flex items-center gap-2">
          {PROTOCOLS.map((p) => (
            <span key={p.name} className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground" title={p.desc}>
              {p.name}
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground">supported on all proxies</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-6 sm:gap-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold sm:text-2xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Unique selling points — things competitors DON'T advertise */}
      <section className="border-t bg-primary/5 py-8">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Timer, title: "Same Price For All", desc: "No volume discounts, no hidden tiers. 1 GB or 10 TB — same flat rate." },
              { icon: EyeOff, title: "Truly Undetectable", desc: "No PTR records, no proxy headers, randomized TLS fingerprints." },
              { icon: RefreshCw, title: "Sticky + Rotating", desc: "Choose sticky sessions (up to 60 min) or auto-rotate per request." },
              { icon: Layers, title: "All Protocols", desc: "HTTP, HTTPS, and SOCKS5 on every proxy type. No extra charges." },
            ].map((u) => (
              <div key={u.title} className="flex items-start gap-3 rounded-lg border border-primary/20 bg-card p-4">
                <u.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">{u.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/20 py-10">
        <div className="container">
          <h2 className="mb-6 text-center text-lg font-bold sm:text-xl">Why UpgradedProxy</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-md border bg-card p-4" style={{ minHeight: 80 }}>
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-t py-10">
        <div className="container">
          <div className="text-center">
            <h2 className="text-lg font-bold sm:text-xl">Stealth-Grade Security</h2>
            <p className="mt-1 text-xs text-muted-foreground">Features no other provider offers — built for operators who can't afford detection.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SECURITY_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 p-4" style={{ minHeight: 80 }}>
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration code snippet */}
      <section className="border-t bg-muted/20 py-10">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">Developer-First</p>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">Integrate in 30 Seconds</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                One line to connect. Use any language, any HTTP client. Our proxies work with cURL, Python, Node.js, Go, and more — no SDK required.
              </p>
              <ul className="mt-4 space-y-2">
                {["Auto-rotate IPs per request", "Sticky sessions up to 60 min", "City-level geo-targeting via URL params", "Username:password or IP allowlist auth"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="sm" className="mt-4">
                <Link to="/docs">Read API Docs <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <p className="text-muted-foreground mb-2"># cURL — Residential proxy with US geo-targeting</p>
              <p><span className="text-primary">curl</span> -x http://user:pass@gate.upgradedproxy.com:7777 \</p>
              <p className="pl-4">-k https://httpbin.org/ip</p>
              <p className="mt-3 text-muted-foreground"># Python — Rotate per request</p>
              <p><span className="text-primary">import</span> requests</p>
              <p className="mt-1">proxies = {"{"}</p>
              <p className="pl-4">"http": "http://user:pass@gate.upgradedproxy.com:7777",</p>
              <p className="pl-4">"https": "http://user:pass@gate.upgradedproxy.com:7777"</p>
              <p>{"}"}</p>
              <p className="mt-1">r = requests.get("https://httpbin.org/ip", proxies=proxies)</p>
              <p><span className="text-primary">print</span>(r.json())</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proxy Solutions */}
      <section className="border-t py-12" style={{ background: "linear-gradient(180deg, hsl(220 40% 8%) 0%, hsl(220 35% 12%) 100%)" }}>
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Left column */}
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-bold text-white">Proxy Solutions</h2>
                <p className="mt-2 text-sm text-white/60">UpgradedProxy offers various types of proxy solutions, adapting to your data collection needs.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-bold text-white">Scraping Solutions</h3>
              </div>
            </div>

            {/* Right column — product cards */}
            <div className="space-y-3">
              {PRODUCTS.map((p) => (
                <div key={p.name} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-primary/40">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient}`}>
                    <p.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">{p.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-white/60">from </span>
                    <span className="text-xl font-bold text-white">{p.price}</span>
                    <span className="text-sm text-white/60">{p.unit}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Link to="/signup">{p.cta} <ChevronRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                    <Link to={p.link} className="text-xs text-white/50 hover:text-white transition-colors">
                      Learn More <ChevronRight className="inline h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Check className="h-4 w-4 text-primary" />
              Pay as you go Pricing available
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70">Looking for any custom plans?</span>
              <Button asChild variant="outline" size="sm" className="border-primary text-primary">
                <Link to="/pricing">Contact Support <ChevronRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t py-14 bg-muted/20">
        <div className="container">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">USE CASES</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Let UpgradedProxy Empower your Business</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Utilizing proxy solutions from UpgradedProxy can allow your corporation to grow further beyond your wildest expectations.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/use-cases">View All Use Cases <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <uc.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold">{uc.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                <Link to="/use-cases" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="border-t py-10">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="text-lg font-bold sm:text-xl">How We Compare</h2>
            <p className="mt-1 text-xs text-muted-foreground">Features most proxy providers don't offer — standard with us.</p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="pb-2 text-center font-semibold text-primary">UpgradedProxy</th>
                  <th className="pb-2 text-center font-medium text-muted-foreground">Others</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{row.feature}</td>
                    <td className="py-2.5 text-center">
                      {row.us ? <Check className="inline h-4 w-4 text-primary" /> : <XIcon className="inline h-4 w-4 text-muted-foreground/40" />}
                    </td>
                    <td className="py-2.5 text-center">
                      {row.others ? <Check className="inline h-4 w-4 text-muted-foreground/60" /> : <XIcon className="inline h-4 w-4 text-muted-foreground/40" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Locations preview */}
      <section className="border-t bg-muted/20 py-10">
        <div className="container">
          <h2 className="mb-6 text-center text-lg font-bold sm:text-xl">Global Coverage</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_LOCATIONS.map((loc) => (
              <div key={loc.name} className="flex items-center gap-3 rounded-md border bg-card p-3">
                <span className="text-xl">{loc.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">{loc.ips} IPs</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button asChild variant="outline" size="sm"><Link to="/locations">View All Locations →</Link></Button>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="border-t py-10">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-5">
              <div className="flex gap-1 text-primary">{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
              <p className="mt-2 text-xs text-muted-foreground italic">"The only proxy provider where our scraping success rate went from 72% to 99.4%. The no reverse DNS feature is a game changer."</p>
              <p className="mt-2 text-xs font-semibold">— Data Engineering Lead, Fortune 500</p>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex gap-1 text-primary">{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
              <p className="mt-2 text-xs text-muted-foreground italic">"Flat-rate pricing means we can budget predictably. No surprises, no tier negotiations. Just works."</p>
              <p className="mt-2 text-xs font-semibold">— VP of Operations, E-Commerce Platform</p>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex gap-1 text-primary">{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
              <p className="mt-2 text-xs text-muted-foreground italic">"We tested 6 providers. UpgradedProxy was the only one that passed our TLS fingerprint detection tests."</p>
              <p className="mt-2 text-xs font-semibold">— CTO, Cybersecurity Firm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="border-t bg-muted/20 py-10">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">No corners cut</p>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">Working only with certified partners</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Each of our upstream suppliers and server associates maintain industry quality standards and certifications. We ensure all information passing through our channels remains exceptionally safeguarded.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              {CERTIFICATIONS.map((cert) => (
                <div key={cert} className="flex items-center justify-center rounded-full border-2 border-muted-foreground/20 h-16 w-16 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground leading-tight">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t py-10">
        <div className="container mx-auto max-w-2xl">
          <h2 className="mb-4 text-center text-lg font-bold sm:text-xl">FAQ</h2>
          <div className="space-y-2">
            {FAQS.map((item) => (
              <details key={item.question} className="group rounded-md border px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium">{item.question}</summary>
                <p className="mt-2 text-xs text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-8">
        <div className="container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm font-medium">Ready to get started?</p>
          <Button asChild size="sm"><Link to="/signup">Create Free Account</Link></Button>
        </div>
      </section>
    </>
  );
}
