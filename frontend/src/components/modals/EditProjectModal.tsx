'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit2,
  Building,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Flag,
  Layers,
  Percent,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Project, ProjectPriority, ProjectStatus, Employee } from '@/types';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Fintech & AI',
  'Mobile Application',
  'Web Platform',
  'DevOps & Cloud',
  'Product & UI/UX',
  'Enterprise ERP',
  'Marketing & Growth',
  'General',
];

const PRIORITIES: { label: ProjectPriority; color: string; bg: string }[] = [
  { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100 hover:bg-slate-200' },
  { label: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  { label: 'High', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100' },
  { label: 'Urgent', color: 'text-rose-600', bg: 'bg-rose-50 hover:bg-rose-100' },
];

const STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'In Review', 'Completed', 'On Hold'];

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: EditProjectModalProps) {
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Fintech & AI');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [budget, setBudget] = useState('');
  const [spent, setSpent] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!project) return;
    setTitle(project.title || '');
    setDescription(project.description || '');
    setClient(project.client || '');
    setCategory(project.category || 'General');
    setPriority(project.priority || 'Medium');
    setStatus(project.status || 'In Progress');
    setBudget(project.budget !== undefined ? project.budget.toString() : '0');
    setSpent(project.spent !== undefined ? project.spent.toString() : '0');
    setStartDate(project.startDate || '');
    setDeadline(project.deadline || '');
    setProgress(project.progress || 0);
    setSelectedMembers(project.teamMembers || []);
  }, [project]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableEmployees(data.data);
        }
      })
      .catch((err) => console.error('Error fetching employees:', err));
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const handleToggleMember = (name: string) => {
    if (selectedMembers.includes(name)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== name));
    } else {
      setSelectedMembers([...selectedMembers, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Project title is required';
    if (!deadline) newErrors.deadline = 'Target deadline date is required';
    if (budget && (isNaN(Number(budget)) || Number(budget) < 0)) {
      newErrors.budget = 'Please enter a valid positive budget amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          client: client.trim() || undefined,
          category,
          status,
          priority,
          budget: Number(budget) || 0,
          spent: Number(spent) || 0,
          startDate: startDate || new Date().toISOString().split('T')[0],
          deadline,
          progress: Number(progress),
          teamMembers: selectedMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project');
      }

      success('Project Updated', `"${title.trim()}" changes have been saved.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating project:', err);
      toastError('Update Failed', err.message || 'Unable to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Project</h2>
              <p className="text-xs text-slate-500">Update project attributes, timeline, and allocations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Project Title</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Domain</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Client / Stakeholder</span>
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Status & Lifecycle</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Project Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Progress Slider */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-600" />
                <span>Overall Completion Progress</span>
              </span>
              <span className="font-bold text-indigo-600">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <span>Priority Level</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.label;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPriority(p.label)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget & Spent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>Budget (₹ INR)</span>
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>Spent to Date (₹ INR)</span>
              </label>
              <input
                type="number"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Deadline</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Team Members ({selectedMembers.length})</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 max-h-32 overflow-y-auto">
              {availableEmployees.map((emp) => {
                const isChecked = selectedMembers.includes(emp.name);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleToggleMember(emp.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{emp.name}</span>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
