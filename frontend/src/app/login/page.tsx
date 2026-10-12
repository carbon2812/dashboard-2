'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('admin@expensetracker.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password, rememberMe });
      if (result.success) {
        toastSuccess('Welcome back! Entering Dashboard...');
        router.replace('/dashboard');
      } else {
        const err = result.error || 'Invalid email or password.';
        setErrorMessage(err);
        toastError(err);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to authenticate.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[25%] w-[350px] h-[350px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Expense Tracker
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Corporate Finance Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local VPS Docker Protected</span>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[460px]"
        >
          {/* Card Container */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/40 space-y-7">
            {/* Header info inside card */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium mb-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Authorized Access Only</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sign in to Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Access corporate financial ledger, analytics, and persistent receipt storage.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span className="flex-1 font-medium">{errorMessage}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Corporate Email</span>
                  <span className="text-[10px] text-slate-500">Work address</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@expensetracker.local"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500">Min 4 characters</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/40 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span>Remember this session</span>
                </label>
                <span className="text-[11px] text-indigo-400 font-medium">SSL Encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Pills */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Quick 1-Click Demo Logins:</span>
                <span className="text-slate-500">Click to autofill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@expensetracker.local', 'admin123')}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                    <span>Executive Admin</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    admin@expensetracker.local
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('finance@expensetracker.local', 'finance123')}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                    <span>Finance Director</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    finance@expensetracker.local
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer System Badges */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            VPS Local Storage
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            PostgreSQL Docker
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Expense Tracker Enterprise • Protected Session
        </p>
      </footer>
    </div>
  );
}
