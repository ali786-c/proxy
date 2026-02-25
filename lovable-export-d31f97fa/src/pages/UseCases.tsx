import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Eye, TrendingUp, ShoppingCart, FileSearch, Database, Globe, Smartphone, Check, ArrowRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const USE_CASES = [
  { icon: Search, title: "Market Research", desc: "Collect competitive intelligence from any market, any region — without IP bans or CAPTCHAs.", details: ["Access geo-restricted content from 190+ countries", "Rotate IPs per request for large-scale collection", "No reverse DNS ensures your research stays private", "Flat-rate pricing means predictable budgets"], recommended: "Residential Proxies", link: "/residential-proxies" },
  { icon: Eye, title: "Ad Verification", desc: "Verify ad placements, detect fraud, and ensure brand safety across every region.", details: ["View ads as real users see them in each country", "Detect cloaking and redirect chains", "Mobile proxies for in-app ad verification", "City-level targeting for local ad checks"], recommended: "Mobile Proxies", link: "/mobile-proxies" },
  { icon: TrendingUp, title: "SEO Monitoring", desc: "Track search engine rankings from any location without triggering bot detection.", details: ["Monitor SERP positions across 190+ countries", "Undetectable requests — no fingerprint leaks", "Sticky sessions for consistent tracking", "High-speed datacenter proxies for bulk SERP checks"], recommended: "Datacenter Proxies", link: "/datacenter-proxies" },
  { icon: ShoppingCart, title: "Price Intelligence", desc: "Monitor competitor pricing in real-time across regions, currencies, and platforms.", details: ["Access localized pricing from any country", "Bypass anti-bot systems with residential IPs", "Rotate sessions to avoid rate limiting", "TLS fingerprint masking prevents detection"], recommended: "Residential Proxies", link: "/residential-proxies" },
  { icon: FileSearch, title: "Brand Protection", desc: "Detect counterfeit products, unauthorized sellers, and trademark violations worldwide.", details: ["Monitor e-commerce marketplaces globally", "Access region-locked platforms and listings", "Automated scanning with API integration", "No PTR records — your monitoring stays invisible"], recommended: "Static Residential (ISP)", link: "/isp-proxies" },
  { icon: Database, title: "Web Data Collection", desc: "Extract structured data at scale with undetectable, high-performance proxy infrastructure.", details: ["10M+ IPs for large-scale extraction", "Auto-rotate or sticky sessions per use case", "Zero proxy headers — traffic looks organic", "Budget-friendly datacenter proxies for high volume"], recommended: "Datacenter Proxies", link: "/datacenter-proxies" },
  { icon: Globe, title: "Geo-Content Testing", desc: "Test your website or app as users experience it from different countries and cities.", details: ["City-level geo-targeting in 190+ countries", "Test localization, CDN routing, and geo-fencing", "Verify content delivery and page load times", "SOCKS5 support for non-HTTP testing"], recommended: "Residential Proxies", link: "/residential-proxies" },
  { icon: Smartphone, title: "Social Media Management", desc: "Manage multiple accounts safely with unique mobile IPs that match real carrier fingerprints.", details: ["Real mobile carrier IPs — not datacenter", "Sticky sessions up to 60 minutes", "Country and city-level targeting", "TLS masking prevents platform detection"], recommended: "Mobile Proxies", link: "/mobile-proxies" },
];

const FAQ_ITEMS = [
  { question: "Which proxy type is best for my use case?", answer: "It depends on your needs. Residential proxies are best for general web access, datacenter for high-speed bulk operations, mobile for app testing, and ISP for long-running sessions." },
  { question: "Can I use multiple proxy types at once?", answer: "Yes. Your account supports all proxy types simultaneously." },
  { question: "Do you support custom integrations?", answer: "Absolutely. Our REST API and standard proxy protocols work with any tool, script, or platform." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/pricing", label: "Pricing" },
  { to: "/locations", label: "Locations" },
];

export default function UseCases() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead title="Use Cases — Proxy Solutions for Every Industry" description="From market research to brand protection, UpgradedProxy powers the most demanding proxy workflows." canonical="https://upgraderpx.com/use-cases" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-12 text-center">
        <h1 className="text-3xl font-bold">{t("page.ucTitle")}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{t("page.ucSub")}</p>
      </section>

      <section className="container pb-12">
        <div className="grid gap-4 lg:grid-cols-2">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><uc.icon className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold">{uc.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{uc.desc}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {uc.details.map((d) => (<li key={d} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3 w-3 text-primary shrink-0" /> {d}</li>))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-[10px] text-muted-foreground">Recommended: <span className="font-semibold text-foreground">{uc.recommended}</span></span>
                <Button asChild size="sm" variant="outline"><Link to={uc.link}>{t("section.learnMore")} <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-primary/5 py-8">
        <div className="container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm font-medium">{t("page.notSure")}</p>
          <Button asChild size="sm"><Link to="/signup">{t("hero.getStarted")}</Link></Button>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}