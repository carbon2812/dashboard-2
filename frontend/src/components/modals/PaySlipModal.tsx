'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  Building,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Download,
} from 'lucide-react';
import { SalaryPayment, Employee } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: SalaryPayment | null;
  salaryPayment?: SalaryPayment | null;
  employee?: Employee | null;
}

export function PaySlipModal({
  isOpen,
  onClose,
  payment: paymentProp,
  salaryPayment,
  employee,
}: PaySlipModalProps) {
  const payment = paymentProp || salaryPayment;
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-8 print:shadow-none print:border-none print:max-w-full"
        >
          {/* Header Controls (Hidden on print) */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Official Salary Pay Slip</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Payslip Document */}
          <div className="p-6 sm:p-8 space-y-6 text-slate-800">
            {/* Company & Document Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div>
                <div className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    ET
                  </div>
                  <span>Expense Tracker Corp.</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Corporate Headquarters • Financial Ledger</p>
                <p className="text-[11px] text-slate-400">GST / Corporate ID: CIN-2026-ETRACK</p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {payment.status}
                </span>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Slip #{payment.id.slice(-8).toUpperCase()}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  Period: {payment.month}
                </div>
              </div>
            </div>

            {/* Employee Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Employee Name</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{payment.employeeName || 'Staff Member'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Designation</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{payment.designation || 'Specialist'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{payment.department || 'Operations'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Disbursement Date</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(payment.paymentDate)}</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 bg-slate-100/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 select-none">
                <div className="p-3 pl-4">Earnings</div>
                <div className="p-3 text-right pr-4">Amount</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between p-3 px-4">
                  <span className="text-slate-600">Base Monthly Salary</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(payment.baseSalary)}</span>
                </div>

                <div className="flex justify-between p-3 px-4 bg-emerald-50/30">
                  <span className="text-emerald-700 font-medium">Incentives / Performance Bonus</span>
                  <span className="font-semibold text-emerald-700">+{formatCurrency(payment.bonus)}</span>
                </div>

                <div className="flex justify-between p-3 px-4 bg-rose-50/30">
                  <span className="text-rose-700 font-medium">Statutory & Other Deductions</span>
                  <span className="font-semibold text-rose-700">-{formatCurrency(payment.deductions)}</span>
                </div>
              </div>

              {/* Net Pay Grand Total */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                    Total Net Pay Credited
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Via {payment.paymentMethod} • Settled
                  </div>
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-white">
                  {formatCurrency(payment.netSalary)}
                </div>
              </div>
            </div>

            {/* Payment Details & Notes */}
            {payment.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Notes / Remarks: </span>
                <span>{payment.notes}</span>
              </div>
            )}

            {/* Signature & Disclaimer Footer */}
            <div className="pt-6 border-t border-slate-100 flex items-end justify-between text-xs text-slate-400">
              <div className="space-y-1">
                <p className="font-medium text-slate-500">System Generated Salary Slip</p>
                <p className="text-[11px]">This is an electronically verified disbursement receipt.</p>
              </div>

              <div className="text-right">
                <div className="w-32 border-b border-slate-300 mb-1" />
                <span className="text-[11px] text-slate-500 font-medium">Authorized Payroll Signatory</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
