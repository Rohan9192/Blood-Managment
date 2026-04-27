"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Droplets, Menu, X, User, LogOut, LayoutDashboard, Users, FileText, Shield } from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/donors", label: "Donors", icon: Users },
    { href: "/requests", label: "Requests", icon: FileText },
    { href: "/blood-availability", label: "Blood Stock", icon: Droplets },
  ];

  const authLinks = session
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...(session.user.role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/75 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/3 via-transparent to-blue-500/3 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:shadow-rose-900/60 transition-shadow">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Blood<span className="text-rose-400">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-rose-950/40 text-rose-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                      pathname === link.href
                        ? "bg-rose-950/40 text-rose-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}
                <NotificationBell />
                <button
                  onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-lg shadow-rose-900/30 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-1">
          {[...navLinks, ...authLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-rose-950/40 text-rose-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {"icon" in link && link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
            </Link>
          ))}
          {session ? (
            <button
              onClick={() => { signOut({ callbackUrl: `${window.location.origin}/` }); setMobileOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-rose-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-1.5 text-sm font-semibold rounded-xl border border-slate-600 hover:border-rose-500 text-slate-300 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-900/30 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
