'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FolderPlus,
  Briefcase,
  Building,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Flag,
  Layers,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { ProjectPriority, ProjectStatus, Employee } from '@/types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Fintech & AI');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [budget, setBudget] = useState('');
  const [spent, setSpent] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');

  // Team members selection
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Initial tasks
  const [tasks, setTasks] = useState<{ title: string; assignedEmployeeName?: string; priority?: ProjectPriority }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch employees for member selection
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableEmployees(data.data);
        }
      })
      .catch((err) => console.error('Error fetching employees for project modal:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMember = (name: string) => {
    if (selectedMembers.includes(name)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== name));
    } else {
      setSelectedMembers([...selectedMembers, name]);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        title: newTaskTitle.trim(),
        priority,
        assignedEmployeeName: selectedMembers[0] || undefined,
      },
    ]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
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
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title: title.trim(),
          description: description.trim() || undefined,
          client: client.trim() || undefined,
          category,
          status,
          priority,
          budget: Number(budget) || 0,
          spent: Number(spent) || 0,
          currency: 'INR',
          startDate: startDate || new Date().toISOString().split('T')[0],
          deadline,
          teamMembers: selectedMembers,
          tasks: tasks.map((t) => ({
            title: t.title,
            priority: t.priority || priority,
            assignedEmployeeName: t.assignedEmployeeName,
            status: 'Todo',
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create project');
      }

      success('Project Created', `"${title.trim()}" has been initialized successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating project:', err);
      toastError('Creation Failed', err.message || 'Unable to create project');
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
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Project</h2>
              <p className="text-xs text-slate-500">Add client details, allocated budget, deadlines & deliverables</p>
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
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Project Title</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. NextGen Mobile Banking Suite"
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

          {/* Client & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Client / Stakeholder</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Global, Internal Operations"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
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
              placeholder="Brief overview of project goals, deliverables, and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Priority Pills */}
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

          {/* Financials & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>Allocated Budget (₹ INR)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (errors.budget) setErrors({ ...errors, budget: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.budget
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {errors.budget && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.budget}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>Initial Spent (₹ INR)</span>
              </label>
              <input
                type="number"
                placeholder="0"
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
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  if (errors.deadline) setErrors({ ...errors, deadline: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.deadline
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {errors.deadline && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.deadline}</p>
              )}
            </div>
          </div>

          {/* Team Members Assignment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Assign Team Members</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedMembers.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 max-h-32 overflow-y-auto">
              {availableEmployees.length > 0 ? (
                availableEmployees.map((emp) => {
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
                      <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {emp.name.charAt(0)}
                      </span>
                      <span>{emp.name}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white ml-0.5" />}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 italic py-1">
                  No employees in company directory yet. You can add them in Employees & Salary.
                </div>
              )}
            </div>
          </div>

          {/* Initial Tasks List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Initial Deliverables & Tasks (Optional)</span>
              <span className="text-[11px] text-slate-400 font-normal">{tasks.length} tasks added</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add milestone/task (e.g. Design token Figma handoff)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask(e);
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {tasks.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="text-slate-800 font-medium truncate flex-1">{task.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            <span>Create Project</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
