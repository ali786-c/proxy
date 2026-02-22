import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Tag, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const MOCK_COUPONS: Coupon[] = [
  { id: "c1", code: "WELCOME20", type: "percentage", value: 20, min_amount: 10, max_uses: 500, used_count: 143, expires_at: "2026-06-30", is_active: true, created_at: "2026-01-01" },
  { id: "c2", code: "FLAT5", type: "fixed", value: 5, min_amount: 25, max_uses: 100, used_count: 87, expires_at: "2026-03-31", is_active: true, created_at: "2026-01-15" },
  { id: "c3", code: "VIP50", type: "percentage", value: 50, min_amount: 100, max_uses: 10, used_count: 10, expires_at: null, is_active: false, created_at: "2025-12-01" },
  { id: "c4", code: "NEWYEAR10", type: "fixed", value: 10, min_amount: 50, max_uses: null, used_count: 412, expires_at: "2026-01-31", is_active: false, created_at: "2025-12-25" },
];

type FormData = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  min_amount: string;
  max_uses: string;
  expires_at: string;
  is_active: boolean;
};

const EMPTY: FormData = { code: "", type: "percentage", value: "", min_amount: "0", max_uses: "", expires_at: "", is_active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [modalOpen, setModalOpen] = useState(false);

  const createCoupon = () => {
    if (!form.code.trim() || !form.value) return;
    const coupon: Coupon = {
      id: `c${Date.now()}`,
      code: form.code.toUpperCase().replace(/\s/g, ""),
      type: form.type,
      value: Number(form.value),
      min_amount: Number(form.min_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      used_count: 0,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
      created_at: new Date().toISOString().slice(0, 10),
    };
    setCoupons((prev) => [coupon, ...prev]);
    setForm(EMPTY);
    setModalOpen(false);
    toast({ title: "Coupon Created", description: `${coupon.code} is now active.` });
  };

  const toggleActive = (id: string) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Deleted", description: "Coupon removed." });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `${code} copied.` });
  };

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((s, c) => s + c.used_count, 0);

  return (
    <>
      <SEOHead title="Admin — Coupons" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coupons & Promo Codes</h1>
            <p className="text-sm text-muted-foreground">{activeCount} active · {totalRedemptions} total redemptions</p>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" /> Create Coupon</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Code</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER25" className="uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v: "percentage" | "fixed") => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Value</Label>
                    <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percentage" ? "20" : "5.00"} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Min Amount ($)</Label>
                    <Input type="number" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max Uses (blank = unlimited)</Label>
                    <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Expires (optional)</Label>
                  <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active immediately</Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={createCoupon} disabled={!form.code.trim() || !form.value}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3"><Tag className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Redemptions</p>
              <p className="text-2xl font-bold">{(totalRedemptions || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold">{c.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(c.code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {c.type === "percentage" ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-sm">${c.min_amount}</TableCell>
                    <TableCell className="text-sm">
                      {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.expires_at ?? "Never"}</TableCell>
                    <TableCell>
                      <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c.id)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteCoupon(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
