import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Send,
  Clock,
  FileText,
  RefreshCw,
  CalendarClock,
  Plus,
  Search,
  ListChecks,
  TrendingUp,
  Sparkles,
  Globe,
  Zap,
  BarChart3,
} from "lucide-react";
import type { BlogPost } from "@/lib/api/admin";

// ── Keyword Queue ─────────────────────────────────────
interface QueuedKeyword {
  id: string;
  keyword: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "generating" | "done";
  added_at: string;
}

// ── Market Trends ─────────────────────────────────────
interface MarketTrend {
  id: string;
  topic: string;
  volume: string;
  trend: "rising" | "stable" | "declining";
  relevance: number;
  suggestedTitle: string;
  source: string;
}

const MOCK_TRENDS: MarketTrend[] = [
  { id: "t1", topic: "SOCKS5 Proxy Security", volume: "12.4K", trend: "rising", relevance: 95, suggestedTitle: "What Are SOCKS5 Proxies? Complete Guide 2025", source: "Google Trends" },
  { id: "t2", topic: "Proxy for Web Scraping", volume: "28.1K", trend: "rising", relevance: 92, suggestedTitle: "How to Use Proxies for Web Scraping in 2026", source: "SEMrush" },
  { id: "t3", topic: "Disable Proxy Settings", volume: "18.7K", trend: "stable", relevance: 88, suggestedTitle: "How to Disable a Proxy on Any Device (Windows, Mac, Android & iOS)", source: "Google Trends" },
  { id: "t4", topic: "Residential vs Datacenter", volume: "8.9K", trend: "rising", relevance: 85, suggestedTitle: "What Is a Web Proxy & How It Works", source: "Ahrefs" },
  { id: "t5", topic: "Ad Verification Proxy", volume: "5.2K", trend: "rising", relevance: 82, suggestedTitle: "Effective Ad Verification Using Residential Proxies", source: "Google Trends" },
  { id: "t6", topic: "IPv6 Proxy Performance", volume: "3.1K", trend: "stable", relevance: 78, suggestedTitle: "IPv6 Proxies: Performance Benchmarks & Best Practices", source: "SEMrush" },
];

const MOCK_QUEUE: QueuedKeyword[] = [
  { id: "q1", keyword: "best rotating proxies for scraping", priority: "high", status: "pending", added_at: "2026-02-20" },
  { id: "q2", keyword: "residential proxy vs vpn", priority: "high", status: "generating", added_at: "2026-02-19" },
  { id: "q3", keyword: "proxy authentication methods explained", priority: "medium", status: "pending", added_at: "2026-02-18" },
  { id: "q4", keyword: "how to scrape amazon with proxies", priority: "medium", status: "done", added_at: "2026-02-17" },
  { id: "q5", keyword: "socks5 proxy setup tutorial", priority: "low", status: "pending", added_at: "2026-02-16" },
  { id: "q6", keyword: "datacenter proxy speed benchmarks", priority: "low", status: "pending", added_at: "2026-02-15" },
];

const MOCK_POSTS: BlogPost[] = [
  { id: "b1", title: "Best Residential Proxies in 2026", slug: "best-residential-proxies-2026", status: "published", keywords: ["residential proxies", "best proxies"], author: "Auto", created_at: "2026-02-10", published_at: "2026-02-18" },
  { id: "b2", title: "How to Use SOCKS5 Proxies for Scraping", slug: "socks5-proxies-scraping", status: "published", keywords: ["socks5", "web scraping"], author: "Auto", created_at: "2026-02-05", published_at: "2026-02-12" },
  { id: "b3", title: "Datacenter vs Residential: Which to Choose?", slug: "datacenter-vs-residential", status: "queued", keywords: ["datacenter proxies", "residential proxies", "comparison"], author: "Auto", created_at: "2026-02-15", published_at: null },
  { id: "b4", title: "Mobile Proxies for Social Media Management", slug: "mobile-proxies-social-media", status: "queued", keywords: ["mobile proxies", "social media"], author: "Auto", created_at: "2026-02-17", published_at: null },
  { id: "b5", title: "ISP Proxies Explained: Speed Meets Trust", slug: "isp-proxies-explained", status: "draft", keywords: ["isp proxies"], author: "Auto", created_at: "2026-02-19", published_at: null },
  { id: "b6", title: "Proxy API Integration Guide", slug: "proxy-api-guide", status: "draft", keywords: ["proxy api", "integration"], author: "Auto", created_at: "2026-02-20", published_at: null },
];

const STATUS_ICON: Record<string, typeof FileText> = { draft: FileText, queued: Clock, published: Send };
const STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = { draft: "outline", queued: "secondary", published: "default" };
const PRIORITY_BADGE: Record<string, "default" | "secondary" | "destructive"> = { high: "destructive", medium: "default", low: "secondary" };
const QUEUE_STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = { pending: "outline", generating: "secondary", done: "default" };
const TREND_BADGE: Record<string, "default" | "secondary" | "outline"> = { rising: "default", stable: "secondary", declining: "outline" };

