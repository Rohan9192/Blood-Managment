"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, AlertTriangle, CheckCircle, Info, Zap, X } from "lucide-react";
import { useSession } from "next-auth/react";

type Notif = {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  read: boolean;
  link?: string;
  createdAt: string;
};

const typeConfig = {
  INFO:     { icon: Info,          color: "text-blue-400",    bg: "bg-blue-500/10",    dot: "bg-blue-400" },
  SUCCESS:  { icon: CheckCircle,   color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  WARNING:  { icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/10",   dot: "bg-amber-400" },
  CRITICAL: { icon: Zap,           color: "text-rose-400",    bg: "bg-rose-500/10",    dot: "bg-rose-400" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ notifications: Notif[]; unreadCount: number }>;
    },
    enabled: !!session?.user,
    refetchInterval: 20000, // poll every 20 seconds
  });

  const markRead = useMutation({
    mutationFn: () => fetch("/api/notifications", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && (data?.unreadCount ?? 0) > 0) markRead.mutate();
  };

  if (!session?.user) return null;

  const unread = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
      >
        <Bell className={`w-5 h-5 transition-colors ${unread > 0 ? "text-rose-400" : "text-slate-400"}`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-700/60 bg-slate-900/97 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-400" />
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              {unread > 0 && (
                <span className="text-xs bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm gap-2">
                <CheckCheck className="w-8 h-8 text-slate-700" />
                <span>All caught up!</span>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-800/40 ${!n.read ? "bg-slate-800/20" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!n.read ? "text-white" : "text-slate-300"}`}>{n.title}</p>
                        <span className="text-slate-600 text-[10px] shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${cfg.dot}`} />}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-800 text-center">
              <button
                onClick={() => markRead.mutate()}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
