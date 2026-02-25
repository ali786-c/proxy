import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Globe, Server, Wifi, Monitor, Shield, Zap } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const PRODUCT_OVERVIEW = [
  { id: "residential", name: "Residential Proxies", desc: "The cheapest residential proxies on the market", price: "€0.99", unit: "/GB", icon: Globe, color: "bg-red-50 text-red-500 dark:bg-red-500/10", link: "/residential-proxies", tab: "residential" },
  { id: "premium", name: "Premium Residential", desc: "Premium browsing for unmatched performance", price: "€2.99", unit: "/GB", icon: Shield, color: "bg-green-50 text-green-600 dark:bg-green-500/10", link: "/residential-proxies", tab: "premium" },
  { id: "mobile", name: "Mobile Proxies", desc: "Real 3G/4G/5G mobile device connections", price: "€2.95", unit: "/GB", icon: Monitor, color: "bg-purple-50 text-purple-500 dark:bg-purple-500/10", link: "/mobile-proxies", tab: "mobile" },
  { id: "datacenter", name: "Datacenter Proxies", desc: "Blazing fast and budget friendly IPs", price: "€0.79", unit: "/GB", icon: Server, color: "bg-blue-50 text-blue-500 dark:bg-blue-500/10", link: "/datacenter-proxies", tab: "datacenter" },
  { id: "static", name: "Static Residential (ISP)", desc: "ISP IPs with unlimited bandwidth", price: "€2.99", unit: "/IP", icon: Wifi, color: "bg-orange-50 text-orange-500 dark:bg-orange-500/10", link: "/isp-proxies", tab: "static" },
];

const RESIDENTIAL_PLANS = [
  { plan: "Pay as you go", gb: "1 GB", perGb: "€0.99", monthly: "—", manager: false, min: 6 },
  { plan: "Monthly Plan", gb: "100 GB", perGb: "€0.89", monthly: "€89.00/mo", manager: false, min: 100 },
];

const PREMIUM_TIERS = [
  { plan: "Pay as you go", gb: "1 GB", perGb: "€2.99", monthly: "—", manager: false, min: 2 },
  { plan: "Flex Plan", gb: "8 GB", perGb: "€2.79", monthly: "€22.32/mo", manager: false, min: 8 },
  { plan: "Pro Plan", gb: "25 GB", perGb: "€2.59", monthly: "€64.75/mo", manager: false, min: 25 },
  { plan: "Advanced Plan", gb: "50 GB", perGb: "€2.39", monthly: "€119.50/mo", manager: false, min: 50 },
  { plan: "Business Plan", gb: "100 GB", perGb: "€2.19", monthly: "€219.00/mo", manager: true, min: 100 },
  { plan: "Scale Plan", gb: "250 GB", perGb: "€1.99", monthly: "€497.50/mo", manager: true, min: 250 },
  { plan: "Growth Plan", gb: "500 GB", perGb: "€1.79", monthly: "€895.00/mo", manager: true, min: 500 },
  { plan: "Enterprise 1K", gb: "1,000 GB", perGb: "€1.59", monthly: "€1,590.00/mo", manager: true, min: 1000 },
  { plan: "Enterprise 2K", gb: "2,000 GB", perGb: "€1.39", monthly: "€2,780.00/mo", manager: true, min: 2000 },
  { plan: "Enterprise 5K", gb: "5,000 GB", perGb: "€1.19", monthly: "€5,950.00/mo", manager: true, min: 5000 },
];

const MOBILE_TIERS = [
  { plan: "Pay as you go", gb: "1 GB", perGb: "€2.95", monthly: "—", manager: false, min: 2 },
  { plan: "Flex Plan", gb: "8 GB", perGb: "€2.79", monthly: "€22.32/mo", manager: false, min: 8 },
  { plan: "Pro Plan", gb: "25 GB", perGb: "€2.59", monthly: "€64.75/mo", manager: false, min: 25 },
  { plan: "Advanced Plan", gb: "50 GB", perGb: "€2.39", monthly: "€119.50/mo", manager: false, min: 50 },
  { plan: "Business Plan", gb: "100 GB", perGb: "€2.19", monthly: "€219.00/mo", manager: true, min: 100 },
  { plan: "Scale Plan", gb: "250 GB", perGb: "€1.99", monthly: "€497.50/mo", manager: true, min: 250 },
  { plan: "Growth Plan", gb: "500 GB", perGb: "€1.79", monthly: "€895.00/mo", manager: true, min: 500 },
  { plan: "Enterprise 1K", gb: "1,000 GB", perGb: "€1.59", monthly: "€1,590.00/mo", manager: true, min: 1000 },
  { plan: "Enterprise 2K", gb: "2,000 GB", perGb: "€1.39", monthly: "€2,780.00/mo", manager: true, min: 2000 },
  { plan: "Enterprise 5K", gb: "5,000 GB", perGb: "€1.19", monthly: "€5,950.00/mo", manager: true, min: 5000 },
];

