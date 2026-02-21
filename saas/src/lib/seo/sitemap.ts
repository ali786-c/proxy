// Static sitemap generation helper
// Can be run at build time or served via edge function

const BASE_URL = "https://upgraderpx.com";

const PUBLIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/residential-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/datacenter-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/isp-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/mobile-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/socks5-proxies", priority: "0.9", changefreq: "monthly" },
  { path: "/proxy-api", priority: "0.9", changefreq: "monthly" },
  { path: "/locations", priority: "0.8", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/docs", priority: "0.7", changefreq: "weekly" },
];

export function generateSitemap(blogSlugs: string[] = []): string {
  const staticUrls = PUBLIC_ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${BASE_URL}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  );

  const blogUrls = blogSlugs.map(
    (slug) =>
      `  <url>\n    <loc>${BASE_URL}/blog/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...blogUrls].join("\n")}
</urlset>`;
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin/app areas
Disallow: /app/
Disallow: /admin/
Disallow: /login
Disallow: /signup
`;
}
