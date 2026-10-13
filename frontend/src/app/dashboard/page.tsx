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
  Users,
  CreditCard,
  FileText,
  CheckCircle2,
  Calendar,
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
import { DisburseSalaryModal } from '@/components/modals/DisburseSalaryModal';
import { PaySlipModal } from '@/components/modals/PaySlipModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardStats, ExpenseCategory, Expense, Employee, SalaryPayment } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function DashboardPage() {
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [viewingPaySlip, setViewingPaySlip] = useState<{
    payment: SalaryPayment;
    employee?: Employee;
  } | null>(null);

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, catRes, empRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/categories'),
        fetch('/api/employees'),
      ]);

      const statsData = await statsRes.json();
      const catData = await catRes.json();
      const empData = await empRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
      if (catData.success) {
        setCategories(catData.data);
      }
      if (empData.success) {
        setEmployees(empData.data || []);
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
          subtitle="Real-time financial disbursements, categories & expense tracking"
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
                Track custom category allocations, view spending velocity, and preserve compliant bill receipts with secure digital records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/employees"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all transform active:scale-95"
              >
                <Users className="w-4 h-4 text-indigo-300" />
                <span>Employee & Salary Hub</span>
              </Link>

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
                icon={FileCheck2}
                subtitle="Attached to expense logs"
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
                  <ArrowRight className="w-3.5 h-3.5" />
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

          {/* Employee Salary & Payroll Hub Overview Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Employee Management & Salary Payroll</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HR & Compensation
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Manage workforce roster, disburse monthly salaries with bonuses & tax deductions, and download payslips
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsDisburseModalOpen(true)}
                  disabled={employees.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Disburse Salary</span>
                </button>

                <Link
                  href="/employees"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold text-xs border border-slate-200 transition-all"
                >
                  <span>Staff Directory & Slips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Payroll Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Employees</p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {stats?.payrollStats?.activeEmployees ?? employees.filter((e) => e.status === 'Active').length}
                </p>
                <span className="text-[10px] text-slate-400">Total roster: {employees.length}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Base Payroll</p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {formatCurrency(
                    stats?.payrollStats?.totalMonthlyPayroll ??
                      employees
                        .filter((e) => e.status === 'Active')
                        .reduce((sum, e) => sum + (e.baseSalary || 0), 0)
                  )}
                </p>
                <span className="text-[10px] text-slate-400">Base salary liability</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disbursed This Month</p>
                <p className="text-xl font-black text-emerald-600 mt-1">
                  {formatCurrency(stats?.payrollStats?.totalPaidThisMonth ?? 0)}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">Net paid to employees</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Payroll</p>
                <p className="text-xl font-black text-amber-600 mt-1">
                  {formatCurrency(
                    Math.max(
                      0,
                      (stats?.payrollStats?.totalMonthlyPayroll ??
                        employees
                          .filter((e) => e.status === 'Active')
                          .reduce((sum, e) => sum + (e.baseSalary || 0), 0)) -
                        (stats?.payrollStats?.totalPaidThisMonth ?? 0)
                    )
                  )}
                </p>
                <span className="text-[10px] text-amber-600 font-medium">Unpaid balance</span>
              </div>
            </div>

            {/* Latest Salary Slips List */}
            {stats?.payrollStats?.recentPayments && stats.payrollStats.recentPayments.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Recent Salary Disbursements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.payrollStats.recentPayments.slice(0, 3).map((sal) => (
                    <div
                      key={sal.id}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {sal.employeeName || 'Staff Member'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{sal.month}</span>
                          <span>•</span>
                          <span>{sal.paymentMethod}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-slate-900 text-xs">
                          {formatCurrency(sal.netSalary)}
                        </p>
                        <button
                          onClick={() => {
                            const emp = employees.find((e) => e.id === sal.employeeId);
                            setViewingPaySlip({ payment: sal, employee: emp });
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-0.5 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Slip</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Expenses List Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Disbursements</h3>
                <p className="text-xs text-slate-500">Latest expense claims and bill receipts</p>
              </div>

              <div className="flex items-center gap-3">
                {stats && stats.recentExpenses.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to clear all recorded disbursements?')) return;
                      try {
                        const res = await fetch('/api/reset', { method: 'POST' });
                        if (res.ok) {
                          success('Cleared', 'Disbursements cleared successfully.');
                          fetchData();
                        }
                      } catch (e: any) {
                        toastError('Clear Failed', e.message);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                    title="Remove all dummy / test expense records"
                  >
                    <span>Clear Dummy Data</span>
                  </button>
                )}
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
                  title="No disbursements logged yet"
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

      {/* Disburse Salary Modal */}
      <DisburseSalaryModal
        isOpen={isDisburseModalOpen}
        onClose={() => setIsDisburseModalOpen(false)}
        employees={employees}
        onSuccess={(createdPayment) => {
          fetchData();
          if (createdPayment) {
            const emp = employees.find((e) => e.id === createdPayment.employeeId);
            setViewingPaySlip({ payment: createdPayment, employee: emp });
          }
        }}
      />

      {/* Pay Slip Modal */}
      {viewingPaySlip && (
        <PaySlipModal
          isOpen={true}
          onClose={() => setViewingPaySlip(null)}
          salaryPayment={viewingPaySlip.payment}
          employee={viewingPaySlip.employee}
        />
      )}
    </div>
  );
}
