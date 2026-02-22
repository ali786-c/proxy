import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminTicket {
  id: string;
  user: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
  messages: { sender: "client" | "support"; text: string; time: string }[];
}

const MOCK_TICKETS: AdminTicket[] = [
  {
    id: "TK-1001", user: "alice@acme.co", subject: "Cannot connect to residential pool", category: "technical",
    status: "in_progress", priority: "high", created_at: "2026-02-18T10:00:00Z", updated_at: "2026-02-19T14:30:00Z",
    messages: [
      { sender: "client", text: "Getting connection refused on port 10000.", time: "2026-02-18T10:00:00Z" },
      { sender: "support", text: "We're investigating. Can you share your IP allowlist?", time: "2026-02-18T11:30:00Z" },
    ],
  },
  {
    id: "TK-1002", user: "bob@corp.io", subject: "Billing discrepancy on last invoice", category: "billing",
    status: "open", priority: "medium", created_at: "2026-02-19T08:00:00Z", updated_at: "2026-02-19T08:00:00Z",
    messages: [{ sender: "client", text: "Charged for 58GB but usage shows 42GB.", time: "2026-02-19T08:00:00Z" }],
  },
  {
    id: "TK-1003", user: "charlie@mail.com", subject: "Account suspended without notice", category: "other",
    status: "open", priority: "high", created_at: "2026-02-20T06:00:00Z", updated_at: "2026-02-20T06:00:00Z",
    messages: [{ sender: "client", text: "My account was suspended. I didn't violate any TOS.", time: "2026-02-20T06:00:00Z" }],
  },
  {
    id: "TK-1004", user: "eve@startup.co", subject: "Request SOCKS5 on mobile", category: "feature",
    status: "resolved", priority: "low", created_at: "2026-02-14T12:00:00Z", updated_at: "2026-02-15T16:00:00Z",
    messages: [
      { sender: "client", text: "Would love SOCKS5 on mobile proxies.", time: "2026-02-14T12:00:00Z" },
      { sender: "support", text: "Added to our roadmap. Thanks for the suggestion!", time: "2026-02-15T16:00:00Z" },
    ],
  },
];

const STATUS_COLOR = { open: "secondary", in_progress: "default", resolved: "outline", closed: "outline" } as const;
const PRIORITY_COLOR = { low: "secondary", medium: "default", high: "destructive" } as const;

export default function AdminSupport() {
  const [tickets, setTickets] = useState<AdminTicket[]>(MOCK_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.id.toLowerCase().includes(q) || t.user.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    }
    return true;
  });

  const sendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const updated = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
          ...t,
          status: "in_progress" as const,
          messages: [...t.messages, { sender: "support" as const, text: replyText, time: new Date().toISOString() }],
          updated_at: new Date().toISOString(),
        }
        : t
    );
    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === selectedTicket.id) ?? null);
    setReplyText("");
    toast({ title: "Reply Sent", description: `Response sent to ${selectedTicket.user}` });
  };

  const changeStatus = (ticketId: string, status: AdminTicket["status"]) => {
    const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status, updated_at: new Date().toISOString() } : t));
    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === ticketId) ?? null);
    toast({ title: "Status Updated", description: `Ticket ${ticketId} → ${status}` });
  };

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  return (
    <>
      <SEOHead title="Admin — Support" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground">
              {openCount} open · {inProgressCount} in progress · {tickets.length} total
            </p>
          </div>
        </div>

        {selectedTicket ? (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>← Back</Button>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{selectedTicket.id} · {selectedTicket.user} · {selectedTicket.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={PRIORITY_COLOR[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                    <Select value={selectedTicket.status} onValueChange={(v: AdminTicket["status"]) => changeStatus(selectedTicket.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((msg, i) => (
                    <div key={i} className={`rounded-lg p-3 text-sm ${msg.sender === "support" ? "bg-primary/5 ml-8" : "bg-muted mr-8"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">{msg.sender === "support" ? "Support (You)" : selectedTicket.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.time ? new Date(msg.time).toLocaleString() : "—"}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={2} className="flex-1" />
                  <Button onClick={sendReply} disabled={!replyText.trim()} className="self-end">Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicket(t)}>
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell className="text-sm">{t.user}</TableCell>
                        <TableCell className="font-medium">{t.subject}</TableCell>
                        <TableCell><Badge variant={PRIORITY_COLOR[t.priority]} className="text-xs">{t.priority}</Badge></TableCell>
                        <TableCell><Badge variant={STATUS_COLOR[t.status]} className="text-xs">{t.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{t.updated_at ? new Date(t.updated_at).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No tickets match.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
