'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Printer,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AddEmployeeModal } from '@/components/modals/AddEmployeeModal';
import { EditEmployeeModal } from '@/components/modals/EditEmployeeModal';
import { DisburseSalaryModal } from '@/components/modals/DisburseSalaryModal';
import { PaySlipModal } from '@/components/modals/PaySlipModal';
import { Employee, SalaryPayment, PayrollStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function EmployeesPage() {
  const { success, error: toastError } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Tab: 'directory' or 'salaries'
  const [activeTab, setActiveTab] = useState<'directory' | 'salaries'>('directory');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [disbursingEmployee, setDisbursingEmployee] = useState<Employee | null>(null);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [viewingPaySlip, setViewingPaySlip] = useState<{
    payment: SalaryPayment;
    employee?: Employee;
  } | null>(null);

  // Fetch all employee & salary data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, salRes, statsRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/salaries'),
        fetch('/api/payroll/stats'),
      ]);

      const empData = await empRes.json();
      const salData = await salRes.json();
      const statsData = await statsRes.json();

      if (empData.success) {
        setEmployees(empData.data || []);
      }
      if (salData.success) {
        setSalaryPayments(salData.data || []);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err: any) {
      console.error('Error fetching employee & salary data:', err);
      toastError('Fetch Error', 'Failed to retrieve employee or salary records');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete employee handler
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove employee "${name}"? This will not delete past historical salary disbursements.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to remove employee');

      success('Employee Removed', `${name} has been removed from directory.`);
      fetchData();
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  // Delete salary record handler
  const handleDeleteSalary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary disbursement record?')) return;
    try {
      const res = await fetch(`/api/salaries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete salary record');

      success('Salary Record Deleted', 'Disbursement entry has been removed.');
      fetchData();
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  // Quick launch salary modal for a specific employee
  const handleQuickDisburse = (employee: Employee) => {
    setDisbursingEmployee(employee);
    setIsDisburseModalOpen(true);
  };

  // View pay slip
  const handleViewPaySlip = (payment: SalaryPayment) => {
    const employee = employees.find((e) => e.id === payment.employeeId);
    setViewingPaySlip({ payment, employee });
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filter salaries
  const filteredSalaries = salaryPayments.filter((sal) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      (sal.employeeName && sal.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sal.designation && sal.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sal.paymentMethod && sal.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMonth = monthFilter === 'ALL' || sal.month === monthFilter;

    return matchesSearch && matchesMonth;
  });

  // Extract unique departments for dropdown
  const uniqueDepartments = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);

  // Extract unique months from salary records
  const uniqueMonths = Array.from(new Set(salaryPayments.map((s) => s.month))).filter(Boolean);

  // Fallback stats computation
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const totalBasePayroll = employees
    .filter((e) => e.status === 'Active')
    .reduce((sum, e) => sum + (e.baseSalary || 0), 0);
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const paidThisMonth = salaryPayments
    .filter((s) => s.month === currentMonthStr && s.status === 'Paid')
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onQuickAdd={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Employee Management & Payroll"
          subtitle="Staff roster, base salaries, monthly payroll disbursement, and payslips"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner / Actions */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-indigo-400/20">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                <span>HR & Compensation Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Workforce & Salary Disbursements
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
                Maintain your team directory, disburse monthly salaries with bonuses and deductions, and print professional payslips in real-time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setDisbursingEmployee(null);
                  setIsDisburseModalOpen(true);
                }}
                disabled={employees.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 transition-all transform active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Disburse Salary</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-semibold text-xs sm:text-sm shadow-md transition-all transform active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Top KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Employees</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.activeEmployees ?? activeCount}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Total roster: {employees.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Base Payroll</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(stats?.totalMonthlyPayroll ?? totalBasePayroll)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Base committed expense</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disbursed This Month</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {formatCurrency(stats?.totalPaidThisMonth ?? paidThisMonth)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Net payments sent</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Payroll</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {formatCurrency(Math.max(0, (stats?.totalMonthlyPayroll ?? totalBasePayroll) - (stats?.totalPaidThisMonth ?? paidThisMonth)))}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Remaining this cycle</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs & Search Toolbar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
                <button
                  onClick={() => setActiveTab('directory')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'directory'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Staff Directory ({employees.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('salaries')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'salaries'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Salary Slips & Ledger ({salaryPayments.length})</span>
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all self-start sm:self-auto"
                title="Refresh Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
              {/* Search Bar */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'directory'
                      ? 'Search by employee name, role, email, department...'
                      : 'Search salary payments by employee, designation, method...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {activeTab === 'directory' ? (
                <>
                  {/* Department Filter */}
                  <div className="sm:col-span-3">
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="ALL">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="sm:col-span-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Month Filter */}
                  <div className="sm:col-span-6">
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="ALL">All Salary Months</option>
                      {uniqueMonths.map((m) => (
                        <option key={m} value={m}>
                          Payroll Month: {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* MAIN TAB CONTENT */}
          {activeTab === 'directory' ? (
            /* ============================================================ */
            /* TAB 1: STAFF DIRECTORY                                       */
            /* ============================================================ */
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
                  <p className="text-sm font-medium">Loading employee records...</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Employees Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                    {searchQuery || departmentFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'No employees match your selected filter criteria. Try resetting your search.'
                      : 'Get started by onboarding your team members into the system to manage compensation.'}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add First Employee</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Employee Details</th>
                        <th className="py-4 px-6">Department & Role</th>
                        <th className="py-4 px-6 text-right">Base Salary</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6">Joined Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filteredEmployees.map((emp) => {
                        const initials = emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors group">
                            {/* Employee Info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                    {emp.name}
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                    {emp.email && (
                                      <span className="flex items-center gap-1 truncate">
                                        <Mail className="w-3 h-3 text-slate-300" />
                                        {emp.email}
                                      </span>
                                    )}
                                    {emp.phone && (
                                      <span className="flex items-center gap-1 shrink-0">
                                        <Phone className="w-3 h-3 text-slate-300" />
                                        {emp.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Department & Role */}
                            <td className="py-4 px-6">
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {emp.department}
                                </span>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                  {emp.designation}
                                </p>
                              </div>
                            </td>

                            {/* Base Salary */}
                            <td className="py-4 px-6 text-right">
                              <p className="font-extrabold text-slate-900">
                                {formatCurrency(emp.baseSalary)}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">/ month</span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  emp.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                    : emp.status === 'On Leave'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    emp.status === 'Active'
                                      ? 'bg-emerald-500'
                                      : emp.status === 'On Leave'
                                      ? 'bg-amber-500'
                                      : 'bg-slate-400'
                                  }`}
                                />
                                {emp.status}
                              </span>
                            </td>

                            {/* Joined Date */}
                            <td className="py-4 px-6 text-slate-600 font-medium text-xs whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{emp.joinDate || 'N/A'}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleQuickDisburse(emp)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors"
                                  title="Pay Monthly Salary"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay Salary</span>
                                </button>

                                <button
                                  onClick={() => setEditingEmployee(emp)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                  title="Edit Employee"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Remove Employee"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================ */
            /* TAB 2: SALARY SLIPS & DISBURSEMENT LEDGER                    */
            /* ============================================================ */
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-card overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
                  <p className="text-sm font-medium">Loading salary disbursement ledger...</p>
                </div>
              ) : filteredSalaries.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Salary Disbursements Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                    {searchQuery || monthFilter !== 'ALL'
                      ? 'No salary payments match your filter settings. Reset search to see all records.'
                      : 'You haven’t recorded any employee salary payouts yet. Click "Disburse Salary" to generate your first pay ledger and slip.'}
                  </p>
                  <button
                    onClick={() => {
                      setDisbursingEmployee(null);
                      setIsDisburseModalOpen(true);
                    }}
                    disabled={employees.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Record Salary Payment</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Employee</th>
                        <th className="py-4 px-6">Payroll Month</th>
                        <th className="py-4 px-6 text-right">Base Salary</th>
                        <th className="py-4 px-6 text-right">Bonus</th>
                        <th className="py-4 px-6 text-right">Deductions</th>
                        <th className="py-4 px-6 text-right">Net Disbursed</th>
                        <th className="py-4 px-6">Payment Mode & Date</th>
                        <th className="py-4 px-6 text-right">Pay Slip / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filteredSalaries.map((sal) => (
                        <tr key={sal.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Employee */}
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-bold text-slate-900">{sal.employeeName || 'Staff Member'}</p>
                              <p className="text-xs text-slate-400 font-medium">
                                {sal.designation || sal.department || 'Employee'}
                              </p>
                            </div>
                          </td>

                          {/* Payroll Month */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              {sal.month}
                            </span>
                          </td>

                          {/* Base Salary */}
                          <td className="py-4 px-6 text-right font-semibold text-slate-600">
                            {formatCurrency(sal.baseSalary)}
                          </td>

                          {/* Bonus */}
                          <td className="py-4 px-6 text-right font-medium text-emerald-600">
                            {sal.bonus > 0 ? `+${formatCurrency(sal.bonus)}` : '—'}
                          </td>

                          {/* Deductions */}
                          <td className="py-4 px-6 text-right font-medium text-rose-500">
                            {sal.deductions > 0 ? `-${formatCurrency(sal.deductions)}` : '—'}
                          </td>

                          {/* Net Disbursed */}
                          <td className="py-4 px-6 text-right">
                            <p className="font-extrabold text-slate-900 text-sm">
                              {formatCurrency(sal.netSalary)}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              {sal.status}
                            </span>
                          </td>

                          {/* Payment Method & Date */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <p className="font-semibold text-slate-800 text-xs">{sal.paymentMethod}</p>
                            <span className="text-[11px] text-slate-400">{sal.paymentDate}</span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewPaySlip(sal)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors shadow-2xs"
                                title="Generate and Print Corporate Pay Slip"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View Pay Slip</span>
                              </button>

                              <button
                                onClick={() => handleDeleteSalary(sal.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Salary Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Add Employee */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* 2. Edit Employee */}
      {editingEmployee && (
        <EditEmployeeModal
          isOpen={true}
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* 3. Disburse Salary */}
      <DisburseSalaryModal
        isOpen={isDisburseModalOpen}
        onClose={() => {
          setIsDisburseModalOpen(false);
          setDisbursingEmployee(null);
        }}
        preSelectedEmployee={disbursingEmployee}
        employees={employees}
        onSuccess={(createdPayment) => {
          fetchData();
          // Optionally auto-open the newly created payslip
          if (createdPayment) {
            const emp = employees.find((e) => e.id === createdPayment.employeeId) || disbursingEmployee || undefined;
            setViewingPaySlip({ payment: createdPayment, employee: emp });
          }
        }}
      />

      {/* 4. Pay Slip Viewer & PDF Print */}
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
