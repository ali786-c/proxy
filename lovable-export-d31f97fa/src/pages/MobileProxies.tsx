import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { useI18n } from "@/contexts/I18nContext";

const FAQ_ITEMS = [
  { question: "What are mobile proxies?", answer: "Mobile proxies route your traffic through real 4G and 5G IP addresses assigned by mobile carriers. These IPs are shared among thousands of real mobile users, giving them exceptionally high trust scores." },
  { question: "Why are mobile proxy IPs harder to block?", answer: "Mobile carrier IPs are shared by many real users through CGNAT. Blocking a single mobile IP would affect thousands of legitimate users, so websites rarely blacklist them." },
  { question: "Do you support 5G mobile proxies?", answer: "Yes. Our mobile proxy pool includes both 4G LTE and 5G connections across multiple carriers in supported countries." },
  { question: "How does IP rotation work on mobile proxies?", answer: "Mobile proxies rotate IPs by cycling through carrier assignments. You can trigger rotation on each request or maintain a sticky session for up to 60 minutes." },
  { question: "What authentication methods are available?", answer: "Mobile proxies support IP allowlist and username:password authentication, both configurable through the UpgradedProxy dashboard." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/proxy-api", label: "Proxy API" },
  { to: "/locations", label: "Proxy Locations" },
];

export default function MobileProxies() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead title="Mobile Proxies — 4G & 5G Carrier IPs" description="Premium 4G and 5G mobile proxies with real carrier IPs." canonical="https://upgraderpx.com/mobile-proxies" />
      <SchemaProduct name="UpgradedProxy Mobile Proxies" description="4G and 5G mobile carrier proxy service" price="2.95" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">{t("page.mobTitle")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("page.mobSub")}</p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("page.howItWorks")}</h2>
            <p className="mt-3 text-muted-foreground">Mobile proxies route your requests through IP addresses assigned by cellular carriers like AT&T, Vodafone, and T-Mobile. These IPs sit behind Carrier-Grade NAT (CGNAT), meaning each address is shared by hundreds or thousands of real mobile subscribers.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("page.useCases")}</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• <strong>Social media automation</strong> — Highest success rates for account operations</li>
              <li>• <strong>App testing</strong> — Test mobile experiences from real carrier networks</li>
              <li>• <strong>Ad verification</strong> — Verify mobile ad delivery across carriers and regions</li>
              <li>• <strong>Anti-detection browsing</strong> — Browse with genuine mobile fingerprints</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("page.authMethods")}</h2>
            <p className="mt-3 text-muted-foreground">Use <strong>IP allowlist</strong> for whitelist-based access or <strong>username:password</strong> for credential-based setups.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("page.rotVsSticky")}</h2>
            <p className="mt-3 text-muted-foreground"><strong>Rotating mode</strong> assigns a new mobile IP on every request. <strong>Sticky sessions</strong> maintain the same 4G/5G IP for up to 60 minutes.</p>
          </div>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}