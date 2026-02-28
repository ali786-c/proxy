import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, Search, LayoutGrid, List as ListIcon, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/use-backend";
import { toast } from "@/hooks/use-toast";
import { formatProxyLine } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
    "residential": "Residential Proxies",
    "datacenter": "Datacenter Proxies",
    "mobile": "Mobile Proxies",
    "datacenter-ipv6": "Datacenter IPv6",
    "datacenter-unmetered": "Datacenter Unmetered",
};

const DB_TYPE_MAP: Record<string, string> = {
    "residential": "rp",
    "mobile": "mp",
    "datacenter": "dc",
    "datacenter-ipv6": "dc_ipv6",
    "datacenter-unmetered": "dc_unmetered",
};

export default function ProxyList() {
    const { type } = useParams<{ type: string }>();
    const dbType = type ? DB_TYPE_MAP[type] || type : null;
    const { data: orders, isLoading } = useOrders(dbType);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");

    const title = type ? TYPE_LABELS[type] || "Proxies" : "All Proxies";

    const allProxies = useMemo(() => {
        if (!orders) return [];
        return orders.flatMap((order: any) =>
            (order.proxies || []).map((p: any) => ({
                ...p,
                product_name: order.product?.name || "Unknown",
                expires_at: order.expires_at,
            }))
        );
    }, [orders]);

    const filteredProxies = useMemo(() => {
        if (!search) return allProxies;
        const s = search.toLowerCase();
        return allProxies.filter((p: any) =>
            p.host.toLowerCase().includes(s) ||
            p.username.toLowerCase().includes(s) ||
            p.country.toLowerCase().includes(s)
        );
    }, [allProxies, search]);

    const copyProxy = (p: any) => {
        const text = formatProxyLine(p);
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Proxy credentials copied to clipboard." });
    };

    const exportProxies = () => {
        const content = filteredProxies.map((p: any) => formatProxyLine(p)).join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type || "proxies"}-export.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <SEOHead title={title} noindex />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage and export your {title.toLowerCase()} list.</p>
                    </div>
                    <Button asChild>
                        <Link to="/app/proxies/generate" className="gap-2">
                            <Plus className="h-4 w-4" /> Generate New
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by host, user, or country..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-md p-1 bg-muted/50">
                                    <Button
                                        variant={viewMode === "table" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setViewMode("table")}
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button variant="outline" size="sm" onClick={exportProxies} disabled={filteredProxies.length === 0} className="gap-2">
                                    <Download className="h-4 w-4" /> Export All
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredProxies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <p>No proxies found matching your criteria.</p>
                                {!search && (
                                    <Button variant="link" asChild className="mt-2">
                                        <Link to="/app/proxies/generate">Generate your first batch now</Link>
                                    </Button>
                                )}
                            </div>
                        ) : viewMode === "table" ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Host:Port</TableHead>
                                            <TableHead>Auth</TableHead>
                                            <TableHead>Expires</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProxies.map((p: any, i: number) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg leading-none" title={p.country}>
                                                            {p.country === 'US' ? '🇺🇸' : p.country === 'GB' ? '🇬🇧' : p.country === 'DE' ? '🇩🇪' : '🌐'}
                                                        </span>
                                                        <span className="text-sm font-medium">{p.country}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{p.host}:{p.port}</TableCell>
                                                <TableCell className="font-mono text-xs max-w-[150px] truncate" title={`${p.username}:${p.password}`}>
                                                    {p.username}:{p.password}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] font-normal">
                                                        {new Date(p.expires_at).toLocaleDateString()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyProxy(p)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {filteredProxies.map((p: any, i: number) => (
                                    <div key={i} className="border rounded-lg p-3 space-y-2 bg-card hover:border-primary/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{p.country === 'US' ? '🇺🇸' : p.country === 'GB' ? '🇬🇧' : '🌐'}</span>
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold">{type || 'Proxy'}</Badge>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyProxy(p)}>
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="font-mono text-xs p-2 bg-muted rounded truncate">
                                            {p.host}:{p.port}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>Expires: {new Date(p.expires_at).toLocaleDateString()}</span>
                                            <span>{p.city || 'Any City'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