const DATACENTER_TIERS = [
  { plan: "Pay as you go", gb: "1 GB", perGb: "€0.79", monthly: "—", manager: false, min: 7 },
  { plan: "Basic Plan", gb: "200 GB", perGb: "€0.69", monthly: "€138.00/mo", manager: false, min: 200 },
  { plan: "Standard Plan", gb: "500 GB", perGb: "€0.59", monthly: "€295.00/mo", manager: true, min: 500 },
  { plan: "Advanced Plan", gb: "1,000 GB", perGb: "€0.49", monthly: "€490.00/mo", manager: true, min: 1000 },
];

const STATIC_TIERS = [
  { type: "Shared IPs", price: "€2.99", unit: "/IP", desc: "Shared with other users", features: ["Unlimited Bandwidth", "Entry-level pricing", "Billed monthly per IP"], min: 2 },
  { type: "Private IPs", price: "€4.99", unit: "/IP", desc: "Dedicated to 1 user", features: ["Unlimited Bandwidth", "Low Fraud Score", "Billed monthly per IP"], min: 1 },
  { type: "Virgin IPs", price: "€7.99", unit: "/IP", desc: "0 Fraud score guaranteed", features: ["Unlimited Bandwidth", "Dedicated to 1 user", "Billed monthly per IP"], min: 1 },
];

