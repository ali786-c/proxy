import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { useI18n } from "@/contexts/I18nContext";

const FAQ_ITEMS = [
  { question: "What are ISP proxies?", answer: "ISP proxies combine the speed of datacenter infrastructure with the legitimacy of residential IPs." },
  { question: "How are ISP proxies different from residential proxies?", answer: "Residential proxies rotate through peer-to-peer IPs. ISP proxies are static, hosted on fast servers, and registered under real ISPs." },
  { question: "Can I keep the same ISP proxy IP for extended periods?", answer: "Yes. ISP proxies are static by nature, meaning you keep the same IP for the lifetime of your subscription." },
  { question: "What authentication do ISP proxies support?", answer: "Both IP allowlist and username:password authentication are supported." },
  { question: "What are ISP proxies used for?", answer: "Common use cases include social media management, e-commerce operations, sneaker and ticket purchasing, and any workflow requiring a stable residential-grade IP." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/locations", label: "Proxy Locations" },
  { to: "/pricing", label: "Pricing" },
];

export default function ISPProxies() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead title="ISP Proxies — Static Residential IPs at Datacenter Speed" description="Static ISP proxies with real residential IPs hosted on fast datacenter servers." canonical="https://upgraderpx.com/isp-proxies" />
      <SchemaProduct name="UpgradedProxy ISP Proxies" description="Static residential ISP proxy service" price="2.99" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">{t("page.ispTitle")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("page.ispSub")}</p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("page.howItWorks")}</h2>
            <p className="mt-3 text-muted-foreground">ISP proxies are IP addresses registered under real Internet Service Providers but hosted on high-performance server infrastructure. Websites see a legitimate residential IP while you enjoy datacenter speed and reliability.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("page.useCases")}</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• <strong>Social media management</strong> — Run multiple accounts with stable, trusted IPs</li>
              <li>• <strong>E-commerce operations</strong> — Maintain persistent sessions for purchasing workflows</li>
              <li>• <strong>Sneaker & ticket bots</strong> — Fast static IPs that bypass residential detection</li>
              <li>• <strong>Account creation</strong> — Reduce verification friction with ISP-grade trust</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container">
          <h2 className="text-2xl font-bold">{t("page.authMethods")}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Configure <strong>IP allowlist</strong> authentication for seamless, credential-free access from your servers. Alternatively, use <strong>username:password</strong> authentication for flexible multi-device setups.</p>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}