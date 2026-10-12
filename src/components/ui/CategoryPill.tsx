import React from 'react';
import { getCategoryIcon } from '@/lib/icons';
import { ExpenseCategory } from '@/types';

interface CategoryPillProps {
  category?: Partial<ExpenseCategory> | null;
  name?: string;
  color?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryPill({
  category,
  name,
  color,
  icon,
  size = 'md',
  className = '',
}: CategoryPillProps) {
  const finalName = category?.name || name || 'General';
  const finalColor = category?.color || color || '#6366f1';
  const finalIconName = category?.icon || icon || 'Layers';

  const IconComponent = getCategoryIcon(finalIconName);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full transition-all border ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${finalColor}15`, // 8-10% opacity
        borderColor: `${finalColor}35`,
        color: finalColor,
      }}
    >
      <IconComponent className={iconSizes[size]} style={{ color: finalColor }} />
      <span className="truncate max-w-[140px]">{finalName}</span>
    </span>
  );
}
