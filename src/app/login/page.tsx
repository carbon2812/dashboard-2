'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Building2,
  Briefcase,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
  HardDrive,
  KeyRound,
  ChevronLeft,
  RefreshCw,
  LogOut,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, logout, switchUser, demoUsers, isLoading } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Finance Director');
  const [signUpDepartment, setSignUpDepartment] = useState('Corporate Finance');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form errors
  const [formError, setFormError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const passwordStrength = getPasswordStrength(signUpPassword);

  // Handle Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!signInEmail || !signInPassword) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login({
      email: signInEmail,
      password: signInPassword,
      rememberMe,
    });
    setSubmitting(false);

    if (res.success) {
      success('Authentication Successful', `Welcome back to Nova Fin.`);
      router.push('/dashboard');
    } else {
      setFormError(res.error || 'Authentication failed. Please verify credentials.');
      toastError('Login Failed', res.error || 'Invalid credentials');
    }
  };

  // Handle Sign Up Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!signUpName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!signUpEmail.includes('@')) {
      setFormError('Please provide a valid corporate email.');
      return;
    }
    if (signUpPassword.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setFormError('Please accept the Security Policy & Terms.');
      return;
    }

    setSubmitting(true);
    const res = await register({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      role: signUpRole,
      department: signUpDepartment,
    });
    setSubmitting(false);

    if (res.success) {
      success('Account Created', `Welcome to Nova Fin, ${signUpName}!`);
      router.push('/dashboard');
    } else {
      setFormError(res.error || 'Registration failed.');
      toastError('Registration Failed', res.error || 'Could not create account');
    }
  };

  // Quick Demo Auto-fill & Instant Login
  const handleQuickDemoLogin = async (demoUser: typeof demoUsers[0]) => {
    setSignInEmail(demoUser.email);
    setSignInPassword('password123');
    setFormError(null);
    setSubmitting(true);

    const res = await login({
      email: demoUser.email,
      password: 'password123',
      rememberMe: true,
    });
    setSubmitting(false);

    if (res.success) {
      success('Signed in as ' + demoUser.name, `Active role: ${demoUser.role}`);
      router.push('/dashboard');
    } else {
      // Fallback switch direct in memory
      await switchUser(demoUser);
      success('Logged In', `Switched session to ${demoUser.name}`);
      router.push('/dashboard');
    }
  };

  // Handle Simulated Forgot Password
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      toastError('Error', 'Please enter a valid email address.');
      return;
    }
    setResetSent(true);
    info(
      'Recovery Dispatched',
      `A password recovery link and security OTP (code: NOVA-791823) were sent to ${resetEmail}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Ambient glowing radial lights */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-base flex items-center gap-2">
              <span>Nova</span>
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FIN ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Expense Management Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational • SOC2 Compliant</span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content Split Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left Column: Visual Showcase & Brand Highlights */}
        <div className="flex-1 w-full max-w-xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Generation Corporate Spend Management</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Unified spend control for high-growth <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">finance teams.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Track multi-currency disbursements, automate bill sync to Google Drive cloud storage, and gain real-time category budget visibility.
            </p>
          </motion.div>

          {/* Feature Showcase Cards */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2"
          >
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Real-Time
                </span>
              </div>
              <div className="text-lg font-bold text-white">Spend Control</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated multi-currency audit</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  Drive Sync
                </span>
              </div>
              <div className="text-lg font-bold text-white">Zero-Loss Vault</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated bill receipt backup</div>
            </div>
          </motion.div>

          {/* Trust Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/50 border border-slate-800/90 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white block">Bank-Grade 256-bit AES Encryption</span>
              Compliant with FinTech security standards and strict role-based access control.
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Authentication Card */}
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Ambient accent inside card */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Currently Logged In Banner */}
            {user && (
              <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user.initials || 'ME'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href="/dashboard"
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    Go
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Accounts Header */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Instant 1-Click Demo Profiles</span>
                </span>
                <span className="text-[10px] text-slate-500">Click to enter</span>
              </div>

              {/* Demo Profile Badges */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: 'Julian Sterling',
                    email: 'julian@nova.fin',
                    role: 'Finance Director',
                    initials: 'JS',
                    color: 'from-indigo-600 to-indigo-800',
                  },
                  {
                    name: 'Elena Vance',
                    email: 'elena@nova.fin',
                    role: 'Financial Analyst',
                    initials: 'EV',
                    color: 'from-violet-600 to-purple-800',
                  },
                  {
                    name: 'Marcus Brody',
                    email: 'marcus@nova.fin',
                    role: 'Executive Admin',
                    initials: 'MB',
                    color: 'from-emerald-600 to-teal-800',
                  },
                  {
                    name: 'Sophia Patel',
                    email: 'sophia@nova.fin',
                    role: 'Risk Auditor',
                    initials: 'SP',
                    color: 'from-amber-600 to-orange-800',
                  },
                ].map((demo) => {
                  const isSelected = user?.email === demo.email;
                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() =>
                        handleQuickDemoLogin({
                          id: `user_${demo.initials.toLowerCase()}`,
                          name: demo.name,
                          email: demo.email,
                          role: demo.role as UserRole,
                          department: 'Finance',
                          initials: demo.initials,
                          createdAt: new Date().toISOString(),
                        })
                      }
                      className={`text-left p-2.5 rounded-xl border transition-all flex items-center gap-2 group ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${demo.color} text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        {demo.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate group-hover:text-indigo-300">
                          {demo.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{demo.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Tabs (Sign In vs Create Account) */}
            <div className="relative p-1 rounded-2xl bg-slate-950 border border-slate-800 flex mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setFormError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all relative z-10 ${
                  mode === 'signin' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setFormError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all relative z-10 ${
                  mode === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>

              {/* Animated Tab Background Indicator */}
              <motion.div
                layout
                className="absolute inset-y-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
                style={{
                  left: mode === 'signin' ? '4px' : '50%',
                  right: mode === 'signin' ? '50%' : '4px',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              />
            </div>

            {/* Error Message Box */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </motion.div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. julian@nova.fin"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Remember this session for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Nova Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* CREATE ACCOUNT FORM */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Julian Sterling"
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Enterprise Role</label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Finance Director">Finance Director</option>
                      <option value="Senior Financial Analyst">Financial Analyst</option>
                      <option value="Executive Admin">Executive Admin</option>
                      <option value="Risk & Compliance Auditor">Auditor</option>
                      <option value="Team Member">Team Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={signUpDepartment}
                      onChange={(e) => setSignUpDepartment(e.target.value)}
                      placeholder="Finance & Treasury"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Set Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {signUpPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength >= step
                                ? step === 1
                                  ? 'bg-rose-500'
                                  : step === 2
                                  ? 'bg-amber-500'
                                  : step === 3
                                  ? 'bg-blue-500'
                                  : 'bg-emerald-500'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Strength</span>
                        <span className="font-semibold text-slate-400">
                          {passwordStrength <= 1
                            ? 'Weak'
                            : passwordStrength === 2
                            ? 'Fair'
                            : passwordStrength === 3
                            ? 'Good'
                            : 'Strong'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="text-indigo-400 hover:underline">Enterprise Terms of Service</span>{' '}
                      and FinTech security policies.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Enterprise Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SSO Providers Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or Enterprise SSO</span>
              </div>
            </div>

            {/* Social / SSO Mock Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  info('Google SSO Initiated', 'Simulating OAuth redirect to accounts.google.com');
                  setTimeout(() => {
                    handleQuickDemoLogin(demoUsers[0] || {
                      id: 'user_julian',
                      name: 'Julian Sterling',
                      email: 'julian@nova.fin',
                      role: 'Finance Director',
                      department: 'Finance',
                      initials: 'JS',
                      createdAt: new Date().toISOString(),
                    });
                  }, 700);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  info('Enterprise SAML/SSO', 'Connecting to Okta / Azure AD identity provider');
                  setTimeout(() => {
                    handleQuickDemoLogin(demoUsers[1] || {
                      id: 'user_elena',
                      name: 'Elena Vance',
                      email: 'elena@nova.fin',
                      role: 'Senior Financial Analyst',
                      department: 'FP&A',
                      initials: 'EV',
                      createdAt: new Date().toISOString(),
                    });
                  }, 700);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>Okta SAML</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Nova Financial Systems Inc. Enterprise Expense Automation.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Shield</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">SOC-2 Type II</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Audit Logging</span>
          </div>
        </div>
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {forgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setForgotPasswordOpen(false);
                setResetSent(false);
              }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">Account Recovery</h3>
                </div>
                <button
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {!resetSent ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter the corporate email address associated with your Nova account. We will send you an OTP recovery code and temporary sign-in link.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="julian@nova.fin"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                    >
                      Send Recovery Code
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Recovery Link Sent</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Check inbox for <strong className="text-white">{resetEmail}</strong>. Use temporary code <strong className="text-indigo-400">NOVA-791823</strong> to restore access.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail(resetEmail || 'julian@nova.fin');
                      setSignInPassword('password123');
                      setForgotPasswordOpen(false);
                      setResetSent(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Return to Sign In with Temporary Credentials
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
