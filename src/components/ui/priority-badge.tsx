'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PriorityLevel } from '@/lib/types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getStyles = () => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
      case 'Medium':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-[0_0_8px_rgba(56,189,248,0.15)]';
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
      default:
        return 'bg-white/10 text-white/60 border-white/15';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        getStyles()
      )}
    >
      {priority}
    </span>
  );
}
