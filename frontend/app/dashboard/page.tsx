'use client';

import { useEffect, useState } from 'react';
import { FileText, MessageSquare, CheckCircle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { getStats, getRecentQueries } from '@/lib/api';

interface Stats {
  total_docs: number;
  total_queries: number;
  resolution_rate: number;
  queries_this_week: number;
}

const statCards = [
  {
    key: 'total_docs',
    label: 'Documents',
    icon: FileText,
    gradient: 'from-violet-500 to-indigo-500',
    glow: 'shadow-violet-500/20',
    bg: 'from-violet-500/10 to-indigo-500/5',
    suffix: '',
  },
  {
    key: 'total_queries',
    label: 'Total Queries',
    icon: MessageSquare,
    gradient: 'from-indigo-500 to-cyan-500',
    glow: 'shadow-indigo-500/20',
    bg: 'from-indigo-500/10 to-cyan-500/5',
    suffix: '',
  },
  {
    key: 'resolution_rate',
    label: 'Resolution Rate',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
    bg: 'from-emerald-500/10 to-teal-500/5',
    suffix: '%',
  },
  {
    key: 'queries_this_week',
    label: 'This Week',
    icon: TrendingUp,
    gradient: 'from-pink-500 to-rose-500',
    glow: 'shadow-pink-500/20',
    bg: 'from-pink-500/10 to-rose-500/5',
    suffix: '',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getRecentQueries(0)])
      .then(([s, q]) => { setStats(s); setQueries(q.queries?.slice(0, 6) ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
        <p className="text-slate-500 text-sm">Your support bot performance at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ key, label, icon: Icon, gradient, glow, bg, suffix }) => (
          <div key={key} className={`relative glass rounded-2xl p-5 overflow-hidden card-hover`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} pointer-events-none`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg ${glow}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-black text-white">
                {loading ? <span className="text-slate-700">—</span> : `${(stats as any)?.[key] ?? 0}${suffix}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent queries */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="font-semibold text-white">Recent questions</h2>
            <p className="text-xs text-slate-500 mt-0.5">What visitors are asking</p>
          </div>
          <a href="/dashboard/analytics" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : queries.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No questions yet</p>
            <p className="text-slate-600 text-xs mt-1">Share your embed widget to start getting queries</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {queries.map((q, i) => (
              <div key={q.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1 truncate">{q.question}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{q.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      q.resolved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {q.resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
