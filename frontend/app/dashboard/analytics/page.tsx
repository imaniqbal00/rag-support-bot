'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { getChartData, getRecentQueries } from '@/lib/api';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [chart, setChart] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getChartData(), getRecentQueries(0)])
      .then(([c, q]) => { setChart(c); setQueries(q.queries ?? []); setTotal(q.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function loadPage(p: number) {
    const q = await getRecentQueries(p);
    setQueries(q.queries ?? []);
    setPage(p);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-slate-500 text-sm">Understand what your visitors need</p>
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Query volume</h2>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </div>
        </div>

        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : chart.length === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-slate-600 text-sm">No data yet — queries will appear here</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 16 }} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Total" activeDot={{ r: 4, fill: '#6366f1' }} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} dot={false} name="Resolved" activeDot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Query table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">All questions</h2>
          <span className="text-xs text-slate-500 glass px-2.5 py-1 rounded-full">{total} total</span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : queries.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-sm">No queries yet.</div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {queries.map((q, i) => (
                <div key={q.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {q.resolved
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-1">{q.question}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{q.answer}</p>
                    </div>
                    <div className="shrink-0 text-right ml-4">
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(q.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-1.5 flex items-center justify-end gap-1">
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            style={{ width: `${Math.round(q.confidence * 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-600">{Math.round(q.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                <button onClick={() => loadPage(page - 1)} disabled={page === 0}
                  className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-slate-700 transition-colors font-medium">
                  ← Previous
                </button>
                <span className="text-xs text-slate-600">Page {page + 1} of {totalPages}</span>
                <button onClick={() => loadPage(page + 1)} disabled={page >= totalPages - 1}
                  className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-slate-700 transition-colors font-medium">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
