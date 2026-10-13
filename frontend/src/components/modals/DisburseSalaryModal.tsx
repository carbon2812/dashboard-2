'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  FileText,
  Building,
} from 'lucide-react';
import { Employee } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface DisburseSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  preSelectedEmployee?: Employee | null;
  onSalaryDisbursed?: () => void;
  onSuccess?: (createdPayment?: any) => void;
}

export function DisburseSalaryModal({
  isOpen,
  onClose,
  employees,
  preSelectedEmployee,
  onSalaryDisbursed,
  onSuccess,
}: DisburseSalaryModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [month, setMonth] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [bonus, setBonus] = useState('');
  const [deductions, setDeductions] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Setup default current month (YYYY-MM)
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(currentMonth);

    if (preSelectedEmployee) {
      setSelectedEmpId(preSelectedEmployee.id);
      setBaseSalary(String(preSelectedEmployee.baseSalary || 0));
    } else if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
      setBaseSalary(String(employees[0].baseSalary || 0));
    }
  }, [preSelectedEmployee, employees, isOpen]);

  // When selected employee changes, update base salary
  const handleEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setBaseSalary(String(emp.baseSalary || 0));
    }
  };

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || preSelectedEmployee;

  const numBase = Number(baseSalary) || 0;
  const numBonus = Number(bonus) || 0;
  const numDeductions = Number(deductions) || 0;
  const netSalary = Math.max(0, numBase + numBonus - numDeductions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedEmpId) newErrors.employee = 'Please select an employee';
    if (!month) newErrors.month = 'Disbursement month is required';
    if (!baseSalary || numBase < 0) newErrors.baseSalary = 'Valid base salary is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          employeeId: selectedEmpId,
          month,
          baseSalary: numBase,
          bonus: numBonus,
          deductions: numDeductions,
          netSalary,
          paymentDate,
          paymentMethod,
          status,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to disburse salary');
      }

      success(
        'Salary Disbursed',
        `₹${netSalary.toLocaleString('en-IN')} paid to ${currentEmp?.name || 'employee'} for ${month}.`
      );
      if (onSuccess) {
        onSuccess(data.data);
      }
      if (onSalaryDisbursed) {
        onSalaryDisbursed();
      }
      onClose();

      // Reset
      setBonus('');
      setDeductions('');
      setNotes('');
      setErrors({});
    } catch (err: any) {
      toastError('Payroll Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Disburse Salary Payment</h3>
                <p className="text-xs text-slate-500">Calculate net pay, bonus, deductions & generate pay record</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Employee Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Employee <span className="text-rose-500">*</span>
              </label>
              {employees.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  No employees in directory. Please add an employee first.
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedEmpId}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.designation} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {errors.employee && <p className="mt-1 text-[11px] text-rose-500">{errors.employee}</p>}
            </div>

            {/* Salary Month & Payment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Salary Month <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Salary Breakdown Row */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Salary Components</div>

              <div className="grid grid-cols-3 gap-3">
                {/* Base Salary */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Salary</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  </div>
                </div>

                {/* Bonus */}
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 mb-1">+ Bonus</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-2 rounded-lg border border-emerald-200 bg-emerald-50/40 text-xs font-semibold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-600 text-xs">₹</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 mb-1">- Deductions</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={deductions}
                      onChange={(e) => setDeductions(e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-2 rounded-lg border border-rose-200 bg-rose-50/40 text-xs font-semibold text-rose-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-600 text-xs">₹</span>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight Box */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider block">
                    Net Disbursable Salary
                  </span>
                  <span className="text-xs text-emerald-200">
                    Base + Bonus - Deductions
                  </span>
                </div>
                <div className="text-xl font-bold tracking-tight text-white">
                  {formatCurrency(netSalary)}
                </div>
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI / Instant Pay</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="Cash">Cash Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Disbursement Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  <option value="Paid">Paid (Disbursed)</option>
                  <option value="Pending">Pending Approval</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes / Transaction Ref</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. UTR #1982739182 credited to HDFC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || employees.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Record Disbursement</span>
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
