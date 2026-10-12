'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Building,
} from 'lucide-react';
import { Expense } from '@/types';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  onViewBill: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpenseCard({
  expense,
  onViewBill,
  onEditExpense,
  onDeleteExpense,
}: ExpenseCardProps) {
  const hasAttachment = Boolean(expense.attachment);
  const isImage = expense.attachment?.mimeType?.startsWith('image/');

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Category + Date */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <CategoryPill category={expense.category} size="sm" />
          <span className="text-[11px] font-medium text-slate-400">
            {formatDate(expense.date)}
          </span>
        </div>

        {/* Merchant & Amount */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h4 className="font-bold text-slate-900 text-sm truncate">
            {expense.merchant || 'Disbursement'}
          </h4>
          <span className="font-bold text-slate-900 text-base tracking-tight shrink-0">
            {formatCurrency(expense.amount, expense.currency)}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {expense.description}
        </p>

        {/* Bill Attachment Preview Card if present */}
        {hasAttachment && (
          <div
            onClick={() => onViewBill(expense)}
            className="mb-3 p-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {isImage ? (
                  <img
                    src={expense.attachment?.thumbnailUrl || expense.attachment?.localUrl}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {expense.attachment?.name}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1 shrink-0 ml-2">
              <Eye className="w-3 h-3" />
              Preview
            </span>
          </div>
        )}
      </div>

      {/* Footer Methods & Actions */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <Badge variant="neutral" size="sm">
          {expense.paymentMethod}
        </Badge>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditExpense(expense)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteExpense(expense.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
