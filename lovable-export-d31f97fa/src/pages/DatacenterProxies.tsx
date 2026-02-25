import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { useI18n } from "@/contexts/I18nContext";

const FAQ_ITEMS = [
  { question: "What are datacenter proxies?", answer: "Datacenter proxies use IP addresses hosted in data centers rather than residential ISPs. They offer extremely fast speeds and are ideal for high-volume tasks where raw performance matters." },
  { question: "What is the difference between shared and private datacenter proxies?", answer: "Shared datacenter proxies are used by multiple customers simultaneously, keeping costs low. Private datacenter proxies are dedicated to your account exclusively." },
  { question: "How fast are datacenter proxies compared to residential?", answer: "Datacenter proxies are significantly faster, typically offering sub-50ms latency and higher bandwidth since they run on enterprise-grade server infrastructure." },
  { question: "Can I use datacenter proxies for web scraping?", answer: "Yes. Datacenter proxies work well for scraping sites that don't have aggressive anti-bot protections." },
  { question: "Do you support HTTP and HTTPS with datacenter proxies?", answer: "Yes. All datacenter proxies support both HTTP and HTTPS protocols, with optional SOCKS5 support available." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/proxy-api", label: "Proxy API" },
  { to: "/pricing", label: "Pricing" },
];

export default function DatacenterProxies() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead title="Datacenter Proxies — Fast & Affordable" description="High-speed datacenter proxies with shared and private IP options." canonical="https://upgraderpx.com/datacenter-proxies" />
      <SchemaProduct name="UpgradedProxy Datacenter Proxies" description="High-speed shared and private datacenter proxy service" price="0.79" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">{t("page.dcTitle")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("page.dcSub")}</p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("page.howItWorks")}</h2>
            <p className="mt-3 text-muted-foreground">Datacenter proxies route your traffic through high-speed servers hosted in professional data centers. Unlike residential IPs, these addresses are not tied to an ISP — they deliver raw speed and are optimized for high-throughput operations.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("page.useCases")}</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• <strong>High-volume scraping</strong> — Collect large datasets quickly at minimal cost</li>
              <li>• <strong>Price monitoring</strong> — Track competitor pricing across thousands of SKUs</li>
              <li>• <strong>Automated testing</strong> — Run QA suites through diverse IP endpoints</li>
              <li>• <strong>Account management</strong> — Manage multiple accounts with dedicated IPs</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("page.authMethods")}</h2>
            <p className="mt-3 text-muted-foreground">Authenticate with <strong>IP allowlist</strong> for zero-credential setups, or use <strong>username:password</strong> in your proxy configuration.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("page.sharedVsPrivate")}</h2>
            <p className="mt-3 text-muted-foreground"><strong>Shared datacenter proxies</strong> distribute costs across users while maintaining solid performance. <strong>Private datacenter proxies</strong> give you exclusive use of dedicated IPs.</p>
          </div>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}