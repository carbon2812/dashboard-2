'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Tags,
  Check,
  Loader2,
  DollarSign,
  Palette,
  Sparkles,
} from 'lucide-react';
import { ExpenseCategory } from '@/types';
import { CATEGORY_ICONS, CATEGORY_COLORS, getCategoryIcon } from '@/lib/icons';
import { useToast } from '@/context/ToastContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: ExpenseCategory | null;
  onCategorySaved: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  onCategorySaved,
}: CategoryModalProps) {
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('Laptop');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color || '#6366f1');
      setIcon(categoryToEdit.icon || 'Laptop');
      setDescription(categoryToEdit.description || '');
      setBudget(categoryToEdit.budget ? categoryToEdit.budget.toString() : '');
    } else {
      setName('');
      setColor('#6366f1');
      setIcon('Laptop');
      setDescription('');
      setBudget('');
    }
    setNameError('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        color,
        icon,
        description: description.trim(),
        budget: budget ? parseFloat(budget) : undefined,
      };

      const url = categoryToEdit
        ? `/api/categories/${categoryToEdit.id}`
        : '/api/categories';
      const method = categoryToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      success(
        categoryToEdit ? 'Category Updated' : 'Category Created',
        `Category "${name}" is ready for expense allocation.`
      );
      onCategorySaved();
      onClose();
    } catch (err: any) {
      toastError('Save Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const SelectedIconComponent = getCategoryIcon(icon);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal my-8 border border-slate-200 overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${color}15`, color }}
              >
                <SelectedIconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {categoryToEdit ? 'Edit Category' : 'New Custom Category'}
                </h3>
                <p className="text-xs text-slate-500">
                  Define budget limits, custom icon, and color tag
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[calc(85vh-140px)] overflow-y-auto">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AI Research, Client Entertainment, Hardware"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  nameError ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
                }`}
              />
              {nameError && <p className="mt-1 text-[11px] text-rose-500">{nameError}</p>}
            </div>

            {/* Monthly Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Monthly Spending Budget (Optional INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Used to compute budget utilization warnings and progress bars
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Color Palette Accent
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {color === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Icon Symbol
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {CATEGORY_ICONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = icon === opt.name;
                  return (
                    <button
                      type="button"
                      key={opt.name}
                      onClick={() => setIcon(opt.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm scale-105'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      title={opt.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scope / Guidelines (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="What types of expenses fall under this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{categoryToEdit ? 'Save Changes' : 'Create Category'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
