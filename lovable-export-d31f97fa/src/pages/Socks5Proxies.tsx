import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { useI18n } from "@/contexts/I18nContext";

const FAQ_ITEMS = [
  { question: "What are SOCKS5 proxies?", answer: "SOCKS5 proxies operate at a lower network level than HTTP proxies, supporting any type of traffic including TCP and UDP." },
  { question: "What is the difference between SOCKS5 and HTTP proxies?", answer: "HTTP proxies only handle HTTP/HTTPS traffic. SOCKS5 proxies forward any traffic type without modification." },
  { question: "Do SOCKS5 proxies support UDP?", answer: "Yes. SOCKS5 is the only proxy protocol that natively supports UDP connections." },
  { question: "How do I authenticate with SOCKS5 proxies?", answer: "UpgradedProxy SOCKS5 connections support both IP allowlist and username:password authentication methods." },
  { question: "Can I use SOCKS5 with rotating IPs?", answer: "Yes. Our SOCKS5 proxy service supports rotating residential, datacenter, and mobile IPs with full SOCKS5 protocol support." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/proxy-api", label: "Proxy API" },
  { to: "/pricing", label: "Pricing" },
];

export default function Socks5Proxies() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead title="SOCKS5 Proxies — Protocol-Agnostic Proxy Service" description="SOCKS5 proxy service supporting TCP and UDP traffic." canonical="https://upgraderpx.com/socks5-proxies" />
      <SchemaProduct name="UpgradedProxy SOCKS5 Proxies" description="Protocol-agnostic SOCKS5 proxy service" price="0.99" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">{t("page.s5Title")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("page.s5Sub")}</p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("page.howItWorks")}</h2>
            <p className="mt-3 text-muted-foreground">SOCKS5 operates at the session layer (Layer 5) of the network stack, forwarding packets between client and server without inspecting or modifying the data.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("page.useCases")}</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• <strong>Gaming</strong> — Low-latency UDP support for online gaming</li>
              <li>• <strong>Streaming</strong> — Access geo-restricted media through SOCKS5 tunnels</li>
              <li>• <strong>P2P applications</strong> — Route torrent traffic securely</li>
              <li>• <strong>Custom protocols</strong> — Any TCP/UDP application works out of the box</li>
              <li>• <strong>Email operations</strong> — Route SMTP/IMAP through diverse IPs</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container">
          <h2 className="text-2xl font-bold">{t("page.authMethods")}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Connect with <strong>IP allowlist</strong> for automatic authentication or <strong>username:password</strong> for maximum flexibility.</p>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}