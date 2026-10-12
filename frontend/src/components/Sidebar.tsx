'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Settings,
  UploadCloud,
  FileCode,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onQuickAdd?: () => void;
  driveConnected?: boolean;
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
  onQuickAdd,
  driveConnected = true,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      label: 'Expenses',
      href: '/expenses',
      icon: Receipt,
      badge: 'Live',
    },
    {
      label: 'Categories',
      href: '/categories',
      icon: Tags,
      badge: undefined,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: undefined,
    },
    {
      label: 'API Docs',
      href: '/api-docs',
      icon: FileCode,
      badge: 'Swagger',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
              <span>Expense</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/80">Tracker</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Finance & Bills</p>
          </div>
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      {onQuickAdd && (
        <div className="px-4 pt-5 pb-2">
          <button
            onClick={onQuickAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm hover:shadow-indigo-500/10 transition-all transform active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Expense</span>
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Cloud Storage Status Footer Widget */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
              <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-slate-800">VPS Storage</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Receipts save locally to VPS /uploads with Docker volume persistence.
        </p>
        <Link
          href="/settings"
          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700"
        >
          <span>Storage Settings</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* User Session & Workspace Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <Link
              href="/settings"
              onClick={onMobileClose}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user.initials || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user.role}
                </div>
              </div>
            </Link>

            <button
              onClick={() => {
                logout();
                onMobileClose?.();
              }}
              title="Sign out of portal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/settings"
            onClick={onMobileClose}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all group"
            title="Expense Tracker Workspace"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              ET
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate">Expense Tracker</div>
              <div className="text-[11px] text-slate-500 truncate">Active Workspace</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-64"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
}
