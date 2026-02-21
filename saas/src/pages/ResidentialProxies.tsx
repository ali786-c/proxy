import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";

// Primary: residential proxies | Secondary: rotating residential proxy, residential IP, geo-targeted proxy, residential proxy provider, backconnect proxy, real residential IP
const FAQ_ITEMS = [
  { question: "What are residential proxies?", answer: "Residential proxies route your traffic through real IP addresses assigned by Internet Service Providers to homeowners, making your requests appear as genuine residential users." },
  { question: "How does rotating residential proxy work?", answer: "Each request is routed through a different residential IP from our pool. You can configure rotation intervals or use sticky sessions to keep the same IP for a set duration." },
  { question: "Can I target specific countries or cities?", answer: "Yes. UpgradedProxy supports geo-targeted residential proxies in 190+ countries with city-level targeting in major markets." },
  { question: "How do I authenticate my residential proxy connection?", answer: "We support both IP allowlist authentication and username:password credentials. You can configure either method from the proxy dashboard." },
  { question: "What is the difference between rotating and sticky sessions?", answer: "Rotating sessions assign a new residential IP per request for maximum anonymity. Sticky sessions hold the same IP for up to 30 minutes, ideal for multi-step workflows." },
  { question: "Are residential proxies legal?", answer: "Yes. Residential proxies are legal when used for legitimate purposes such as market research, ad verification, brand protection, and SEO monitoring." },
];

const RELATED = [
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/locations", label: "Proxy Locations" },
  { to: "/proxy-api", label: "Proxy API" },
];

export default function ResidentialProxies() {
  return (
    <>
      <SEOHead
        title="Residential Proxies — Real IPs, Global Coverage"
        description="Premium rotating residential proxies with 10M+ real IPs in 190+ countries. Geo-targeted, fast, and reliable residential proxy service from UpgradedProxy."
        canonical="https://upgraderpx.com/residential-proxies"
      />
      <SchemaProduct name="UpgradedProxy Residential Proxies" description="Rotating residential proxy service with 10M+ real IPs in 190+ countries" price="1.28" currency="EUR" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">Residential Proxies</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Access 10 million+ real residential IPs across 190+ countries. UpgradedProxy's residential proxy network delivers genuine traffic from ISP-assigned addresses — ideal for web scraping, ad verification, and market research at scale.
        </p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">How Residential Proxies Work</h2>
            <p className="mt-3 text-muted-foreground">
              When you connect through our residential proxy network, your request is routed through a real IP address assigned by an Internet Service Provider to a residential device. This makes your traffic indistinguishable from a regular household user, enabling high success rates even on heavily protected websites.
            </p>
            <p className="mt-3 text-muted-foreground">
              Our backconnect gateway automatically selects the best residential IP from the pool based on your geo-targeting preferences. You connect to a single endpoint and we handle the rotation behind the scenes.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Use Cases</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• <strong>Web scraping & data collection</strong> — Gather pricing data, product listings, and public datasets at scale</li>
              <li>• <strong>Ad verification</strong> — Verify ad placements and detect fraud across markets</li>
              <li>• <strong>Brand protection</strong> — Monitor unauthorized use of trademarks and IP</li>
              <li>• <strong>SEO monitoring</strong> — Track search engine rankings from localized perspectives</li>
              <li>• <strong>Market research</strong> — Access geo-restricted content for competitive analysis</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Authentication Methods</h2>
            <p className="mt-3 text-muted-foreground">
              UpgradedProxy supports two authentication methods for residential proxy access. <strong>IP allowlist</strong> lets you authorize specific server IPs from the proxy dashboard — no credentials needed in your code. <strong>Username and password</strong> authentication embeds your credentials directly in the proxy URL, ideal for distributed setups or cloud environments.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Rotating vs Sticky Sessions</h2>
            <p className="mt-3 text-muted-foreground">
              <strong>Rotating sessions</strong> assign a fresh residential IP on every request, maximizing anonymity and distributing load across the pool. <strong>Sticky sessions</strong> hold the same IP for a configurable duration (up to 30 minutes), giving you session persistence for login flows, shopping carts, or multi-page scraping.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t py-12">
        <div className="container">
          <h2 className="text-2xl font-bold">Geo-Targeted Residential Proxy Coverage</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Target specific countries, states, or cities with our residential proxy network. We maintain deep IP pools in the United States, United Kingdom, Germany, Japan, Brazil, India, and 180+ more countries. Use our API or proxy dashboard to configure location-based routing in seconds.
          </p>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}
