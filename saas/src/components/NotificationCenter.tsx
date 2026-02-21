import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, CreditCard, AlertTriangle, Shield, Gift, MessageSquare } from "lucide-react";

export interface Notification {
  id: string;
  type: "payment" | "alert" | "security" | "promo" | "support";
  title: string;
  message: string;
  read: boolean;
  time: string;
}

const ICON_MAP = {
  payment: CreditCard,
  alert: AlertTriangle,
  security: Shield,
  promo: Gift,
  support: MessageSquare,
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "payment", title: "Payment Received", message: "$50.00 added to your balance via Stripe.", read: false, time: "2 min ago" },
  { id: "n2", type: "alert", title: "Usage Warning", message: "You've used 80% of your daily bandwidth quota.", read: false, time: "15 min ago" },
  { id: "n3", type: "security", title: "New Login Detected", message: "Login from 203.0.113.42 (United States).", read: false, time: "1 hr ago" },
  { id: "n4", type: "support", title: "Ticket Updated", message: "Support replied to TK-1001: Cannot connect to residential pool.", read: true, time: "2 hr ago" },
  { id: "n5", type: "promo", title: "New Coupon Available", message: "Use WELCOME20 for 20% off your next top-up!", read: true, time: "1 day ago" },
  { id: "n6", type: "payment", title: "Auto Top-Up Triggered", message: "Balance fell below $5. Auto-charged $50 via Stripe.", read: true, time: "2 days ago" },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={markAllRead}>
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => {
                const Icon = ICON_MAP[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <div className={`mt-0.5 rounded-full p-1.5 ${!n.read ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-3.5 w-3.5 ${!n.read ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}