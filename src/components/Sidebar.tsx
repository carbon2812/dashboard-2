'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Settings,
  HardDrive,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  LogIn,
  LogOut,
  KeyRound,
  User as UserIcon,
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
      label: 'Settings & Drive',
      href: '/settings',
      icon: Settings,
      badge: driveConnected ? 'Sync' : 'Setup',
    },
    {
      label: 'Auth & Login',
      href: '/login',
      icon: KeyRound,
      badge: 'Portal',
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
              <span>Nova</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/80">FIN</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Expense Management</p>
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

      {/* Google Drive Status Footer Widget */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Google Drive</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Bill receipts sync automatically to Drive storage.
        </p>
        <Link
          href="/settings"
          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
        >
          <span>Manage Integration</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-100">
        {user ? (
          <div className="flex items-center justify-between group">
            <Link
              href="/login"
              className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
              title="Click to view profile or switch account"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user.initials || 'ME'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.role}</div>
              </div>
            </Link>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 ml-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-xs font-semibold text-indigo-600"
          >
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Sign In to Nova</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
