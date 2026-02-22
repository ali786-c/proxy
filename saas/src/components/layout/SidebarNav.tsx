import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown } from "lucide-react";
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Settings,
  CreditCard,
  Users,
  Package,
  Shield,
  FileText,
  Bell,
  Home,
  Wifi,
  Server,
  Smartphone,
  Code,
  MonitorSmartphone,
  Gift,
  Receipt,
  BookOpen,
  Activity,
  HelpCircle,
  Wallet,
  Gauge,
  Layers,
  Building2,
  Lock,
  ShieldAlert,
  DollarSign,
  Download,
  Store,
  History,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: typeof Globe;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const CLIENT_SECTIONS: NavSection[] = [
  {
    label: "",
    items: [
      { title: "Overview", url: "/app", icon: LayoutDashboard },
    ],
  },
  {
    label: "Proxy Services",
    items: [
      { title: "Generate Proxies", url: "/app/proxies", icon: Globe, badge: "New" },
    ],
  },
  {
    label: "My Proxies",
    collapsible: true,
    defaultOpen: true,
    items: [
      { title: "Residential", url: "/app/proxy-history?type=rp", icon: Home },
      { title: "Datacenter", url: "/app/proxy-history?type=dc", icon: Server },
      { title: "Mobile", url: "/app/proxy-history?type=mp", icon: Smartphone },
      { title: "Datacenter IPv6", url: "/app/proxy-history?type=isp", icon: Zap },
      { title: "Datacenter (Unmetered)", url: "/app/proxy-history?type=dc_unmetered", icon: Activity },
    ],
  },
  {
    label: "Scraping Solutions",
    collapsible: true,
    defaultOpen: false,
    items: [
      { title: "Scraper API", url: "/app/scraper-api", icon: Code, badge: "Beta" },
      { title: "Scraping Browser", url: "/app/scraping-browser", icon: MonitorSmartphone, badge: "Beta" },
    ],
  },
  {
    label: "Earn",
    items: [
      { title: "Referral Program", url: "/app/referral", icon: Gift },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Account & Billing", url: "/app/billing", icon: CreditCard },
      { title: "Invoices", url: "/app/invoices", icon: Receipt },
      { title: "Security & 2FA", url: "/app/security", icon: Shield },
      { title: "Organization", url: "/app/organization", icon: Building2 },
      { title: "Custom Domains", url: "/app/custom-domains", icon: Globe },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Support Tickets", url: "/app/support", icon: HelpCircle },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Rate Limits", url: "/app/rate-limits", icon: Gauge },
      { title: "Documentation", url: "/docs", icon: BookOpen },
      { title: "Network Status", url: "/status", icon: Activity },
      { title: "FAQ", url: "/app/faq", icon: HelpCircle },
      { title: "Install App", url: "/install", icon: Download },
    ],
  },
];

const ADMIN_SECTIONS: NavSection[] = [
  {
    label: "",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Products", url: "/admin/products", icon: Package },
      { title: "Invoices", url: "/admin/invoices", icon: Receipt },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Blog / Auto-Post", url: "/admin/blog", icon: FileText },
    ],
  },
  {
    label: "Payments",
    items: [
      { title: "Payment Gateways", url: "/admin/payment-gateways", icon: Wallet },
      { title: "Top-Up Settings", url: "/admin/topup-settings", icon: Gauge },
      { title: "Coupons", url: "/admin/coupons", icon: Gift },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Support Tickets", url: "/admin/support", icon: HelpCircle },
    ],
  },
  {
    label: "Resellers",
    items: [
      { title: "White-Label Portal", url: "/admin/resellers", icon: Store },
    ],
  },
  {
    label: "Security & Monitoring",
    items: [
      { title: "Fraud Detection", url: "/admin/fraud-detection", icon: ShieldAlert },
      { title: "SLA Monitoring", url: "/admin/sla-monitoring", icon: Activity },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Audit Log", url: "/admin/audit", icon: Shield },
      { title: "Permissions", url: "/admin/permissions", icon: Lock },
      { title: "Currencies", url: "/admin/currencies", icon: DollarSign },
      { title: "Alerts", url: "/admin/alerts", icon: Bell },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

function CollapsibleSection({ section }: { section: NavSection }) {
  const [open, setOpen] = useState(section.defaultOpen ?? true);

  return (
    <SidebarGroup>
      {section.label && (
        <button
          onClick={() => section.collapsible && setOpen(!open)}
          className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          {section.label}
          {section.collapsible && (
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`} />
          )}
        </button>
      )}
      {(!section.collapsible || open) && (
        <SidebarGroupContent>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.url + item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === "/app" || item.url === "/admin"}
                    className="flex items-center gap-2 text-sm"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${item.badge === "New" ? "bg-primary text-primary-foreground"
                        : item.badge === "Beta" ? "bg-warning text-warning-foreground"
                          : "bg-muted text-muted-foreground"
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

export function SidebarNav() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const sections = isAdmin ? ADMIN_SECTIONS : CLIENT_SECTIONS;

  return (
    <Sidebar>
      <SidebarContent className="py-2">
        {sections.map((section, i) => (
          <CollapsibleSection key={section.label || i} section={section} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
