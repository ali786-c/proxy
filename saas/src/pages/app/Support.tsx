import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSupportTickets } from "@/hooks/use-backend";

const STATUS_CONFIG: Record<string, { color: "secondary" | "default" | "outline"; icon: typeof AlertCircle }> = {
  open: { color: "secondary", icon: AlertCircle },
  in_progress: { color: "default", icon: Clock },
  resolved: { color: "outline", icon: CheckCircle2 },
  closed: { color: "outline", icon: CheckCircle2 },
};

const PRIORITY_COLOR: Record<string, "secondary" | "default" | "destructive"> = { low: "secondary", normal: "default", high: "destructive" };

export default function Support() {
  const { data: tickets, isLoading, createTicket, replyTicket } = useSupportTickets();
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newMessage, setNewMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const selectedTicket = tickets?.find((t: any) => t.id === selectedTicketId);

  const handleCreate = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      await createTicket.mutateAsync({ subject: newSubject, message: newMessage, priority: newPriority });
      setNewSubject("");
      setNewMessage("");
      setDialogOpen(false);
      toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicketId) return;
    try {
      await replyTicket.mutateAsync({ id: selectedTicketId, message: replyText });
      setReplyText("");
      toast({ title: "Reply Sent" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      <SEOHead title="Support" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" /> New Ticket</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Brief description of your issue" />
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={4} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreate} disabled={!newSubject.trim() || !newMessage.trim() || createTicket.isPending}>
                  {createTicket.isPending ? "Submitting…" : "Submit Ticket"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {selectedTicket ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTicketId(null)}>← Back to Tickets</Button>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 text-primary italic lowercase">#{selectedTicket.id} · {selectedTicket.status.replace("_", " ")}</p>
                  </div>
                  <Badge variant={PRIORITY_COLOR[selectedTicket.priority] ?? "secondary"}>{selectedTicket.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {(selectedTicket.messages ?? []).map((msg: any, i: number) => (
                    <div key={i} className={`rounded-lg p-3 text-sm ${msg.is_admin_reply ? "bg-primary/5 mr-8 border border-primary/10" : "bg-muted ml-8"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{msg.is_admin_reply ? "Support Ninja" : "You"}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your message..." rows={2} className="flex-1" />
                  <Button onClick={handleReply} disabled={!replyText.trim() || replyTicket.isPending} className="self-end">
                    {replyTicket.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !tickets?.length ? (
          <EmptyState icon={MessageSquare} title="No tickets" description="You haven't created any support tickets yet." />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t: any) => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicketId(t.id)}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{t.subject}</span>
                          <span className="text-[10px] text-muted-foreground">#{t.id}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={PRIORITY_COLOR[t.priority] ?? "secondary"} className="text-[10px]">{t.priority}</Badge></TableCell>
                      <TableCell><Badge variant={STATUS_CONFIG[t.status]?.color ?? "secondary"} className="text-[10px] capitalize">{t.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
