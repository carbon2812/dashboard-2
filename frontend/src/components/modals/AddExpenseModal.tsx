'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  Tag,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExpenseCategory, ExpenseAttachment, PaymentMethod } from '@/types';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { formatFileSize } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  onExpenseAdded: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Corporate Card');

  // File Upload State
  const [attachment, setAttachment] = useState<ExpenseAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
      setValidationErrors({});
      setUploadError(null);
    }
  }, [isOpen, categories, categoryId]);

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload bill');
      }

      setAttachment(data.file || data.data);
      success('Bill Attached', `${file.name} uploaded successfully`);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
      toastError('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!categoryId) {
      errors.categoryId = 'Please select an expense category';
    }
    if (!date) {
      errors.date = 'Please pick a date';
    }
    if (!merchant.trim()) {
      errors.merchant = 'Merchant / Vendor name is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        amount: parseFloat(amount),
        currency: 'INR',
        categoryId,
        date,
        merchant: merchant.trim(),
        description: description.trim() || merchant.trim(),
        paymentMethod,
        status: 'Approved',
        attachment,
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record expense');
      }

      // Confetti burst for fintech delight
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#3b82f6'],
      });

      success('Expense Added', `₹${amount} for ${merchant} recorded`);
      onExpenseAdded();
      handleClose();
    } catch (err: any) {
      toastError('Save Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setMerchant('');
    setDescription('');
    setAttachment(null);
    setValidationErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-modal my-8 border border-slate-200 overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Record New Expense</h3>
                <p className="text-xs text-slate-500">Add disbursement details and sync bill to cloud storage</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto max-h-[calc(85vh-140px)]">
            {/* Amount & Merchant Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${validationErrors.amount ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
                      }`}
                  />
                </div>
                {validationErrors.amount && (
                  <p className="mt-1 text-[11px] text-rose-500">{validationErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Merchant / Payee <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. AWS, Stripe, Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${validationErrors.merchant ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
                      }`}
                  />
                </div>
                {validationErrors.merchant && (
                  <p className="mt-1 text-[11px] text-rose-500">{validationErrors.merchant}</p>
                )}
              </div>
            </div>

            {/* Category & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {validationErrors.categoryId && (
                  <p className="mt-1 text-[11px] text-rose-500">{validationErrors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Billing Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                {validationErrors.date && (
                  <p className="mt-1 text-[11px] text-rose-500">{validationErrors.date}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Corporate Card', 'Wire Transfer', 'ACH', 'Reimbursement', 'Petty Cash'] as PaymentMethod[]).map(
                  (method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all truncate ${paymentMethod === method
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {method}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description & Business Justification
              </label>
              <textarea
                rows={2}
                placeholder="Brief reason or project allocation for this expense..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>

            {/* Bill Attachment Drag & Drop Zone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Bill Attachment (JPG, PNG, PDF, DOCX)
                </label>
                <span className="flex items-center gap-1 text-[11px] text-sky-600 font-medium">
                  <UploadCloud className="w-3 h-3" />
                  File Upload
                </span>
              </div>

              {!attachment ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${dragActive
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="py-2 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                      <span className="text-xs font-medium text-slate-600">
                        Uploading & syncing to cloud storage...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                        <UploadCloud className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-xs font-medium text-slate-800">
                        <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Supports invoice receipts: JPG, PNG, PDF, DOCX up to 15MB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Attached File Card */
                <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                      {attachment.mimeType.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {attachment.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Cloud Synced
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Expense</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
