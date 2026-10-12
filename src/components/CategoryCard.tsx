'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, DollarSign, Layers } from 'lucide-react';
import { ExpenseCategory, CategoryBreakdownItem } from '@/types';
import { getCategoryIcon } from '@/lib/icons';
import { formatCurrency } from '@/lib/utils';

interface CategoryCardProps {
  category: ExpenseCategory;
  stats?: CategoryBreakdownItem;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({
  category,
  stats,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const IconComponent = getCategoryIcon(category.icon);
  const totalSpent = stats?.total || 0;
  const count = stats?.count || 0;
  const budget = category.budget || 0;
  const budgetPercent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;
  const isOverBudget = budget > 0 && totalSpent > budget;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header: Icon + Color + Name + Action buttons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: `${category.color}18`,
                color: category.color,
                borderColor: `${category.color}30`,
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                {category.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {count} {count === 1 ? 'transaction' : 'transactions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit Category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {category.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {category.description}
          </p>
        )}

        {/* Total Spent Stat */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Spent
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            {formatCurrency(totalSpent)}
          </div>
        </div>

        {/* Budget Progress Bar */}
        {budget > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-500">Monthly Budget</span>
              <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                {formatCurrency(totalSpent)} / {formatCurrency(budget)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            {isOverBudget && (
              <p className="mt-1 text-[11px] font-medium text-rose-500">
                Exceeded budget by {formatCurrency(totalSpent - budget)}
              </p>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">No budget limit assigned</div>
        )}
      </div>

      {/* Footer Tag */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-mono">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.color.toUpperCase()}
        </span>
        <span>ID: {category.id.slice(-6)}</span>
      </div>
    </motion.div>
  );
}
