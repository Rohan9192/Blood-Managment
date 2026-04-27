import Link from "next/link";
import { ArrowRight, Activity, Shield, Clock, Heart, Droplets } from "lucide-react";
import Button from "@/components/ui/Button";

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
            Join our smart platform to make blood donation faster, easier, and more impactful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-200 relative z-20">
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
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose BloodLink?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our platform is designed to handle critical emergencies with speed and reliability.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Real-time Tracking", desc: "Monitor blood stock levels and request statuses instantly." },
              { icon: Shield, title: "Trusted Network", desc: "Verified donors and secure, encrypted medical information." },
              { icon: Clock, title: "Quick Match", desc: "Our algorithm finds the nearest eligible donors in seconds." }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-rose-900/50 transition-colors group">
                <div className="w-14 h-14 bg-rose-950/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
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
          <Link href="/register">
            <Button as="span" size="lg" className="px-10 py-4 text-lg inline-flex relative z-20">Join the Lifesavers</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
