import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import DOMPurify from "dompurify";
import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaOrg } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/lib/seo/JsonLd";
import { Clock, ArrowLeft } from "lucide-react";
import type { PublicPost } from "@/lib/api/blog";

// ── Money page links ──────────────────────────────────
const MONEY_LINKS = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/proxy-api", label: "Proxy API" },
];

// ── Mock full posts ───────────────────────────────────
const MOCK_POSTS: Record<string, PublicPost> = {
  "best-residential-proxies-2026": {
    slug: "best-residential-proxies-2026",
    title: "Best Residential Proxies in 2026",
    excerpt: "A comprehensive guide to choosing the best residential proxy providers.",
    category: "Guides",
    tags: ["residential", "rotating", "geo-targeting"],
    author: "UpgradedProxy Team",
    published_at: "2026-02-18",
    reading_time_min: 8,
    cover_image: null,
    headings: [
      { id: "what-are-residential-proxies", text: "What Are Residential Proxies?", level: 2 },
      { id: "key-features", text: "Key Features to Look For", level: 2 },
      { id: "rotating-vs-sticky", text: "Rotating vs Sticky Sessions", level: 2 },
      { id: "use-cases", text: "Top Use Cases", level: 2 },
      { id: "pricing-comparison", text: "Pricing Comparison", level: 2 },
      { id: "getting-started", text: "Getting Started with UpgradedProxy", level: 2 },
    ],
    html_content: `
      <h2 id="what-are-residential-proxies">What Are Residential Proxies?</h2>
      <p>Residential proxies route your traffic through real IP addresses assigned by Internet Service Providers (ISPs) to homeowners. This makes them appear as legitimate users to target websites, providing the highest level of anonymity and trust.</p>
      <p>Unlike datacenter proxies, residential IPs are tied to physical locations and real devices, which means they're far less likely to be detected and blocked by anti-bot systems.</p>

      <h2 id="key-features">Key Features to Look For</h2>
      <p>When evaluating residential proxy providers, focus on these critical features:</p>
      <ul>
        <li><strong>Pool size:</strong> Larger IP pools mean better rotation and lower block rates.</li>
        <li><strong>Geo-targeting:</strong> Country, state, and city-level targeting for localized data.</li>
        <li><strong>Session control:</strong> Both rotating and sticky sessions for different use cases.</li>
        <li><strong>Authentication:</strong> IP allowlisting and username/password support.</li>
        <li><strong>API access:</strong> Programmatic proxy generation and management.</li>
      </ul>

      <h2 id="rotating-vs-sticky">Rotating vs Sticky Sessions</h2>
      <p>Rotating sessions assign a new IP for every request — ideal for scraping large datasets where you need maximum anonymity. Sticky sessions maintain the same IP for a set duration (typically 1-30 minutes), which is essential for tasks like account management, checkout flows, and session-based browsing.</p>

      <h2 id="use-cases">Top Use Cases</h2>
      <p>Residential proxies excel in several legitimate business scenarios:</p>
      <ul>
        <li><strong>Price intelligence:</strong> Monitor competitor pricing across regions without detection.</li>
        <li><strong>Ad verification:</strong> Verify ad placements and detect fraud from different geolocations.</li>
        <li><strong>SEO monitoring:</strong> Track search rankings from multiple locations accurately.</li>
        <li><strong>Brand protection:</strong> Detect unauthorized use of trademarks and counterfeit products.</li>
      </ul>

      <h2 id="pricing-comparison">Pricing Comparison</h2>
      <p>Residential proxy pricing varies significantly across providers. Most charge per GB with complex volume tiers. UpgradedProxy takes a different approach: flat-rate pricing at €0.64/GB — the same price for everyone, regardless of volume. No tiers, no negotiations, no hidden fees.</p>

      <h2 id="getting-started">Getting Started with UpgradedProxy</h2>
      <p>Setting up residential proxies with UpgradedProxy takes under 60 seconds. Sign up, add your IPs to the allowlist, and start generating proxies through the dashboard or API. Our proxy generator supports country-level targeting with rotating or sticky sessions out of the box. All pricing is in EUR.</p>
    `,
    faqs: [
      { question: "Are residential proxies legal?", answer: "Yes. Residential proxies are legal tools used for legitimate business purposes like market research, ad verification, and SEO monitoring. Always ensure you comply with the target website's terms of service." },
      { question: "How fast are residential proxies?", answer: "Residential proxies are typically slower than datacenter proxies due to routing through real ISP networks. Expect 50-200ms latency depending on the target and geo location. UpgradedProxy optimizes routing to minimize latency." },
      { question: "What's the difference between residential and ISP proxies?", answer: "Residential proxies use IPs from real home users, while ISP proxies use IPs registered to ISPs but hosted in datacenters. ISP proxies offer datacenter-like speed with residential-level trust." },
    ],
    related_slugs: ["datacenter-vs-residential", "rotating-vs-sticky-sessions", "geo-targeting-proxies-ecommerce"],
  },
};

