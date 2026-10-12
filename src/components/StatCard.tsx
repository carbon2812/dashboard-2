'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: number; // e.g. +4.8 or -2.1
  changeLabel?: string;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs last month',
  subtitle,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50 border-indigo-100',
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${iconBg} ${iconColor} shadow-sm shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-semibold text-[11px] ${
                isPositive
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80' // for expenses, + can be rose or emerald depending on perspective; user asked for clear indicator
                  : isNegative
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {change === 0 && <Minus className="w-3 h-3" />}
              <span>{change > 0 ? `+${change}%` : `${change}%`}</span>
            </span>
            <span className="text-slate-400">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-500">{subtitle}</span>
        ) : null}
      </div>
    </motion.div>
  );
}
