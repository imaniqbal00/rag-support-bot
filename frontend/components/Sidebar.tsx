'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, LayoutDashboard, FileText, BarChart2, Code2, LogOut, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const navItems = [
  { href: '/dashboard',           label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'Documents',  icon: FileText },
  { href: '/dashboard/analytics', label: 'Analytics',  icon: BarChart2 },
  { href: '/dashboard/embed',     label: 'Embed',      icon: Code2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-slate-950 border-r border-white/5 fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">BotBase</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}>
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`} />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-white">Pro features</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">Custom domains, advanced analytics, priority support.</p>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 w-full transition-all group">
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
