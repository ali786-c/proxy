import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";

const COUNTRIES = [
  { name: "United States", flag: "🇺🇸", ips: "9,567,890+" },
  { name: "United Kingdom", flag: "🇬🇧", ips: "3,260,554+" },
  { name: "Germany", flag: "🇩🇪", ips: "3,221,909+" },
  { name: "France", flag: "🇫🇷", ips: "2,661,413+" },
  { name: "Japan", flag: "🇯🇵", ips: "3,345,678+" },
  { name: "Canada", flag: "🇨🇦", ips: "2,789,123+" },
  { name: "Australia", flag: "🇦🇺", ips: "2,123,456+" },
  { name: "South Korea", flag: "🇰🇷", ips: "1,987,654+" },
  { name: "Brazil", flag: "🇧🇷", ips: "1,856,321+" },
  { name: "India", flag: "🇮🇳", ips: "1,734,567+" },
  { name: "Netherlands", flag: "🇳🇱", ips: "1,456,789+" },
  { name: "Italy", flag: "🇮🇹", ips: "1,234,567+" },
  { name: "Spain", flag: "🇪🇸", ips: "1,123,456+" },
  { name: "Mexico", flag: "🇲🇽", ips: "987,654+" },
  { name: "Indonesia", flag: "🇮🇩", ips: "876,543+" },
  { name: "Turkey", flag: "🇹🇷", ips: "765,432+" },
  { name: "Poland", flag: "🇵🇱", ips: "654,321+" },
  { name: "Sweden", flag: "🇸🇪", ips: "543,210+" },
  { name: "Singapore", flag: "🇸🇬", ips: "432,109+" },
  { name: "South Africa", flag: "🇿🇦", ips: "321,098+" },
];

const FAQ_ITEMS = [
  { question: "How many proxy locations does UpgradedProxy offer?", answer: "We offer proxy IPs in 190+ countries with city-level targeting available in major markets." },
  { question: "Can I target a specific city or state?", answer: "Yes. For residential and mobile proxies, you can target specific states/regions and cities in supported countries." },
  { question: "How do I switch between proxy locations?", answer: "Use the geo-targeting parameter in your proxy configuration or API call." },
  { question: "Which countries have the most IPs?", answer: "The United States has the largest pool with 9.5M+ residential IPs, followed by Japan, the United Kingdom, and Germany." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/proxy-api", label: "Proxy API" },
  { to: "/pricing", label: "Pricing" },
];

export default function Locations() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead title="Proxy Locations — 190+ Countries" description="Browse UpgradedProxy's global proxy network in 190+ countries." canonical="https://upgraderpx.com/locations" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-12">
        <h1 className="text-3xl font-bold tracking-tight">{t("page.locTitle")}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t("page.locSub")}</p>
      </section>

      <section className="container pb-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COUNTRIES.map((c) => (
            <div key={c.name} className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30">
              <span className="text-2xl" role="img" aria-label={c.name}>{c.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.ips} IPs</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">{t("page.andMore")}</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/pricing">{t("page.viewPlans")}</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-10">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">{t("page.geoTargeting")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Select your target country, state, or city when configuring your proxy connection. Our routing engine assigns an IP from the matching location pool.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("page.useCases")}</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>• <strong>Localized SEO tracking</strong> — Monitor rankings from specific cities</li>
              <li>• <strong>Price comparison</strong> — See region-specific pricing</li>
              <li>• <strong>Content verification</strong> — Check geo-restricted content delivery</li>
              <li>• <strong>Ad verification</strong> — Verify localized ad campaigns</li>
            </ul>
          </div>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}