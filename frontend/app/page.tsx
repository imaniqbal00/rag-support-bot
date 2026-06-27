'use client';

import Link from 'next/link';
import { Bot, BarChart2, Code2, Upload, Zap, Shield, Star, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">BotBase</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="shimmer-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25">
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4 grid-bg">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-float2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass text-sm text-slate-300 px-4 py-2 rounded-full mb-8 animate-slide-up">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            Powered by Groq LLaMA + pgvector
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-6 animate-slide-up delay-100">
            Your docs.<br />
            <span className="gradient-text">Your AI bot.</span><br />
            One paste.
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up delay-200">
            Upload your docs and get a smart support chatbot widget in minutes.
            Paste one script tag — it works on any website.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 animate-slide-up delay-300">
            <Link href="/signup" className="shimmer-btn text-white font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-indigo-500/30">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="glass text-slate-300 font-medium px-8 py-4 rounded-2xl text-base hover:text-white hover:bg-white/10 transition-all">
              Sign in
            </Link>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-slate-500 animate-slide-up delay-400">
            {['No credit card', 'Setup in 5 min', 'Free tier available'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Dashboard preview ── */}
        <div className="relative max-w-5xl mx-auto mt-20 animate-slide-up delay-400">
          <div className="glass rounded-2xl p-1 glow-purple">
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-4 bg-slate-700/50 rounded-md px-3 py-1 text-xs text-slate-500">
                  localhost:3000/dashboard
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="flex h-64">
                {/* Sidebar */}
                <div className="w-44 bg-slate-950 border-r border-white/5 p-3 space-y-1">
                  {['Overview','Documents','Analytics','Embed'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                      <div className="w-3 h-3 rounded bg-current opacity-60" />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: 'Documents', val: '12', color: 'from-violet-500/20 to-violet-600/10' },
                      { label: 'Queries', val: '1,847', color: 'from-indigo-500/20 to-indigo-600/10' },
                      { label: 'Resolution', val: '94%', color: 'from-emerald-500/20 to-emerald-600/10' },
                      { label: 'This Week', val: '284', color: 'from-pink-500/20 to-pink-600/10' },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-lg p-2.5 bg-gradient-to-br ${s.color} border border-white/5`}>
                        <div className="text-[10px] text-slate-500 mb-1">{s.label}</div>
                        <div className="text-base font-bold text-white">{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 h-28 flex items-end gap-1">
                    {[30,50,40,70,60,80,55,90,65,85,75,95].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-sm opacity-70" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-slate-400 text-lg">From upload to live widget in minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Upload,
              gradient: 'from-violet-500 to-indigo-500',
              glow: 'shadow-violet-500/20',
              title: 'Upload any doc',
              desc: 'Drag in PDFs, Markdown, or text files. We chunk, embed with MiniLM, and index into pgvector automatically.',
              items: ['PDF, TXT, Markdown', 'Auto-chunking + embeddings', 'Instant indexing'],
            },
            {
              icon: Code2,
              gradient: 'from-indigo-500 to-cyan-500',
              glow: 'shadow-indigo-500/20',
              title: 'One script tag',
              desc: 'Copy a single snippet and paste it before </body>. A branded chat widget appears on your site instantly.',
              items: ['Vanilla JS — zero deps', 'Works on any website', 'Custom name & greeting'],
            },
            {
              icon: BarChart2,
              gradient: 'from-cyan-500 to-emerald-500',
              glow: 'shadow-cyan-500/20',
              title: 'Deep analytics',
              desc: 'See every question visitors ask, confidence scores, resolution rate, and gaps in your documentation.',
              items: ['Resolution tracking', '30-day query chart', 'Export & review'],
            },
          ].map(({ icon: Icon, gradient, glow, title, desc, items }) => (
            <div key={title} className="glass rounded-2xl p-6 card-hover group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg ${glow}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/5 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center px-8">
          {[
            { val: '< 30s', label: 'Time to first indexed doc' },
            { val: '384-dim', label: 'Embedding vectors (MiniLM)' },
            { val: '∞', label: 'Websites you can embed on' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-4xl font-black gradient-text mb-2">{val}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto text-center py-28 px-4">
        <div className="glass rounded-3xl p-12 glow-purple relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 pointer-events-none" />
          <Star className="w-10 h-10 text-violet-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black mb-4">Ready to ship?</h2>
          <p className="text-slate-400 mb-8">Set up your support bot in under 5 minutes.</p>
          <Link href="/signup" className="shimmer-btn inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl shadow-indigo-500/30">
            Create free account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-600">
        BotBase &copy; {new Date().getFullYear()} — Built with Groq + Supabase + Next.js
      </footer>
    </div>
  );
}