// Fallback for unknown slugs
function makeFallbackPost(slug: string): PublicPost {
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    slug,
    title,
    excerpt: `Read about ${title.toLowerCase()} on the UpgradedProxy blog.`,
    category: "Guides",
    tags: [],
    author: "UpgradedProxy Team",
    published_at: "2026-02-01",
    reading_time_min: 5,
    cover_image: null,
    headings: [
      { id: "overview", text: "Overview", level: 2 },
      { id: "how-it-works", text: "How It Works", level: 2 },
      { id: "getting-started", text: "Getting Started", level: 2 },
    ],
    html_content: `
      <h2 id="overview">Overview</h2>
      <p>This article covers ${title.toLowerCase()} in depth. Content will be delivered by the backend content pipeline.</p>
      <h2 id="how-it-works">How It Works</h2>
      <p>Technical details and implementation specifics will be provided here once the article is generated by the auto-blogging system.</p>
      <h2 id="getting-started">Getting Started</h2>
      <p>Step-by-step instructions for getting started with this topic will appear here.</p>
    `,
    faqs: [],
    related_slugs: ["best-residential-proxies-2026"],
  };
}

// Related posts mini data
const ALL_POST_TITLES: Record<string, string> = {
  "best-residential-proxies-2026": "Best Residential Proxies in 2026",
  "socks5-proxies-scraping": "How to Use SOCKS5 Proxies for Scraping",
  "datacenter-vs-residential": "Datacenter vs Residential: Which to Choose?",
  "mobile-proxies-social-media": "Mobile Proxies for Social Media Management",
  "isp-proxies-explained": "ISP Proxies Explained",
  "proxy-api-integration-guide": "Proxy API Integration Guide",
  "rotating-vs-sticky-sessions": "Rotating vs Sticky Sessions",
  "geo-targeting-proxies-ecommerce": "Geo-Targeting for E-commerce Intelligence",
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => MOCK_POSTS[slug ?? ""] ?? makeFallbackPost(slug ?? "post"), [slug]);

  const relatedPosts = post.related_slugs
    .filter((s) => ALL_POST_TITLES[s])
    .map((s) => ({ slug: s, title: ALL_POST_TITLES[s] }));

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`https://upgraderpx.com/blog/${post.slug}`}
      />
      <SchemaOrg />
      {/* BlogPosting JSON-LD */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          author: { "@type": "Organization", name: post.author },
          datePublished: post.published_at,
          publisher: { "@type": "Organization", name: "UpgradedProxy", url: "https://upgraderpx.com" },
          mainEntityOfPage: `https://upgraderpx.com/blog/${post.slug}`,
        }}
      />

      <article className="container py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {/* Header */}
          <header>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <time>{post.published_at}</time>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_min} min read</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">{post.category}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold lg:text-4xl">{post.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {post.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                ))}
              </div>
            )}
          </header>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            {/* Table of Contents (sidebar on lg) */}
            {post.headings.length > 0 && (
              <aside className="lg:sticky lg:top-20 lg:order-2 lg:w-56 lg:shrink-0 lg:self-start">
                <nav className="rounded-lg border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Table of Contents
                  </p>
                  <ul className="space-y-2">
                    {post.headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                          style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Content — rendered as HTML from backend */}
            <div
              className="prose prose-neutral dark:prose-invert max-w-none flex-1 lg:order-1"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.html_content) }}
            />
          </div>

          {/* FAQ Section */}
          {post.faqs.length > 0 && <FAQSection items={post.faqs as { question: string; answer: string }[]} />}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 border-t pt-10">
              <h2 className="mb-6 text-xl font-bold">Related Articles</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <p className="font-medium text-sm">{rp.title}</p>
                    <p className="mt-1 text-xs text-primary">Read article →</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Internal links to money pages */}
          <InternalLinks
            title="Explore Our Proxy Services"
            links={MONEY_LINKS}
          />
        </div>
      </article>
    </>
  );
}
