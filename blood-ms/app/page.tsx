import Link from "next/link";
import { ArrowRight, Activity, Shield, Clock, Heart, Droplets, Users, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import BloodStockTicker from "@/components/home/BloodStockTicker";

export default function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Background — multi-layer orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-rose-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] bg-rose-700/12 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-700/8 rounded-full blur-[130px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-orange-600/6 rounded-full blur-[100px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(51,65,85,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(51,65,85,0.15) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/50 border border-rose-900/50 text-rose-400 text-sm font-medium mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            Save a life today. Donate blood.
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none mb-6 animate-in slide-in-from-bottom-6 duration-700">
            Give the Gift of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-orange-400">
              Life &amp; Hope
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            BloodLink connects generous donors with patients in urgent need.
            Real-time blood stock tracking. Smart donor matching. Zero delays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-200 relative z-20 mb-10">
            <Link href="/register" className="w-full sm:w-auto">
              <Button as="span" size="lg" className="w-full flex font-bold text-lg group">
                Become a Donor
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/requests" className="w-full sm:w-auto">
              <Button as="span" size="lg" variant="secondary" className="w-full flex font-bold text-lg">
                Request Blood
              </Button>
            </Link>
          </div>

          {/* Quick stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 animate-in fade-in duration-1000 delay-300">
            <Link href="/donors" className="flex items-center gap-2 hover:text-rose-400 transition-colors">
              <Users className="w-4 h-4" /> Find Donors
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/blood-availability" className="flex items-center gap-2 hover:text-rose-400 transition-colors">
              <Droplets className="w-4 h-4" /> Live Blood Stock
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/requests" className="flex items-center gap-2 hover:text-rose-400 transition-colors">
              <FileText className="w-4 h-4" /> Blood Requests
            </Link>
          </div>
        </div>
      </section>

      {/* Live Blood Stock Section */}
      <section className="py-16 bg-slate-900/60 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Live Blood Stock</h2>
              <p className="text-slate-400 text-sm mt-1">Current availability at your nearest blood bank — updated in real time</p>
            </div>
            <Link
              href="/blood-availability"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-rose-400 border border-rose-900/50 hover:bg-rose-950/30 transition-colors"
            >
              View All Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <BloodStockTicker />
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose BloodLink?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our platform is engineered for life-critical situations — fast, transparent, and always accurate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Real-time Stock Tracking",
                desc: "Monitor blood availability by group instantly. Public dashboard means zero guesswork for patients and hospitals.",
                color: "text-rose-400", bg: "bg-rose-950/40",
              },
              {
                icon: Shield,
                title: "QR-Verified Donors",
                desc: "Every approved donor gets a digital ID card with QR code. Hospitals scan it to verify identity and log donations instantly.",
                color: "text-violet-400", bg: "bg-violet-950/40",
              },
              {
                icon: Clock,
                title: "Smart Compatibility",
                desc: "Our algorithm filters compatible blood groups per recipient. Find the right donor faster than ever — no manual cross-checking.",
                color: "text-blue-400", bg: "bg-blue-950/40",
              },
            ].map((f, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-slate-700 transition-colors group">
                <div className={`w-14 h-14 ${f.bg} border border-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Register", desc: "Sign up as a donor or receiver in under 2 minutes.", icon: Users },
              { step: "02", title: "Get Verified", desc: "Admin reviews and approves your donor profile.", icon: Shield },
              { step: "03", title: "Get Your Digital ID", desc: "Receive a QR-coded Digital Donor ID card.", icon: Droplets },
              { step: "04", title: "Save Lives", desc: "Match with patients or donate at blood drives.", icon: Heart },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-full">
                  <div className="w-10 h-10 bg-rose-950/50 border border-rose-900/50 rounded-xl flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="text-rose-500/50 text-xs font-mono font-bold">{s.step}</span>
                  <h3 className="text-white font-bold mt-1 mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10 text-slate-700">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-950/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Heart className="w-16 h-16 text-rose-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Every drop counts.</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            A single donation can save up to three lives. Don't wait for an emergency to make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button as="span" size="lg" className="px-10 py-4 text-lg inline-flex relative z-20">Join BloodLink</Button>
            </Link>
            <Link href="/blood-availability">
              <Button as="span" size="lg" variant="secondary" className="px-10 py-4 text-lg inline-flex relative z-20">
                <Droplets className="w-5 h-5" /> Check Blood Stock
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
