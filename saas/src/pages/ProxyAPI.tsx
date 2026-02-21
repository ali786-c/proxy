import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaProduct, SchemaFAQ } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";

// Primary: proxy API | Secondary: proxy REST API, programmatic proxy, proxy management API, proxy automation, proxy endpoint API
const FAQ_ITEMS = [
  { question: "What is the UpgradedProxy API?", answer: "Our REST API lets you programmatically manage proxy configurations, rotate IPs, check usage, and control your entire proxy infrastructure from your own applications." },
  { question: "What can I do with the proxy API?", answer: "You can create and manage proxy users, configure geo-targeting, rotate IPs on demand, monitor bandwidth consumption, manage authentication credentials, and retrieve real-time proxy performance metrics." },
  { question: "What authentication does the API use?", answer: "The API uses Bearer token authentication. Generate your API key from the proxy dashboard and include it in the Authorization header of every request." },
  { question: "Is there a rate limit on API calls?", answer: "Standard plans allow up to 1,000 API requests per minute. Enterprise plans offer custom rate limits based on your needs." },
  { question: "Do you provide API client libraries?", answer: "We provide official client libraries for Python, Node.js, Go, and PHP, along with comprehensive REST API documentation with curl examples." },
];

const RELATED = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/docs", label: "Documentation" },
  { to: "/pricing", label: "Pricing" },
];

export default function ProxyAPI() {
  return (
    <>
      <SEOHead
        title="Proxy API — Programmatic Proxy Management"
        description="REST API for managing proxies programmatically. Create users, rotate IPs, configure geo-targeting, and monitor usage. Full proxy automation from UpgradedProxy."
        canonical="https://upgraderpx.com/proxy-api"
      />
      <SchemaProduct name="UpgradedProxy API" description="REST API for programmatic proxy management and automation" price="0" />
      <SchemaFAQ items={FAQ_ITEMS} />

      <section className="container py-16">
        <h1 className="text-4xl font-bold tracking-tight">Proxy API</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Full programmatic control over your proxy infrastructure. UpgradedProxy's REST API lets you automate proxy management, rotate IPs on demand, configure geo-targeting, and integrate proxy controls directly into your applications.
        </p>
      </section>

      <section className="border-t py-12">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">How the Proxy API Works</h2>
            <p className="mt-3 text-muted-foreground">
              Authenticate with your API key and make standard REST calls to manage every aspect of your proxy setup. The API returns JSON responses and follows RESTful conventions — list, create, update, and delete resources with predictable endpoints.
            </p>
            <div className="mt-4 rounded-md border bg-muted/50 p-4">
              <code className="text-xs text-muted-foreground">
                GET /api/v1/proxies<br />
                POST /api/v1/proxies/rotate<br />
                GET /api/v1/usage/bandwidth<br />
                PUT /api/v1/settings/geo-target
              </code>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Use Cases</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• <strong>Automated proxy rotation</strong> — Trigger IP changes programmatically</li>
              <li>• <strong>Dynamic geo-targeting</strong> — Switch locations per request via API</li>
              <li>• <strong>Usage monitoring</strong> — Track bandwidth and request counts in real time</li>
              <li>• <strong>User management</strong> — Create sub-users and manage access programmatically</li>
              <li>• <strong>Webhook integrations</strong> — Receive alerts on usage thresholds and errors</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container">
          <h2 className="text-2xl font-bold">Authentication & Security</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Generate API keys from your proxy dashboard. Include your key as a Bearer token in the Authorization header. All API traffic is encrypted over HTTPS, and you can restrict API keys by IP allowlist for additional security.
          </p>
        </div>
      </section>

      <FAQSection items={FAQ_ITEMS} />
      <InternalLinks links={RELATED} />
    </>
  );
}
