'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Kanban,
  LayoutGrid,
  List,
  ArrowRight,
  ChevronRight,
  Trash2,
  Edit2,
  Users,
  Layers,
  Flag,
  Percent,
  CheckSquare,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AddProjectModal } from '@/components/modals/AddProjectModal';
import { EditProjectModal } from '@/components/modals/EditProjectModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { Project, ProjectPriority, ProjectStatus, ProjectStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const STATUS_COLUMNS: { key: ProjectStatus; label: string; color: string; border: string; bg: string }[] = [
  { key: 'Planning', label: 'Planning', color: 'text-slate-700', border: 'border-slate-300', bg: 'bg-slate-50' },
  { key: 'In Progress', label: 'In Progress', color: 'text-indigo-700', border: 'border-indigo-300', bg: 'bg-indigo-50/50' },
  { key: 'In Review', label: 'In Review', color: 'text-amber-700', border: 'border-amber-300', bg: 'bg-amber-50/50' },
  { key: 'Completed', label: 'Completed', color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50/50' },
  { key: 'On Hold', label: 'On Hold', color: 'text-rose-700', border: 'border-rose-300', bg: 'bg-rose-50/50' },
];

const PRIORITY_BADGES: Record<ProjectPriority, { bg: string; text: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600' },
  Medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Urgent: { bg: 'bg-rose-50', text: 'text-rose-700' },
};

