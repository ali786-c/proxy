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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MessageSchema } from "@/lib/api/client";
import { useAdminTickets } from "@/hooks/use-backend";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { z } from "zod";

const TicketMessageSchema = z.object({
  id: z.number(),
  message: z.string(),
  is_admin_reply: z.boolean(),
  created_at: z.string(),
});

const TicketSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  subject: z.string(),
  status: z.string(),
  priority: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  user: z.object({
    email: z.string(),
  }).nullable(),
  messages: z.array(TicketMessageSchema).optional(),
});

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

const STATUS_COLOR = { open: "secondary", in_progress: "default", resolved: "outline", closed: "outline" } as const;
const PRIORITY_COLOR = { low: "secondary", medium: "default", high: "destructive" } as const;

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: tickets = [], isLoading, replyTicket, updateStatus: statusUpdateMutation, deleteTicket } = useAdminTickets();

  const selectedTicket = tickets.find((t: any) => t.id === selectedTicketId) || null;

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

  const changeStatus = async (status: string) => {
    if (!selectedTicketId) return;
    try {
      await statusUpdateMutation.mutateAsync({ id: selectedTicketId, status });
      toast({ title: "Status Updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedTicketId || !window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteTicket.mutateAsync(selectedTicketId);
      setSelectedTicketId(null);
      toast({ title: "Ticket Deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = tickets.filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.id.toLowerCase().includes(q) || t.user.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    }
    return true;
  });

  const openCount = tickets.filter((t: any) => t.status === "open").length;
  const inProgressCount = tickets.filter((t: any) => t.status === "in_progress").length;

  if (isLoading) return <LoadingSkeleton />;

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
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicketId(null)}>← Back</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTicket.isPending}>Delete Ticket</Button>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedTicket.id} · From: {selectedTicket.user}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={PRIORITY_COLOR[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                    <Select value={selectedTicket.status} onValueChange={(v) => changeStatus(v)}>
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
                        <span className="text-xs text-muted-foreground">{new Date(msg.time).toLocaleString()}</span>
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
                    {filtered.map((t: any) => (
                      <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicketId(t.id)}>
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell className="text-sm">{t.user}</TableCell>
                        <TableCell className="font-medium">{t.subject}</TableCell>
                        <TableCell><Badge variant={PRIORITY_COLOR[t.priority]} className="text-xs">{t.priority}</Badge></TableCell>
                        <TableCell><Badge variant={STATUS_COLOR[t.status]} className="text-xs">{t.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</TableCell>
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
