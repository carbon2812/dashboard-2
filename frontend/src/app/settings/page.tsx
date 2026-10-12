'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  FileText,
  FileCode,
  Terminal,
  User,
  Shield,
  Key,
  Database,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StorageStatus } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { success, error: toastError, info } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(false);
  const [testUploading, setTestUploading] = useState(false);
  const [copiedVolume, setCopiedVolume] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState('Finance Team');
  const [profileEmail, setProfileEmail] = useState('finance@expensetracker.local');
  const [currency, setCurrency] = useState('INR (₹)');

  const checkStorageStatus = async () => {
    try {
      setCheckingStorage(true);
      const res = await fetch('/api/storage/status');
      const data = await res.json();
      if (data.success) {
        setStorageStatus(data.data);
      }
    } catch (err: any) {
      console.warn('Storage status check error:', err);
    } finally {
      setCheckingStorage(false);
    }
  };

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const handleTestUpload = async () => {
    setTestUploading(true);
    try {
      // Create a test PDF document blob
      const testBlob = new Blob(['%PDF-1.4\n%Test Verified Expense Receipt Document\n%%EOF'], { type: 'application/pdf' });
      const testFile = new File([testBlob], `test-receipt-${Date.now()}.pdf`, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', testFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      success('Test Upload Successful', `Receipt saved to VPS /uploads: ${data.file?.filename || 'test-receipt.pdf'}`);
      checkStorageStatus();
    } catch (err: any) {
      toastError('Test Upload Failed', err.message);
    } finally {
      setTestUploading(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to clear all expenses and reset transactions?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      success('Data Cleared', 'All expenses cleared from database.');
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="System Settings"
          subtitle="Manage corporate profile, VPS local storage, and data preferences"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => {}}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">

          {/* Section 1: VPS Local Storage Integration */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>VPS Local Storage</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Docker Persistent
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Local disk storage for PDF and Image receipts served publicly at /uploads with Docker volume persistence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={checkStorageStatus}
                  disabled={checkingStorage}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Refresh Storage Status"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingStorage ? 'animate-spin text-sky-600' : ''}`} />
                </button>

                <button
                  onClick={handleTestUpload}
                  disabled={testUploading}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{testUploading ? 'Testing Upload...' : 'Test File Upload'}</span>
                </button>
              </div>
            </div>

            {/* Storage Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Storage Provider</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-sm text-slate-900">
                    {storageStatus?.provider || 'VPS Local Storage'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Upload Folder</span>
                <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
                  backend/uploads/
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Size Limit</span>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  {storageStatus?.maxFileSize || '10MB Max'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Allowed Formats</span>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  PDF, JPG, PNG, WebP
                </div>
              </div>
            </div>

            {/* Docker Volume Persistence Box */}
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-sky-900">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>Docker Volume Persistence (docker-compose.yml)</span>
                </div>
                <button
                  onClick={() => {
                    const snippet = `volumes:\n  - ./backend/uploads:/app/uploads`;
                    navigator.clipboard.writeText(snippet);
                    setCopiedVolume(true);
                    setTimeout(() => setCopiedVolume(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900"
                >
                  {copiedVolume ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVolume ? 'Copied' : 'Copy Volume Config'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto space-y-0.5">
                <div>services:</div>
                <div className="pl-4">backend:</div>
                <div className="pl-8">volumes:</div>
                <div className="pl-12 text-emerald-400">- ./backend/uploads:/app/uploads</div>
              </div>
            </div>
          </div>

          {/* Section 3: Corporate Profile & Currency */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Corporate Profile</h3>
              <p className="text-xs text-slate-500">General settings for the expense management workspace</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corporate Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - United States Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Role</label>
                <input
                  type="text"
                  disabled
                  value="Finance Director / Admin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => success('Profile Saved', 'Corporate details updated')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Section 3: REST API & Developer Documentation */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Swagger API Documentation</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      OpenAPI 3.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Interactive sandbox documentation for all expense, category, and storage endpoints
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/api/docs"
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OpenAPI JSON</span>
                </Link>

                <Link
                  href="/api-docs"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Open Swagger UI</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section 4: Prisma ORM & PostgreSQL Configuration */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Prisma ORM & PostgreSQL</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PostgreSQL
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Type-safe database layer with relational schemas for Categories, Expenses, and Attachments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Prisma v6 Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">ORM Provider</span>
                <div className="mt-1 font-bold text-slate-900">PostgreSQL (Prisma Client)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Models</span>
                <div className="mt-1 font-bold text-slate-900">Category, Expense, Attachment</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Database Schema</span>
                <div className="mt-1 font-bold text-slate-900">prisma/schema.prisma</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-slate-400"># Useful Prisma Terminal Commands:</div>
              <div className="text-emerald-400">npx prisma db push        # Push schema models directly to PostgreSQL</div>
              <div className="text-emerald-400">npx prisma db seed        # Seed initial categories into database</div>
              <div className="text-emerald-400">npx prisma studio         # Open visual database browser in web browser</div>
            </div>
          </div>

          {/* Section 5: Data Maintenance & Reset */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Database & Demo Data Management</h3>
                <p className="text-xs text-slate-500">Restore pre-seeded fintech data or clear test transactions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-sm font-bold text-slate-900">Clear All Expenses</div>
                <div className="text-xs text-slate-500">
                  Empties all recorded expense transactions while keeping your categories intact.
                </div>
              </div>

              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors shrink-0"
              >
                Clear All Expenses
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
