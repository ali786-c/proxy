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
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Paperclip } from "lucide-react";
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
  const { data: tickets, isLoading, createTicket, replyTicket, updateStatus } = useSupportTickets();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedTicket = tickets?.find((t: any) => t.id === selectedTicketId);

  const handleCreate = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      await createTicket.mutateAsync({
        subject: newSubject,
        message: newMessage,
        priority: newPriority,
        attachment: newFile || undefined
      });
      setNewSubject("");
      setNewMessage("");
      setNewFile(null);
      setDialogOpen(false);
      toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReply = async () => {
    if ((!replyText.trim() && !replyFile) || !selectedTicketId) return;
    try {
      await replyTicket.mutateAsync({
        id: selectedTicketId,
        message: replyText,
        attachment: replyFile || undefined
      });
      setReplyText("");
      setReplyFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handeClose = async () => {
    if (!selectedTicketId) return;
    try {
      await updateStatus.mutateAsync({ id: selectedTicketId, status: "closed" });
      toast({ title: "Ticket Closed", description: "Your ticket has been marked as closed." });
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
          {!selectedTicket && (
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
                  <div className="space-y-1.5">
                    <Label>Attachment (Optional)</Label>
                    <Input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="cursor-pointer" />
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
          )}
        </div>

        {selectedTicket ? (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedTicketId(null)}>← Back to List</Button>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={PRIORITY_COLOR[selectedTicket.priority] ?? "secondary"}>{selectedTicket.priority}</Badge>
                    <Badge variant={STATUS_CONFIG[selectedTicket.status]?.color ?? "secondary"}>{selectedTicket.status.replace("_", " ")}</Badge>
                  </div>
                </div>
                {selectedTicket.status !== "closed" && (
                  <Button variant="outline" size="sm" onClick={handeClose} disabled={updateStatus.isPending}>Close Ticket</Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto px-1">
                  {selectedTicket.messages?.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col ${msg.is_admin_reply ? "items-start" : "items-end"}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.is_admin_reply ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="font-bold text-[10px] uppercase opacity-70">{msg.is_admin_reply ? "Support Agent" : "You"}</span>
                          <span className="text-[10px] opacity-70">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        {msg.attachment_url && (
                          <div className="mt-2 pt-2 border-t border-current/20">
                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs hover:underline mt-1">
                              <Paperclip className="h-3 w-3" />
                              {msg.attachment_name || "View Attachment"}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== "closed" && (
                  <div className="pt-4 border-t space-y-3">
                    <Label>Reply to Ticket</Label>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message here..."
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-[250px]">
                          <Input type="file" onChange={(e) => setReplyFile(e.target.files?.[0] || null)} className="h-8 text-xs cursor-pointer" />
                        </div>
                        <Button onClick={handleReply} disabled={(!replyText.trim() && !replyFile) || replyTicket.isPending}>
                          {replyTicket.isPending ? "Sending..." : "Send Reply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {!tickets?.length ? (
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
                        <TableHead className="text-right">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((t: any) => (
                        <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicketId(t.id)}>
                          <TableCell className="font-medium">{t.subject}</TableCell>
                          <TableCell><Badge variant={PRIORITY_COLOR[t.priority] ?? "secondary"} className="text-xs">{t.priority}</Badge></TableCell>
                          <TableCell><Badge variant={STATUS_CONFIG[t.status]?.color ?? "secondary"} className="text-xs">{t.status.replace("_", " ")}</Badge></TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
