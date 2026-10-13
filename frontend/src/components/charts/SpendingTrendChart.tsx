'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyTrendItem, WeeklyTrendItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface SpendingTrendChartProps {
  monthlyData: MonthlyTrendItem[];
  weeklyData: WeeklyTrendItem[];
}

export function SpendingTrendChart({ monthlyData, weeklyData }: SpendingTrendChartProps) {
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-300">Loading trends...</div>;
  }

  const data = view === 'monthly'
    ? monthlyData.map(d => ({ label: d.month, amount: d.amount, previous: d.previousYear }))
    : weeklyData.map(d => ({ label: d.day, amount: d.amount, previous: undefined }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl p-3 shadow-modal text-xs">
          <div className="font-semibold text-slate-500 mb-1">{label}</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-slate-600">Disbursed:</span>
            <span className="font-bold text-slate-900">{formatCurrency(payload[0].value)}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Prior Period:</span>
              <span className="font-medium text-slate-600">{formatCurrency(payload[1].value)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Spending Trajectory</h3>
          <p className="text-xs text-slate-500">
            {view === 'monthly' ? 'Last 6 calendar months trajectory' : 'Daily expenses over the last 7 days'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setView('monthly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              view === 'monthly'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              view === 'weekly'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={resolvedTheme === 'dark' ? '#1f2c45' : '#f1f5f9'}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendingGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
