import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { SEOHead } from "@/components/seo/SEOHead";
import { SchemaOrg } from "@/components/seo/SchemaComponents";
import { FAQSection } from "@/components/seo/FAQSection";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JsonLd } from "@/lib/seo/JsonLd";
import { Clock, ArrowLeft } from "lucide-react";
import { useBlogPost, useBlogPosts } from "@/hooks/use-backend";

const MONEY_LINKS = [
  { to: "/residential-proxies", label: "Residential Proxies" },
  { to: "/datacenter-proxies", label: "Datacenter Proxies" },
  { to: "/isp-proxies", label: "ISP Proxies" },
  { to: "/mobile-proxies", label: "Mobile Proxies" },
  { to: "/socks5-proxies", label: "SOCKS5 Proxies" },
  { to: "/proxy-api", label: "Proxy API" },
];

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useBlogPost(slug!);
  const { data: allPosts = [] } = useBlogPosts();

  const relatedPosts = allPosts
    .filter((p: any) => p.category === post?.category && p.slug !== post?.slug)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-96 w-full mt-8" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <p className="mt-2 text-muted-foreground">This article doesn't exist or hasn't been published yet.</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Support for optional structured content from backend if added later
  const headings = Array.isArray((post as any).headings) ? (post as any).headings : [];
  const faqs = Array.isArray((post as any).faqs) ? (post as any).faqs : [];

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`https://upgraderpx.com/blog/${post.slug}`}
      />
      <SchemaOrg />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          author: { "@type": "Organization", name: post.author?.name || "System" },
          datePublished: post.published_at || post.created_at,
          publisher: { "@type": "Organization", name: "UpgradedProxy", url: "https://upgraderpx.com" },
          mainEntityOfPage: `https://upgraderpx.com/blog/${post.slug}`,
        }}
      />

      <article className="container py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <header>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <time>{new Date(post.published_at || post.created_at).toLocaleDateString()}</time>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_min} min read</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">{post.category || "General"}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold lg:text-4xl">{post.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
            {(post.tags ?? []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {(post.tags as string[]).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                ))}
              </div>
            )}
          </header>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            {headings.length > 0 && (
              <aside className="lg:sticky lg:top-20 lg:order-2 lg:w-56 lg:shrink-0 lg:self-start">
                <nav className="rounded-lg border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table of Contents</p>
                  <ul className="space-y-2">
                    {headings.map((h: any) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="block text-sm text-muted-foreground transition-colors hover:text-foreground" style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            <div
              className="prose prose-neutral dark:prose-invert max-w-none flex-1 lg:order-1"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </div>

          {faqs.length > 0 && <FAQSection items={faqs} />}

          {relatedPosts.length > 0 && (
            <section className="mt-12 border-t pt-10">
              <h2 className="mb-6 text-xl font-bold">Related Articles</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((rp: any) => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <p className="font-medium text-sm">{rp.title}</p>
                    <p className="mt-1 text-xs text-primary">Read article →</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <InternalLinks title="Explore Our Proxy Services" links={MONEY_LINKS} />
        </div>
      </article>
    </>
  );
}
