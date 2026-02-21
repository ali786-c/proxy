import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";

// Primary: mobile proxies | Secondary: 4G mobile proxy, 5G proxy, mobile IP rotation, carrier proxy, mobile proxy network
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
  return (
    <>
      <SEOHead
        title="Mobile Proxies — 4G & 5G Carrier IPs"
        description="Premium 4G and 5G mobile proxies with real carrier IPs. Highest trust scores, automatic rotation, and global mobile proxy coverage from UpgradedProxy."
        canonical="https://upgraderpx.com/mobile-proxies"
      />
      <SchemaProduct name="UpgradedProxy Mobile Proxies" description="4G and 5G mobile carrier proxy service with automatic IP rotation" price="5.72" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">Mobile Proxies</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Connect through real 4G and 5G mobile carrier IPs — the most trusted proxy type available. Mobile IPs are shared by thousands of real users via CGNAT, making them virtually impossible to blacklist.
        </p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">How Mobile Proxies Work</h2>
            <p className="mt-3 text-muted-foreground">
              Mobile proxies route your requests through IP addresses assigned by cellular carriers like AT&T, Vodafone, and T-Mobile. These IPs sit behind Carrier-Grade NAT (CGNAT), meaning each address is shared by hundreds or thousands of real mobile subscribers. This shared usage makes mobile proxy IPs the hardest to detect and the most trusted by websites.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Use Cases</h2>
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
            <h2 className="text-2xl font-bold">Authentication</h2>
            <p className="mt-3 text-muted-foreground">
              Use <strong>IP allowlist</strong> for whitelist-based access or <strong>username:password</strong> for credential-based setups. Both methods are configurable from the proxy dashboard and supported through our REST API.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Rotating vs Sticky Sessions</h2>
            <p className="mt-3 text-muted-foreground">
              <strong>Rotating mode</strong> assigns a new mobile IP on every request, distributing your traffic across the carrier pool. <strong>Sticky sessions</strong> maintain the same 4G/5G IP for up to 60 minutes — essential for login flows, checkout processes, and session-dependent operations.
            </p>
          </div>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}
