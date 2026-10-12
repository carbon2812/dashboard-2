'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck2,
  UploadCloud,
  Plus,
  ArrowRight,
  Sparkles,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart';
import { ExpenseTable } from '@/components/ExpenseTable';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { EditExpenseModal } from '@/components/modals/EditExpenseModal';
import { BillViewerModal } from '@/components/modals/BillViewerModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardStats, ExpenseCategory, Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function DashboardPage() {
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, catRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/categories'),
      ]);

      const statsData = await statsRes.json();
      const catData = await catRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
      if (catData.success) {
        setCategories(catData.data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      toastError('Fetch Error', 'Failed to refresh financial metrics');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      success('Expense Removed', 'Disbursement record deleted.');
      fetchData();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onQuickAdd={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Executive Dashboard"
          subtitle="Real-time financial disbursements, categories & VPS receipt storage"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Q2 Corporate Expenditure</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Fintech Expense Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
                Track custom category allocations, view spending velocity, and preserve compliant bill receipts in VPS local storage.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs sm:text-sm hover:bg-indigo-50 shadow-sm transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Quick Add Expense</span>
              </button>
            </div>
          </div>

          {/* Overview Stat Cards */}
          {loading || !stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Total Expenses (YTD)"
                value={formatCurrency(stats.totalExpenses)}
                icon={DollarSign}
                change={stats.monthlyGrowth}
                changeLabel="vs last month"
                iconColor="text-indigo-600"
                iconBg="bg-indigo-50 border-indigo-100"
              />
              <StatCard
                title="Current Month Spent"
                value={formatCurrency(stats.monthlyExpenses)}
                icon={TrendingUp}
                subtitle={`${stats.budgetUtilization}% of total category budgets`}
                iconColor="text-blue-600"
                iconBg="bg-blue-50 border-blue-100"
              />
              <StatCard
                title="Verified Bill Receipts"
                value={`${stats.totalReceipts} Synced`}
                icon={UploadCloud}
                subtitle="Stored in VPS /uploads"
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50 border-emerald-100"
              />
              <StatCard
                title="Average Disbursement"
                value={formatCurrency(stats.averageExpense)}
                icon={Receipt}
                subtitle="Across active transactions"
                iconColor="text-purple-600"
                iconBg="bg-purple-50 border-purple-100"
              />
            </div>
          )}

          {/* Charts Row: Spending Trends & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Trajectory (2 Cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col justify-between">
              {loading || !stats ? (
                <ChartSkeleton />
              ) : (
                <SpendingTrendChart
                  monthlyData={stats.monthlyTrends}
                  weeklyData={stats.weeklyTrends}
                />
              )}
            </div>

            {/* Category Breakdown Donut (1 Col) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Category Breakdown</h3>
                  <p className="text-xs text-slate-500">Distribution by custom categories</p>
                </div>
                <Link
                  href="/categories"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loading || !stats ? (
                <ChartSkeleton />
              ) : (
                <CategoryPieChart
                  data={stats.categoryBreakdown}
                  totalExpenses={stats.totalExpenses}
                />
              )}
            </div>
          </div>

          {/* Recent Expenses List Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Disbursements</h3>
                <p className="text-xs text-slate-500">Latest expense claims and bill receipts</p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/expenses"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  <span>View All Expenses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {loading || !stats ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading recent disbursements...</div>
            ) : stats.recentExpenses.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Receipt}
                  title="No expenses logged yet"
                  description="Begin recording company expenditures with attached bills."
                  actionLabel="Add Expense"
                  onAction={() => setIsAddModalOpen(true)}
                />
              </div>
            ) : (
              <ExpenseTable
                expenses={stats.recentExpenses}
                onViewBill={(exp) => setViewingExpense(exp)}
                onEditExpense={(exp) => setEditingExpense(exp)}
                onDeleteExpense={handleDeleteExpense}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onExpenseAdded={fetchData}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        categories={categories}
        onExpenseUpdated={fetchData}
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
