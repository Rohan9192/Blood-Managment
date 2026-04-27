import Link from "next/link";
import { Droplets, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Blood<span className="text-rose-400">Link</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Connecting donors with those in need. Every drop counts — be the reason someone survives.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Platform</h3>
            <ul className="space-y-2">
              {[
                { label: "Find Donors", href: "/donors" },
                { label: "Blood Requests", href: "/requests" },
                { label: "Blood Stock", href: "/blood-availability" },
                { label: "Register", href: "/register" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-rose-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Blood Groups</h3>
            <div className="grid grid-cols-4 gap-2">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <div
                  key={bg}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs font-bold"
                >
                  {bg}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for saving lives
          </p>
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} BloodLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
