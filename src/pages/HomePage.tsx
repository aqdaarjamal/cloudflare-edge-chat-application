import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
export function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Velocity</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">Enterprise</a>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-200">
            Sign In
          </Button>
        </Link>
      </nav>
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase"
            >
              <Sparkles className="w-3 h-3" />
              Powered by Cloudflare Workers
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-tight"
            >
              The speed of <br />
              <span className="text-blue-500 italic">thought.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed"
            >
              Experience sub-millisecond real-time communication built on the edge. No servers, no lag, just pure connection.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 rounded-2xl text-lg font-bold transition-all group shadow-xl shadow-blue-900/20">
                  Launch Application
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="h-14 px-8 text-slate-400 hover:text-white rounded-2xl">
                View Documentation
              </Button>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl" />
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-2 w-24 bg-slate-700 rounded-full" />
                    <div className="h-2 w-full bg-slate-800 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <div className="space-y-2 flex-1 pt-2 text-right">
                    <div className="h-2 w-16 bg-blue-500/50 rounded-full ml-auto" />
                    <div className="h-8 w-full bg-blue-600/20 rounded-2xl" />
                  </div>
                  <div className="w-12 h-12 bg-blue-600/30 rounded-2xl" />
                </div>
                <div className="h-[200px] bg-slate-800/20 rounded-3xl border border-dashed border-white/5 flex items-center justify-center">
                  <Globe className="w-12 h-12 text-slate-800 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase text-xs tracking-widest">Global Network</h4>
            <p className="text-slate-500 text-sm">300+ edge locations worldwide for near-zero latency.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase text-xs tracking-widest">Enterprise Ready</h4>
            <p className="text-slate-500 text-sm">E2EE, SOC2 compliance, and custom data residency.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase text-xs tracking-widest">Durable Objects</h4>
            <p className="text-slate-500 text-sm">Reliable stateful computing without the overhead.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase text-xs tracking-widest">Open API</h4>
            <p className="text-slate-500 text-sm">Integrate Velocity directly into your stack seamlessly.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}