const STATUS_BADGES: Record<ProjectStatus, { bg: string; text: string; border: string }> = {
  Planning: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'In Review': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'On Hold': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function ProjectsPage() {
  const { success, error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // View state: 'grid' | 'kanban' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'table'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch Projects Data & Stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/projects/stats/summary'),
      ]);

      const projData = await projRes.json();
      const statsData = await statsRes.json();

      if (projData.success && Array.isArray(projData.data)) {
        setProjects(projData.data);
      }
      if (statsData.success && statsData.data) {
        setStats(statsData.data);
      }
    } catch (err: any) {
      console.error('Error fetching project data:', err);
      toastError('Fetch Error', 'Failed to retrieve project details');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete project handler
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete project');

      success('Project Deleted', 'Project was removed successfully.');
      fetchData();
    } catch (err: any) {
      toastError('Action Failed', err.message);
    }
  };

  // Quick move status handler for Kanban
  const handleQuickStatusMove = async (project: Project, newStatus: ProjectStatus) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        success('Status Updated', `Moved to ${newStatus}`);
        fetchData();
      }
    } catch (err: any) {
      console.error('Error moving project status:', err);
    }
  };

  // Unique categories list for filter
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.category).filter(Boolean))) as string[];
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Computed fallback stats
  const totalProjects = stats?.totalProjects ?? projects.length;
  const inProgress = stats?.inProgress ?? projects.filter((p) => p.status === 'In Progress').length;
  const completed = stats?.completed ?? projects.filter((p) => p.status === 'Completed').length;
  const totalBudget = stats?.totalBudget ?? projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent = stats?.totalSpent ?? projects.reduce((s, p) => s + (p.spent || 0), 0);
  const totalTasks = stats?.totalTasks ?? projects.reduce((s, p) => s + (p.tasks?.length || 0), 0);
  const completedTasks =
    stats?.completedTasks ??
    projects.reduce((s, p) => s + (p.tasks?.filter((t) => t.status === 'Done').length || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onQuickAdd={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Project Management"
          subtitle="Portfolio delivery tracking, milestones, task pipelines, budgets & team allocations"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner / Hero */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-indigo-400/20">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-300" />
                <span>Enterprise Project Suite</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Projects & Deliverables Management
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
                Organize company initiatives with milestone tracking, budget utilization, task checklists, and cross-functional team assignments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => fetchData()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-md border border-white/10 transition-colors"
                title="Refresh project list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-900/30 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Stats Summary Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Total Projects</span>
                <FolderKanban className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{totalProjects}</div>
              <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
                <span>{inProgress} currently in active delivery</span>
              </p>
            </div>

            {/* Completion Rate */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {completed} <span className="text-sm font-semibold text-slate-400">/ {totalProjects}</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {totalProjects > 0 ? `${Math.round((completed / totalProjects) * 100)}% completion rate` : '0%'}
              </p>
            </div>

            {/* Budget vs Spent */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Allocated Budget</span>
                <IndianRupee className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 truncate">
                {formatCurrency(totalBudget)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                Spent: <strong className="text-slate-800">{formatCurrency(totalSpent)}</strong>
              </p>
            </div>

            {/* Deliverables / Tasks */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Tasks Completed</span>
                <CheckSquare className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {completedTasks} <span className="text-sm font-semibold text-slate-400">/ {totalTasks}</span>
              </div>
              <p className="text-xs text-amber-600 font-medium mt-1">
                {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% milestones done` : 'No tasks recorded'}
              </p>
            </div>
          </div>

          {/* Control Bar: Filters, Search, View Switcher */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by title, client, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              {/* Category Filter */}
              {uniqueCategories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Domains</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {/* View Switcher Buttons */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Kanban Board View"
                >
                  <Kanban className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold">Loading project pipelines...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No project matches your active search filters. Try resetting the filters.'
                  : 'Get started by creating your first project with allocated budget and target milestones.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setCategoryFilter('ALL');
                  setIsAddModalOpen(true);
                }}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ========================================================
               1. GRID CARDS VIEW
               ======================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const tasksCount = project.tasks?.length || 0;
                const doneCount = project.tasks?.filter((t) => t.status === 'Done').length || 0;
                const budgetUtil =
                  project.budget > 0
                    ? Math.min(100, Math.round((project.spent / project.budget) * 100))
                    : 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all p-5 flex flex-col justify-between cursor-pointer relative"
                  >
                    <div>
                      {/* Card Header: Category & Priority & Menu */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                          {project.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              PRIORITY_BADGES[project.priority]?.bg
                            } ${PRIORITY_BADGES[project.priority]?.text}`}
                          >
                            {project.priority}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              STATUS_BADGES[project.status]?.bg
                            } ${STATUS_BADGES[project.status]?.text} ${
                              STATUS_BADGES[project.status]?.border
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </div>

                      {/* Title & Client */}
                      <div className="mt-3">
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        {project.client && (
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{project.client}</span>
                          </p>
                        )}
                        {project.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">Progress</span>
                          <span className="font-bold text-indigo-600">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Financial info */}
                      <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Budget</div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {formatCurrency(project.budget)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Spent</div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {formatCurrency(project.spent)} ({budgetUtil}%)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Team avatars, Deadline, and Task count */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {/* Team Avatars */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {project.teamMembers && project.teamMembers.length > 0 ? (
                          project.teamMembers.slice(0, 3).map((member, i) => (
                            <div
                              key={i}
                              title={member}
                              className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white"
                            >
                              {member.charAt(0)}
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No assignees</span>
                        )}
                        {project.teamMembers && project.teamMembers.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                            +{project.teamMembers.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {tasksCount > 0 && (
                          <span className="flex items-center gap-1 font-medium">
                            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {doneCount}/{tasksCount}
                            </span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          <span>{project.deadline || 'No date'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'kanban' ? (
            /* ========================================================
               2. KANBAN BOARD VIEW
               ======================================================== */
            <div className="flex gap-4 overflow-x-auto pb-6">
              {STATUS_COLUMNS.map((col) => {
                const columnProjects = filteredProjects.filter((p) => p.status === col.key);

                return (
                  <div
                    key={col.key}
                    className="w-80 shrink-0 bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col max-h-[75vh]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            col.key === 'Completed'
                              ? 'bg-emerald-500'
                              : col.key === 'In Progress'
                              ? 'bg-indigo-600'
                              : col.key === 'In Review'
                              ? 'bg-amber-500'
                              : col.key === 'On Hold'
                              ? 'bg-rose-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {col.label}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs">
                        {columnProjects.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
                      {columnProjects.length > 0 ? (
                        columnProjects.map((p) => {
                          const tasksCount = p.tasks?.length || 0;
                          const doneCount = p.tasks?.filter((t) => t.status === 'Done').length || 0;

                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedProject(p)}
                              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer space-y-2.5 group"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {p.category || 'General'}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    PRIORITY_BADGES[p.priority]?.bg
                                  } ${PRIORITY_BADGES[p.priority]?.text}`}
                                >
                                  {p.priority}
                                </span>
                              </div>

                              <div>
                                <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                  {p.title}
                                </h5>
                                {p.client && (
                                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                    {p.client}
                                  </p>
                                )}
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                  <span>Progress</span>
                                  <span className="font-bold text-slate-700">{p.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-indigo-600 h-full rounded-full"
                                    style={{ width: `${p.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Quick Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                                <span>{p.deadline || 'No deadline'}</span>
                                {tasksCount > 0 && (
                                  <span className="font-semibold text-slate-600">
                                    {doneCount}/{tasksCount} tasks
                                  </span>
                                )}
                              </div>

                              {/* Quick Move Next stage */}
                              {col.key !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextIdx =
                                      STATUS_COLUMNS.findIndex((c) => c.key === col.key) + 1;
                                    if (nextIdx < STATUS_COLUMNS.length) {
                                      handleQuickStatusMove(p, STATUS_COLUMNS[nextIdx].key);
                                    }
                                  }}
                                  className="w-full py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                >
                                  <span>Move to Next Stage</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs italic">
                          No projects
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================
               3. TABLE LIST VIEW
               ======================================================== */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="py-3.5 px-4">Project</th>
                      <th className="py-3.5 px-4">Domain</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Progress</th>
                      <th className="py-3.5 px-4">Budget / Spent</th>
                      <th className="py-3.5 px-4">Deadline</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((p) => {
                      const tasksCount = p.tasks?.length || 0;
                      const doneCount = p.tasks?.filter((t) => t.status === 'Done').length || 0;

                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProject(p)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-400">{p.client || 'Internal'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                              {p.category || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-full border text-[10px] ${
                                STATUS_BADGES[p.status]?.bg
                              } ${STATUS_BADGES[p.status]?.text} ${STATUS_BADGES[p.status]?.border}`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                                PRIORITY_BADGES[p.priority]?.bg
                              } ${PRIORITY_BADGES[p.priority]?.text}`}
                            >
                              {p.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 min-w-[130px]">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-slate-700">{p.progress}%</span>
                              <span className="text-slate-400">
                                {doneCount}/{tasksCount}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{formatCurrency(p.budget)}</div>
                            <div className="text-[10px] text-slate-400">
                              Spent: {formatCurrency(p.spent)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {p.deadline || 'No target'}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingProject(p)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete project "${p.title}"?`)) {
                                    handleDeleteProject(p.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onSuccess={() => fetchData()}
      />

      <ProjectDetailModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        onEdit={(p) => {
          setSelectedProject(null);
          setEditingProject(p);
        }}
        onDelete={(id) => handleDeleteProject(id)}
        onProjectUpdated={(up) => {
          setSelectedProject(up);
          fetchData();
        }}
      />
    </div>
  );
}
