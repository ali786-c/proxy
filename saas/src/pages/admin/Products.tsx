import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";

interface Product {
  id: string;
  name: string;
  proxy_type: string;
  unit: "GB" | "IP";
  base_cost_eur: number;
  sell_price_eur: number;
  markup_pct: number;
  is_active: boolean;
}

// Evomi base costs + 30% markup
const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Residential", proxy_type: "residential", unit: "GB", base_cost_eur: 0.49, sell_price_eur: 0.64, markup_pct: 30, is_active: true },
  { id: "p2", name: "Premium Residential", proxy_type: "residential", unit: "GB", base_cost_eur: 2.20, sell_price_eur: 2.86, markup_pct: 30, is_active: true },
  { id: "p3", name: "Datacenter", proxy_type: "datacenter", unit: "GB", base_cost_eur: 0.30, sell_price_eur: 0.39, markup_pct: 30, is_active: true },
  { id: "p4", name: "Static Residential (ISP)", proxy_type: "isp", unit: "IP", base_cost_eur: 2.50, sell_price_eur: 3.25, markup_pct: 30, is_active: true },
  { id: "p5", name: "Mobile", proxy_type: "mobile", unit: "GB", base_cost_eur: 2.20, sell_price_eur: 2.86, markup_pct: 30, is_active: true },
];

type FormData = {
  name: string;
  proxy_type: string;
  unit: "GB" | "IP";
  base_cost_eur: string;
  markup_pct: string;
  is_active: boolean;
};

const EMPTY_FORM: FormData = { name: "", proxy_type: "residential", unit: "GB", base_cost_eur: "", markup_pct: "30", is_active: true };

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading products…</div>;

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      proxy_type: p.proxy_type,
      unit: p.unit,
      base_cost_eur: String(p.base_cost_eur),
      markup_pct: String(p.markup_pct),
      is_active: p.is_active,
    });
    setModalOpen(true);
  };

  const computeSellPrice = () => {
    const base = parseFloat(form.base_cost_eur) || 0;
    const markup = parseFloat(form.markup_pct) || 0;
    return (base * (1 + markup / 100)).toFixed(2);
  };

  const handleSave = () => {
    alert(`${editId ? "Update" : "Create"} product: ${form.name} — Sell price: €${computeSellPrice()}/${form.unit}`);
    setModalOpen(false);
  };

  return (
    <>
      <SEOHead title="Admin — Products" noindex />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">Manage proxy product catalog. All prices flat-rate in EUR with 30% markup over base cost.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Base Cost</TableHead>
                  <TableHead className="text-right">Markup</TableHead>
                  <TableHead className="text-right">Sell Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(products ?? []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="capitalize">{p.type}</TableCell>
                    <TableCell>per GB</TableCell>
                    <TableCell className="text-right">€{(p.price * 0.7).toFixed(2)}</TableCell>
                    <TableCell className="text-right">30%</TableCell>
                    <TableCell className="text-right font-semibold">€{Number(p.price).toFixed(2)}/GB</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active !== false ? "default" : "secondary"}>
                        {p.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pricing Model Info */}
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-medium">Pricing Model</p>
            <p className="mt-1 text-xs text-muted-foreground">
              All products use flat-rate pricing in EUR. The sell price = base cost × (1 + markup%).
              Same price for all customers regardless of volume — no tiers, no volume discounts.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Proxy Type</Label>
                <Select value={form.proxy_type} onValueChange={(v) => setForm({ ...form, proxy_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="datacenter">Datacenter</SelectItem>
                    <SelectItem value="isp">ISP</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="socks5">SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Billing Unit</Label>
                <Select value={form.unit} onValueChange={(v: "GB" | "IP") => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GB">Per GB</SelectItem>
                    <SelectItem value="IP">Per IP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Base Cost (€)</Label>
                <Input type="number" step="0.01" value={form.base_cost_eur} onChange={(e) => setForm({ ...form, base_cost_eur: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Markup (%)</Label>
                <Input type="number" value={form.markup_pct} onChange={(e) => setForm({ ...form, markup_pct: e.target.value })} />
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm">Sell Price: <span className="font-bold text-primary">€{computeSellPrice()}/{form.unit}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
