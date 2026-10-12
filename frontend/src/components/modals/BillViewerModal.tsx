'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Download,
  FileText,
  UploadCloud,
  FileCode,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { ExpenseAttachment } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface BillViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment?: ExpenseAttachment | null;
  expenseTitle?: string;
  amountFormatted?: string;
}

export function BillViewerModal({
  isOpen,
  onClose,
  attachment,
  expenseTitle = 'Expense Receipt',
  amountFormatted,
}: BillViewerModalProps) {
  if (!isOpen || !attachment) return null;

  const isImage = attachment.mimeType.startsWith('image/');
  const isPdf = attachment.mimeType === 'application/pdf' || attachment.name.endsWith('.pdf');
  const isDocx = attachment.mimeType.includes('word') || attachment.name.endsWith('.docx') || attachment.name.endsWith('.doc');

  const fileUrl = attachment.url || attachment.localUrl || '#';
  const downloadUrl = attachment.url || attachment.localUrl || '#';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-modal flex flex-col overflow-hidden z-10 border border-slate-200"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                {isImage && <ImageIcon className="w-5 h-5" />}
                {isPdf && <FileText className="w-5 h-5" />}
                {isDocx && <FileCode className="w-5 h-5" />}
                {!isImage && !isPdf && !isDocx && <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                  {attachment.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>•</span>
                  <span>{expenseTitle}</span>
                  {amountFormatted && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">{amountFormatted}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Storage Status Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>VPS Storage</span>
              </div>

              {/* View Original / Open Externally */}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Download */}
              <a
                href={downloadUrl}
                download={attachment.name}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Download original file"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Viewer */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50/70 flex items-center justify-center min-h-[350px]">
            {isImage ? (
              <div className="max-w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden bg-white p-2 shadow-sm border border-slate-200">
                <img
                  src={fileUrl}
                  alt={attachment.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-0"
                  title="PDF Document Viewer"
                />
              </div>
            ) : (
              <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600 mb-4">
                  <FileCode className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{attachment.name}</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Document files are stored securely in VPS storage. You can inspect the document details or download it below.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Type:</span>
                    <span className="font-medium text-slate-700">DOCX Document</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-medium text-slate-700">{formatFileSize(attachment.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stored File:</span>
                    <span className="font-mono text-[10px] text-slate-600 truncate max-w-[180px]">
                      {attachment.filename || attachment.name}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <a
                    href={downloadUrl}
                    download={attachment.name}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>VPS Local Storage Asset: <span className="font-mono text-slate-700">{attachment.filename || attachment.name}</span></span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
