'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserPlus,
  Briefcase,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded?: () => void;
  onSuccess?: () => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Marketing & Growth',
  'Sales & BD',
  'Operations',
  'Human Resources (HR)',
  'Finance & Accounting',
  'Legal & Compliance',
  'Customer Support',
];

export function AddEmployeeModal({
  isOpen,
  onClose,
  onEmployeeAdded,
  onSuccess,
}: AddEmployeeModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!designation.trim()) newErrors.designation = 'Designation/Job role is required';
    if (!baseSalary || isNaN(Number(baseSalary)) || Number(baseSalary) < 0) {
      newErrors.baseSalary = 'Valid base monthly salary is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          department,
          designation: designation.trim(),
          baseSalary: Number(baseSalary),
          status,
          joinDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add employee');
      }

      success('Employee Added', `${name.trim()} added to company directory.`);
      if (onSuccess) onSuccess();
      if (onEmployeeAdded) onEmployeeAdded();
      onClose();

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setDepartment('Engineering');
      setDesignation('');
      setBaseSalary('');
      setStatus('Active');
      setErrors({});
    } catch (err: any) {
      toastError('Submission Error', err.message);
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
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-500">Record staff member details and monthly base salary</p>
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'
                }`}
              />
              {errors.name && <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>}
            </div>

            {/* Department & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <Building className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Designation / Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => {
                    setDesignation(e.target.value);
                    if (errors.designation) setErrors((prev) => ({ ...prev, designation: '' }));
                  }}
                  placeholder="e.g. Senior Backend Engineer"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.designation ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors.designation && <p className="mt-1 text-[11px] text-rose-500">{errors.designation}</p>}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Base Monthly Salary & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monthly Base Salary (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={baseSalary}
                    onChange={(e) => {
                      setBaseSalary(e.target.value);
                      if (errors.baseSalary) setErrors((prev) => ({ ...prev, baseSalary: '' }));
                    }}
                    placeholder="e.g. 75000"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.baseSalary ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'
                    }`}
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                    ₹
                  </span>
                </div>
                {errors.baseSalary && <p className="mt-1 text-[11px] text-rose-500">{errors.baseSalary}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joining Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
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
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Add Employee</span>
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