const FAQ_ITEMS = [
  { question: "Why is there only one price per product?", answer: "We believe in fair, transparent pricing. Our pay-as-you-go rates are flat — no hidden tiers. Volume plans simply offer lower rates for higher commitment." },
  { question: "What is the minimum purchase?", answer: "The minimum spend per transaction is €5. Minimum quantities vary by product — e.g. 6 GB for residential, 1 GB for premium/mobile, 7 GB for datacenter, and varies by IP type for static." },
  { question: "Can I switch products at any time?", answer: "Yes. You can use any combination of proxy types from your account. Each product is billed at its own rate." },
  { question: "Do you offer a money-back guarantee?", answer: "Yes. We offer a money-back guarantee within the first 3 days if you've used less than 1 GB or 10% of your purchase — no questions asked." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards via Stripe, PayPal, and crypto (BTC, LTC, SOL, TRX, BNB). Crypto payments are VAT-free. Card and PayPal payments include 22% VAT." },
  { question: "Are there overage charges?", answer: "No surprise charges. When you reach your balance limit, proxies pause until you top up." },
  { question: "What is your refund policy?", answer: "We offer a money-back guarantee within the first 3 days, no questions asked." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/locations", label: "Proxy Locations" },
];

function PricingTable({ tiers, unitLabel = "/GB", t }: { tiers: typeof PREMIUM_TIERS; unitLabel?: string; t: (k: string) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="py-3 pr-4">Plan</th>
            <th className="py-3 pr-4">Bandwidth</th>
            <th className="py-3 pr-4">Account Manager</th>
            <th className="py-3 pr-4">Price {unitLabel}</th>
            <th className="py-3 pr-4">Monthly Price</th>
            <th className="py-3" />
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
              <td className="py-3 pr-4 font-medium">{tier.plan}</td>
              <td className="py-3 pr-4 text-muted-foreground">{tier.gb}</td>
              <td className="py-3 pr-4">
                {tier.manager ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-3 pr-4 font-bold">{tier.perGb}</td>
              <td className="py-3 pr-4 text-muted-foreground">{tier.monthly}</td>
              <td className="py-3">
                <Button asChild size="sm" variant={i === 0 ? "default" : "outline"} className="text-xs">
                  <Link to="/signup">{i === 0 ? t("page.buyNow") : t("page.subscribe")}</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t("page.customContact")} <Link to="/docs" className="text-primary hover:underline">{t("section.contactSupport")}</Link>
      </p>
    </div>
  );
}

export default function Pricing() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead
        title="Pricing — Flat-Rate Proxy Plans in EUR"
        description="Transparent proxy pricing in euros. Residential from €0.99/GB, datacenter from €0.79/GB, premium from €2.99/GB, mobile from €2.95/GB. Volume discounts available."
        canonical="https://upgraderpx.com/pricing"
      />
      <SchemaProduct name="UpgradedProxy Residential Proxies" description="54M+ residential proxy IPs with geo-targeting" price="0.99" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-12 text-center">
        <h1 className="text-3xl font-bold">{t("page.pricingTitle")}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{t("page.pricingSub")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> {t("page.moneyBack")}</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> {t("page.minTx")}</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> {t("page.payOnly")}</span>
        </div>
      </section>

      <section className="container pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("page.ourProxies")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_OVERVIEW.map((p) => (
            <Link key={p.id} to={p.link} className="group flex items-start gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/40">
              <div className={`rounded-lg p-2.5 ${p.color}`}><p.icon className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {t("section.from")} <span className="font-bold text-foreground">{p.price}{p.unit}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </Link>
          ))}
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-5 text-center">
            <span className="text-lg">🛡️</span>
            <h3 className="mt-2 text-sm font-semibold">{t("page.moneyBack")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">3-day refund policy — no questions asked</p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to="/signup">{t("hero.getStarted")} →</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <h2 className="mb-6 text-center text-lg font-bold">{t("page.detailedPricing")}</h2>
        <Tabs defaultValue="residential" className="w-full">
          <TabsList className="mx-auto mb-6 flex w-full max-w-2xl flex-wrap h-auto gap-1">
            <TabsTrigger value="residential" className="flex-1 min-w-[120px]">Residential</TabsTrigger>
            <TabsTrigger value="premium" className="flex-1 min-w-[120px]">Premium</TabsTrigger>
            <TabsTrigger value="mobile" className="flex-1 min-w-[120px]">Mobile</TabsTrigger>
            <TabsTrigger value="datacenter" className="flex-1 min-w-[120px]">Datacenter</TabsTrigger>
            <TabsTrigger value="static" className="flex-1 min-w-[120px]">Static ISP</TabsTrigger>
          </TabsList>

          <TabsContent value="residential">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2.5 text-red-500 dark:bg-red-500/10"><Globe className="h-5 w-5" /></div>
                <div><h3 className="font-semibold">Core Residential Proxies</h3><p className="text-xs text-muted-foreground">High quality and fast — the cheapest on the market</p></div>
              </div>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-4 text-center"><p className="text-xs text-muted-foreground">54M+</p><p className="text-sm font-semibold">Residential IPs</p></div>
                <div className="rounded-md border p-4 text-center"><p className="text-xs text-muted-foreground">190+</p><p className="text-sm font-semibold">{t("stats.countries")}</p></div>
                <div className="rounded-md border p-4 text-center"><p className="text-xs text-muted-foreground">Rotating & Sticky</p><p className="text-sm font-semibold">IP Sessions</p></div>
              </div>
              <PricingTable tiers={RESIDENTIAL_PLANS} t={t} />
            </div>
          </TabsContent>

          <TabsContent value="premium">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5 text-green-600 dark:bg-green-500/10"><Shield className="h-5 w-5" /></div>
                <div><h3 className="font-semibold">Premium Residential Proxies</h3><p className="text-xs text-muted-foreground">Smooth browsing with no blocks</p></div>
              </div>
              <PricingTable tiers={PREMIUM_TIERS} t={t} />
            </div>
          </TabsContent>

          <TabsContent value="mobile">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2.5 text-purple-500 dark:bg-purple-500/10"><Monitor className="h-5 w-5" /></div>
                <div><h3 className="font-semibold">{t("page.mobTitle")}</h3><p className="text-xs text-muted-foreground">Real 3G/4G/5G connections</p></div>
              </div>
              <PricingTable tiers={MOBILE_TIERS} t={t} />
            </div>
          </TabsContent>

          <TabsContent value="datacenter">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-500 dark:bg-blue-500/10"><Server className="h-5 w-5" /></div>
                <div><h3 className="font-semibold">{t("page.dcTitle")}</h3><p className="text-xs text-muted-foreground">Blazing fast, budget friendly</p></div>
              </div>
              <PricingTable tiers={DATACENTER_TIERS} t={t} />
            </div>
          </TabsContent>

          <TabsContent value="static">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2.5 text-orange-500 dark:bg-orange-500/10"><Wifi className="h-5 w-5" /></div>
                <div><h3 className="font-semibold">{t("page.ispTitle")}</h3><p className="text-xs text-muted-foreground">ISP IPs with unlimited bandwidth</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {STATIC_TIERS.map((tier) => (
                  <div key={tier.type} className="rounded-lg border p-5 text-center">
                    <h4 className="font-semibold">{tier.type}</h4>
                    <p className="mt-1 text-2xl font-bold">{tier.price}<span className="text-sm font-normal text-muted-foreground">{tier.unit}</span></p>
                    <p className="mt-1 text-xs text-muted-foreground">{tier.desc}</p>
                    <ul className="mt-3 space-y-1.5 text-left">
                      {tier.features.map((f) => (<li key={f} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3 w-3 text-primary shrink-0" /> {f}</li>))}
                    </ul>
                    <Button asChild size="sm" className="mt-4 w-full"><Link to="/signup">{t("page.buyNow")}</Link></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}
