'use client';

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  FileText,
  User,
  Shield,
  Key,
  Folder,
  Database,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DriveStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { success, error: toastError, info } = useToast();
  const { user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [testUploading, setTestUploading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState('INR (₹)');

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const checkDriveStatus = async () => {
    try {
      setCheckingDrive(true);
      const res = await fetch('/api/drive/status');
      const data = await res.json();
      if (data.success) {
        setDriveStatus(data.data);
      }
    } catch (err: any) {
      toastError('Status Check Failed', err.message);
    } finally {
      setCheckingDrive(false);
    }
  };

  useEffect(() => {
    checkDriveStatus();
  }, []);

  const handleTestUpload = async () => {
    setTestUploading(true);
    try {
      // Create a test text buffer blob
      const testBlob = new Blob(['Sample verified corporate bill receipt document'], { type: 'text/plain' });
      const testFile = new File([testBlob], `test-receipt-${Date.now()}.txt`, { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', testFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      success('Test Upload Successful', `Bill synced to Drive with file ID: ${data.data.driveFileId}`);
      checkDriveStatus();
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

  const handleCopyEnv = () => {
    const envSnippet = `GOOGLE_DRIVE_CLIENT_ID=your_client_id.apps.googleusercontent.com\nGOOGLE_DRIVE_CLIENT_SECRET=your_client_secret\nGOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token\nGOOGLE_DRIVE_FOLDER_ID=your_target_folder_id`;
    navigator.clipboard.writeText(envSnippet);
    setCopiedKey(true);
    info('Copied to Clipboard', 'Google Drive environment variables copied');
    setTimeout(() => setCopiedKey(false), 2500);
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
          subtitle="Manage corporate profile, Google Drive bill synchronization, and data storage"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => {}}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
          {/* Section 1: Google Drive Integration Status */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Google Drive Integration</h3>
                  <p className="text-xs text-slate-500">
                    Automatic cloud synchronization for attached bills, invoices & receipts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={checkDriveStatus}
                  disabled={checkingDrive}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Refresh Drive Connection Status"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingDrive ? 'animate-spin text-indigo-600' : ''}`} />
                </button>

                <button
                  onClick={handleTestUpload}
                  disabled={testUploading}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{testUploading ? 'Testing Sync...' : 'Test Bill Upload'}</span>
                </button>
              </div>
            </div>

            {/* Status Information Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Connection Mode</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-sm text-slate-900 capitalize">
                    {driveStatus?.mode === 'production' ? 'Live Cloud Storage' : 'Active (Simulated Mode)'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Target Folder</span>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900 truncate">
                  <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{driveStatus?.folderName || 'Fintech Bills & Receipts'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Storage Allocated</span>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  {driveStatus?.quotaUsed || '142.8 MB'} / {driveStatus?.quotaTotal || '15 GB'}
                </div>
              </div>
            </div>

            {/* Note & Setup Instructions */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-indigo-900">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>How to connect your live Google Drive API account</span>
                </div>
                <button
                  onClick={handleCopyEnv}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy env config'}</span>
                </button>
              </div>

              <p className="text-xs text-indigo-950/80 leading-relaxed">
                The dashboard includes automatic zero-config simulated Google Drive storage so you can upload and preview bills immediately. To sync directly to your real Google Drive account, provide your Google Cloud OAuth2 credentials in <code className="px-1.5 py-0.5 rounded bg-indigo-100 font-mono text-indigo-900">.env.local</code>.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto space-y-0.5">
                <div>GOOGLE_DRIVE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
                <div>GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret</div>
                <div>GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token</div>
                <div>GOOGLE_DRIVE_FOLDER_ID=your_folder_id</div>
              </div>
            </div>
          </div>

          {/* Section 2: Corporate Profile & Currency */}
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

          {/* Section 3: Data Maintenance & Reset */}
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
