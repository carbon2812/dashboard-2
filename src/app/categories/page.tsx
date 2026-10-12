'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tags,
  Plus,
  Layers,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CategoryCard } from '@/components/CategoryCard';
import { CategoryModal } from '@/components/modals/CategoryModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ExpenseCategory, DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function CategoriesPage() {
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ExpenseCategory | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, statsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/stats'),
      ]);

      const catData = await catRes.json();
      const statsData = await statsRes.json();

      if (catData.success) {
        setCategories(catData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err: any) {
      toastError('Fetch Error', 'Failed to retrieve categories');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      success('Category Deleted', 'Category has been removed.');
      fetchData();
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const handleOpenCreateModal = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditModal = (cat: ExpenseCategory) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const totalBudgets = categories.reduce((sum, c) => sum + (c.budget || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onQuickAdd={() => setIsAddExpenseModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Custom Categories"
          subtitle="Configure custom expense categories, icons, color identifiers, and budget ceilings"
          onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onQuickAdd={() => setIsAddExpenseModalOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Category Directory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {categories.length} Categories
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total monthly budget cap:{' '}
                <span className="font-bold text-slate-800">{formatCurrency(totalBudgets)}</span>
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 bg-white rounded-3xl border border-slate-200">
              <EmptyState
                icon={Tags}
                title="No categories configured"
                description="Create your first custom category to categorize and budget expenses."
                actionLabel="Create Category"
                onAction={handleOpenCreateModal}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const catStat = stats?.categoryBreakdown.find((b) => b.categoryId === cat.id);
                return (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    stats={catStat}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteCategory}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onCategorySaved={fetchData}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        categories={categories}
        onExpenseAdded={fetchData}
      />
    </div>
  );
}
