import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaOrg } from "@/components/seo/SchemaComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicPostSummary } from "@/lib/api/blog";

// ── Mock data (replaced by GET /public/blog) ──────────
const CATEGORIES = ["Guides", "Comparisons", "Use Cases", "Technical", "Industry News"];
const TAGS = ["residential", "datacenter", "isp", "mobile", "socks5", "scraping", "seo", "api", "geo-targeting", "rotating"];

const MOCK_POSTS: PublicPostSummary[] = [
  { slug: "best-residential-proxies-2026", title: "Best Residential Proxies in 2026", excerpt: "A comprehensive guide to choosing the best residential proxy providers with performance benchmarks, pricing comparisons, and use-case recommendations.", category: "Guides", tags: ["residential", "rotating", "geo-targeting"], author: "UpgradedProxy Team", published_at: "2026-02-18", reading_time_min: 8, cover_image: null },
  { slug: "socks5-proxies-scraping", title: "How to Use SOCKS5 Proxies for Web Scraping", excerpt: "Learn the technical details of SOCKS5 proxy configuration for scraping — authentication, session management, and error handling.", category: "Technical", tags: ["socks5", "scraping", "api"], author: "UpgradedProxy Team", published_at: "2026-02-12", reading_time_min: 6, cover_image: null },
  { slug: "datacenter-vs-residential", title: "Datacenter vs Residential Proxies: Which to Choose?", excerpt: "Compare datacenter and residential proxies across speed, anonymity, cost, and use cases to make the right choice for your project.", category: "Comparisons", tags: ["datacenter", "residential"], author: "UpgradedProxy Team", published_at: "2026-02-08", reading_time_min: 7, cover_image: null },
  { slug: "mobile-proxies-social-media", title: "Mobile Proxies for Social Media Management", excerpt: "Why mobile proxies are the gold standard for social media automation — real carrier IPs, geo-rotation, and trust scores explained.", category: "Use Cases", tags: ["mobile", "geo-targeting"], author: "UpgradedProxy Team", published_at: "2026-02-05", reading_time_min: 5, cover_image: null },
  { slug: "isp-proxies-explained", title: "ISP Proxies Explained: Speed Meets Trust", excerpt: "ISP proxies combine datacenter speed with residential trust. Learn when and how to use them for your toughest targets.", category: "Guides", tags: ["isp"], author: "UpgradedProxy Team", published_at: "2026-01-28", reading_time_min: 6, cover_image: null },
  { slug: "proxy-api-integration-guide", title: "Proxy API Integration Guide", excerpt: "Step-by-step guide to integrating UpgradedProxy's API into your application — authentication, proxy generation, and session management.", category: "Technical", tags: ["api", "scraping"], author: "UpgradedProxy Team", published_at: "2026-01-20", reading_time_min: 10, cover_image: null },
  { slug: "rotating-vs-sticky-sessions", title: "Rotating vs Sticky Sessions: When to Use Each", excerpt: "Understand the trade-offs between rotating and sticky proxy sessions and how to choose the right type for your workload.", category: "Guides", tags: ["residential", "rotating"], author: "UpgradedProxy Team", published_at: "2026-01-15", reading_time_min: 5, cover_image: null },
  { slug: "geo-targeting-proxies-ecommerce", title: "Geo-Targeting Proxies for E-commerce Intelligence", excerpt: "How to use geo-targeted proxies for price monitoring, ad verification, and competitive intelligence across global markets.", category: "Use Cases", tags: ["geo-targeting", "seo", "scraping"], author: "UpgradedProxy Team", published_at: "2026-01-10", reading_time_min: 7, cover_image: null },
];

const PER_PAGE = 6;

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_POSTS.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedTag && !p.tags.includes(selectedTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q));
      }
      return true;
    });
  }, [search, selectedCategory, selectedTag]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setPage(1);
  };

  return (
    <>
      <SEOHead
        title="Blog — Proxy Guides, Tutorials & Industry News"
        description="Expert guides on residential, datacenter, ISP, mobile, and SOCKS5 proxies. Learn scraping techniques, geo-targeting strategies, and proxy API integration."
        canonical="https://upgraderpx.com/blog"
      />
      <SchemaOrg />

      <section className="container py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold lg:text-4xl">UpgradedProxy Blog</h1>
          <p className="mt-2 text-muted-foreground">Expert guides, comparisons, and proxy industry insights.</p>

          {/* Search */}
          <div className="relative mt-8">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          {/* Categories */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setPage(1); }}
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "secondary" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => { setSelectedTag(selectedTag === tag ? null : tag); setPage(1); }}
              >
                #{tag}
              </Badge>
            ))}
          </div>

          {(selectedCategory || selectedTag || search) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3 text-xs">
              Clear filters
            </Button>
          )}

          {/* Posts */}
          <div className="mt-8 space-y-6">
            {paginated.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block rounded-lg border p-6 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time>{post.published_at}</time>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_min} min read</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                </div>
                <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                  ))}
                </div>
              </Link>
            ))}

            {paginated.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No articles match your search. Try different keywords or clear filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
