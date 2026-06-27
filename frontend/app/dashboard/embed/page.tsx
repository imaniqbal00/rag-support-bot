'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, RefreshCw, Code2, Key, Settings, ExternalLink } from 'lucide-react';
import { getTenant, updateTenant, regenerateToken } from '@/lib/api';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
        copied
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'glass text-slate-400 hover:text-white border border-white/10'
      }`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function EmbedPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [form, setForm] = useState({ bot_name: '', bot_greeting: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    getTenant()
      .then((t) => {
        setTenant(t);
        setForm({ bot_name: t.bot_name, bot_greeting: t.bot_greeting });
      })
      .catch((e) => setError(e.message ?? 'Failed to load tenant'));
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const embedCode = tenant
    ? `<script\n  src="${backendUrl}/widget.js"\n  data-token="${tenant.api_token}"\n  data-bot-name="${form.bot_name}"\n  defer\n></script>`
    : '';

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updated = await updateTenant(form);
    setTenant(updated);
    setSaving(false);
  }

  async function handleRegenerate() {
    if (!confirm('Regenerate token? Your existing embed code will stop working immediately.')) return;
    setRegenerating(true);
    const { api_token } = await regenerateToken();
    setTenant((t: any) => ({ ...t, api_token }));
    setRegenerating(false);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center border border-red-500/20">
          <p className="text-red-400 font-semibold mb-2">Failed to load</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <p className="text-xs text-slate-600">Make sure your backend is running on port 3001 and your .env keys are correct.</p>
          <button onClick={() => { setError(''); getTenant().then((t) => { setTenant(t); setForm({ bot_name: t.bot_name, bot_greeting: t.bot_greeting }); }).catch((e) => setError(e.message)); }}
            className="mt-4 shimmer-btn text-white text-sm font-semibold px-5 py-2 rounded-xl">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Embed your bot</h1>
        <p className="text-slate-500 text-sm">One script tag — works on any website</p>
      </div>

      {/* Embed code card */}
      <div className="glass rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Embed code</p>
              <p className="text-xs text-slate-500">Paste before &lt;/body&gt;</p>
            </div>
          </div>
          <CopyButton text={embedCode} />
        </div>
        <div className="p-5 bg-slate-900/50">
          <pre className="text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">
            <span className="text-slate-500">{'<'}</span>
            <span className="text-indigo-400">script</span>{'\n'}
            {'  '}
            <span className="text-violet-400">src</span>
            <span className="text-slate-500">{"=\""}</span>
            <span className="text-emerald-400">{backendUrl}/widget.js</span>
            <span className="text-slate-500">{'"'}</span>{'\n'}
            {'  '}
            <span className="text-violet-400">data-token</span>
            <span className="text-slate-500">{"=\""}</span>
            <span className="text-yellow-400">{tenant.api_token.slice(0, 16)}…</span>
            <span className="text-slate-500">{'"'}</span>{'\n'}
            {'  '}
            <span className="text-violet-400">data-bot-name</span>
            <span className="text-slate-500">{"=\""}</span>
            <span className="text-emerald-400">{form.bot_name}</span>
            <span className="text-slate-500">{'"'}</span>{'\n'}
            {'  '}
            <span className="text-indigo-400">defer</span>{'\n'}
            <span className="text-slate-500">{'>'}</span>
            <span className="text-slate-500">{'</'}</span>
            <span className="text-indigo-400">script</span>
            <span className="text-slate-500">{'>'}</span>
          </pre>
        </div>
      </div>

      {/* API Token card */}
      <div className="glass rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">API Token</p>
              <p className="text-xs text-slate-500">Keep this secret</p>
            </div>
          </div>
          <button onClick={handleRegenerate} disabled={regenerating}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg glass border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-3 border border-white/5">
            <code className="flex-1 text-xs text-slate-300 font-mono break-all">{tenant.api_token}</code>
            <CopyButton text={tenant.api_token} />
          </div>
          <p className="text-xs text-slate-600 mt-2">Anyone with this token can query your bot's knowledge base.</p>
        </div>
      </div>

      {/* Bot settings card */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bot settings</p>
            <p className="text-xs text-slate-500">Customize your widget's appearance</p>
          </div>
        </div>
        <div className="px-5 py-5">
          <form onSubmit={saveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Bot name</label>
              <input type="text" value={form.bot_name}
                onChange={(e) => setForm((f) => ({ ...f, bot_name: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Greeting message</label>
              <input type="text" value={form.bot_greeting}
                onChange={(e) => setForm((f) => ({ ...f, bot_greeting: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
            </div>
            <button type="submit" disabled={saving}
              className="shimmer-btn text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100">
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
