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

import { useAdminTickets } from "@/hooks/use-backend";

const STATUS_COLOR = { open: "secondary", in_progress: "default", resolved: "outline", closed: "outline" } as const;
const PRIORITY_COLOR = { low: "secondary", normal: "default", high: "destructive" } as const;

export default function AdminSupport() {
  const { data: tickets, isLoading, replyTicket, updateStatus } = useAdminTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>;

  const selectedTicket = tickets?.find((t: any) => t.id === selectedTicketId);

  const filtered = (tickets ?? []).filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        String(t.id).includes(q) ||
        t.user?.name?.toLowerCase().includes(q) ||
        t.user?.email?.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicketId) return;
    try {
      await replyTicket.mutateAsync({ id: selectedTicketId, message: replyText });
      setReplyText("");
      toast({ title: "Reply Sent" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const changeStatus = async (ticketId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: ticketId, status });
      toast({ title: "Status Updated", description: `Ticket #${ticketId} → ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openCount = (tickets ?? []).filter((t: any) => t.status === "open").length;
  const inProgressCount = (tickets ?? []).filter((t: any) => t.status === "in_progress").length;

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
            <Button variant="outline" size="sm" onClick={() => setSelectedTicketId(null)}>← Back</Button>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">#{selectedTicket.id} · {selectedTicket.user?.name} ({selectedTicket.user?.email})</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={(PRIORITY_COLOR as any)[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                    <Select value={selectedTicket.status} onValueChange={(v) => changeStatus(selectedTicket.id, v)}>
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
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {(selectedTicket.messages ?? []).map((msg: any, i: number) => (
                    <div key={i} className={`rounded-lg p-3 text-sm ${msg.is_admin_reply ? "bg-primary/5 ml-8 border border-primary/10" : "bg-muted mr-8"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{msg.is_admin_reply ? "Support (You)" : selectedTicket.user?.name}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={2} className="flex-1" />
                  <Button onClick={sendReply} disabled={!replyText.trim() || replyTicket.isPending} className="self-end">
                    {replyTicket.isPending ? "Sending..." : "Send"}
                  </Button>
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
                  <SelectItem value="all">All Statuses</SelectItem>
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
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-24">Priority</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t: any) => (
                      <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicketId(t.id)}>
                        <TableCell className="font-mono text-[10px] text-muted-foreground">#{t.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{t.user?.name}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">{t.user?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{t.subject}</TableCell>
                        <TableCell><Badge variant={(PRIORITY_COLOR as any)[t.priority] ?? "secondary"} className="text-[10px]">{t.priority}</Badge></TableCell>
                        <TableCell><Badge variant={(STATUS_COLOR as any)[t.status] ?? "secondary"} className="text-[10px] capitalize">{t.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No tickets found.</TableCell></TableRow>
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
