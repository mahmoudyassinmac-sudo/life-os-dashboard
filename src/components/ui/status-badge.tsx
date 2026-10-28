'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'Paid':
      case 'Active':
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.12)]';
      case 'Pending':
      case 'In Progress':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.12)]';
      case 'Overdue':
      case 'Canceling':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.12)]';
      case 'Paused':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'Planning':
      case 'Review':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.12)]';
      case 'To Do':
      default:
        return 'bg-white/10 text-white/70 border-white/15';
    }
  };

  const dotColor = () => {
    switch (status) {
      case 'Paid':
      case 'Active':
      case 'Completed':
        return 'bg-emerald-400 shadow-[0_0_6px_#34d399]';
      case 'Pending':
      case 'In Progress':
        return 'bg-sky-400 shadow-[0_0_6px_#38bdf8]';
      case 'Overdue':
      case 'Canceling':
        return 'bg-rose-400 shadow-[0_0_6px_#f43f5e]';
      case 'Paused':
        return 'bg-slate-400';
      case 'Planning':
      case 'Review':
        return 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]';
      case 'To Do':
      default:
        return 'bg-white/40';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide backdrop-blur-md',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        getColors()
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor())} />
      {status}
    </span>
  );
}