export default function AdminBlog() {
  const [tab, setTab] = useState("trends");
  const [postTab, setPostTab] = useState("all");
  const [search, setSearch] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<BlogPost | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [autoInterval, setAutoInterval] = useState("daily");

  const filteredPosts = postTab === "all"
    ? MOCK_POSTS
    : MOCK_POSTS.filter((p) => p.status === postTab);

  const filteredQueue = MOCK_QUEUE.filter((q) =>
    !search || q.keyword.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = (post: BlogPost) => {
    alert(`Publishing immediately: "${post.title}"`);
  };

  const handleRegenerate = (post: BlogPost) => {
    alert(`Regenerating draft: "${post.title}"`);
  };

  const handleSchedule = () => {
    if (!scheduleTarget || !scheduleDate) return;
    alert(`Scheduled "${scheduleTarget.title}" for ${scheduleDate}`);
    setScheduleOpen(false);
    setScheduleTarget(null);
    setScheduleDate("");
  };

  const handleGenerateFromTrend = (trend: MarketTrend) => {
    setGenerating(trend.id);
    // Simulate AI generation
    setTimeout(() => {
      setGenerating(null);
      alert(`Generated article: "${trend.suggestedTitle}" based on "${trend.topic}" trend data.`);
    }, 2000);
  };

  return (
    <>
      <SEOHead title="Admin — Blog & Auto-Blogging" noindex />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Blog & Content Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered auto-blogging with market trend analysis. Generate SEO-optimized articles automatically.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_TRENDS.filter(t => t.trend === "rising").length}</p>
                  <p className="text-xs text-muted-foreground">Rising Trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_QUEUE.filter((q) => q.status === "pending").length}</p>
                  <p className="text-xs text-muted-foreground">Queue Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_QUEUE.filter((q) => q.status === "generating").length}</p>
                  <p className="text-xs text-muted-foreground">Generating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_POSTS.filter((p) => p.status === "draft").length}</p>
                  <p className="text-xs text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{MOCK_POSTS.filter((p) => p.status === "published").length}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-Blog Settings Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2.5">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Auto-Blogging Engine</h3>
                  <p className="text-xs text-muted-foreground">
                    AI scans market trends and generates SEO articles automatically
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={autoInterval} onValueChange={setAutoInterval}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Scan Now
                </Button>
                <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="trends" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Market Trends
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Keyword Queue
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Posts
            </TabsTrigger>
          </TabsList>

          {/* Market Trends */}
          <TabsContent value="trends" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Trending proxy & scraping topics from Google Trends, SEMrush, and Ahrefs. Click <strong>Generate</strong> to create an SEO article.
              </p>
              <Button size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Trends
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_TRENDS.map((trend) => (
                <Card key={trend.id} className="relative overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={TREND_BADGE[trend.trend]} className="text-xs capitalize">
                            {trend.trend === "rising" && <TrendingUp className="mr-1 h-3 w-3" />}
                            {trend.trend}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{trend.volume}/mo</span>
                        </div>
                        <h3 className="mt-2 font-semibold text-sm">{trend.topic}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          Suggested: "{trend.suggestedTitle}"
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {trend.source}
                          <span className="ml-auto">Relevance: {trend.relevance}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${trend.relevance}%` }}
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={generating === trend.id}
                        onClick={() => handleGenerateFromTrend(trend)}
                      >
                        {generating === trend.id ? (
                          <><RefreshCw className="mr-1.5 h-3 w-3 animate-spin" /> Generating…</>
                        ) : (
                          <><Sparkles className="mr-1.5 h-3 w-3" /> Generate Article</>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Keyword Queue */}
          <TabsContent value="queue" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search keywords…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Keyword
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((kw) => (
                      <TableRow key={kw.id}>
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>
                          <Badge variant={PRIORITY_BADGE[kw.priority]} className="text-xs capitalize">{kw.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={QUEUE_STATUS_BADGE[kw.status]} className="text-xs capitalize">
                            {kw.status === "generating" && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                            {kw.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{kw.added_at}</TableCell>
                      </TableRow>
                    ))}
                    {filteredQueue.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No keywords match.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts */}
          <TabsContent value="posts" className="mt-4 space-y-4">
            <Tabs value={postTab} onValueChange={setPostTab}>
              <TabsList>
                <TabsTrigger value="all">All ({MOCK_POSTS.length})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({MOCK_POSTS.filter((p) => p.status === "draft").length})</TabsTrigger>
                <TabsTrigger value="queued">Scheduled ({MOCK_POSTS.filter((p) => p.status === "queued").length})</TabsTrigger>
                <TabsTrigger value="published">Published ({MOCK_POSTS.filter((p) => p.status === "published").length})</TabsTrigger>
              </TabsList>

              <TabsContent value={postTab} className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Keywords</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPosts.map((post) => {
                          const Icon = STATUS_ICON[post.status];
                          return (
                            <TableRow key={post.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{post.title}</p>
                                  <p className="text-xs text-muted-foreground">/{post.slug}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {post.keywords.map((k) => (
                                    <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={STATUS_BADGE[post.status]} className="gap-1">
                                  <Icon className="h-3 w-3" />
                                  {post.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {post.published_at ?? post.created_at}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  {post.status === "draft" && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => handlePublish(post)}>
                                        <Send className="mr-1 h-3 w-3" /> Publish
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleRegenerate(post)}>
                                        <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => { setScheduleTarget(post); setScheduleOpen(true); }}
                                      >
                                        <CalendarClock className="mr-1 h-3 w-3" /> Schedule
                                      </Button>
                                    </>
                                  )}
                                  {post.status === "queued" && (
                                    <Button size="sm" variant="outline" onClick={() => handlePublish(post)}>
                                      <Send className="mr-1 h-3 w-3" /> Publish Now
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredPosts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No posts in this category.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Choose a publish date for "{scheduleTarget?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min="2026-02-21"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={!scheduleDate}>
              <CalendarClock className="mr-2 h-4 w-4" /> Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
