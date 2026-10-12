'use client';

import React from 'react';
import {
  Menu,
  Plus,
  Search,
  UploadCloud,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onQuickAdd: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({
  onMobileMenuToggle,
  onQuickAdd,
  title = 'Overview',
  subtitle = 'Monitor and manage corporate financial disbursements',
}: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="hidden sm:block text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Date Display Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Cloud Storage Status Link */}
        <Link
          href="/settings"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 transition-colors"
          title="Cloudinary Cloud Storage Status"
        >
          <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden md:inline">Cloud Storage</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </Link>

        {/* Workspace Quick Link */}
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
          title="Expense Tracker Workspace Settings"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-[10px] flex items-center justify-center">
            ET
          </div>
          <span className="hidden xl:inline">Workspace</span>
        </Link>

        {/* Quick Add Expense Action */}
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
}
