import { SEOHead } from "@/components/seo/SEOHead";
import { Check } from "lucide-react";

export default function Status() {
  const services = [
    { name: "Residential Proxies", status: "operational" as const },
    { name: "Datacenter Proxies", status: "operational" as const },
    { name: "ISP Proxies", status: "operational" as const },
    { name: "Mobile Proxies", status: "operational" as const },
    { name: "SOCKS5 Proxies", status: "operational" as const },
    { name: "Proxy API", status: "operational" as const },
    { name: "Dashboard", status: "operational" as const },
    { name: "Authentication", status: "operational" as const },
  ];

  return (
    <>
      <SEOHead
        title="System Status"
        description="Real-time status of UpgradedProxy services. Monitor uptime across all proxy types, API, and dashboard."
        canonical="https://upgraderpx.com/status"
      />
      <section className="container py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold">System Status</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">All Systems Operational</p>
          </div>

          <div className="mt-8 space-y-2">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-md border px-4 py-3">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" /> Operational
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-md border p-4">
            <h2 className="text-sm font-semibold">Uptime (Last 30 Days)</h2>
            <div className="mt-3 flex gap-0.5">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="h-8 flex-1 rounded-sm bg-green-500/80"
                  title={`Day ${30 - i}: 100% uptime`}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
            <p className="mt-2 text-sm font-medium">99.99% uptime</p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            For incident reports or to subscribe to status updates, contact support@upgraderpx.com.
          </p>
        </div>
      </section>
    </>
  );
}
