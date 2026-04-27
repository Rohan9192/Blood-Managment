"use client";
import { Link } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  items: { href: string; label: string; icon: any }[];
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-rose-950/50 text-rose-400 font-medium border border-rose-900/50 shadow-sm shadow-rose-950/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-rose-400" : "text-slate-500")} />
              {item.label}
            </NextLink>
          );
        })}
      </div>
    </aside>
  );
}
