'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  FileCode,
  CreditCard,
} from 'lucide-react';
import { Expense } from '@/types';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatFileSize } from '@/lib/utils';

interface ExpenseTableProps {
  expenses: Expense[];
  onViewBill: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpenseTable({
  expenses,
  onViewBill,
  onEditExpense,
  onDeleteExpense,
}: ExpenseTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
            <th className="py-3.5 pl-6 pr-3">Date</th>
            <th className="py-3.5 px-3">Merchant / Details</th>
            <th className="py-3.5 px-3">Category</th>
            <th className="py-3.5 px-3">Method</th>
            <th className="py-3.5 px-3">Bill Receipt</th>
            <th className="py-3.5 px-3 text-right">Amount</th>
            <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          <AnimatePresence>
            {expenses.map((exp, idx) => {
              const hasAttachment = Boolean(exp.attachment);
              const isImage = exp.attachment?.mimeType?.startsWith('image/');
              const isPdf = exp.attachment?.mimeType === 'application/pdf' || exp.attachment?.name?.endsWith('.pdf');

              return (
                <motion.tr
                  key={exp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group hover:bg-slate-50/70 transition-colors"
                >
                  {/* Date */}
                  <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                      {formatDate(exp.date)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {exp.id.slice(-6).toUpperCase()}
                    </div>
                  </td>

                  {/* Merchant & Description */}
                  <td className="py-4 px-3 max-w-[240px]">
                    <div className="font-bold text-slate-900 truncate">
                      {exp.merchant || 'Disbursement'}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {exp.description}
                    </div>
                  </td>

                  {/* Category Pill */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <CategoryPill category={exp.category} size="sm" />
                  </td>

                  {/* Payment Method */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <Badge variant="neutral" size="sm">
                      {exp.paymentMethod}
                    </Badge>
                  </td>

                  {/* Bill Attachment Preview Thumbnail */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    {hasAttachment ? (
                      <button
                        onClick={() => onViewBill(exp)}
                        className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left shadow-2xs group/btn"
                        title="Click to view full receipt & cloud storage details"
                      >
                        {/* Thumbnail image or icon */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
                          {isImage ? (
                            <img
                              src={exp.attachment?.thumbnailUrl || exp.attachment?.localUrl}
                              alt="Receipt"
                              className="w-full h-full object-cover"
                            />
                          ) : isPdf ? (
                            <FileText className="w-4 h-4 text-rose-500" />
                          ) : (
                            <FileCode className="w-4 h-4 text-blue-500" />
                          )}
                        </div>

                        <div className="min-w-0 max-w-[120px]">
                          <div className="text-xs font-semibold text-slate-800 group-hover/btn:text-indigo-600 truncate">
                            {exp.attachment?.name}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Cloud Synced
                          </div>
                        </div>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No bill</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                      {formatCurrency(exp.amount, exp.currency)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {hasAttachment && (
                        <button
                          onClick={() => onViewBill(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Bill Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
