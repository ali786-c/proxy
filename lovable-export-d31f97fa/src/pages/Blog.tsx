import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaOrg } from "@/components/seo/SchemaComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-backend";

const CATEGORIES = ["Guides", "Comparisons", "Use Cases", "Technical", "Industry News"];
const TAGS = ["residential", "datacenter", "isp", "mobile", "socks5", "scraping", "seo", "api", "geo-targeting", "rotating"];
const PER_PAGE = 6;

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: posts = [], isLoading } = useBlogPosts();

  const filtered = useMemo(() => {
    return posts.filter((p: any) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedTag && !(p.tags ?? []).includes(selectedTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q) || (p.tags ?? []).some((t: string) => t.includes(q));
      }
      return true;
    });
  }, [posts, search, selectedCategory, selectedTag]);

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

          <div className="relative mt-8">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

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

          {isLoading ? (
            <div className="mt-8 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-6 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {paginated.map((post: any) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="block rounded-lg border p-6 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time>{new Date(post.published_at || post.created_at).toLocaleDateString()}</time>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_min} min read</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">{post.category || "General"}</Badge>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(post.tags ?? []).map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                    ))}
                  </div>
                </Link>
              ))}

              {paginated.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {posts.length === 0 ? "No articles published yet. Check back soon!" : "No articles match your search. Try different keywords or clear filters."}
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
