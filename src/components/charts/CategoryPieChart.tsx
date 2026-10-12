'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CategoryBreakdownItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/icons';

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[];
  totalExpenses: number;
}

export function CategoryPieChart({ data, totalExpenses }: CategoryPieChartProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-300">Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No category expense data available
      </div>
    );
  }

  const chartData = data.filter(d => d.total > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategoryBreakdownItem;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl p-3 shadow-modal text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-slate-900">{item.name}</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">{formatCurrency(item.total)}</div>
          <div className="text-slate-500 mt-0.5">
            {item.percentage}% of total expenses • {item.count} items
          </div>
          {item.budget && (
            <div className="text-slate-400 mt-1 pt-1 border-t border-slate-100">
              Budget: {formatCurrency(item.budget)}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="total"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.categoryId}`}
                  fill={entry.color || '#6366f1'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-300 outline-none"
                  style={{
                    filter: activeIndex === index ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' : 'none',
                    transform: activeIndex === index ? 'scale(1.03)' : 'scale(1)',
                    transformOrigin: 'center center',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Spent
          </span>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {chartData.slice(0, 6).map((item) => {
          const IconComponent = getCategoryIcon(item.icon);
          return (
            <div
              key={item.categoryId}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 font-medium truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900 shrink-0 ml-1">
                {item.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
