import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Globe,
  Shield,
  Smartphone,
  Server,
  Layers,
  Wifi,
  Check,
  ArrowRight,
  Star,
  BookOpen,
  FileText,
  DollarSign,
  MessageSquare,
  Wallet,
  Activity,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import { useUsage, useStats } from "@/hooks/use-backend";

const PRODUCTS = [
  {
    id: "core-residential",
    name: "Core Residential",
    subtitle: "100% ethical residential proxies",
    price: "0.99",
    unit: "GB",
    discount: "BEST VALUE",
    popular: true,
    icon: Globe,
    color: "border-destructive",
    features: [
      "Unbeatable Pricing at €0.99/GB",
      "50M+ real residential IPs from around the world",
      "Free IP rotation, sticky sessions, and geo-targeting",
      "99.9% uptime with outstanding 24/7 support",
    ],
    cta: "Get Started",
    ctaVariant: "default" as const,
  },
  {
    id: "premium-residential",
    name: "Premium Residential",
    subtitle: "100% ethical residential proxies",
    price: "2.99",
    unit: "GB",
    icon: Wifi,
    features: [
      "100M+ real residential IPs from around the world",
      "Free IP rotation, sticky sessions, and geo-targeting",
      "99.9% uptime with outstanding 24/7 support",
      "Choose between Size, Quality and Speed Modes",
    ],
    cta: "See Pricing",
    ctaVariant: "default" as const,
  },
  {
    id: "static-residential",
    name: "Static Residential",
    subtitle: "100% ethical residential proxies",
    price: "2.99",
    unit: "IP",
    icon: Layers,
    features: [
      "Unlimited Bandwidth",
      "Virgin, Private and Shared IPs",
      "99.9% uptime with outstanding 24/7 support",
      "500 Concurrent Connections free",
    ],
    cta: "See Pricing",
    ctaVariant: "default" as const,
  },
  {
    id: "datacenter",
    name: "Datacenter Proxies",
    subtitle: "High-Speed Affordable Datacenter IPs",
    price: "0.79",
    unit: "GB",
    icon: Server,
    features: [
      "200ms response time",
      "Affordable for high-performance scraping",
      "500k+ IPs in 10k+ datacenters worldwide",
      "99.9% uptime with outstanding 24/7 support",
    ],
    cta: "Get Started",
    ctaVariant: "default" as const,
  },
  {
    id: "mobile",
    name: "Mobile Proxies",
    subtitle: "Real human phone IPs",
    price: "2.95",
    unit: "GB",
    icon: Smartphone,
    features: [
      "Real human 3G/4G/5G IPs from 195+ countries",
      "No phone farms, no datacenter IPs, no worries",
      "99.9% uptime with outstanding 24/7 support",
      "Unlimited Concurrent Sessions",
    ],
    cta: "Get Started",
    ctaVariant: "default" as const,
  },
];

const QUICK_LINKS = [
  { label: "API Docs", icon: BookOpen, url: "/docs" },
  { label: "Blog", icon: FileText, url: "/blog" },
  { label: "Earn $$$", icon: DollarSign, url: "/app/referral" },
  { label: "Live Chat", icon: MessageSquare, url: "#" },
];

export default function AppDashboard() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { t } = useI18n();
  const { data: usage } = useUsage("24h");
  const { data: stats } = useStats();

  const balance = user?.balance ?? 0;
  const usedGb = usage?.total_bandwidth_mb ? (usage.total_bandwidth_mb / 1024).toFixed(2) : "0.00";

  return (
    <>
      <SEOHead title="Dashboard" noindex />

      <div className="space-y-6">
        {/* Wallet & Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("billing.balance")}</p>
                <p className="text-2xl font-bold">{format(balance)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="rounded-full bg-success/10 p-3">
                <Activity className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("dashboard.usedLast24h")}</p>
                <p className="text-2xl font-bold">{usedGb} GB</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="rounded-full bg-warning/10 p-3">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("dashboard.statsLast24h")}</p>
                <div className="flex gap-3 text-2xl font-bold">{stats?.active_proxies ?? 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Swiss Quality</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="h-4 w-4 text-warning" /> Lightning Fast</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 100% Ethical</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> Money-Back Guarantee</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PRODUCTS.slice(0, 2).map((product) => (
            <ProductCard key={product.id} product={product} format={format} t={t} />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PRODUCTS.slice(2).map((product) => (
            <ProductCard key={product.id} product={product} format={format} t={t} />
          ))}
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-2">Looking for something else?</span>
          {QUICK_LINKS.map((link) => (
            <Button key={link.label} variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to={link.url}>
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Testimonial + Guarantee */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">4.9/5 from 500+ reviews</span>
              </div>
              <blockquote className="text-sm italic text-muted-foreground">
                "Incredible proxy quality at unmatched prices. The residential pool is massive and bans are virtually non-existent. Best service we've used for competitive intelligence."
              </blockquote>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">MM</div>
                <div>
                  <p className="text-sm font-medium">Michal Marhan</p>
                  <p className="text-xs text-muted-foreground">Software Developer @ deepscout.ai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="font-bold text-lg">Money Back Guarantee</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                No questions asked. If you used less than 1GB or 10% and you're not satisfied, we'll refund you in full.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/terms">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, format, t }: { product: typeof PRODUCTS[0], format: (val: number) => string, t: (key: string) => string }) {
  return (
    <Card className={`relative overflow-hidden ${product.popular ? "border-destructive ring-1 ring-destructive/20" : ""}`}>
      {product.popular && (
        <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">POPULAR</Badge>
      )}
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${product.popular ? "bg-destructive/10" : "bg-primary/10"}`}>
            <product.icon className={`h-5 w-5 ${product.popular ? "text-destructive" : "text-primary"}`} />
          </div>
          <div>
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.subtitle}</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-xs text-muted-foreground">{t("section.from")}</span>
          <span className="text-3xl font-bold">{format(Number(product.price))}</span>
          <span className="text-sm text-muted-foreground">/{product.unit}</span>
          {product.discount && (
            <Badge variant="secondary" className="ml-2 bg-success/10 text-success text-[10px]">{product.discount}</Badge>
          )}
        </div>

        <ul className="space-y-1.5">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              {f}
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <Button className="flex-1" asChild>
            <Link to={`/app/proxies?type=${product.id}`}>
              {product.cta}
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/${product.id === "core-residential" ? "residential" : product.id === "premium-residential" ? "residential" : product.id === "static-residential" ? "isp" : product.id}-proxies`}>
              Learn More
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
