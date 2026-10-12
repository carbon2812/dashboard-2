'use client';

import React from 'react';
import {
  Search,
  Filter,
  Download,
  X,
  FileCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { ExpenseCategory, ExpenseFilterParams } from '@/types';

interface ExpenseFiltersProps {
  categories: ExpenseCategory[];
  filters: ExpenseFilterParams;
  onFilterChange: (filters: Partial<ExpenseFilterParams>) => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
  totalFilteredCount: number;
}

export function ExpenseFilters({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  onExportCSV,
  totalFilteredCount,
}: ExpenseFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.categoryId && filters.categoryId !== 'all') ||
    filters.startDate ||
    filters.endDate ||
    filters.hasAttachment !== undefined ||
    (filters.paymentMethod && filters.paymentMethod !== 'all')
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-card space-y-3.5">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by merchant, note, amount..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
        {/* Category selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            Category
          </label>
          <select
            value={filters.categoryId || 'all'}
            onChange={(e) => onFilterChange({ categoryId: e.target.value === 'all' ? undefined : e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod || 'all'}
            onChange={(e) => onFilterChange({ paymentMethod: e.target.value === 'all' ? undefined : e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Methods</option>
            <option value="Corporate Card">Corporate Card</option>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="ACH">ACH</option>
            <option value="Reimbursement">Reimbursement</option>
            <option value="Petty Cash">Petty Cash</option>
          </select>
        </div>

        {/* Receipt Attached Toggle */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            Bill Attachment
          </label>
          <select
            value={filters.hasAttachment === undefined ? 'all' : filters.hasAttachment ? 'yes' : 'no'}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({
                hasAttachment: val === 'all' ? undefined : val === 'yes' ? true : false,
              });
            }}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Records</option>
            <option value="yes">With Bill Synced</option>
            <option value="no">No Attachment</option>
          </select>
        </div>
      </div>
    </div>
  );
}
