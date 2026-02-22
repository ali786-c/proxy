import { useState, useCallback } from "react";

import { SEOHead } from "@/components/seo/SEOHead";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
interface GeneratedProxy {
  host: string;
  port: string;
  username: string;
  password: string;
}

import { useProducts, useGenerateProxy, useOrders, useProxySettings } from "@/hooks/use-backend";

const TYPE_MAP: Record<string, string> = {
  rp: "residential",
  mp: "mobile",
  isp: "isp",
  dc: "datacenter",
};

function formatProxyLine(p: GeneratedProxy) {
  return `${p.host}:${p.port}:${p.username}:${p.password}`;
}

function generateCurl(p: GeneratedProxy) {
  return `curl -x http://${p.username}:${p.password}@${p.host}:${p.port} https://httpbin.org/ip`;
}

function generatePython(p: GeneratedProxy) {
  return `import requests

proxies = {
    "http": "http://${p.username}:${p.password}@${p.host}:${p.port}",
    "https": "http://${p.username}:${p.password}@${p.host}:${p.port}",
}
response = requests.get("https://httpbin.org/ip", proxies=proxies)
print(response.json())`;
}

function generateNode(p: GeneratedProxy) {
  return `const HttpsProxyAgent = require('https-proxy-agent');

const agent = new HttpsProxyAgent(
  'http://${p.username}:${p.password}@${p.host}:${p.port}'
);

fetch('https://httpbin.org/ip', { agent })
  .then(res => res.json())
  .then(console.log);`;
}

export default function Proxies() {
  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const { data: settings } = useProxySettings();
  const generateProxy = useGenerateProxy();

  const [product, setProduct] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [sessionType, setSessionType] = useState("rotating");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proxies, setProxies] = useState<any[]>([]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    if (!product) {
      setError("Please select a product.");
      return;
    }

    setLoading(true);
    try {
      const selectedProduct = products?.find((p: any) => p.type === product);
      if (!selectedProduct) throw new Error("Product not found");

      const result = await generateProxy.mutateAsync({
        product_id: selectedProduct.id,
        quantity: quantity,
        country: country || 'US',
        session_type: sessionType as any,
      });

      setProxies(result.proxies || []);
      toast({ title: "Proxies Generated", description: `${result.proxies?.length || 0} proxies ready.` });
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [product, products, quantity, generateProxy]);

  const copyAll = useCallback(() => {
    const text = proxies.map(formatProxyLine).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "All proxies copied to clipboard." });
  }, [proxies]);

  const exportAs = useCallback(
    (format: "txt" | "csv" | "json") => {
      let content: string;
      let mime: string;
      if (format === "json") {
        content = JSON.stringify(proxies, null, 2);
        mime = "application/json";
      } else if (format === "csv") {
        content = "host,port,username,password\n" + proxies.map((p) => `${p.host},${p.port},${p.username},${p.password}`).join("\n");
        mime = "text/csv";
      } else {
        content = proxies.map(formatProxyLine).join("\n");
        mime = "text/plain";
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proxies.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [proxies]
  );

  const sampleProxy = proxies[0];

  return (
    <>
      <SEOHead title="Proxy Generator" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Proxy Generator</h1>

        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Proxies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={product} onValueChange={setProduct}>
                  <SelectTrigger><SelectValue placeholder="Select Product..." /></SelectTrigger>
                  <SelectContent>
                    {(products ?? []).map((p: any) => (
                      <SelectItem key={p.id} value={p.type}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const evomiType = TYPE_MAP[product] || "residential";
                      const countriesObj = settings?.data?.[evomiType]?.countries || {};
                      return Object.entries(countriesObj).map(([code, name]: any) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City (optional)</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Any" />
              </div>

              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rotating">Rotating</SelectItem>
                    <SelectItem value="sticky">Sticky</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Generating…" : "Generate Proxies"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {proxies.length > 0 && (
          <Tabs defaultValue="output">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="snippets">Config Snippets</TabsTrigger>
              </TabsList>
            </div>

            {/* Plain-text output window */}
            <TabsContent value="output" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">
                    <Badge variant="secondary" className="mr-2">{proxies.length}</Badge>
                    proxies generated • {product} • {country} • {sessionType}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    readOnly
                    className="font-mono text-xs leading-relaxed min-h-[200px] max-h-[400px] resize-y bg-muted"
                    value={proxies.map(formatProxyLine).join("\n")}
                    onFocus={(e) => e.target.select()}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" size="sm" onClick={copyAll}>
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportAs("txt")}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download .txt
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportAs("csv")}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download .csv
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportAs("json")}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download .json
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Table view */}
            <TabsContent value="table" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Host</TableHead>
                          <TableHead>Port</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Password</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proxies.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-mono text-xs">{p.host}</TableCell>
                            <TableCell className="font-mono text-xs">{p.port}</TableCell>
                            <TableCell className="font-mono text-xs">{p.username}</TableCell>
                            <TableCell className="font-mono text-xs">{p.password}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="snippets" className="mt-4 space-y-4">
              {sampleProxy && (
                <>
                  <SnippetBlock title="cURL" code={generateCurl(sampleProxy)} />
                  <SnippetBlock title="Python (requests)" code={generatePython(sampleProxy)} />
                  <SnippetBlock title="Node.js (fetch)" code={generateNode(sampleProxy)} />
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}

function SnippetBlock({ title, code }: { title: string; code: string }) {
  const copy = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `${title} snippet copied.` });
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={copy}>
          <Copy className="mr-1 h-3.5 w-3.5" /> Copy
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">{code}</pre>
      </CardContent>
    </Card>
  );
}
