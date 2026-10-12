'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Filter,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ExpenseFilters } from '@/components/ExpenseFilters';
import { ExpenseTable } from '@/components/ExpenseTable';
import { ExpenseCard } from '@/components/ExpenseCard';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { EditExpenseModal } from '@/components/modals/EditExpenseModal';
import { BillViewerModal } from '@/components/modals/BillViewerModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { Expense, ExpenseCategory, ExpenseFilterParams } from '@/types';
import { exportExpensesToCSV, formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function ExpensesPage() {
  const { success, error: toastError } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<ExpenseFilterParams>({
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Fetch Expenses with filters
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.categoryId) queryParams.set('categoryId', filters.categoryId);
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      if (filters.paymentMethod) queryParams.set('paymentMethod', filters.paymentMethod);
      if (filters.hasAttachment !== undefined) queryParams.set('hasAttachment', String(filters.hasAttachment));
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

      const res = await fetch(`/api/expenses?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (err: any) {
      toastError('Fetch Error', 'Failed to retrieve expenses');
    } finally {
      setLoading(false);
    }
  }, [filters, toastError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleFilterChange = (newFilters: Partial<ExpenseFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ sortBy: 'date', sortOrder: 'desc' });
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      success('Expense Deleted', 'Record has been removed.');
      fetchExpenses();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const totalFilteredAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onQuickAdd={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Expenses Ledger"
          subtitle="Explore, filter, and audit corporate expenditures with Google Drive receipts"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Subheader with View Switcher & Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Transactions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {expenses.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total filtered amount:{' '}
                <span className="font-bold text-slate-800">{formatCurrency(totalFilteredAmount)}</span>
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <ExpenseFilters
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onExportCSV={() => exportExpensesToCSV(expenses, categories)}
            totalFilteredCount={expenses.length}
          />

          {/* Expenses Content Container */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card overflow-hidden">
            {loading ? (
              <div className="divide-y divide-slate-100">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={Receipt}
                  title="No expenses match criteria"
                  description="Try adjusting your filters, clearing the search term, or create a new expense entry."
                  actionLabel="Add New Expense"
                  onAction={() => setIsAddModalOpen(true)}
                />
              </div>
            ) : viewMode === 'table' ? (
              <ExpenseTable
                expenses={expenses}
                onViewBill={(exp) => setViewingExpense(exp)}
                onEditExpense={(exp) => setEditingExpense(exp)}
                onDeleteExpense={handleDeleteExpense}
              />
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenses.map((exp) => (
                  <ExpenseCard
                    key={exp.id}
                    expense={exp}
                    onViewBill={(e) => setViewingExpense(e)}
                    onEditExpense={(e) => setEditingExpense(e)}
                    onDeleteExpense={handleDeleteExpense}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onExpenseAdded={fetchExpenses}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        categories={categories}
        onExpenseUpdated={fetchExpenses}
      />

      {/* Bill Viewer Modal */}
      <BillViewerModal
        isOpen={Boolean(viewingExpense)}
        onClose={() => setViewingExpense(null)}
        attachment={viewingExpense?.attachment}
        expenseTitle={viewingExpense?.merchant}
        amountFormatted={viewingExpense ? formatCurrency(viewingExpense.amount) : undefined}
      />
    </div>
  );
}
