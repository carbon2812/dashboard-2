'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Building,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  CheckSquare,
  AlertTriangle,
  IndianRupee,
  Layers,
  Flag,
  Percent,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, ProjectPriority, ProjectStatus, ProjectTask } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onProjectUpdated: (updatedProject: Project) => void;
}

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; border: string }> = {
  Planning: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'In Review': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'On Hold': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const PRIORITY_COLORS: Record<ProjectPriority, { bg: string; text: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600' },
  Medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Urgent: { bg: 'bg-rose-50', text: 'text-rose-700' },
};

export function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  onEdit,
  onDelete,
  onProjectUpdated,
}: ProjectDetailModalProps) {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'tasks' | 'overview'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'done'>('all');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<ProjectPriority>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === 'Done');
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'todo') return t.status !== 'Done';
    if (taskFilter === 'done') return t.status === 'Done';
    return true;
  });

  const budget = project.budget || 0;
  const spent = project.spent || 0;
  const budgetUtilization = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  // Toggle Task Status
  const handleToggleTask = async (task: ProjectTask) => {
    try {
      setTogglingTaskId(task.id);
      const newStatus = task.status === 'Done' ? 'Todo' : 'Done';

      if (newStatus === 'Done') {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      const res = await fetch(`/api/projects/${project.id}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update task');
      }

      // Re-fetch whole project to get latest progress
      const pRes = await fetch(`/api/projects/${project.id}`);
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        onProjectUpdated(pData.data);
      }
    } catch (err: any) {
      console.error('Error toggling task:', err);
      toastError('Task Update Failed', err.message);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setAddingTask(true);
      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          assignedEmployeeName: newTaskAssignee || project.teamMembers?.[0] || undefined,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
          status: 'Todo',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add task');
      }

      setNewTaskTitle('');
      setNewTaskDueDate('');

      const pRes = await fetch(`/api/projects/${project.id}`);
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        onProjectUpdated(pData.data);
      }
      success('Task Added', 'New project task added successfully.');
    } catch (err: any) {
      console.error('Error adding task:', err);
      toastError('Task Error', err.message);
    } finally {
      setAddingTask(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete task');
      }

      const pRes = await fetch(`/api/projects/${project.id}`);
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        onProjectUpdated(pData.data);
      }
    } catch (err: any) {
      console.error('Error deleting task:', err);
      toastError('Error', err.message);
    }
  };

  // Quick Status Change from Modal
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onProjectUpdated(data.data);
        success('Status Updated', `Project moved to ${newStatus}`);
      }
    } catch (err: any) {
      console.error('Error changing status:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col"
      >
        {/* Top Header Card */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  {project.category || 'General'}
                </span>

                {/* Status Dropdown */}
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                    STATUS_COLORS[project.status]?.bg || 'bg-slate-100'
                  } ${STATUS_COLORS[project.status]?.text || 'text-slate-700'} ${
                    STATUS_COLORS[project.status]?.border || 'border-slate-200'
                  }`}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>

                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    PRIORITY_COLORS[project.priority]?.bg || 'bg-slate-100'
                  } ${PRIORITY_COLORS[project.priority]?.text || 'text-slate-600'}`}
                >
                  {project.priority} Priority
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {project.title}
              </h1>

              {project.client && (
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Client: <strong className="text-slate-700">{project.client}</strong></span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEdit(project)}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit Project"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete project "${project.title}"?`)) {
                    onDelete(project.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            {/* Progress */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Progress</span>
                <Percent className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-lg font-black text-slate-900 mt-1">{project.progress}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Tasks metric */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Tasks Done</span>
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {completedTasks.length} <span className="text-xs text-slate-400 font-normal">/ {tasks.length}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {tasks.length > 0
                  ? `${Math.round((completedTasks.length / tasks.length) * 100)}% completed`
                  : 'No tasks added'}
              </p>
            </div>

            {/* Budget */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Budget</span>
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-base font-black text-slate-900 mt-1 truncate">
                {formatCurrency(budget)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                Spent: {formatCurrency(spent)} ({budgetUtilization}%)
              </p>
            </div>

            {/* Target Deadline */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Deadline</span>
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-1 truncate">
                {project.deadline || 'No target'}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                From: {project.startDate || 'Started'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tasks & Deliverables</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview & Team</span>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'tasks' ? (
            <div className="space-y-4">
              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add actionable task or milestone..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={addingTask || !newTaskTitle.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                  >
                    {addingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {/* Assignee */}
                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="">Assign Member</option>
                      {project.teamMembers.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Priority */}
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as ProjectPriority)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent</option>
                  </select>

                  {/* Due Date */}
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
                    title="Task Due Date"
                  />
                </div>
              </form>

              {/* Task Filter Pills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      taskFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    All ({tasks.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('todo')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      taskFilter === 'todo' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Pending ({tasks.length - completedTasks.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('done')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      taskFilter === 'done' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Completed ({completedTasks.length})
                  </button>
                </div>
              </div>

              {/* Task Items List */}
              <div className="space-y-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const isDone = task.status === 'Done';
                    const isToggling = togglingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-emerald-50/30 border-emerald-100/80 text-slate-500'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            disabled={isToggling}
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                : 'border-slate-300 hover:border-indigo-600 hover:bg-indigo-50 text-transparent'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold leading-relaxed ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                              {task.assignedEmployeeName && (
                                <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {task.assignedEmployeeName}
                                </span>
                              )}

                              {task.priority && (
                                <span
                                  className={`font-semibold px-1.5 py-0.5 rounded ${
                                    PRIORITY_COLORS[task.priority]?.bg
                                  } ${PRIORITY_COLORS[task.priority]?.text}`}
                                >
                                  {task.priority}
                                </span>
                              )}

                              {task.dueDate && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  Due {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No tasks in this view</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the box above to add milestone deliverables.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Scope & Details</h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  {project.description || 'No detailed scope provided for this project.'}
                </p>
              </div>

              {/* Team Members List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Team ({project.teamMembers?.length || 0})
                </h3>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.teamMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {member.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{member}</p>
                          <p className="text-[11px] text-slate-500">Project Contributor</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No team members assigned.</p>
                )}
              </div>

              {/* Budget Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Utilization</h3>
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Budget Spent: {formatCurrency(spent)}</span>
                    <span>Cap: {formatCurrency(budget)}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        budgetUtilization > 90 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${budgetUtilization}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Remaining: {formatCurrency(Math.max(0, budget - spent))}</span>
                    <span>{budgetUtilization}% utilized</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
