import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Globe, Server, Wifi, Monitor, Shield } from "lucide-react";

// Evomi source prices + 30% markup, EUR, flat rate
const PRODUCTS = [
  {
    id: "residential",
    name: "Residential Proxies",
    desc: "Affordable browsing without compromise",
    price: "€1.28",
    unit: "/GB",
    icon: Globe,
    color: "bg-red-50 text-red-500 dark:bg-red-500/10",
    link: "/residential-proxies",
  },
  {
    id: "premium-residential",
    name: "Premium Residential",
    desc: "Premium browsing for unmatched performance",
    price: "€5.72",
    unit: "/GB",
    icon: Shield,
    color: "bg-green-50 text-green-600 dark:bg-green-500/10",
    link: "/residential-proxies",
  },
  {
    id: "static-residential",
    name: "Static Residential Proxies",
    desc: "Real high quality static residential proxies",
    price: "€6.50",
    unit: "/IP",
    icon: Wifi,
    color: "bg-orange-50 text-orange-500 dark:bg-orange-500/10",
    link: "/isp-proxies",
  },
  {
    id: "mobile",
    name: "Mobile Proxies",
    desc: "Utilize real mobile devices with our proxies",
    price: "€5.72",
    unit: "/GB",
    icon: Monitor,
    color: "bg-purple-50 text-purple-500 dark:bg-purple-500/10",
    link: "/mobile-proxies",
  },
  {
    id: "datacenter",
    name: "Datacenter Proxies",
    desc: "Blazing fast and budget friendly IPs",
    price: "€0.78",
    unit: "/GB",
    icon: Server,
    color: "bg-blue-50 text-blue-500 dark:bg-blue-500/10",
    link: "/datacenter-proxies",
  },
];

const FAQ_ITEMS = [
  { question: "Why is there only one price per product?", answer: "We believe in fair, transparent pricing. Whether you use 1 GB or 1,000 GB, you pay the same rate per unit. No volume tricks, no hidden tiers." },
  { question: "Can I switch products at any time?", answer: "Yes. You can use any combination of proxy types from your account. Each product is billed at its flat rate." },
  { question: "Is there a free trial?", answer: "Yes. Every new account gets a trial with bandwidth to test our network quality before committing." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and crypto. Enterprise customers can pay via wire transfer." },
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

export default function Pricing() {
  return (
    <>
      <SEOHead
        title="Pricing — Flat-Rate Proxy Plans in EUR"
        description="Transparent flat-rate proxy pricing in euros. Residential €1.28/GB, datacenter €0.78/GB, mobile €5.72/GB. Same price for everyone — no volume tricks."
        canonical="https://upgraderpx.com/pricing"
      />
      <SchemaProduct name="UpgradedProxy Residential Proxies" description="10M+ residential proxy IPs with geo-targeting" price="1.28" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      {/* Hero */}
      <section className="container py-12 text-center">
        <h1 className="text-3xl font-bold">Products Pricing</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Transparent, flat-rate pricing — no hidden fees, no volume tricks. Everyone pays the same fair rate.
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Money Back Guarantee</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> No Reverse Lookup</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Pay Only What You Use</span>
        </div>
      </section>

      {/* Our Proxies - evomi-style grid */}
      <section className="container pb-12">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Our Proxies</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <Link
              key={p.id}
              to={p.link}
              className="group flex items-start gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className={`rounded-lg p-2.5 ${p.color}`}>
                <p.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Starting from <span className="font-bold text-foreground">{p.price}{p.unit}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </Link>
          ))}

          {/* Free trial card */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-5 text-center">
            <span className="text-lg">🌐</span>
            <h3 className="mt-2 text-sm font-semibold">Try our proxies for free</h3>
            <p className="mt-1 text-xs text-muted-foreground">UpgradedProxy offers a free trial for all users</p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to="/signup">Try for Free →</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          All prices in EUR. Same rate regardless of volume. <Link to="/docs" className="text-primary hover:underline">Contact us</Link> for custom integrations.
        </p>
      </section>

      {/* Why Choose Section */}
      <section className="border-t bg-muted/20 py-10">
        <div className="container">
          <h2 className="mb-6 text-center text-lg font-bold">Why Choose UpgradedProxy</h2>
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {[
              { title: "One Price For All", desc: "No volume discounts, no confusing tiers. Pay the same fair rate whether you use 1 GB or 1,000 GB." },
              { title: "99.9% Uptime SLA", desc: "Enterprise-grade infrastructure monitored 24/7 with automatic failover." },
              { title: "Swiss-Grade Privacy", desc: "No activity logs. No reverse DNS lookup. Zero data retention." },
              { title: "Dedicated Support", desc: "Live chat for everyone. Priority support for high-volume accounts." },
            ].map((f) => (
              <div key={f.title} className="rounded-md border bg-card p-4">
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}
